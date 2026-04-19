import { Resend } from 'resend';
import twilio from 'twilio';

import { createAlertEvent, updateAlertEventStatus } from '@/lib/db/queries/alerts';
import type { AlertRule } from '@/lib/db/schema/alert-rules';
import type { Member } from '@/lib/db/queries/members';
import type { Organization } from '@/lib/db/queries/organizations';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY not configured');
    _resend = new Resend(key);
  }
  return _resend;
}

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error('Twilio credentials not configured');
  return twilio(sid, token);
}

export interface DeliveryTarget {
  org: Pick<Organization, 'id' | 'name'>;
  member: Pick<Member, 'id' | 'clerkUserId' | 'phone'>;
  email: string;
}

function formatAlertSubject(rule: AlertRule, value: number): string {
  return `Stormline alert: ${rule.name}`;
}

function formatAlertBody(rule: AlertRule, value: number): string {
  const formattedValue = value.toLocaleString('en-US', { maximumFractionDigits: 4 });
  const conditionLabel: Record<AlertRule['condition'], string> = {
    above: `exceeded threshold of ${rule.threshold}`,
    below: `fell below threshold of ${rule.threshold}`,
    pct_change_above: `changed by more than ${rule.threshold}% over ${rule.windowDays} days`,
    pct_change_below: `changed by less than ${rule.threshold}% over ${rule.windowDays} days`,
    percentile_above: `is above the ${rule.threshold}th percentile (${rule.windowDays}-day window)`,
    percentile_below: `is below the ${rule.threshold}th percentile (${rule.windowDays}-day window)`,
  };

  return [
    `Alert: ${rule.name}`,
    '',
    `Current value: ${formattedValue}`,
    `Condition: ${conditionLabel[rule.condition]}`,
    '',
    'Stormline provides market intelligence, not financial, legal, or tax advice.',
    'Consult licensed professionals for decisions specific to your business.',
  ].join('\n');
}

function formatSmsBody(rule: AlertRule, value: number): string {
  const formattedValue = value.toLocaleString('en-US', { maximumFractionDigits: 4 });
  return `Stormline: "${rule.name}" triggered — current value ${formattedValue}. Not financial advice.`;
}

export async function deliverAlert(
  rule: AlertRule,
  triggeredValue: number,
  targets: DeliveryTarget[],
): Promise<void> {
  const channels = rule.channels as string[];
  const valueStr = String(triggeredValue);

  const event = await createAlertEvent({
    ruleId: rule.id,
    triggeredValue: valueStr,
    emailStatus: channels.includes('email') ? null : undefined,
    smsStatus: channels.includes('sms') ? null : undefined,
    inAppStatus: channels.includes('in_app') ? 'sent' : undefined,
  });

  const emailStatus = await (async () => {
    if (!channels.includes('email')) return undefined;
    const emailTargets = targets.filter((t) => t.email);
    if (emailTargets.length === 0) return 'skipped';
    try {
      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'alerts@stormline.io',
        to: emailTargets.map((t) => t.email),
        subject: formatAlertSubject(rule, triggeredValue),
        text: formatAlertBody(rule, triggeredValue),
      });
      return 'sent';
    } catch {
      return 'failed';
    }
  })();

  const smsStatus = await (async () => {
    if (!channels.includes('sms')) return undefined;
    const smsTargets = targets.filter((t) => t.member.phone);
    if (smsTargets.length === 0) return 'skipped';
    try {
      const client = getTwilioClient();
      const from = process.env.TWILIO_FROM_NUMBER;
      if (!from) throw new Error('TWILIO_FROM_NUMBER not configured');
      const body = formatSmsBody(rule, triggeredValue);
      await Promise.all(
        smsTargets.map((t) =>
          client.messages.create({ from, to: t.member.phone!, body }),
        ),
      );
      return 'sent';
    } catch {
      return 'failed';
    }
  })();

  const patch: Record<string, string> = {};
  if (emailStatus !== undefined) patch.emailStatus = emailStatus;
  if (smsStatus !== undefined) patch.smsStatus = smsStatus;
  if (Object.keys(patch).length > 0) {
    await updateAlertEventStatus(event.id, patch);
  }
}

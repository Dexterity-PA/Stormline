export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { indicators, members } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import {
  getIndicatorSeries,
  listActiveAlertRules,
} from '@/lib/db/queries/alerts';
import { getLatestValues } from '@/lib/db/queries/indicators';
import { getOrgById } from '@/lib/db/queries/organizations';
import { listMembersByOrg } from '@/lib/db/queries/members';
import { evaluateRule } from '@/lib/alerts/evaluator';
import { deliverAlert } from '@/lib/alerts/delivery';
import type { DeliveryTarget } from '@/lib/alerts/delivery';
import { clerkClient } from '@clerk/nextjs/server';

// Protect with a shared secret set in Vercel cron config
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rules = await listActiveAlertRules();
  if (rules.length === 0) {
    return NextResponse.json({ checked: 0, triggered: 0 });
  }

  // Fetch latest value for every unique indicator referenced
  const uniqueIndicatorIds = [...new Set(rules.map((r) => r.indicatorId))];
  const latestValues = await getLatestValues(uniqueIndicatorIds);
  const latestMap = new Map(latestValues.map((v) => [v.indicatorId, v.value]));

  let triggered = 0;

  for (const rule of rules) {
    const latestRaw = latestMap.get(rule.indicatorId);
    if (latestRaw === undefined) continue;
    const currentValue = Number(latestRaw);
    if (Number.isNaN(currentValue)) continue;

    let historicalValues: number[] = [];
    const needsHistory =
      rule.condition === 'pct_change_above' ||
      rule.condition === 'pct_change_below' ||
      rule.condition === 'percentile_above' ||
      rule.condition === 'percentile_below';

    if (needsHistory && rule.windowDays) {
      const series = await getIndicatorSeries(rule.indicatorId, rule.windowDays);
      historicalValues = series.map((s) => Number(s.value)).filter((v) => !Number.isNaN(v));
    }

    const fires = evaluateRule(rule, { currentValue, historicalValues });
    if (!fires) continue;

    triggered++;

    const org = await getOrgById(rule.orgId);
    if (!org) continue;

    const orgMembers = await listMembersByOrg(rule.orgId);
    const clerk = await clerkClient();

    const targets: DeliveryTarget[] = [];
    for (const member of orgMembers) {
      if (!member.emailAlerts) continue;
      try {
        const user = await clerk.users.getUser(member.clerkUserId);
        const email =
          user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
            ?.emailAddress ?? '';
        if (email) {
          targets.push({ org, member, email });
        }
      } catch {
        // Skip member if Clerk lookup fails
      }
    }

    await deliverAlert(rule, currentValue, targets);
  }

  return NextResponse.json({ checked: rules.length, triggered });
}

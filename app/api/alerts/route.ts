export const runtime = 'nodejs';

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOrgByClerkId } from '@/lib/db/queries/organizations';
import { getMemberByClerkAndOrg } from '@/lib/db/queries/members';
import {
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  CreateAlertRuleInput,
  UpdateAlertRuleInput,
} from '@/lib/db/queries/alerts';

async function resolveOrgMember(clerkUserId: string, clerkOrgId: string) {
  const org = await getOrgByClerkId(clerkOrgId);
  if (!org) return null;
  const member = await getMemberByClerkAndOrg(clerkUserId, org.id);
  if (!member) return null;
  return { org, member };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId, orgId: clerkOrgId } = await auth();
  if (!userId || !clerkOrgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ctx = await resolveOrgMember(userId, clerkOrgId);
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateAlertRuleInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Validation error' },
      { status: 422 },
    );
  }

  try {
    const rule = await createAlertRule(ctx.org.id, userId, parsed.data);
    return NextResponse.json(rule, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const PatchSchema = z.object({
  id: z.string().uuid(),
  ...UpdateAlertRuleInput.shape,
});

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { userId, orgId: clerkOrgId } = await auth();
  if (!userId || !clerkOrgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ctx = await resolveOrgMember(userId, clerkOrgId);
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Validation error' },
      { status: 422 },
    );
  }

  const { id, ...updateFields } = parsed.data;

  try {
    const rule = await updateAlertRule(id, ctx.org.id, updateFields);
    return NextResponse.json(rule);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

const DeleteSchema = z.object({ id: z.string().uuid() });

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { userId, orgId: clerkOrgId } = await auth();
  if (!userId || !clerkOrgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ctx = await resolveOrgMember(userId, clerkOrgId);
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'id is required' }, { status: 422 });
  }

  try {
    await deleteAlertRule(parsed.data.id, ctx.org.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

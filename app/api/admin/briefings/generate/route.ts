import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';
import { generateDraft } from '@/lib/ai/briefings/generator';
import { industryEnum } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const maxDuration = 120;

const RequestSchema = z.object({
  orgId: z.string().uuid(),
  industry: z.enum(industryEnum.enumValues),
  region: z.string().min(1).max(64),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { orgId, industry, region } = parsed.data;

  try {
    const briefingId = await generateDraft(orgId, industry, region);
    return NextResponse.json({ briefingId }, { status: 201 });
  } catch (err) {
    console.error('[briefings/generate]', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

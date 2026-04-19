import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';
import { updateBriefingBody } from '@/lib/db/queries/briefings';

export const runtime = 'nodejs';

const PatchSchema = z.object({
  bodyMd: z.string().min(1),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const briefing = await updateBriefingBody(id, parsed.data.bodyMd);
    return NextResponse.json({ briefing });
  } catch (err) {
    console.error('[briefings/[id] PATCH]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

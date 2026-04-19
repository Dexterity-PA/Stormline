import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { publishBriefing } from '@/lib/db/queries/briefings';

export const runtime = 'nodejs';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  let userId: string;
  try {
    ({ userId } = await requireAdmin());
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const briefing = await publishBriefing(id, userId);
    return NextResponse.json({ briefing });
  } catch (err) {
    console.error('[briefings/[id]/publish]', err);
    return NextResponse.json({ error: 'Publish failed' }, { status: 500 });
  }
}

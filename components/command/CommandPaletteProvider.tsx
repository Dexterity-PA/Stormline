import { INDICATOR_REGISTRY } from '@/lib/indicators/registry';
import { CommandPalette } from './CommandPalette';
import type { PaletteData } from './types';

async function loadBriefings(): Promise<PaletteData['briefings']> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { listBriefings } = await import('@/lib/db/queries/briefings');
    const { data } = await listBriefings({ status: 'published', limit: 5 });
    return data.map((b) => ({
      id: b.id,
      headline: b.headline,
      industry: b.industry,
      publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
    }));
  } catch {
    // DB not ready (missing schema, network, etc) — surface empty briefings group
    return [];
  }
}

export async function CommandPaletteProvider() {
  const indicators = INDICATOR_REGISTRY.slice(0, 20).map((i) => ({
    code: i.code,
    name: i.name,
    costBucket: i.costBucket,
  }));
  const briefings = await loadBriefings();
  const data: PaletteData = { indicators, briefings };
  return <CommandPalette data={data} />;
}

import type {
  BriefingData,
  IndicatorRef,
  RelatedAlertRef,
} from '@/components/briefing/types';
import { INDICATOR_REGISTRY } from '@/lib/indicators/registry';

export interface BriefingWithContext {
  briefing: BriefingData;
  indicators: IndicatorRef[];
  relatedAlerts: RelatedAlertRef[];
}

/**
 * Returns the briefing plus its context panel (indicator chips + related alerts).
 *
 * Stubbed against the in-file mock map until the generator + Drizzle wiring land —
 * the real implementation will join `briefings → indicator_observations → alerts`
 * filtered by industry and a 14-day event window, keyed off the same structured
 * fields (`indicatorRefs`, `relatedAlerts`) that this function already returns.
 */
export function getBriefingWithContext(
  briefing: BriefingData,
): BriefingWithContext {
  return {
    briefing,
    indicators: briefing.indicatorRefs,
    relatedAlerts: briefing.relatedAlerts,
  };
}

/**
 * Extracts indicator codes referenced in a briefing. Uses the structured
 * `indicatorRefs` field as the source of truth (the `inlineIndicators`
 * terms-to-codes map is a render-time concern, not the briefing contract).
 */
export function extractIndicatorReferences(briefing: BriefingData): string[] {
  return briefing.indicatorRefs.map((ref) => ref.code);
}

/**
 * Validates that every inline term's code is a known indicator. Returns the
 * list of unknown codes (empty when all resolved).
 */
export function findUnknownIndicatorCodes(briefing: BriefingData): string[] {
  const known = new Set(INDICATOR_REGISTRY.map((i) => i.code));
  const all = new Set<string>([
    ...briefing.indicatorRefs.map((r) => r.code),
    ...briefing.inlineIndicators.map((i) => i.code),
  ]);
  return Array.from(all).filter((code) => !known.has(code));
}

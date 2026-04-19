import type { AlertRule } from '@/lib/db/schema/alert-rules';

export interface EvaluationContext {
  currentValue: number;
  historicalValues?: number[];
}

export function evaluateRule(rule: AlertRule, ctx: EvaluationContext): boolean {
  const { currentValue, historicalValues = [] } = ctx;
  const threshold = Number(rule.threshold);

  switch (rule.condition) {
    case 'above':
      return currentValue > threshold;

    case 'below':
      return currentValue < threshold;

    case 'pct_change_above':
    case 'pct_change_below': {
      if (historicalValues.length === 0) return false;
      const baseline = historicalValues[0];
      if (baseline === 0) return false;
      const pct = ((currentValue - baseline) / Math.abs(baseline)) * 100;
      return rule.condition === 'pct_change_above' ? pct > threshold : pct < threshold;
    }

    case 'percentile_above':
    case 'percentile_below': {
      if (historicalValues.length === 0) return false;
      const sorted = [...historicalValues].sort((a, b) => a - b);
      const rank = sorted.filter((v) => v <= currentValue).length;
      const percentile = (rank / sorted.length) * 100;
      return rule.condition === 'percentile_above'
        ? percentile > threshold
        : percentile < threshold;
    }

    default:
      return false;
  }
}

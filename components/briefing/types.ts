export type BriefingIndustry = 'restaurant' | 'construction' | 'retail';

export interface BriefingSectionData {
  title: string;
  body: string;
  pullStats?: PullStatData[];
}

export interface PullStatData {
  value: string;
  label: string;
}

export interface InlineIndicator {
  term: string;
  code: string;
}

export interface IndicatorRef {
  code: string;
  name: string;
  currentValue: string;
  percentile: number;
  deltaWoW: number;
  series: number[];
}

export interface RelatedAlertRef {
  id: string;
  category: 'hurricane' | 'tariff' | 'fomc' | 'commodity_move' | 'credit';
  severity: 'low' | 'medium' | 'high';
  title: string;
  publishedAt: string;
}

export interface BriefingData {
  id: string;
  industry: BriefingIndustry;
  weekOf: string;
  headline: string;
  sections: BriefingSectionData[];
  generatedBy: string;
  publishedAt: string;
  indicatorRefs: IndicatorRef[];
  inlineIndicators: InlineIndicator[];
  relatedAlerts: RelatedAlertRef[];
}

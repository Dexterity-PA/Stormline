export type CascadeAlert = {
  id: string
  lat: number
  lng: number
  region: string
  indicator: string
  delta: string
  tone: 'cost' | 'demand'
}

export const CASCADE_ALERTS: CascadeAlert[] = [
  {
    id: 'ukr-wheat',
    lat: 49,
    lng: 32,
    region: 'Ukraine',
    indicator: 'WHEAT',
    delta: '+8.2%',
    tone: 'cost',
  },
  {
    id: 'north-sea-brent',
    lat: 56,
    lng: 3,
    region: 'North Sea',
    indicator: 'BRENT CRUDE',
    delta: '+4.1%',
    tone: 'cost',
  },
  {
    id: 'sing-baltic',
    lat: 1,
    lng: 104,
    region: 'Singapore',
    indicator: 'BALTIC DRY',
    delta: '+12%',
    tone: 'cost',
  },
  {
    id: 'us-gulf-diesel',
    lat: 29,
    lng: -94,
    region: 'US Gulf',
    indicator: 'DIESEL',
    delta: '+3.7%',
    tone: 'cost',
  },
  {
    id: 'taiwan-chips',
    lat: 24,
    lng: 121,
    region: 'Taiwan',
    indicator: 'SEMI LEAD',
    delta: '+18 DAYS',
    tone: 'demand',
  },
  {
    id: 'rus-natgas',
    lat: 61,
    lng: 105,
    region: 'Russia',
    indicator: 'NATURAL GAS',
    delta: '+6.4%',
    tone: 'cost',
  },
]

export const HORMUZ_LAT = 26.5
export const HORMUZ_LNG = 56.2

export type Vessel = {
  id: string
  name: string
  classLabel: string
  stalledHours: number
  // Offsets within the strait, in viewport-normalized coords (relative to center)
  x: number
  y: number
}

export const VESSELS: Vessel[] = [
  { id: 'v1', name: 'MV Front Altair', classLabel: 'Suezmax', stalledHours: 72, x: -0.22, y: -0.06 },
  { id: 'v2', name: 'MV Kairos', classLabel: 'VLCC', stalledHours: 68, x: -0.12, y: 0.08 },
  { id: 'v3', name: 'MV Sea Voyager', classLabel: 'Aframax', stalledHours: 81, x: 0.04, y: -0.14 },
  { id: 'v4', name: 'MV Nordic Star', classLabel: 'Suezmax', stalledHours: 66, x: 0.18, y: 0.02 },
  { id: 'v5', name: 'MV Pacific Dawn', classLabel: 'VLCC', stalledHours: 74, x: -0.28, y: 0.14 },
  { id: 'v6', name: 'MV Atlantic Crown', classLabel: 'Aframax', stalledHours: 70, x: 0.1, y: 0.16 },
  { id: 'v7', name: 'MV Black Pearl', classLabel: 'Suezmax', stalledHours: 77, x: 0.26, y: -0.1 },
  { id: 'v8', name: 'MV Orion', classLabel: 'VLCC', stalledHours: 65, x: -0.02, y: 0.22 },
]

export const NEWS_TICKER_ITEMS = [
  'REUTERS · Shipping rates up 40% in 72h',
  'BLOOMBERG · Brent tests $92',
  'FT · Insurance premiums on Hormuz transit spike 3x',
  'WSJ · Refineries seek alternate supply',
  'RTRS · Lloyd\u2019s widens war-risk zone',
]

// Pre-computed chart point series for mini HUD charts. Indices map to x positions.
// Values are y positions in 0..1 range (inverted later for SVG draw).
export const MINI_CHART_SERIES: Record<
  'wti' | 'vix' | 'spx' | 'dxy',
  { points: number[]; tone: 'up-bad' | 'down-bad' | 'up-good'; label: string; note: string }
> = {
  wti: {
    label: 'WTI CRUDE',
    note: 'INTRADAY',
    tone: 'up-bad',
    points: [0.58, 0.56, 0.57, 0.55, 0.53, 0.52, 0.5, 0.47, 0.42, 0.35, 0.3, 0.24, 0.2, 0.17, 0.15],
  },
  vix: {
    label: 'VIX',
    note: 'INTRADAY',
    tone: 'up-bad',
    points: [0.68, 0.67, 0.65, 0.66, 0.63, 0.6, 0.55, 0.5, 0.45, 0.38, 0.32, 0.27, 0.22, 0.18, 0.14],
  },
  spx: {
    label: 'S&P 500',
    note: 'INTRADAY',
    tone: 'down-bad',
    points: [0.28, 0.3, 0.31, 0.33, 0.36, 0.4, 0.45, 0.5, 0.56, 0.63, 0.69, 0.73, 0.77, 0.8, 0.82],
  },
  dxy: {
    label: 'DXY',
    note: 'INTRADAY',
    tone: 'up-good',
    points: [0.55, 0.54, 0.52, 0.5, 0.48, 0.45, 0.42, 0.4, 0.36, 0.33, 0.3, 0.28, 0.25, 0.23, 0.22],
  },
}

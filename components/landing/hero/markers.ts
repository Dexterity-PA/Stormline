export type MarkerKind = 'hurricane' | 'port' | 'tariff' | 'fed' | 'spike'

export type DisruptionMarker = {
  id: string
  kind: MarkerKind
  lat: number
  lng: number
  category: string
  location: string
  title: string
  summary: string
  affects: string
  updated: string
}

export const MARKERS: DisruptionMarker[] = [
  {
    id: 'port-la',
    kind: 'port',
    lat: 33.74,
    lng: -118.27,
    category: 'PORT',
    location: 'LOS ANGELES',
    title: 'Port of Los Angeles',
    summary: '14-day import backlog',
    affects: 'Lumber, electronics, restaurant imports',
    updated: '3h ago',
  },
  {
    id: 'port-shanghai',
    kind: 'port',
    lat: 31.22,
    lng: 121.47,
    category: 'PORT',
    location: 'SHANGHAI',
    title: 'Port of Shanghai',
    summary: 'Container throughput down 8% WoW',
    affects: 'Steel, textiles, consumer goods',
    updated: '6h ago',
  },
  {
    id: 'hurricane-gulf',
    kind: 'hurricane',
    lat: 27.5,
    lng: -89.0,
    category: 'HURRICANE',
    location: 'GULF COAST',
    title: 'Gulf Basin system',
    summary: 'Cat 2 track converging on refineries',
    affects: 'Diesel, produce freight, gulf imports',
    updated: '47m ago',
  },
  {
    id: 'tariff-eu',
    kind: 'tariff',
    lat: 50.4,
    lng: 10.2,
    category: 'TARIFF',
    location: 'EU',
    title: 'EU tariff bracket — steel',
    summary: 'New 12% duty enters force May 1',
    affects: 'Structural steel, rebar, HVAC units',
    updated: '1d ago',
  },
  {
    id: 'fed-dc',
    kind: 'fed',
    lat: 38.9,
    lng: -77.04,
    category: 'FED',
    location: 'WASHINGTON DC',
    title: 'FOMC decision window',
    summary: 'Rate path diverges from consensus',
    affects: 'Credit spreads, capex financing',
    updated: '4h ago',
  },
  {
    id: 'spike-permian',
    kind: 'spike',
    lat: 31.87,
    lng: -101.9,
    category: 'SPIKE',
    location: 'PERMIAN',
    title: 'Permian crude differential',
    summary: 'WTI–Brent spread widening',
    affects: 'Diesel, fertilizer, freight',
    updated: '2h ago',
  },
  {
    id: 'port-rotterdam',
    kind: 'port',
    lat: 51.95,
    lng: 4.14,
    category: 'PORT',
    location: 'ROTTERDAM',
    title: 'Port of Rotterdam',
    summary: 'Bunker fuel shortage advisory',
    affects: 'Trans-Atlantic freight timing',
    updated: '8h ago',
  },
  {
    id: 'spike-panama',
    kind: 'spike',
    lat: 9.08,
    lng: -79.68,
    category: 'CANAL',
    location: 'PANAMA',
    title: 'Panama Canal transit',
    summary: 'Slot auction premiums up 34%',
    affects: 'West-Coast–East-Coast produce',
    updated: '12h ago',
  },
]

export const MARKER_COLOR: Record<MarkerKind, string> = {
  hurricane: 'var(--sl-violet)',
  port: 'var(--sl-crit)',
  tariff: 'var(--sl-warn)',
  fed: 'var(--sl-cyan)',
  spike: 'var(--sl-accent)',
}

export function latLngToVec3(
  lat: number,
  lng: number,
  radius = 1,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return [x, y, z]
}

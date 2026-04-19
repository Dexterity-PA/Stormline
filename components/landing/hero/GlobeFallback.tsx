import { MARKERS, MARKER_COLOR } from './markers'

/**
 * Static SVG fallback used for SSR and for prefers-reduced-motion.
 * Uses an equirectangular projection + graticule to convey the live globe.
 */
export default function GlobeFallback() {
  const W = 720
  const H = 360
  const meridians = Array.from({ length: 13 }, (_, i) => i * 30 - 180)
  const parallels = Array.from({ length: 7 }, (_, i) => i * 30 - 90).slice(1, 6)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Global disruption map"
      className="sl-mask-fade-y"
    >
      <defs>
        <radialGradient id="sl-globe-fb" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--sl-accent)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sl-globe-fb)" />
      {meridians.map((lng) => {
        const x = ((lng + 180) / 360) * W
        return (
          <line
            key={`m-${lng}`}
            x1={x}
            x2={x}
            y1={0}
            y2={H}
            stroke="var(--sl-border)"
            strokeWidth={1}
            opacity={0.55}
          />
        )
      })}
      {parallels.map((lat) => {
        const y = ((90 - lat) / 180) * H
        return (
          <line
            key={`p-${lat}`}
            x1={0}
            x2={W}
            y1={y}
            y2={y}
            stroke="var(--sl-border)"
            strokeWidth={1}
            opacity={0.55}
          />
        )
      })}
      {MARKERS.map((m) => {
        const x = ((m.lng + 180) / 360) * W
        const y = ((90 - m.lat) / 180) * H
        const c = MARKER_COLOR[m.kind]
        return (
          <g key={m.id}>
            <circle cx={x} cy={y} r={10} fill={c} opacity={0.15} />
            <circle cx={x} cy={y} r={5} fill={c} opacity={0.35} />
            <circle cx={x} cy={y} r={2.5} fill={c} />
          </g>
        )
      })}
    </svg>
  )
}

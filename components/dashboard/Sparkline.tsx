export interface SparklineProps {
  values: number[];
  /** true = upward trend is good (demand indicators); false = upward is bad (cost inputs) */
  positive?: boolean;
  width?: number;
  height?: number;
}

function toPoints(values: number[], w: number, h: number): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  return values
    .map((v, i) => {
      const x = (i * step).toFixed(1);
      // Leave 1px padding top/bottom
      const y = (h - 1 - ((v - min) / range) * (h - 2)).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
}

export function Sparkline({
  values,
  positive = false,
  width = 80,
  height = 32,
}: SparklineProps) {
  const points = toPoints(values, width, height);
  const trending = (values.at(-1) ?? 0) >= (values[0] ?? 0);
  const colorClass =
    trending === positive ? 'stroke-good' : 'stroke-crit';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={colorClass}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

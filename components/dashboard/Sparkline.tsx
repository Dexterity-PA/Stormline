export interface SparklineProps {
  values: number[];
  /** true = upward trend is good (demand indicators); false = upward is bad (cost inputs) */
  positive?: boolean;
  width?: number;
  height?: number;
  /** Optional explicit color class; otherwise auto-derives from trend direction. */
  colorClassName?: string;
  className?: string;
}

function toPoints(values: number[], w: number, h: number): string {
  if (values.length < 2) return "";
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
    .join(" ");
}

export function Sparkline({
  values,
  positive = false,
  width = 120,
  height = 36,
  colorClassName,
  className,
}: SparklineProps) {
  if (values.length < 2) {
    return (
      <div
        style={{ width, height }}
        className={`flex items-center justify-center text-fg-dim text-[10px] ${className ?? ""}`}
        aria-hidden="true"
      >
        no data
      </div>
    );
  }

  const points = toPoints(values, width, height);
  const trending = (values.at(-1) ?? 0) >= (values[0] ?? 0);
  const auto = trending === positive ? "stroke-good" : "stroke-crit";
  const stroke = colorClassName ?? auto;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`${stroke} ${className ?? ""}`}
      aria-hidden="true"
      preserveAspectRatio="none"
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

interface SparklineProps {
  series: number[];
  width?: number;
  height?: number;
  strokeClassName?: string;
  fillClassName?: string;
}

export function Sparkline({
  series,
  width = 120,
  height = 32,
  strokeClassName = 'stroke-accent',
  fillClassName = 'fill-accent/10',
}: SparklineProps) {
  if (series.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true" className="block" />
    );
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = width / (series.length - 1);

  const points = series.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="block overflow-visible"
    >
      <path d={areaPath} className={fillClassName} stroke="none" />
      <path
        d={linePath}
        className={strokeClassName}
        fill="none"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

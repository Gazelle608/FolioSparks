import { SparkFilledIcon } from "../../assets/icons";

interface DataPoint {
  date: string; // ISO
  value: number;
}

interface SparksChartProps {
  data: DataPoint[];
  /** Optional title shown above the chart */
  title?: string;
  height?: number;
}

export function SparksChart({
  data,
  title = "Sparks received",
  height = 180,
}: SparksChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const max = Math.max(1, ...data.map(d => d.value));
  const width = 600;
  const padding = 8;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  // Build path
  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * usableWidth;
    const y = padding + usableHeight - (d.value / max) * usableHeight;
    return { x, y, d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaD = `${pathD} L ${padding + usableWidth} ${padding + usableHeight} L ${padding} ${padding + usableHeight} Z`;

  return (
    <div className="rounded-lg border border-primary-100 bg-white p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-center gap-2">
          <SparkFilledIcon size={14} className="text-spark" />
          <h3 className="font-display text-sm font-bold text-primary-900">
            {title}
          </h3>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-bold text-primary-900 tabular-nums">
            {total.toLocaleString()}
          </div>
          <div className="text-[10px] text-primary-400">last 30 days</div>
        </div>
      </div>

      {data.length === 0
        ? (
            <p className="text-sm text-primary-400 italic py-8 text-center">
              No Sparks yet. Publish a chapter to start earning.
            </p>
          )
        : (
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto"
              role="img"
              aria-label={`Sparks received over time: ${total} total`}
            >
              <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD966" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FFD966" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d={areaD} fill="url(#sparkFill)" />
              <path
                d={pathD}
                fill="none"
                stroke="#E5B93F"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Last point dot */}
              {points.length > 0 && (
                <circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r="3.5"
                  fill="#E5B93F"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
            </svg>
          )}
    </div>
  );
}

interface Bar {
  label: string; // e.g. "Ch. 1"
  value: number;
}

interface ReadershipChartProps {
  data: Bar[];
  title?: string;
  height?: number;
}

export function ReadershipChart({
  data,
  title = "Reads by chapter",
  height = 180,
}: ReadershipChartProps) {
  const max = Math.max(1, ...data.map(d => d.value));
  const width = 600;
  const padding = 8;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const barGap = 4;
  const barWidth
  = data.length > 0
    ? (usableWidth - barGap * (data.length - 1)) / data.length
    : 0;

  return (
    <div className="rounded-lg border border-primary-100 bg-white p-4">
      <h3 className="font-display text-sm font-bold text-primary-900 mb-4">
        {title}
      </h3>

      {data.length === 0
        ? (
            <p className="text-sm text-primary-400 italic py-8 text-center">
              No reads yet.
            </p>
          )
        : (
            <>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto"
                role="img"
                aria-label="Reads by chapter"
              >
                {data.map((d, i) => {
                  const x = padding + i * (barWidth + barGap);
                  const barHeight = (d.value / max) * usableHeight;
                  const y = padding + usableHeight - barHeight;

                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="3"
                        fill="#235347"
                      />
                      <title>{`${d.label}: ${d.value} reads`}</title>
                    </g>
                  );
                })}
              </svg>

              <div className="mt-2 flex justify-between text-[10px] text-primary-400 tabular-nums">
                {data.slice(0, 12).map((d, i) => (
                  <span key={i} className="truncate">
                    {d.label}
                  </span>
                ))}
              </div>
            </>
          )}
    </div>
  );
}

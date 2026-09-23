import { SparkFilledIcon } from "../../assets/icons";

interface StudioStatsProps {
  stories: number;
  published: number;
  sparksReceived: number;
  totalReads: number;
}

export function StudioStats({
  stories,
  published,
  sparksReceived,
  totalReads,
}: StudioStatsProps) {
  const stats = [
    {
      label: "Stories",
      value: stories.toLocaleString(),
      sub: `${published} published`,
      accent: false,
    },
    {
      label: "Reads",
      value: formatShort(totalReads),
      sub: "all-time",
      accent: false,
    },
    {
      label: "Sparks received",
      value: formatShort(sparksReceived),
      sub: "from readers",
      accent: true,
    },
    {
      label: "Followers",
      value: "—",
      sub: "coming soon",
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(s => (
        <div
          key={s.label}
          className="rounded-lg border border-primary-100 bg-white p-4"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary-500">
            {s.accent && <SparkFilledIcon size={11} className="text-spark" />}
            {s.label}
          </div>
          <div className="mt-1.5 font-display text-2xl font-bold text-primary-900 tabular-nums">
            {s.value}
          </div>
          <div className="mt-0.5 text-xs text-primary-400">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function formatShort(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toString();
}

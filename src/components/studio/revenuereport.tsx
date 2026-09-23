import { SparkFilledIcon } from "../../assets/icons";

interface RevenueReportProps {
  /** Click counts per platform in the last 30 days */
  clicks: { platform: string; count: number }[];
  /** Sparks received in the same window */
  sparksThisMonth: number;
}

const PLATFORM_LABELS: Record<string, string> = {
  patreon: "Patreon",
  ko_fi: "Ko-fi",
  buymeacoffee: "Buy Me a Coffee",
  paypal: "PayPal",
  stripe: "Stripe",
  cashapp: "Cash App",
  venmo: "Venmo",
  custom: "Custom",
};

export function RevenueReport({ clicks, sparksThisMonth }: RevenueReportProps) {
  const totalClicks = clicks.reduce((s, c) => s + c.count, 0);

  // Sort platforms by clicks desc so the top performer is first
  const sortedClicks = [...clicks].sort((a, b) => b.count - a.count);
  const topPlatform = sortedClicks[0];

  return (
    <div className="rounded-lg border border-primary-100 bg-white p-4">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-sm font-bold text-primary-900">
          Donation link activity
        </h3>
        <span className="text-[10px] text-primary-400 uppercase tracking-wider">
          Last 30 days
        </span>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <div className="text-xs text-primary-500">Link clicks</div>
          <div className="mt-1 font-display text-2xl font-bold text-primary-900 tabular-nums">
            {totalClicks.toLocaleString()}
          </div>
          <div className="mt-0.5 text-xs text-primary-400">
            {totalClicks === 0
              ? "No clicks yet"
              : topPlatform
                ? `Top: ${PLATFORM_LABELS[topPlatform.platform] ?? topPlatform.platform}`
                : ""}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-xs text-primary-500">
            <SparkFilledIcon size={11} className="text-spark" />
            Sparks received
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-primary-900 tabular-nums">
            {sparksThisMonth.toLocaleString()}
          </div>
          <div className="mt-0.5 text-xs text-primary-400">
            {sparksThisMonth === 0 ? "No Sparks yet" : "From engaged readers"}
          </div>
        </div>
      </div>

      {/* Per-platform breakdown */}
      {sortedClicks.length === 0
        ? (
            <div className="py-6 text-center">
              <p className="text-sm text-primary-400 italic">
                No donation links set up yet.
              </p>
              <a
                href="/studio/settings/donations"
                className="mt-2 inline-block text-xs font-semibold text-primary-600 underline hover:text-primary-900"
              >
                Add a donation link →
              </a>
            </div>
          )
        : (
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary-400">
                By platform
              </div>
              <ul className="space-y-2.5">
                {sortedClicks.map((row) => {
                  const pct
              = totalClicks > 0 ? (row.count / totalClicks) * 100 : 0;
                  return (
                    <li key={row.platform}>
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <span className="text-xs text-primary-700 truncate">
                          {PLATFORM_LABELS[row.platform] ?? row.platform}
                        </span>
                        <span className="shrink-0 text-xs text-primary-500 tabular-nums">
                          {row.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-primary-100 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-primary-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

      {/* Trust note */}
      <div className="mt-5 pt-4 border-t border-primary-100 flex items-start gap-2 text-xs text-primary-500 leading-relaxed">
        <span className="text-primary-600 mt-0.5 shrink-0" aria-hidden="true">
          ✦
        </span>
        <p>
          FolioSparks takes
          <strong>0%</strong>
          of donations. Clicks go
          straight to your chosen platforms — you keep every cent.
        </p>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

import { SparkFilledIcon } from "../../assets/icons";

interface ChapterRow {
  id: string;
  chapter_number: number;
  title: string | null;
  read_count: number;
  spark_count: number;
  is_published: boolean;
}

interface ChapterBreakdownProps {
  chapters: ChapterRow[];
  storyId: string;
}

export function ChapterBreakdown({
  chapters,
  storyId,
}: ChapterBreakdownProps) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-lg border border-primary-100 bg-white p-6 text-center">
        <p className="text-sm text-primary-400 italic">
          No chapters to analyze yet.
        </p>
      </div>
    );
  }

  // Compute retention: % of readers from chapter 1 who reached chapter N
  const firstReads = chapters[0].read_count || 0;

  return (
    <div className="rounded-lg border border-primary-100 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-primary-100">
        <h3 className="font-display text-sm font-bold text-primary-900">
          Chapter breakdown
        </h3>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-primary-50 text-primary-500 text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left font-medium px-4 py-2">Chapter</th>
            <th className="text-right font-medium px-4 py-2">Reads</th>
            <th className="text-right font-medium px-4 py-2">Sparks</th>
            <th className="text-right font-medium px-4 py-2">Retention</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-100">
          {chapters.map((ch) => {
            const retention = firstReads > 0
              ? Math.round((ch.read_count / firstReads) * 100)
              : 0;

            return (
              <tr key={ch.id} className="hover:bg-primary-50/50">
                <td className="px-4 py-2.5">
                  <Link
                    to={`/studio/story/${storyId}/chapter/${ch.chapter_number}`}
                    className="flex items-center gap-2 min-w-0 group"
                  >
                    <span className="text-xs text-primary-400 tabular-nums w-6 shrink-0">
                      {ch.chapter_number}
                    </span>
                    <span className="text-primary-900 truncate group-hover:text-primary-600">
                      {ch.title ?? `Chapter ${ch.chapter_number}`}
                    </span>
                    {!ch.is_published && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary-400">
                        Draft
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-primary-700">
                  {ch.read_count.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <SparkFilledIcon size={11} className="text-spark" />
                    <span className="text-primary-700 font-medium">
                      {ch.spark_count.toLocaleString()}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  <span
                    className={
                      retention >= 70
                        ? "text-primary-600"
                        : retention >= 40
                          ? "text-amber-600"
                          : "text-primary-400"
                    }
                  >
                    {retention}
                    %
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

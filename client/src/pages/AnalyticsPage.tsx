import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import type { Chapter } from "../types/chapter";
import type { Story } from "../types/story";

import { listChapters } from "../api/chapters";
import { getStoryById } from "../api/stories";
import { PageWrapper } from "../components/layout";
import { ChapterBreakdown, ReadershipChart, SparksChart } from "../components/studio";
import { Card, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useauth";

export function AnalyticsPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const { user } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storyId) {
      return;
    }
    (async () => {
      const [storyRes, chaptersRes] = await Promise.all([
        getStoryById(storyId),
        listChapters(storyId, true),
      ]);
      if (storyRes.data) {
        setStory(storyRes.data as unknown as Story);
      }
      if (chaptersRes.data) {
        setChapters(chaptersRes.data as unknown as Chapter[]);
      }
      setLoading(false);
    })();
  }, [storyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!story || !user || story.author_id !== user.id) {
    return <Navigate to="/studio" replace />;
  }

  // Build dummy sparks-over-time from chapter sparks
  const totalSparks = chapters.reduce((s, c) => s + c.spark_count, 0);

  const sparksData = buildSparkSeries(chapters);
  const readsData = chapters
    .filter(c => c.is_published)
    .map(c => ({ label: `Ch.${c.chapter_number}`, value: c.read_count }));

  return (
    <PageWrapper
      title="Analytics"
      subtitle={story.title}
      size="xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Sparks" value={totalSparks.toLocaleString()} accent />
        <StatCard label="Total reads" value={story.read_count.toLocaleString()} />
        <StatCard label="Chapters published" value={String(chapters.filter(c => c.is_published).length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SparksChart data={sparksData} />
        <ReadershipChart data={readsData} />
      </div>

      <ChapterBreakdown
        chapters={chapters.map(c => ({
          id: c.id,
          chapter_number: c.chapter_number,
          title: c.title,
          read_count: c.read_count,
          spark_count: c.spark_count,
          is_published: c.is_published,
        }))}
        storyId={story.id}
      />
    </PageWrapper>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className={`p-5 ${accent ? "border-spark/40 bg-spark/5" : ""}`}>
      <p className="text-xs font-medium text-primary-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-primary-900 tabular-nums">
        {value}
      </p>
    </Card>
  );
}

function buildSparkSeries(chapters: Chapter[]) {
  return chapters
    .filter(c => c.is_published && c.published_at)
    .map(c => ({
      date: c.published_at!,
      value: c.spark_count,
    }));
}

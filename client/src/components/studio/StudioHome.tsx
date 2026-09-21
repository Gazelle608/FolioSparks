import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Chapter } from "../../types/chapter";
import type { Story } from "../../types/story";

import { listChapters } from "../../api/chapters";
import {
  deleteStory,
  getStoriesByAuthor,
  getStoryById,
} from "../../api/stories";
import { PollIcon, SparkOutlineIcon } from "../../assets/icons";
import { useAuth } from "../../hooks/useauth";
import { Button, Card, Spinner, TabPanel, Tabs, useToast } from "../ui";
import { ChapterByChapterUpload } from "./ChapterByChapterUpload";
import { FullManuscriptUpload } from "./FullManuscriptUpload";
import { PublishChoice } from "./PublishChoice";
import { StoryDraftList } from "./storydraftlist";
import { StudioStats } from "./studiostats";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface StudioHomeProps {
  /** When set, shows a single story with tabbed editing instead of the list */
  storyId?: string;
}

type StoryTab = "chapters" | "details" | "analytics" | "desk";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function StudioHome({ storyId }: StudioHomeProps) {
  // Route into story mode
  if (storyId)
    return <StoryWorkspace storyId={storyId} />;
  return <StoryList />;
}

// ===========================================================================
// STORY LIST — the /studio home page
// ===========================================================================
function StoryList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user)
      return;
    setLoading(true);
    const result = await getStoriesByAuthor(user.id, true);
    if (result.data)
      setStories(result.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    const result = await deleteStory(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Story deleted");
    load();
  };

  // Derived totals
  const totalSparks = stories.reduce((s, st) => s + st.spark_count, 0);
  const totalReads = stories.reduce((s, st) => s + st.read_count, 0);
  const publishedCount = stories.filter(
    s => s.status !== "draft",
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary-900">
            Author studio
          </h1>
          <p className="mt-1.5 text-sm text-primary-500">
            Everything you write lives here as a draft until you publish it.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/studio/new")}
        >
          New story
        </Button>
      </header>

      {/* Stats */}
      <StudioStats
        stories={stories.length}
        published={publishedCount}
        sparksReceived={totalSparks}
        totalReads={totalReads}
      />

      {/* Story list */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-primary-900">
            Your stories
          </h2>
          {!loading && stories.length > 0 && (
            <span className="text-xs text-primary-400 tabular-nums">
              {stories.length}
              {" "}
              {stories.length === 1 ? "story" : "stories"}
            </span>
          )}
        </div>

        {loading
          ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" label="Loading your stories…" />
              </div>
            )
          : (
              <StoryDraftList
                stories={stories}
                onDelete={handleDelete}
                onCreateClick={() => navigate("/studio/new")}
              />
            )}
      </section>

      {/* Quick links to settings */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Card
          interactive
          className="p-5"
          onClick={() => navigate("/studio/settings/donations")}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-spark/20 flex items-center justify-center">
              <SparkOutlineIcon size={18} className="text-spark" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-sm font-bold text-primary-900">
                Donation links
              </h3>
              <p className="mt-1 text-xs text-primary-500">
                Where readers support you directly. 0% platform cut.
              </p>
            </div>
          </div>
        </Card>

        <Card
          interactive
          className="p-5"
          onClick={() => {
            // Placeholder — the analytics overview page lives at /studio/analytics
            if (stories[0]) {
              navigate(`/studio/story/${stories[0].id}/analytics`);
            }
            else {
              toast.error("Publish a story first");
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <PollIcon size={18} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-sm font-bold text-primary-900">
                Analytics
              </h3>
              <p className="mt-1 text-xs text-primary-500">
                See which chapters earned the most Sparks.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

// ===========================================================================
// STORY WORKSPACE — /studio/story/:id
// ===========================================================================
function StoryWorkspace({ storyId }: { storyId: string }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StoryTab>("chapters");
  const [flow, setFlow] = useState<
    "idle" | "publish-choice" | "full-manuscript" | "chapter-by-chapter"
  >("idle");

  // ---------------------------------------------------------------------------
  // Load story + chapters
  // ---------------------------------------------------------------------------
  const load = async () => {
    setLoading(true);

    const [storyRes, chaptersRes] = await Promise.all([
      getStoryById(storyId),
      listChapters(storyId, true), // include unpublished
    ]);

    if (storyRes.error) {
      toast.error(storyRes.error);
      setLoading(false);
      return;
    }

    setStory(storyRes.data!);
    setChapters(chaptersRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [storyId]);

  // ---------------------------------------------------------------------------
  // Flow: pick publish path on a fresh draft
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (story?.status === "draft" && chapters.length === 0) {
      setFlow("publish-choice");
    }
  }, [story?.status, chapters.length]);

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" label="Loading story…" />
      </div>
    );
  }

  if (!story) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-primary-500">Story not found.</p>
        <Button
          variant="primary"
          size="sm"
          className="mt-4"
          onClick={() => navigate("/studio")}
        >
          Back to studio
        </Button>
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // Publish flow screens
  // ---------------------------------------------------------------------------
  if (flow === "publish-choice") {
    return (
      <Card className="p-6 sm:p-8 max-w-3xl mx-auto">
        <PublishChoice
          storyTitle={story.title}
          onChoose={(mode) => {
            setFlow(mode === "full_manuscript" ? "full-manuscript" : "chapter-by-chapter");
          }}
          onCancel={() => navigate("/studio")}
        />
      </Card>
    );
  }

  if (flow === "full-manuscript") {
    return (
      <Card className="p-6 sm:p-8 max-w-3xl mx-auto">
        <FullManuscriptUpload
          storyId={story.id}
          authorId={story.author_id}
          onDone={() => {
            setFlow("idle");
            load();
            navigate(`/story/${story.slug}`, { replace: false });
          }}
          onCancel={() => setFlow("publish-choice")}
        />
      </Card>
    );
  }

  if (flow === "chapter-by-chapter") {
    return (
      <Card className="p-6 sm:p-8 max-w-3xl mx-auto">
        <ChapterByChapterUpload
          storyId={story.id}
          authorId={story.author_id}
          onDone={(num) => {
            setFlow("idle");
            load();
            navigate(`/studio/story/${story.id}/chapter/${num}`);
          }}
          onCancel={() => setFlow("publish-choice")}
        />
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // Story header
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-primary-400 uppercase tracking-wider mb-2">
            <button
              type="button"
              onClick={() => navigate("/studio")}
              className="hover:text-primary-700"
            >
              ← Studio
            </button>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-900 truncate">
            {story.title}
          </h1>
          <p className="mt-1 text-sm text-primary-500">
            {story.chapter_count}
            {" "}
            {story.chapter_count === 1 ? "chapter" : "chapters"}
            {story.word_count > 0 && ` · ${formatWords(story.word_count)}`}
            {" · "}
            <span className="capitalize">{story.status}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/story/${story.slug}`, "_blank")}
          >
            View on site
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(`/studio/story/${story.id}/chapter/${nextChapterNumber(chapters)}`)}
          >
            {chapters.length === 0 ? "Start writing" : "New chapter"}
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs
        items={[
          { id: "chapters", label: "Chapters", badge: chapters.length },
          { id: "details", label: "Details" },
          { id: "analytics", label: "Analytics" },
          { id: "desk", label: "Co-writing desk" },
        ]}
        value={activeTab}
        onChange={id => setActiveTab(id as StoryTab)}
      />

      {/* Tab content */}
      <TabPanel id="chapters" activeId={activeTab}>
        <ChaptersPanel
          story={story}
          chapters={chapters}
          onReload={load}
          onOpenChapter={num =>
            navigate(`/studio/story/${story.id}/chapter/${num}`)}
        />
      </TabPanel>

      <TabPanel id="details" activeId={activeTab}>
        <Card className="p-6">
          <p className="text-sm text-primary-500">
            Story details editor — title, synopsis, tags, cover, genre.
            Wire this to
            <code>EditStoryPage</code>
            .
          </p>
        </Card>
      </TabPanel>

      <TabPanel id="analytics" activeId={activeTab}>
        <Card className="p-6">
          <p className="text-sm text-primary-500">
            Analytics — embed
            <code>SparksChart</code>
            ,
            {" "}
            <code>ReadershipChart</code>
            , and
            <code>ChapterBreakdown</code>
            {" "}
            here.
          </p>
        </Card>
      </TabPanel>

      <TabPanel id="desk" activeId={activeTab}>
        <Card className="p-6">
          <p className="text-sm text-primary-500">
            Co-writing desk panel — embed
            <code>DeskCard</code>
            here. Create
            a desk if none exists.
          </p>
        </Card>
      </TabPanel>
    </div>
  );
}

// ===========================================================================
// CHAPTERS PANEL
// ===========================================================================
function ChaptersPanel({
  story,
  chapters,
  onReload,
  onOpenChapter,
}: {
  story: Story;
  chapters: Chapter[];
  onReload: () => void;
  onOpenChapter: (chapterNumber: number) => void;
}) {
  const toast = useToast();

  if (chapters.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-primary-500">
          No chapters yet. Start writing to add the first one.
        </p>
      </Card>
    );
  }

  return (
    <ul className="space-y-2">
      {chapters.map((ch) => {
        const isDraft = !ch.is_published;
        const isScheduled = isDraft && !!ch.scheduled_for;

        return (
          <li
            key={ch.id}
            className="flex items-center gap-4 p-3 rounded-lg border border-primary-100 bg-white hover:border-primary-300 transition-colors"
          >
            <span className="shrink-0 w-10 text-center text-xs text-primary-400 tabular-nums">
              {ch.chapter_number}
            </span>

            <button
              type="button"
              onClick={() => onOpenChapter(ch.chapter_number)}
              className="flex-1 min-w-0 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary-900 truncate">
                  {ch.title ?? `Chapter ${ch.chapter_number}`}
                </span>
                {isScheduled && (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Scheduled
                  </span>
                )}
                {isDraft && !isScheduled && (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary-400">
                    Draft
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-primary-400">
                {ch.word_count.toLocaleString()}
                words
                {!isDraft && (
                  <>
                    {" · "}
                    {ch.read_count.toLocaleString()}
                    reads ·
                    {" "}
                    {ch.spark_count.toLocaleString()}
                    sparks
                  </>
                )}
                {isScheduled && ch.scheduled_for && (
                  <>
                    {" "}
                    ·
                    {" "}
                    publishes
                    {formatWhen(ch.scheduled_for)}
                  </>
                )}
              </p>
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChapter(ch.chapter_number)}
            >
              Edit
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

// ===========================================================================
// Helpers
// ===========================================================================
function nextChapterNumber(chapters: Chapter[]): number {
  if (chapters.length === 0)
    return 1;
  return Math.max(...chapters.map(c => c.chapter_number)) + 1;
}

function formatWords(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1)}M words`;
  if (n >= 1_000)
    return `${Math.round(n / 1_000)}k words`;
  return `${n} words`;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const diff = d.getTime() - Date.now();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
    return `in ${minutes}m`;
  }
  if (hours < 24)
    return `in ${hours}h`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

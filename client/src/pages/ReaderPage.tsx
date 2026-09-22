import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useChapter } from "../hooks/usechapter";
import { useChapterPoll } from "../hooks/usepolls";
import { useSparks } from "../hooks/usesparks";
import { useAuth } from "../hooks/useauth";
import { useReadingProgress } from "../hooks/usereadingprogress";
import {
  ChapterReader,
  ReaderTopBar,
  ChapterGate,
  SparkModal,
  loadReaderPrefs,
  saveReaderPrefs,
  type ReaderPrefs,
} from "../components/reader";
import { PollCard } from "../components/polls";
import { DonationBanner } from "../components/donation";
import { Button, Spinner } from "../components/ui";
import { ArrowRightIcon } from "../assets/icons";
import { useEffect } from "react";

const PUBLIC_CHAPTER_LIMIT = 3;

export function ReaderPage() {
  const { slug, chapterNumber } = useParams<{
    slug: string;
    chapterNumber: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, spend } = useSparks();

  const chapterNum = Number(chapterNumber);
  const [prefs, setPrefs] = useState<ReaderPrefs>(loadReaderPrefs);
  const [sparkModalOpen, setSparkModalOpen] = useState(false);

  // Resolve story first, then chapter
  // (In a full app you"d fetch story by slug; for brevity we assume storyId comes from slug mapping)
  const storyId = slug ?? null;

  const { chapter, previous, next, loading } = useChapter(storyId, chapterNum);

  const { updateProgress } = useReadingProgress({
    storyId,
    chapterId: chapter?.id ?? null,
    restoreOnMount: true,
  });

  const { poll } = useChapterPoll(chapter?.id ?? null);

  // Persist reader prefs
  useEffect(() => {
    saveReaderPrefs(prefs);
  }, [prefs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Spinner size="lg" label="Loading chapter…" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-primary-900">
            Chapter not found
          </h1>
          <Link to={`/story/${slug}`} className="inline-block mt-4">
            <Button variant="primary">Back to story</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = !user && chapter.chapter_number > PUBLIC_CHAPTER_LIMIT;

  return (
    <div className="min-h-screen bg-primary-50">
      <ReaderTopBar
        prefs={prefs}
        onPrefsChange={setPrefs}
        onBack={() => navigate(`/story/${slug}`)}
      />

      {isLocked
        ? (
            <div className="mx-auto max-w-2xl px-4 py-12">
              <ChapterGate
                storyTitle="this story"
                chapterNumber={chapter.chapter_number}
                preview={chapter.content.slice(0, 600)}
              />
            </div>
          ) : (
            <>
              <ChapterReader
                storySlug={slug!}
                storyTitle="the story"
                chapter={chapter}
                previous={previous}
                next={next}
                prefs={prefs}
                onSparkClick={() => setSparkModalOpen(true)}
                onProgressChange={pct => updateProgress(pct)}
              />

              {/* Chapter-end extras */}
              <div className="mx-auto max-w-2xl px-4 pb-24 space-y-6">
                {/* Poll attached to this chapter */}
                {poll && (
                  <PollCard poll={poll} variant="chapter-end" />
                )}

                {/* Donation nudge */}
                <DonationBanner variant="chapter-end" />

                {/* Next chapter teaser */}
                {next && (
                  <Link
                    to={`/read/${slug}/${next.chapter_number}`}
                    className="block rounded-lg border border-primary-200 bg-white p-5 hover:border-primary-400 transition-colors"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-primary-500 mb-1">
                      Next chapter
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-lg font-bold text-primary-900 truncate">
                        {next.title ?? `Chapter ${next.chapter_number}`}
                      </span>
                      <ArrowRightIcon size={18} className="text-primary-500 shrink-0" />
                    </div>
                  </Link>
                )}
              </div>
            </>
          )}

      <SparkModal
        isOpen={sparkModalOpen}
        onClose={() => setSparkModalOpen(false)}
        chapterTitle={chapter.title ?? `Chapter ${chapter.chapter_number}`}
        authorName="the author"
        balance={balance}
        onSend={async (amount, note) => {
          const result = await spend(chapter.id, amount, note);
          return { error: result.error };
        }}
      />
    </div>
  );
}

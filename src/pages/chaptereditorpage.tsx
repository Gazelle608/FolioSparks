import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import type { Chapter } from "../types/chapter";
import type { Story } from "../types/story";

import { getChapterByNumber } from "../api/chapters";
import { getStoryById } from "../api/stories";
import { ArrowRightIcon } from "../assets/icons";
import { PageWrapper } from "../components/layout";
import { PollCard } from "../components/polls";
import { ChapterEditor, PublishPreview } from "../components/studio";
import { Button, Card, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useauth";
import { useChapterPoll } from "../hooks/usepolls";

export function ChapterEditorPage() {
  const { storyId, chapterNumber } = useParams<{
    storyId: string;
    chapterNumber: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { poll } = useChapterPoll(chapter?.id ?? null);

  useEffect(() => {
    if (!storyId || !chapterNumber) {
      return;
    }
    (async () => {
      const [storyRes, chapterRes] = await Promise.all([
        getStoryById(storyId),
        getChapterByNumber(storyId, Number(chapterNumber)),
      ]);
      if (storyRes.data) {
        setStory(storyRes.data as unknown as Story);
      }
      if (chapterRes.data) {
        setChapter(chapterRes.data as Chapter);
      }
      setLoading(false);
    })();
  }, [storyId, chapterNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!story || !chapter || !user || story.author_id !== user.id) {
    return <Navigate to="/studio" replace />;
  }

  const storySlug = story.slug;
  const isPublished = chapter.is_published;

  return (
    <PageWrapper
      size="lg"
      title={`Chapter ${chapter.chapter_number}`}
      subtitle={story.title}
      action={(
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <Button
            variant="ghost"
            rightIcon={<ArrowRightIcon size={14} />}
            onClick={() => navigate(`/studio/story/${story.id}`)}
          >
            Back to story
          </Button>
        </div>
      )}
    >
      <ChapterEditor
        chapter={chapter}
        storySlug={storySlug}
        onSaved={next => setChapter(next)}
      />

      {isPublished && !poll && (
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="font-display text-base font-bold text-primary-900 mb-2">
              Attach a reader poll
            </h3>
            <p className="text-sm text-primary-500 mb-4">
              Let readers decide what happens next. The winning option becomes
              canon for the following chapter.
            </p>
            <Button variant="primary" onClick={() => navigate(`/studio/story/${story.id}`)}>
              Open poll builder
            </Button>
          </Card>
        </div>
      )}

      {poll && (
        <div className="mt-8">
          <PollCard poll={poll} variant="chapter-end" />
        </div>
      )}

      <PublishPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={chapter.title ?? `Chapter ${chapter.chapter_number}`}
        content={chapter.content}
        chapterNumber={chapter.chapter_number}
      />
    </PageWrapper>
  );
}

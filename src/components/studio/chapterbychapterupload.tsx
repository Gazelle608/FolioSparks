import { useState } from "react";

import { createChapter } from "../../api/chapters";
import { updateStory } from "../../api/stories";
import { Button, Card, Input, useToast } from "../ui";

interface ChapterByChapterUploadProps {
  storyId: string;
  authorId: string;
  onDone: (firstChapterNumber: number) => void;
  onCancel: () => void;
}

export function ChapterByChapterUpload({
  storyId,
  authorId,
  onDone,
  onCancel,
}: ChapterByChapterUploadProps) {
  const toast = useToast();
  const [firstTitle, setFirstTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setSubmitting(true);
    setError(null);

    // 1. Set publish_mode
    await updateStory(storyId, { publish_mode: "chapter_by_chapter" });

    // 2. Create the first chapter shell
    const result = await createChapter({
      story_id: storyId,
      author_id: authorId,
      chapter_number: 1,
      title: firstTitle.trim() || "Chapter 1",
      content: "",
      is_published: false,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    toast.success("Draft chapter created");
    onDone(1);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary-900">
          Start your first chapter
        </h1>
        <p className="mt-2 text-sm text-primary-500">
          You"ll write and publish one chapter at a time. Schedule them ahead
          to keep readers on a rhythm.
        </p>
      </header>

      <Card className="p-5 space-y-5">
        <Input
          label="First chapter title"
          placeholder="The Lantern"
          value={firstTitle}
          onChange={e => setFirstTitle(e.target.value)}
          hint="You can rename it later."
          disabled={submitting}
          autoFocus
          maxLength={120}
        />

        <div className="rounded-md bg-primary-50 p-3 text-xs text-primary-600 leading-relaxed">
          <strong className="text-primary-900">Tip:</strong>
          Chapters 1–3 are
          readable by anyone without signing up. That"s how you hook new
          readers before they hit the account gate.
        </div>

        {error && (
          <div
            role="alert"
            className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
          >
            {error}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between pt-4 border-t border-primary-100">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          loading={submitting}
          onClick={handleStart}
        >
          Create and start writing
        </Button>
      </div>
    </div>
  );
}

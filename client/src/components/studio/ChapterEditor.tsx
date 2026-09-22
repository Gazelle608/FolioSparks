import { useEffect, useRef, useState } from "react";

import type { Chapter } from "../../types/chapter";

import { publishChapter, scheduleChapter, unpublishChapter, updateChapter } from "../../api/chapters";
import { Button, Input, useToast } from "../ui";
import { RichTextToolbar } from "./richtexttoolbar";
import { WordCounter } from "./wordcount";

interface ChapterEditorProps {
  chapter: Chapter;
  storySlug: string;
  /** Called after successful save (any kind) */
  onSaved?: (next: Chapter) => void;
  /** Called when the author wants to attach a poll (post-publish) */
  onAttachPoll?: () => void;
}

const AUTOSAVE_DELAY_MS = 1500;

export function ChapterEditor({
  chapter,
  storySlug,
  onSaved,
  onAttachPoll,
}: ChapterEditorProps) {
  const toast = useToast();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(chapter.title ?? `Chapter ${chapter.chapter_number}`);
  const [content, setContent] = useState(chapter.content);
  const [savedChapter, setSavedChapter] = useState(chapter);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [publishing, setPublishing] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  // ---------------------------------------------------------------------------
  // Autosave
  // ---------------------------------------------------------------------------
  const hasChanges = title !== (savedChapter.title ?? `Chapter ${chapter.chapter_number}`)
    || content !== savedChapter.content;

  useEffect(() => {
    if (!hasChanges)
      return;

    const timer = setTimeout(async () => {
      setSaveState("saving");

      const result = await updateChapter(savedChapter.id, { title, content });

      if (result.error) {
        setSaveState("error");
        return;
      }

      const nextChapter: Chapter = { ...savedChapter, ...result.data! };
      setSavedChapter(nextChapter);
      setSaveState("saved");
      onSaved?.(nextChapter);

      // Reset the "Saved" badge after a moment
      setTimeout(() => setSaveState("idle"), 2000);
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [title, content, hasChanges, savedChapter.id, onSaved]);

  // Warn on navigate away with unsaved changes
  useEffect(() => {
    if (!hasChanges)
      return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  // ---------------------------------------------------------------------------
  // Insert markdown from toolbar
  // ---------------------------------------------------------------------------
  const handleInsert = (before: string, after: string = "") => {
    const el = contentRef.current;
    if (!el)
      return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);

    const next
    = content.slice(0, start)
      + before
      + selected
      + after
      + content.slice(end);

    setContent(next);

    // Restore cursor position after React rerenders
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = end + before.length;
    });
  };

  // ---------------------------------------------------------------------------
  // Publish / schedule
  // ---------------------------------------------------------------------------
  const handlePublish = async () => {
    if (hasChanges) {
      // Save first
      const saveResult = await updateChapter(savedChapter.id, { title, content });
      if (saveResult.error) {
        toast.error(saveResult.error);
        return;
      }
    }

    setPublishing(true);
    const result = await publishChapter(savedChapter.id);
    setPublishing(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSavedChapter(current => ({ ...current, ...result.data! }));
    toast.success("Chapter published");

    if (onAttachPoll) {
      setTimeout(() => onAttachPoll(), 600);
    }
  };

  const handleUnpublish = async () => {
    // eslint-disable-next-line no-alert
    if (!confirm("Unpublish this chapter? Readers will no longer see it."))
      return;

    const result = await unpublishChapter(savedChapter.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSavedChapter(current => ({ ...current, ...result.data! }));
    toast.success("Chapter unpublished");
  };

  const handleSchedule = async () => {
    if (!scheduleDate)
      return;

    const result = await scheduleChapter(
      savedChapter.id,
      new Date(scheduleDate).toISOString(),
    );

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSavedChapter(current => ({ ...current, ...result.data! }));
    setScheduleOpen(false);
    toast.success("Chapter scheduled");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const isPublished = savedChapter.is_published;
  const isScheduled = !isPublished && !!savedChapter.scheduled_for;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-primary-400 uppercase tracking-wider tabular-nums">
            Ch.
            {savedChapter.chapter_number}
          </span>
          <SaveBadge state={saveState} />
        </div>

        <div className="flex items-center gap-2">
          <WordCounter text={content} />

          {isPublished
            ? (
                <>
                  <a
                    href={`/story/${storySlug}/${savedChapter.chapter_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </a>
                  <Button variant="ghost" size="sm" onClick={handleUnpublish}>
                    Unpublish
                  </Button>
                </>
              )
            : isScheduled
              ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setScheduleDate(
                          savedChapter.scheduled_for!.slice(0, 16),
                        );
                        setScheduleOpen(true);
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handlePublish}
                      loading={publishing}
                      disabled={!content.trim()}
                    >
                      Publish now
                    </Button>
                  </>
                )
              : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setScheduleOpen(true)}
                    >
                      Schedule
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handlePublish}
                      loading={publishing}
                      disabled={!content.trim()}
                    >
                      Publish chapter
                    </Button>
                  </>
                )}
        </div>
      </div>

      {/* Title */}
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder={`Chapter ${savedChapter.chapter_number}`}
        className="!text-xl !font-display !font-bold !h-14"
        maxLength={120}
      />

      {/* Rich text toolbar */}
      <RichTextToolbar onInsert={handleInsert} />

      {/* Content */}
      <textarea
        ref={contentRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Start writing…"
        className="w-full min-h-[60vh] p-5 rounded-lg border border-primary-200 bg-white text-base leading-relaxed font-display text-primary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-y"
        spellCheck
      />

      {/* Schedule modal */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-primary-900">
              Schedule publication
            </h3>
            <p className="text-sm text-primary-500">
              The chapter will go live automatically at the time you pick.
            </p>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              min={new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)}
              className="w-full h-10 px-3 rounded-md border border-primary-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setScheduleOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSchedule}
                disabled={!scheduleDate}
              >
                Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function SaveBadge({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle")
    return null;

  const map = {
    saving: { text: "Saving…", className: "text-primary-400" },
    saved: { text: "✓ Saved", className: "text-primary-600" },
    error: { text: "Save failed", className: "text-danger" },
  };

  const s = map[state];
  return <span className={`text-xs ${s.className}`}>{s.text}</span>;
}

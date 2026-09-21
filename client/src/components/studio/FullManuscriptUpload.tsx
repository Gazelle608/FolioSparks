/* eslint-disable no-cond-assign */
import { useMemo, useState } from "react";

import { bulkCreateChapters } from "../../api/chapters";
import { publishStory, updateStory } from "../../api/stories";
import { Button, Card, useToast } from "../ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FullManuscriptUploadProps {
  storyId: string;
  authorId: string;
  onDone: () => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Parsed chapter shape
// ---------------------------------------------------------------------------
interface ParsedChapter {
  chapter_number: number;
  title: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Detect chapters from raw text.
// Handles: "Chapter 1", "CHAPTER ONE", "Part II", "1. Title", "## Heading"
// Falls back to splitting on 3+ blank lines if no headings are found.
// ---------------------------------------------------------------------------
function parseManuscript(raw: string): ParsedChapter[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text)
    return [];

  const headingRegex
  = /^(?:chapter\s+(?:\d+|[ivxlc]+|one|two|three|four|five|six|seven|eight|nine|ten)|part\s+(?:\d+|[ivxlc]+)|\d+\s*[.\-–—]|#{1,3}\s+(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]))$/gim;

  const parts: { title: string; content: string }[] = [];
  let lastIndex = 0;
  let lastTitle = "";
  let match: RegExpExecArray | null;

  headingRegex.lastIndex = 0;

  while ((match = headingRegex.exec(text)) !== null) {
    const chunk = text.slice(lastIndex, match.index).trim();

    if (chunk || parts.length === 0) {
      parts.push({
        title: lastTitle || "Opening",
        content: chunk,
      });
    }

    lastTitle = match[0].trim();
    lastIndex = match.index + match[0].length;
  }

  const tail = text.slice(lastIndex).trim();
  if (tail) {
    parts.push({
      title: lastTitle || "Opening",
      content: tail,
    });
  }

  // No headings detected — split on 3+ blank lines
  if (parts.length <= 1) {
    const sections = text.split(/\n\s*\n\s*\n/).filter(s => s.trim());
    return sections.map((s, i) => ({
      chapter_number: i + 1,
      title: `Chapter ${i + 1}`,
      content: s.trim(),
    }));
  }

  return parts
    .filter(p => p.content.length > 0)
    .map((p, i) => ({
      chapter_number: i + 1,
      title: p.title || `Chapter ${i + 1}`,
      content: p.content,
    }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FullManuscriptUpload({
  storyId,
  authorId,
  onDone,
  onCancel,
}: FullManuscriptUploadProps) {
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapters = useMemo(() => parseManuscript(raw), [raw]);

  const totalWords = useMemo(
    () =>
      chapters.reduce(
        (sum, c) => sum + c.content.split(/\s+/).filter(Boolean).length,
        0,
      ),
    [chapters],
  );

  // -------------------------------------------------------------------------
  // File upload handler
  // -------------------------------------------------------------------------
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file)
      return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Manuscript must be under 5 MB");
      return;
    }

    setFileName(file.name);
    setError(null);

    // Only plain text/markdown parsed client-side
    if (
      file.type.startsWith("text/")
      || file.name.endsWith(".txt")
      || file.name.endsWith(".md")
    ) {
      try {
        const text = await file.text();
        setRaw(text);
      }
      catch {
        setError("Could not read the file. Try pasting the text instead.");
      }
    }
    else {
      setError("For now, paste your manuscript or upload a .txt or .md file.");
    }
  };

  // -------------------------------------------------------------------------
  // Publish handler
  // -------------------------------------------------------------------------
  const handlePublish = async () => {
    if (chapters.length === 0)
      return;
    setPublishing(true);
    setError(null);

    // 1. Create chapters as drafts first
    const result = await bulkCreateChapters({
      story_id: storyId,
      author_id: authorId,
      chapters: chapters.map(c => ({
        chapter_number: c.chapter_number,
        title: c.title,
        content: c.content,
      })),
      publishNow: false,
    });

    if (result.error) {
      setPublishing(false);
      setError(result.error);
      toast.error(result.error);
      return;
    }

    // 2. Set publish_mode
    const modeResult = await updateStory(storyId, {
      publish_mode: "full_manuscript",
    });

    if (modeResult.error) {
      setPublishing(false);
      setError(modeResult.error);
      return;
    }

    // 3. Publish the story
    const pubResult = await publishStory(storyId);
    setPublishing(false);

    if (pubResult.error) {
      setError(pubResult.error);
      toast.error(pubResult.error);
      return;
    }

    toast.success(`Published ${chapters.length} chapters`);
    onDone();
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="font-display text-2xl font-bold text-primary-900">
          Upload your manuscript
        </h1>
        <p className="mt-2 text-sm text-primary-500">
          Paste your full text or upload a file. We"ll split it into chapters
          automatically — you can rename them after.
        </p>
      </header>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {!raw
        ? (
            <Card className="p-8 text-center border-2 border-dashed border-primary-200">
              <label className="cursor-pointer block">
                <div className="flex flex-col items-center gap-3">
                  <UploadGlyph className="w-10 h-10 text-primary-400" />
                  <div>
                    <p className="font-medium text-primary-900">
                      Choose a file or paste below
                    </p>
                    <p className="mt-1 text-xs text-primary-400">
                      .txt or .md — up to 5 MB
                    </p>
                  </div>
                  <span className="inline-flex items-center h-9 px-4 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                    Select file
                  </span>
                </div>
                <input
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  onChange={handleFile}
                  className="sr-only"
                />
              </label>
              <div className="mt-6 text-xs uppercase tracking-wider text-primary-400">
                or
              </div>
              <textarea
                placeholder="Paste your manuscript here…"
                value={raw}
                onChange={e => setRaw(e.target.value)}
                rows={6}
                className="mt-6 w-full p-3 rounded-md border border-primary-200 text-sm text-primary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-y font-mono"
              />
            </Card>
          )
        : (
            <>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-primary-900">
                      {chapters.length}
                      {" "}
                      {chapters.length === 1 ? "chapter" : "chapters"}
                      detected
                    </p>
                    <p className="text-xs text-primary-500">
                      {totalWords.toLocaleString()}
                      words total
                      {fileName && ` · from ${fileName}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRaw("");
                      setFileName(null);
                      setError(null);
                    }}
                  >
                    Start over
                  </Button>
                </div>
                <ul className="max-h-64 overflow-y-auto divide-y divide-primary-100 rounded-md border border-primary-100">
                  {chapters.map(c => (
                    <li
                      key={c.chapter_number}
                      className="p-3 flex items-start gap-3"
                    >
                      <span className="shrink-0 w-8 text-center text-xs text-primary-400 tabular-nums pt-0.5">
                        {c.chapter_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-900 truncate">
                          {c.title}
                        </p>
                        <p className="mt-0.5 text-xs text-primary-400 line-clamp-1">
                          {c.content.slice(0, 120)}
                          …
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-primary-400 tabular-nums">
                        {c.content.split(/\s+/).filter(Boolean).length}
                        w
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t border-primary-100">
        <Button variant="ghost" onClick={onCancel} disabled={publishing}>
          Back
        </Button>

        <Button
          variant="primary"
          size="lg"
          loading={publishing}
          disabled={chapters.length === 0}
          onClick={handlePublish}
        >
          {chapters.length > 0
            ? `Publish ${chapters.length} chapters`
            : "Publish"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline glyph
// ---------------------------------------------------------------------------
function UploadGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 15V3m0 0L7 8m5-5l5 5M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

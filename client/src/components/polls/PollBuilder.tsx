import { useState } from "react";

import { createPoll } from "../../api/polls";
import { Button, Input, Textarea } from "../ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PollBuilderProps {
  storyId: string;
  authorId: string;
  /** Chapter the poll is attached to (usually the chapter just published) */
  chapterId: string;
  /** Called after successful creation with the new poll id */
  onCreated?: (pollId: string) => void;
  /** Called when the author cancels */
  onCancel?: () => void;
}

interface DraftOption {
  id: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const MAX_QUESTION_LEN = 200;
const MAX_DESCRIPTION_LEN = 400;
const MAX_OPTION_LEN = 120;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PollBuilder({
  storyId,
  authorId,
  chapterId,
  onCreated,
  onCancel,
}: PollBuilderProps) {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<DraftOption[]>([
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
  ]);
  const [closesAt, setClosesAt] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Option management
  // ---------------------------------------------------------------------------
  const updateOption = (id: string, text: string) => {
    setOptions(prev => prev.map(o => (o.id === id ? { ...o, text } : o)));
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS)
      return;
    setOptions(prev => [...prev, { id: crypto.randomUUID(), text: "" }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= MIN_OPTIONS)
      return;
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!question.trim())
      next.question = "Ask a question";
    else if (question.length > MAX_QUESTION_LEN)
      next.question = `Max ${MAX_QUESTION_LEN} characters`;

    const filled = options.filter(o => o.text.trim().length > 0);
    if (filled.length < MIN_OPTIONS)
      next.options = `Add at least ${MIN_OPTIONS} options`;
    if (filled.some(o => o.text.length > MAX_OPTION_LEN))
      next.options = `Each option max ${MAX_OPTION_LEN} characters`;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = async () => {
    setTopError(null);
    if (!validate())
      return;

    setSubmitting(true);

    const result = await createPoll({
      story_id: storyId,
      author_id: authorId,
      chapter_id: chapterId,
      question: question.trim(),
      description: description.trim() || undefined,
      closes_at: closesAt ? new Date(closesAt).toISOString() : undefined,
      options: options.map(o => o.text.trim()).filter(Boolean),
    });

    setSubmitting(false);

    if (result.error) {
      setTopError(result.error);
      return;
    }

    onCreated?.(result.data!.id);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="rounded-lg border border-primary-100 bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-primary-100">
        <h2 className="font-display text-lg font-bold text-primary-900">
          Attach a reader poll
        </h2>
        <p className="mt-1 text-sm text-primary-500">
          Readers vote on what happens next. The winning option becomes canon
          for your next chapter.
        </p>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Question */}
        <Textarea
          label="Question"
          placeholder="What should Amaka trade her name for?"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          maxLength={MAX_QUESTION_LEN}
          showCount
          error={errors.question}
          disabled={submitting}
        />

        {/* Description */}
        <Textarea
          label="Context (optional)"
          placeholder="A line about why this decision matters…"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION_LEN}
          showCount
          disabled={submitting}
        />

        {/* Options */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-primary-900">
              Options
              (
              {options.length}
              /
              {MAX_OPTIONS}
              )
            </label>
            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="text-xs font-semibold text-primary-600 hover:text-primary-900"
              >
                + Add option
              </button>
            )}
          </div>

          <div className="space-y-2">
            {options.map((option, i) => (
              <div key={option.id} className="flex items-center gap-2">
                <span className="shrink-0 w-6 text-center text-xs text-primary-400 tabular-nums">
                  {i + 1}
                </span>
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={option.text}
                  onChange={e => updateOption(option.id, e.target.value)}
                  maxLength={MAX_OPTION_LEN}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  disabled={options.length <= MIN_OPTIONS || submitting}
                  aria-label="Remove option"
                  className="shrink-0 p-2 rounded-md text-primary-400 hover:text-danger hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <TrashGlyph />
                </button>
              </div>
            ))}
          </div>

          {errors.options && (
            <p className="mt-2 text-xs text-danger">{errors.options}</p>
          )}
        </div>

        {/* Close date */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-primary-900">
            Close on (optional)
          </label>
          <input
            type="datetime-local"
            value={closesAt}
            onChange={e => setClosesAt(e.target.value)}
            disabled={submitting}
            min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
            className="w-full h-10 px-3 rounded-md border border-primary-200 bg-white text-sm text-primary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
          <p className="mt-1 text-xs text-primary-400">
            Leave empty to close manually when your next chapter is ready.
          </p>
        </div>

        {/* Top error */}
        {topError && (
          <div
            role="alert"
            className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
          >
            {topError}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-primary-100 flex items-center justify-end gap-3">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={submitting}
        >
          Attach poll to chapter
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline glyph
// ---------------------------------------------------------------------------
function TrashGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16M9 6V4h6v2m-8 0v14a2 2 0 002 2h6a2 2 0 002-2V6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

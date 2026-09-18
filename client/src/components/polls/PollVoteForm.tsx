import { useState } from "react";

import type { Poll, PollOption } from "../../types/poll";

import { Button } from "../ui";

interface PollVoteFormProps {
  poll: Poll;
  options: PollOption[];
  /** Called with the selected option id */
  onVote: (optionId: string) => Promise<{ error: string | null }>;
  /** Disabled state (e.g. reader isn"t signed in) */
  disabled?: boolean;
  /** Reason shown when disabled */
  disabledReason?: string;
}

export function PollVoteForm({
  poll,
  options,
  onVote,
  disabled = false,
  disabledReason,
}: PollVoteFormProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selected)
      return;

    setSubmitting(true);
    setError(null);

    const result = await onVote(selected);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-display text-lg font-bold text-primary-900 leading-snug">
          {poll.question}
        </h3>
        {poll.description && (
          <p className="mt-1.5 text-sm text-primary-500 leading-relaxed">
            {poll.description}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2" role="radiogroup" aria-label={poll.question}>
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => !disabled && setSelected(option.id)}
              disabled={disabled || submitting}
              className={[
                "w-full flex items-center gap-3 p-3.5 rounded-lg border-2 text-left",
                "transition-all duration-150",
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-primary-400",
                isSelected
                  ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                  : "border-primary-100 bg-white",
              ].join(" ")}
            >
              {/* Radio circle */}
              <span
                className={[
                  "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected
                    ? "border-primary-500 bg-primary-500"
                    : "border-primary-300 bg-white",
                ].join(" ")}
                aria-hidden="true"
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </span>

              <span
                className={[
                  "flex-1 text-sm",
                  isSelected
                    ? "font-semibold text-primary-900"
                    : "text-primary-700",
                ].join(" ")}
              >
                {option.option_text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Disabled reason */}
      {disabled && disabledReason && (
        <p className="text-xs text-primary-400 italic">{disabledReason}</p>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={handleSubmit}
        disabled={!selected || disabled}
        loading={submitting}
      >
        Cast my vote
      </Button>

      {/* Helper text */}
      <p className="text-xs text-primary-400 text-center">
        One vote per reader · You can"t change it later
      </p>
    </div>
  );
}

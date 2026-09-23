import { forwardRef, type TextareaHTMLAttributes, useId } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, hint, error, showCount, maxLength, value, className = "", id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1.5 text-sm font-medium text-primary-900"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error}
          className={[
            "w-full min-h-[100px] p-3 rounded-md border bg-white",
            "text-sm text-primary-900 placeholder:text-primary-400",
            "transition-colors resize-y",
            error
              ? "border-danger focus:ring-2 focus:ring-danger focus:outline-none"
              : "border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none",
            className,
          ].join(" ")}
          {...props}
        />

        <div className="flex justify-between mt-1">
          {error
            ? (
                <p className="text-xs text-danger">{error}</p>
              )
            : hint
              ? (
                  <p className="text-xs text-primary-400">{hint}</p>
                )
              : (
                  <span />
                )}

          {showCount && maxLength && (
            <span
              className={[
                "text-xs",
                currentLength > maxLength * 0.9
                  ? "text-warning"
                  : "text-primary-400",
              ].join(" ")}
            >
              {currentLength}
              /
              {maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

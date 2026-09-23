import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, error, leftIcon, rightIcon, className = "", id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

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

        <div
          className={[
            "relative flex items-center rounded-md border bg-white",
            "transition-colors",
            error
              ? "border-danger focus-within:ring-2 focus-within:ring-danger"
              : "border-primary-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200",
          ].join(" ")}
        >
          {leftIcon && (
            <span className="pl-3 text-primary-400 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={[
              "flex-1 h-10 px-3 bg-transparent text-sm text-primary-900",
              "placeholder:text-primary-400",
              "focus:outline-none",
              leftIcon ? "pl-2" : "",
              rightIcon ? "pr-2" : "",
              className,
            ].join(" ")}
            {...props}
          />

          {rightIcon && (
            <span className="pr-3 text-primary-400">{rightIcon}</span>
          )}
        </div>

        {error
          ? (
              <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">
                {error}
              </p>
            )
          : hint
            ? (
                <p id={`${inputId}-hint`} className="mt-1 text-xs text-primary-400">
                  {hint}
                </p>
              )
            : null}
      </div>
    );
  },
);

Input.displayName = "Input";

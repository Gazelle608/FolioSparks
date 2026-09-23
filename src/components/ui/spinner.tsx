import type { HTMLAttributes } from "react";

type Size = "xs" | "sm" | "md" | "lg";

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size;
  label?: string;
}

const sizeClasses: Record<Size, string> = {
  xs: "w-3  h-3  border-2",
  sm: "w-4  h-4  border-2",
  md: "w-6  h-6  border-2",
  lg: "w-10 h-10 border-[3px]",
};

export function Spinner({
  size = "md",
  label,
  className = "",
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={`inline-flex items-center gap-2 text-primary-500 ${className}`}
      {...props}
    >
      <span
        className={[
          "inline-block rounded-full",
          "border-current border-t-transparent animate-spin",
          sizeClasses[size],
        ].join(" ")}
      />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

// Full-page centered loader
export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <Spinner size="lg" label={label ?? "Loading…"} />
    </div>
  );
}

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        "px-6 py-12 rounded-lg",
        className,
      ].join(" ")}
    >
      {icon && (
        <div className="mb-4 text-primary-300">
          {icon}
        </div>
      )}

      <h3 className="font-display text-lg font-bold text-primary-900">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-primary-500">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

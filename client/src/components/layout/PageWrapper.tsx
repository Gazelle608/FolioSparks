import type { ReactNode } from "react";

import { Container } from "./Container";

interface PageWrapperProps {
  children: ReactNode;
  /** Page title rendered in a header block above content */
  title?: string;
  /** Small text under the title */
  subtitle?: string;
  /** Optional action (button) rendered to the right of the title */
  action?: ReactNode;
  /** Width preset for the inner container */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Tint the background (default page background is #DAF1DE) */
  background?: "default" | "muted" | "dark";
  /** Extra classes on the outer <main> */
  className?: string;
  /** Extra classes on the inner container */
  innerClassName?: string;
}

const backgroundClasses = {
  default: "bg-primary-50",
  muted: "bg-white",
  dark: "bg-primary-900 text-primary-50",
};

export function PageWrapper({
  children,
  title,
  subtitle,
  action,
  size = "xl",
  background = "default",
  className = "",
  innerClassName = "",
}: PageWrapperProps) {
  const hasHeader = !!(title || subtitle || action);

  return (
    <main
      className={[
        "min-h-[calc(100vh-4rem)]", // 4rem = navbar height
        backgroundClasses[background],
        className,
      ].join(" ")}
    >
      <Container size={size} className={`py-8 lg:py-12 ${innerClassName}`}>
        {hasHeader && (
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {title && (
                <h1
                  className={[
                    "font-display text-3xl lg:text-4xl font-bold tracking-tight",
                    background === "dark"
                      ? "text-primary-50"
                      : "text-primary-900",
                  ].join(" ")}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p
                  className={[
                    "mt-2 text-base",
                    background === "dark"
                      ? "text-primary-200"
                      : "text-primary-500",
                  ].join(" ")}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </header>
        )}

        {children}
      </Container>
    </main>
  );
}

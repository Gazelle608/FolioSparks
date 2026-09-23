import { forwardRef, type HTMLAttributes } from "react";

type Size = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size;
  as?: "div" | "section" | "main" | "article" | "header" | "footer";
}

const sizeClasses: Record<Size, string> = {
  sm: "max-w-2xl", // 672px  — narrow forms, onboarding
  md: "max-w-4xl", // 896px  — reading column, settings
  lg: "max-w-6xl", // 1152px — standard page width
  xl: "max-w-7xl", // 1280px — library, homepage
  full: "max-w-none",
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "lg", as: Tag = "div", className = "", children, ...props }, ref) => (
    <Tag
      ref={ref as never}
      className={[
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Tag>
  ),
);

Container.displayName = "Container";

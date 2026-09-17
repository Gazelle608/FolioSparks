import { forwardRef, type HTMLAttributes, useState } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: Size;
  ring?: boolean;
}

const sizeClasses: Record<Size, string> = {
  xs: "w-6  h-6  text-[10px]",
  sm: "w-8  h-8  text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

function initials(name?: string): string {
  if (!name)
    return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? "")
    .join("");
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = "md", ring = false, className = "", ...props }, ref) => {
    const [failed, setFailed] = useState(false);
    const showFallback = !src || failed;

    return (
      <div
        ref={ref}
        className={[
          "inline-flex items-center justify-center rounded-full",
          "bg-primary-100 text-primary-700 font-medium overflow-hidden select-none",
          ring ? "ring-2 ring-primary-200 ring-offset-2" : "",
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {showFallback
          ? (
              <span aria-hidden="true">{initials(name)}</span>
            )
          : (
              <img
                src={src}
                alt={alt ?? name ?? "Avatar"}
                className="w-full h-full object-cover"
                onError={() => setFailed(true)}
              />
            )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

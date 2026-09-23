import type { HTMLAttributes } from "react";

interface GenrePillProps extends HTMLAttributes<HTMLSpanElement> {
  genre: string;
  size?: "sm" | "md";
  variant?: "solid" | "outline";
}

// ---------------------------------------------------------------------------
// Genre color map — the single source of truth.
// Edit colors here, everything updates everywhere.
// ---------------------------------------------------------------------------
const GENRE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "epic-fantasy": { bg: "bg-primary-800", text: "text-primary-50", border: "border-primary-800" },
  "fantasy": { bg: "bg-primary-700", text: "text-primary-50", border: "border-primary-700" },
  "sci-fi": { bg: "bg-sky-100", text: "text-sky-900", border: "border-sky-300" },
  "mystery": { bg: "bg-indigo-100", text: "text-indigo-900", border: "border-indigo-300" },
  "romance": { bg: "bg-rose-100", text: "text-rose-900", border: "border-rose-300" },
  "thriller": { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" },
  "horror": { bg: "bg-slate-800", text: "text-slate-50", border: "border-slate-800" },
  "literary": { bg: "bg-stone-100", text: "text-stone-800", border: "border-stone-300" },
  "historical": { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-300" },
  "contemporary": { bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-300" },
  "adventure": { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" },
  "paranormal": { bg: "bg-violet-100", text: "text-violet-900", border: "border-violet-300" },
  "dystopian": { bg: "bg-zinc-800", text: "text-zinc-50", border: "border-zinc-800" },
  "comedy": { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-300" },
  "drama": { bg: "bg-fuchsia-100", text: "text-fuchsia-900", border: "border-fuchsia-300" },
  "poetry": { bg: "bg-lime-100", text: "text-lime-900", border: "border-lime-300" },
};

const DEFAULT_STYLE = {
  bg: "bg-primary-100",
  text: "text-primary-800",
  border: "border-primary-300",
};

const sizeClasses = {
  sm: "text-[10px] px-2 py-0.5 tracking-wide",
  md: "text-xs px-2.5 py-1",
};

export function GenrePill({
  genre,
  size = "sm",
  variant = "solid",
  className = "",
  ...props
}: GenrePillProps) {
  const slug = genre.toLowerCase().replace(/\s+/g, "-");
  const style = GENRE_STYLES[slug] ?? DEFAULT_STYLE;

  const variantClasses
    = variant === "solid"
      ? `${style.bg} ${style.text}`
      : `bg-transparent border ${style.border} ${style.text}`;

  const label = slug
    .split("-")
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <span
      className={[
        "inline-flex items-center font-semibold uppercase whitespace-nowrap rounded-full",
        sizeClasses[size],
        variantClasses,
        className,
      ].join(" ")}
      {...props}
    >
      {label}
    </span>
  );
}

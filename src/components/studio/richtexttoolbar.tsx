interface RichTextToolbarProps {
  onInsert: (before: string, after?: string) => void;
}

const ITEMS: Array<
  | { kind: "button"; icon: React.ReactNode; label: string; before: string; after?: string }
  | { kind: "divider" }
> = [
  { kind: "button", icon: <strong>B</strong>, label: "Bold", before: "**", after: "**" },
  { kind: "button", icon: <em>I</em>, label: "Italic", before: "*", after: "*" },
  { kind: "divider" },
  { kind: "button", icon: "H1", label: "Heading 1", before: "# ", after: "\n" },
  { kind: "button", icon: "H2", label: "Heading 2", before: "## ", after: "\n" },
  { kind: "divider" },
  { kind: "button", icon: "", label: "Quote", before: "> ", after: "\n" },
  { kind: "button", icon: "```", label: "Code block", before: "```\n", after: "\n```\n" },
  { kind: "divider" },
  { kind: "button", icon: "•", label: "Bullet list", before: "- ", after: "\n" },
  { kind: "button", icon: "1.", label: "Numbered list", before: "1. ", after: "\n" },
  { kind: "divider" },
  { kind: "button", icon: "—", label: "Scene break", before: "\n\n---\n\n" },
  { kind: "button", icon: "🔗", label: "Link", before: "[", after: "](https://)" },
];

export function RichTextToolbar({ onInsert }: RichTextToolbarProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap p-2 rounded-md border border-primary-100 bg-primary-50/60">
      {ITEMS.map((item, i) => {
        if (item.kind === "divider") {
          return (
            <span
              key={i}
              className="w-px h-5 bg-primary-200 mx-1"
              aria-hidden="true"
            />
          );
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onInsert(item.before, item.after)}
            title={item.label}
            aria-label={item.label}
            className="w-8 h-8 flex items-center justify-center rounded text-sm text-primary-700 hover:bg-white hover:text-primary-900 transition-colors"
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
}

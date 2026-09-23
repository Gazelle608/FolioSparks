interface DraftSaverProps {
  state: "idle" | "saving" | "saved" | "error";
  lastSaved?: string | null;
}

export function DraftSaver({ state, lastSaved }: DraftSaverProps) {
  if (state === "idle" && !lastSaved)
    return null;

  const map = {
    idle: { text: lastSaved ? `Saved ${lastSaved}` : "", className: "text-primary-400" },
    saving: { text: "Saving…", className: "text-primary-400" },
    saved: { text: "✓ Saved", className: "text-primary-600" },
    error: { text: "Save failed", className: "text-danger" },
  };

  const s = map[state];
  if (!s.text)
    return null;

  return <span className={`text-xs ${s.className}`}>{s.text}</span>;
}

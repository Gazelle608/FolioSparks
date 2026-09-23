interface WordCounterProps {
  text: string;
}

export function WordCounter({ text }: WordCounterProps) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return (
    <span className="text-xs text-primary-400 tabular-nums">
      {words.toLocaleString()}
      words
      {words > 0 && ` · ~${minutes} min read`}
    </span>
  );
}

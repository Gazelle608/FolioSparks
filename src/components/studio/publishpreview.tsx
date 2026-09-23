import { Button, Modal } from "../ui";

interface PublishPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  chapterNumber: number;
}

export function PublishPreview({
  isOpen,
  onClose,
  title,
  content,
  chapterNumber,
}: PublishPreviewProps) {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reader preview"
      description={`Chapter ${chapterNumber} as readers will see it`}
      size="lg"
      footer={(
        <Button variant="primary" onClick={onClose}>
          Looks good
        </Button>
      )}
    >
      <article className="reading-text max-h-[60vh] overflow-y-auto pr-2">
        <header className="mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-primary-400 mb-2">
            Chapter
            {chapterNumber}
          </p>
          <h1 className="font-display text-2xl font-bold text-primary-900">
            {title}
          </h1>
        </header>

        {paragraphs.map((p, i) => (
          <p key={i} className="mb-5" style={{ textIndent: "1.5em" }}>
            {p}
          </p>
        ))}
      </article>
    </Modal>
  );
}

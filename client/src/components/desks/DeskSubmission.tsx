import type { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";

import { useState } from "react";

import type { DeskSubmission as Submission } from "../../types/desk";

import { approveSubmission, deleteSubmission } from "../../api/desks";
import { Avatar, Button, Modal, useToast } from "../ui";

// ---------------------------------------------------------------------------
// LIST MODE — the compact row used in the desk panel
// ---------------------------------------------------------------------------
interface DeskSubmissionListProps {
  submissions: Submission[];
  /** Called after approve/delete so parent can refresh */
  onChanged?: () => void;
}

export function DeskSubmissionList({
  submissions,
  onChanged,
}: DeskSubmissionListProps) {
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const pending = submissions.filter(s => !s.is_approved);

  if (submissions.length === 0) {
    return (
      <p className="text-sm text-primary-400 italic py-3">
        No drafts submitted yet.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {submissions.map(submission => (
          <li
            key={submission.id}
            className={[
              "flex items-center gap-3 p-3 rounded-md border transition-colors",
              submission.is_approved
                ? "border-primary-100 bg-primary-50"
                : "border-primary-100 bg-white hover:border-primary-300 cursor-pointer",
            ].join(" ")}
            onClick={() => !submission.is_approved && setActiveSubmission(submission)}
          >
            <Avatar
              src={submission.submitter?.avatar_url ?? undefined}
              name={submission.submitter?.display_name}
              size="sm"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary-900 truncate">
                  Ch.
                  {submission.chapter_number}
                  {submission.title && ` — ${submission.title}`}
                </span>
                {submission.is_approved && (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary-600">
                    ✓ Approved
                  </span>
                )}
              </div>
              <p className="text-xs text-primary-400 mt-0.5">
                {submission.submitter?.display_name ?? "Unknown"}
                ·
                {" "}
                {submission.word_count.toLocaleString()}
                words ·
                {" "}
                {formatRelative(submission.created_at)}
              </p>
            </div>

            {!submission.is_approved && (
              <span className="shrink-0 text-xs text-primary-500">
                Review →
              </span>
            )}
          </li>
        ))}
      </ul>

      {pending.length > 0 && (
        <p className="mt-2 text-xs text-primary-400">
          {pending.length}
          {pending.length === 1 ? "draft" : "drafts"}
          waiting
          for review
        </p>
      )}

      {/* Detail modal */}
      <SubmissionReviewModal
        submission={activeSubmission}
        onClose={() => setActiveSubmission(null)}
        onChanged={() => {
          setActiveSubmission(null);
          onChanged?.();
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// DETAIL MODAL — the review UI
// ---------------------------------------------------------------------------
function SubmissionReviewModal({
  submission,
  onClose,
  onChanged,
}: {
  submission: Submission | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [approving, setApproving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!submission)
    return null;

  const handleApprove = async () => {
    setApproving(true);
    const result = await approveSubmission(submission.id);
    setApproving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Draft approved — a chapter was created in your Studio");
    onChanged();
  };

  const handleReject = async () => {
    // eslint-disable-next-line no-alert
    if (!confirm("Delete this draft? This cannot be undone."))
      return;

    setDeleting(true);
    const result = await deleteSubmission(submission.id);
    setDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Draft deleted");
    onChanged();
  };

  const paragraphs = submission.content
    .split(/\n\s*\n/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  return (
    <Modal
      isOpen={!!submission}
      onClose={onClose}
      size="lg"
      title={`Chapter ${submission.chapter_number}${
        submission.title ? ` — ${submission.title}` : ""
      }`}
      description={`Submitted by ${submission.submitter?.display_name ?? "Unknown"}`}
      footer={(
        <>
          <Button
            variant="ghost"
            onClick={handleReject}
            loading={deleting}
            disabled={approving}
          >
            Delete draft
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            loading={approving}
            disabled={deleting}
          >
            Approve & publish
          </Button>
        </>
      )}
    >
      {/* Meta row */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary-100">
        <Avatar
          src={submission.submitter?.avatar_url ?? undefined}
          name={submission.submitter?.display_name}
          size="md"
        />
        <div>
          <p className="text-sm font-medium text-primary-900">
            {submission.submitter?.display_name ?? "Unknown"}
          </p>
          <p className="text-xs text-primary-400">
            {submission.word_count.toLocaleString()}
            words ·
            {" "}
            {formatRelative(submission.created_at)}
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="reading-text max-h-[55vh] overflow-y-auto pr-2">
        {paragraphs.map((para: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined, i: Key | null | undefined) => (
          <p key={i} className="mb-4">
            {para}
          </p>
        ))}
      </div>

      {/* Footnote */}
      <p className="mt-4 pt-4 border-t border-primary-100 text-xs text-primary-400 leading-relaxed">
        Approving creates a
        <strong>draft chapter</strong>
        in your Studio. You
        can still edit, schedule, or unpublish before it goes live.
      </p>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)
    return "just now";
  if (minutes < 60)
    return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

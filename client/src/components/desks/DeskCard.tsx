import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { Desk, DeskMember, DeskInvite as Invite, DeskSubmission } from "../../types/desk";

import {
  closeDesk,
  getDeskMembers,
  getDeskSubmissions,
  getPendingInvites,
} from "../../api/desks";
import { DeskIcon } from "../../assets/icons";
import { useAuth } from "../../hooks/useAuth";
import { Card, useToast } from "../ui";
import { CoWriterList } from "./CoWriterList";
import { DeskInvite } from "./DeskInvite";
import { DeskSubmissionList } from "./DeskSubmission";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface DeskCardProps {
  desk: Desk;
  /** Owner view shows invites + submissions + close button */
  variant?: "public" | "owner";
  /** Story title — used in shared copy */
  storyTitle?: string;
  /** Called after any mutation so parent can refresh */
  onChanged?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DeskCard({
  desk,
  variant = "public",
  storyTitle,
  onChanged,
}: DeskCardProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState<DeskMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [submissions, setSubmissions] = useState<DeskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  // ---------------------------------------------------------------------------
  // Load
  // ---------------------------------------------------------------------------
  const load = async () => {
    setLoading(true);

    const [membersRes, invitesRes, submissionsRes] = await Promise.all([
      getDeskMembers(desk.id),
      variant === "owner" ? getPendingInvites(desk.owner_id) : Promise.resolve({ data: [] }),
      variant === "owner" ? getDeskSubmissions(desk.id) : Promise.resolve({ data: [] }),
    ]);

    setMembers(membersRes.data ?? []);
    setPendingInvites(
      (invitesRes.data ?? []).filter(i => i.desk_id === desk.id),
    );
    setSubmissions(submissionsRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [desk.id, variant]);

  // ---------------------------------------------------------------------------
  // Close desk
  // ---------------------------------------------------------------------------
  const handleClose = async () => {
    // eslint-disable-next-line no-alert
    if (!confirm("Close this desk? Co-writers keep their approved chapters, but no new drafts can be submitted."))
      return;

    setClosing(true);
    const result = await closeDesk(desk.id);
    setClosing(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Desk closed");
    onChanged?.();
  };

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const isOwner = variant === "owner" && user?.id === desk.owner_id;
  const coWriters = members.filter(m => m.role === "cowriter");
  const isOpen = desk.status === "open";

  // ---------------------------------------------------------------------------
  // PUBLIC VIEW
  // ---------------------------------------------------------------------------
  if (variant === "public") {
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <DeskIcon size={18} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-primary-900">
                {desk.title}
              </h3>
              <p className="text-xs text-primary-500 mt-0.5">
                Open co-writing desk ·
                {coWriters.length}
                /
                {desk.max_cowriters}
                co-writers
              </p>
            </div>
          </div>

          {!isOpen && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary-100 text-primary-500">
              Closed
            </span>
          )}
        </div>

        {desk.brief && (
          <p className="text-sm text-primary-600 leading-relaxed mb-4">
            {desk.brief}
          </p>
        )}

        {coWriters.length > 0 && (
          <div className="mb-4">
            <CoWriterList members={members} />
          </div>
        )}

        {isOpen && (
          <Link
            to={`/desk/${desk.id}/join`}
            className="inline-block text-sm font-semibold text-primary-700 underline hover:text-primary-900"
          >
            Request to co-write →
          </Link>
        )}
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // OWNER VIEW
  // ---------------------------------------------------------------------------
  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-primary-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <DeskIcon size={18} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-primary-900">
                {desk.title}
              </h2>
              <p className="text-xs text-primary-500 mt-0.5">
                {storyTitle ? `${storyTitle} · ` : ""}
                {coWriters.length}
                /
                {desk.max_cowriters}
                co-writers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={[
                "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                isOpen
                  ? "bg-primary-500 text-white"
                  : "bg-primary-100 text-primary-500",
              ].join(" ")}
            >
              {isOpen ? "Open" : "Closed"}
            </span>
            {isOpen && (
              <button
                type="button"
                onClick={handleClose}
                disabled={closing}
                className="text-xs text-primary-400 hover:text-danger transition-colors"
              >
                {closing ? "Closing…" : "Close desk"}
              </button>
            )}
          </div>
        </div>

        {desk.brief && (
          <p className="mt-3 text-sm text-primary-600 leading-relaxed">
            {desk.brief}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-6">
        {/* Members */}
        <section>
          <h3 className="font-display text-sm font-bold text-primary-900 mb-3">
            On this desk (
            {members.length}
            )
          </h3>
          <CoWriterList members={members} max={10} />
        </section>

        {/* Invite form (owner only, desk must be open) */}
        {isOwner && isOpen && (
          <section className="pt-5 border-t border-primary-100">
            <DeskInvite
              deskId={desk.id}
              existingMemberIds={members.map(m => m.user_id)}
              pendingInvites={pendingInvites}
              memberCount={coWriters.length}
              maxCowriters={desk.max_cowriters}
              onInvited={load}
              onRevoked={(inviteId) => {
                setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
              }}
            />
          </section>
        )}

        {/* Submissions (owner only) */}
        {isOwner && submissions.length > 0 && (
          <section className="pt-5 border-t border-primary-100">
            <h3 className="font-display text-sm font-bold text-primary-900 mb-3">
              Draft submissions (
              {submissions.length}
              )
            </h3>
            <DeskSubmissionList submissions={submissions} onChanged={load} />
          </section>
        )}

        {isOwner && submissions.length === 0 && !loading && (
          <section className="pt-5 border-t border-primary-100">
            <p className="text-sm text-primary-400 italic">
              No drafts submitted yet. Co-writers will appear here when they
              submit a chapter for review.
            </p>
          </section>
        )}
      </div>
    </Card>
  );
}

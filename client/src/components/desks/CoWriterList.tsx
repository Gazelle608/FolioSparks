import type { DeskMember } from "../../types/desk";

import { Avatar } from "../ui";

interface CoWriterListProps {
  members: DeskMember[];
  /** Max avatars shown before "+N more" */
  max?: number;
  /** Optional click handler — usually navigates to user profile */
  onMemberClick?: (member: DeskMember) => void;
  /** Hide the "Owner" role badge (in some contexts you want less chrome) */
  hideRoles?: boolean;
}

export function CoWriterList({
  members,
  max = 6,
  onMemberClick,
  hideRoles = false,
}: CoWriterListProps) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-primary-400 italic">
        No co-writers yet
      </p>
    );
  }

  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map(member => (
        <button
          key={member.id}
          type="button"
          onClick={() => onMemberClick?.(member)}
          disabled={!onMemberClick}
          title={
            hideRoles
              ? member.profile?.display_name
              : `${member.profile?.display_name ?? "Unknown"} · ${roleLabel(member.role)}`
          }
          className={[
            "relative rounded-full transition-transform",
            onMemberClick ? "cursor-pointer hover:scale-110 hover:z-10" : "cursor-default",
            member.role === "owner" ? "ring-2 ring-spark ring-offset-2" : "ring-2 ring-white",
          ].join(" ")}
        >
          <Avatar
            src={member.profile?.avatar_url ?? undefined}
            name={member.profile?.display_name}
            size="md"
          />
        </button>
      ))}

      {overflow > 0 && (
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center ring-2 ring-white">
          +
          {overflow}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function roleLabel(role: DeskMember["role"]): string {
  switch (role) {
    case "owner": return "Owner";
    case "cowriter": return "Co-writer";
    case "reader": return "Reader";
    default: return "Unknown";
  }
}

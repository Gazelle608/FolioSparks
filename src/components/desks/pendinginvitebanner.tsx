import { useNavigate } from "react-router-dom";

import type { DeskInvite } from "../../types/desk";

import { DeskIcon } from "../../assets/icons";
import { useAuth } from "../../hooks/useauth";
import { useMyInvites } from "../../hooks/usedesk";
import { Avatar, Button, useToast } from "../ui";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PendingInviteBanner() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { invites, respond } = useMyInvites();

  // Nothing to render
  if (!user || invites.length === 0)
    return null;

  // ---------------------------------------------------------------------------
  // Respond
  // ---------------------------------------------------------------------------
  const handleRespond = async (invite: DeskInvite, accept: boolean) => {
    const result = await respond(invite.id, accept);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      accept
        ? `You joined the desk for "${invite.invited_user?.display_name ?? "the story"}"`
        : "Invite declined",
    );

    if (accept) {
      navigate("/studio");
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-spark/10 border-b border-spark/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 space-y-2">
        {invites.map(invite => (
          <div
            key={invite.id}
            className="flex items-center gap-3 flex-wrap"
          >
            {/* Icon */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <DeskIcon size={16} className="text-primary-700" />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
              <Avatar
                src={invite.invited_user?.avatar_url ?? undefined}
                name={invite.invited_user?.display_name}
                size="xs"
              />
              <p className="text-sm text-primary-900">
                <strong className="font-semibold">
                  {invite.invited_user?.display_name ?? "Someone"}
                </strong>
                {" "}
                invited you to co-write a chapter
                {invite.message && (
                  <span className="text-primary-500 italic">
                    {" "}
                    —
                    "
                    {truncate(invite.message, 80)}
                    "
                  </span>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleRespond(invite, true)}
              >
                Accept
              </Button>
              <button
                type="button"
                onClick={() => handleRespond(invite, false)}
                className="text-xs font-medium text-primary-500 hover:text-primary-900 transition-colors px-2"
              >
                Decline
              </button>
            </div>
          </div>
        ))}

        {/* "+N more" if there are multiple invites */}
        {invites.length > 3 && (
          <p className="text-xs text-primary-500 pl-11">
            +
            {invites.length - 3}
            more
            {" "}
            {invites.length - 3 === 1 ? "invite" : "invites"}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function truncate(text: string, max: number): string {
  if (text.length <= max)
    return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

import { type FormEvent, useState } from "react";

import type { DeskInvite as Invite } from "../../types/desk";

import { inviteToDesk } from "../../api/desks";
import { Button, Input, Avatar, useToast } from "../ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DeskInviteProps {
  deskId: string;
  /** Members already on the desk — used to filter out duplicate invites */
  existingMemberIds: string[];
  /** Pending invites — shown below the form */
  pendingInvites?: Invite[];
  /** Current number of co-writers vs max — hides the form if full */
  memberCount: number;
  maxCowriters: number;
  /** Called after a successful invite */
  onInvited?: () => void;
  /** Called when the owner revokes a pending invite */
  onRevoked?: (inviteId: string) => void;
  /** Simulated search — in prod, this calls your search endpoint */
  onSearchUser?: (username: string) => Promise<{
    id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
  } | null>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DeskInvite({
  deskId,
  existingMemberIds,
  pendingInvites = [],
  memberCount,
  maxCowriters,
  onInvited,
  onRevoked,
  onSearchUser,
}: DeskInviteProps) {
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [foundUser, setFoundUser] = useState<{
    id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFull = memberCount >= maxCowriters;

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFoundUser(null);

    const trimmed = username.trim().toLowerCase();
    if (!trimmed)
      return;

    if (existingMemberIds.includes(trimmed)) {
      setError("They are already a co-writer on this desk.");
      return;
    }

    if (!onSearchUser) {
      // Fallback for when search isn"t wired yet
      setError("Search is not available. Wire up onSearchUser.");
      return;
    }

    setSearching(true);
    const result = await onSearchUser(trimmed);
    setSearching(false);

    if (!result) {
      setError("No user found with that username.");
      return;
    }

    if (existingMemberIds.includes(result.id)) {
      setError("They are already a co-writer on this desk.");
      return;
    }

    setFoundUser(result);
  };

  // ---------------------------------------------------------------------------
  // Send invite
  // ---------------------------------------------------------------------------
  const handleSend = async () => {
    if (!foundUser)
      return;
    setSending(true);
    setError(null);

    const result = await inviteToDesk(deskId, foundUser.id, message.trim() || undefined);
    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    toast.success(`Invite sent to ${foundUser.display_name}`);
    setUsername("");
    setMessage("");
    setFoundUser(null);
    onInvited?.();
  };

  // ---------------------------------------------------------------------------
  // Full desk
  // ---------------------------------------------------------------------------
  if (isFull) {
    return (
      <div className="rounded-md bg-primary-50 border border-primary-100 p-3 text-sm text-primary-600">
        Desk is at capacity (
        {memberCount}
        /
        {maxCowriters}
        ). Remove a co-writer
        or raise the limit to invite more.
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-display text-sm font-bold text-primary-900 mb-2">
          Invite a co-writer
        </h4>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, ""))}
            disabled={searching || !!foundUser}
            aria-label="Co-writer username"
          />
          {!foundUser
            ? (
                <Button
                  type="submit"
                  variant="secondary"
                  loading={searching}
                  disabled={!username.trim()}
                >
                  Find
                </Button>
              )
            : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFoundUser(null);
                    setUsername("");
                    setError(null);
                  }}
                >
                  Clear
                </Button>
              )}
        </form>

        {/* Error */}
        {error && (
          <p className="mt-2 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Found user card */}
      {foundUser && (
        <div className="rounded-md border border-primary-200 bg-primary-50 p-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={foundUser.avatar_url ?? undefined}
              name={foundUser.display_name}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-900 truncate">
                {foundUser.display_name}
              </p>
              <p className="text-xs text-primary-500 truncate">
                @
                {foundUser.username}
              </p>
            </div>
          </div>

          <textarea
            placeholder="Add a note (optional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={300}
            rows={2}
            className="mt-3 w-full p-2 rounded-md border border-primary-200 bg-white text-sm text-primary-900 placeholder:text-primary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none"
          />

          <div className="mt-3 flex items-center justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSend}
              loading={sending}
            >
              Send invite
            </Button>
          </div>
        </div>
      )}

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div>
          <h4 className="font-display text-sm font-bold text-primary-900 mb-2">
            Pending invites
            (
            {pendingInvites.length}
            )
          </h4>
          <ul className="space-y-2">
            {pendingInvites.map(invite => (
              <li
                key={invite.id}
                className="flex items-center gap-3 p-2.5 rounded-md border border-primary-100 bg-white"
              >
                <Avatar
                  src={invite.invited_user?.avatar_url ?? undefined}
                  name={invite.invited_user?.display_name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary-900 truncate">
                    {invite.invited_user?.display_name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-primary-400">
                    Waiting since
                    {formatRelative(invite.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRevoked?.(invite.id)}
                  className="text-xs text-primary-400 hover:text-danger transition-colors"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Attribution note */}
      <p className="text-xs text-primary-400 leading-relaxed">
        Co-writers draft chapters alongside you, but you approve every
        submission before it publishes. The byline stays yours.
      </p>
    </div>
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

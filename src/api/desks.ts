import type { ApiResult } from "./supabase";

import { err, ok, supabase } from "./supabase";

interface Desk {
  id: string;
  story_id: string;
  owner_id: string;
  title: string;
  brief?: string | null;
  max_cowriters?: number | null;
  status: string;
  [key: string]: unknown;
}

interface DeskMember {
  id: string;
  desk_id: string;
  user_id: string;
  role: string;
  [key: string]: unknown;
}

interface DeskInvite {
  id: string;
  desk_id: string;
  invited_user_id: string;
  invited_by: string;
  status: string;
  message?: string | null;
  responded_at?: string | null;
  [key: string]: unknown;
}

interface DeskSubmission {
  id: string;
  desk_id: string;
  submitted_by: string;
  chapter_number: number;
  title?: string | null;
  content: string;
  is_approved: boolean;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Get open desk for a story
// ---------------------------------------------------------------------------
export async function getDeskForStory(
  storyId: string,
): Promise<ApiResult<Desk | null>> {
  const { data, error } = await supabase
    .from("desks")
    .select("*")
    .eq("story_id", storyId)
    .eq("status", "open")
    .maybeSingle();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Get desk members
// ---------------------------------------------------------------------------
export async function getDeskMembers(
  deskId: string,
): Promise<ApiResult<DeskMember[]>> {
  const { data, error } = await supabase
    .from("desk_members")
    .select("*")
    .eq("desk_id", deskId);

  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Author: open a desk
// ---------------------------------------------------------------------------
export interface CreateDeskInput {
  story_id: string;
  owner_id: string;
  title: string;
  brief?: string;
  max_cowriters?: number;
}

export async function createDesk(
  input: CreateDeskInput,
): Promise<ApiResult<Desk>> {
  const { data, error } = await supabase
    .from("desks")
    .insert({
      ...input,
      status: "open",
    } as never)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Author: close the desk
// ---------------------------------------------------------------------------
export async function closeDesk(deskId: string): Promise<ApiResult<Desk>> {
  const { data, error } = await supabase
    .from("desks")
    .update({ status: "closed" } as never)
    .eq("id", deskId)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Invite a co-writer
// ---------------------------------------------------------------------------
export async function inviteToDesk(
  deskId: string,
  invitedUserId: string,
  message?: string,
): Promise<ApiResult<DeskInvite>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user)
    return err("Not authenticated");

  const { data, error } = await supabase
    .from("desk_invites")
    .insert({
      desk_id: deskId,
      invited_user_id: invitedUserId,
      invited_by: userData.user.id,
      message: message ?? null,
      status: "pending",
    } as never)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Respond to an invite
// ---------------------------------------------------------------------------
export async function respondToInvite(
  inviteId: string,
  accept: boolean,
): Promise<ApiResult<DeskInvite>> {
  const { data, error } = await supabase
    .from("desk_invites")
    .update({
      status: accept ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    } as never)
    .eq("id", inviteId)
    .select()
    .single();

  if (error)
    return err(error.message);

  // If accepted, add as desk member
  if (accept && data) {
    const invite = data as unknown as DeskInvite;
    await supabase.from("desk_members").insert({
      desk_id: invite.desk_id,
      user_id: invite.invited_user_id,
      role: "cowriter",
    } as never);
  }

  return ok(data);
}

// ---------------------------------------------------------------------------
// Pending invites for a user
// ---------------------------------------------------------------------------
export async function getPendingInvites(
  userId: string,
): Promise<ApiResult<DeskInvite[]>> {
  const { data, error } = await supabase
    .from("desk_invites")
    .select("*")
    .eq("invited_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Co-writer: submit a draft chapter
// ---------------------------------------------------------------------------
export interface SubmitDraftInput {
  desk_id: string;
  chapter_number: number;
  title?: string;
  content: string;
}

export async function submitDeskDraft(
  input: SubmitDraftInput,
): Promise<ApiResult<DeskSubmission>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user)
    return err("Not authenticated");

  const { data, error } = await supabase
    .from("desk_submissions")
    .insert({
      ...input,
      submitted_by: userData.user.id,
      is_approved: false,
    } as never)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Owner: get submissions for a desk
// ---------------------------------------------------------------------------
export async function getDeskSubmissions(
  deskId: string,
): Promise<ApiResult<DeskSubmission[]>> {
  const { data, error } = await supabase
    .from("desk_submissions")
    .select("*")
    .eq("desk_id", deskId)
    .order("chapter_number", { ascending: true });

  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Owner: approve a submission (creates a real chapter)
// ---------------------------------------------------------------------------
export async function approveSubmission(
  submissionId: string,
): Promise<ApiResult<null>> {
  const { data: submission, error: fetchError } = await supabase
    .from("desk_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission)
    return err("Submission not found");

  const draft = submission as unknown as DeskSubmission;

  // Get story_id from the desk
  const { data: desk } = await supabase
    .from("desks")
    .select("story_id, owner_id")
    .eq("id", draft.desk_id)
    .single();

  if (!desk)
    return err("Desk not found");

  const deskRecord = desk as unknown as Pick<Desk, "story_id" | "owner_id">;

  // Create the chapter
  const { error: chapterError } = await supabase.from("chapters").insert({
    story_id: deskRecord.story_id,
    author_id: deskRecord.owner_id,
    chapter_number: draft.chapter_number,
    title: draft.title,
    content: draft.content,
    is_published: false,
  } as never);

  if (chapterError)
    return err(chapterError.message);

  // Mark approved
  const { error: approveError } = await supabase
    .from("desk_submissions")
    .update(
      { is_approved: true, approved_at: new Date().toISOString() } as never,
    )
    .eq("id", submissionId);

  if (approveError)
    return err(approveError.message);
  return ok(null);
}

// ---------------------------------------------------------------------------
// Owner: reject submission
// ---------------------------------------------------------------------------
export async function deleteSubmission(
  submissionId: string,
): Promise<ApiResult<null>> {
  const { error } = await supabase
    .from("desk_submissions")
    .delete()
    .eq("id", submissionId);
  if (error)
    return err(error.message);
  return ok(null);
}

import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// Read
// ============================================================
export async function getById(id: string) {
  const { data } = await supabaseAdmin
    .from("desks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getByStory(storyId: string) {
  const { data } = await supabaseAdmin
    .from("desks")
    .select("*")
    .eq("story_id", storyId)
    .eq("status", "open")
    .maybeSingle();
  return data;
}

export async function getMembers(deskId: string) {
  const { data } = await supabaseAdmin
    .from("desk_members")
    .select(
      `
      id, desk_id, user_id, role, joined_at,
      profile:profiles!desk_members_user_id_fkey (
        display_name, username, avatar_url
      )
    `,
    )
    .eq("desk_id", deskId);

  return (data ?? []) as unknown as Array<{
    id: string;
    desk_id: string;
    user_id: string;
    role: string;
    joined_at: string;
    profile?: {
      display_name: string;
      username: string;
      avatar_url: string | null;
    };
  }>;
}

export async function isMember(
  deskId: string,
  userId: string,
): Promise<boolean> {
  const { count } = await supabaseAdmin
    .from("desk_members")
    .select("id", { count: "exact", head: true })
    .eq("desk_id", deskId)
    .eq("user_id", userId);
  return (count ?? 0) > 0;
}

// ============================================================
// Open / close
// ============================================================
interface OpenDeskInput {
  story_id: string;
  owner_id: string;
  title: string;
  brief?: string;
  max_cowriters?: number;
}

export async function open(input: OpenDeskInput) {
  const { data: desk, error } = await supabaseAdmin
    .from("desks")
    .insert({
      story_id: input.story_id,
      owner_id: input.owner_id,
      title: input.title,
      brief: input.brief ?? null,
      max_cowriters: input.max_cowriters ?? 3,
      status: "open",
    })
    .select()
    .single();

  if (error || !desk) {
    logger.error("Failed to open desk", { error: error?.message });
    throw HttpError.internal("Could not open desk");
  }

  // Add the owner as a member
  await supabaseAdmin.from("desk_members").insert({
    desk_id: desk.id,
    user_id: input.owner_id,
    role: "owner",
  });

  logger.info("Desk opened", { deskId: desk.id, storyId: input.story_id });
  return desk;
}

export async function close(id: string) {
  const { data, error } = await supabaseAdmin
    .from("desks")
    .update({ status: "closed" })
    .eq("id", id)
    .select()
    .single();

  if (error)
    throw HttpError.internal("Could not close desk");
  return data;
}

// ============================================================
// Invites
// ============================================================
interface InviteInput {
  desk_id: string;
  invited_user_id: string;
  invited_by: string;
  message?: string;
}

export async function invite(input: InviteInput) {
  // Don't allow inviting someone already on the desk
  const memberAlready = await isMember(input.desk_id, input.invited_user_id);
  if (memberAlready) {
    throw HttpError.conflict("Already a member of this desk");
  }

  const { data, error } = await supabaseAdmin
    .from("desk_invites")
    .insert({
      desk_id: input.desk_id,
      invited_user_id: input.invited_user_id,
      invited_by: input.invited_by,
      message: input.message ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw HttpError.conflict("Invite already sent");
    }
    logger.error("Invite failed", { error: error.message });
    throw HttpError.internal("Could not send invite");
  }

  logger.info("Desk invite sent", {
    deskId: input.desk_id,
    invitedUser: input.invited_user_id,
  });
  return data;
}

export async function getPendingInvites(userId: string) {
  const { data } = await supabaseAdmin
    .from("desk_invites")
    .select(
      `
      *,
      invited_user:profiles!desk_invites_invited_user_id_fkey (
        display_name, username, avatar_url
      )
    `,
    )
    .eq("invited_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as Array<Record<string, unknown>>;
}

export async function respondInvite(
  inviteId: string,
  userId: string,
  accept: boolean,
) {
  const { data: invite } = await supabaseAdmin
    .from("desk_invites")
    .select("*")
    .eq("id", inviteId)
    .eq("invited_user_id", userId)
    .maybeSingle();

  if (!invite)
    throw HttpError.notFound("Invite not found");
  if (invite.status !== "pending")
    throw HttpError.badRequest("Invite already handled");

  const { data, error } = await supabaseAdmin
    .from("desk_invites")
    .update({
      status: accept ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", inviteId)
    .select()
    .single();

  if (error)
    throw HttpError.internal("Could not update invite");

  if (accept) {
    await supabaseAdmin.from("desk_members").insert({
      desk_id: invite.desk_id,
      user_id: userId,
      role: "cowriter",
    });
    logger.info("Co-writer joined desk", { deskId: invite.desk_id, userId });
  }

  return data;
}

// ============================================================
// Submissions
// ============================================================
interface SubmitInput {
  desk_id: string;
  chapter_number: number;
  title?: string;
  content: string;
  submitted_by: string;
}

export async function submitDraft(input: SubmitInput) {
  const wordCount = input.content.trim().split(/\s+/).filter(Boolean).length;

  const { data, error } = await supabaseAdmin
    .from("desk_submissions")
    .insert({
      desk_id: input.desk_id,
      chapter_number: input.chapter_number,
      title: input.title ?? null,
      content: input.content,
      submitted_by: input.submitted_by,
      word_count: wordCount,
      is_approved: false,
    })
    .select()
    .single();

  if (error) {
    logger.error("Submit draft failed", { error: error.message });
    throw HttpError.internal("Could not submit draft");
  }

  logger.info("Desk submission received", {
    deskId: input.desk_id,
    by: input.submitted_by,
  });
  return data;
}

export async function getSubmissions(deskId: string) {
  const { data } = await supabaseAdmin
    .from("desk_submissions")
    .select(
      `
      *,
      submitter:profiles!desk_submissions_submitted_by_fkey (
        display_name, username, avatar_url
      )
    `,
    )
    .eq("desk_id", deskId)
    .order("chapter_number", { ascending: true });

  return (data ?? []) as unknown as Array<Record<string, unknown>>;
}

export async function getSubmission(id: string) {
  const { data } = await supabaseAdmin
    .from("desk_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

// ============================================================
// Approve — creates a real chapter from the submission
// ============================================================
export async function approveSubmission(submissionId: string): Promise<void> {
  const submission = await getSubmission(submissionId);
  if (!submission)
    throw HttpError.notFound("Submission not found");
  if (submission.is_approved)
    throw HttpError.badRequest("Already approved");

  const { data: desk } = await supabaseAdmin
    .from("desks")
    .select("story_id, owner_id")
    .eq("id", submission.desk_id)
    .single();

  if (!desk)
    throw HttpError.notFound("Desk not found");

  // Create the chapter as an unpublished draft owned by the desk owner
  const { error: chapterError } = await supabaseAdmin.from("chapters").insert({
    story_id: desk.story_id,
    author_id: desk.owner_id,
    chapter_number: submission.chapter_number,
    title: submission.title,
    content: submission.content,
    is_published: false,
  });

  if (chapterError) {
    logger.error("Failed to create chapter from submission", {
      error: chapterError.message,
    });
    throw HttpError.internal("Could not create chapter");
  }

  await supabaseAdmin
    .from("desk_submissions")
    .update({ is_approved: true, approved_at: new Date().toISOString() })
    .eq("id", submissionId);

  logger.info("Submission approved", { submissionId });
}

export async function removeSubmission(submissionId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("desk_submissions")
    .delete()
    .eq("id", submissionId);
  if (error)
    throw HttpError.internal("Could not delete submission");
}

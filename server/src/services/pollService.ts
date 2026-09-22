import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// Types
// ============================================================
interface CreatePollInput {
  story_id: string;
  author_id: string;
  chapter_id: string;
  question: string;
  description?: string;
  closes_at?: string;
  options: string[];
}

// ============================================================
// Read
// ============================================================
export async function listByStory(storyId: string) {
  const { data, error } = await supabaseAdmin
    .from("polls")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false });

  if (error)
    throw HttpError.internal("Failed to load polls");
  return data ?? [];
}

export async function getById(id: string) {
  const { data } = await supabaseAdmin
    .from("polls")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getByChapter(chapterId: string) {
  const { data } = await supabaseAdmin
    .from("polls")
    .select("*")
    .eq("chapter_id", chapterId)
    .maybeSingle();
  return data;
}

export async function getOptions(pollId: string) {
  const { data, error } = await supabaseAdmin
    .from("poll_options")
    .select("*")
    .eq("poll_id", pollId)
    .order("display_order", { ascending: true });

  if (error)
    return [];
  return data ?? [];
}

export async function getUserVote(pollId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("poll_votes")
    .select("*")
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

// ============================================================
// Create
// ============================================================
export async function create(input: CreatePollInput) {
  // 1. Insert the poll
  const { data: poll, error: pollError } = await supabaseAdmin
    .from("polls")
    .insert({
      story_id: input.story_id,
      author_id: input.author_id,
      chapter_id: input.chapter_id,
      question: input.question,
      description: input.description ?? null,
      closes_at: input.closes_at ?? null,
      status: "open",
    })
    .select()
    .single();

  if (pollError || !poll) {
    logger.error("Failed to create poll", { error: pollError?.message });
    throw HttpError.internal("Could not create poll");
  }

  // 2. Insert the options
  const options = input.options.map((text, i) => ({
    poll_id: poll.id,
    option_text: text,
    display_order: i,
  }));

  const { error: optionsError } = await supabaseAdmin
    .from("poll_options")
    .insert(options);

  if (optionsError) {
    // Roll back the poll
    await supabaseAdmin.from("polls").delete().eq("id", poll.id);
    throw HttpError.internal("Could not create poll options");
  }

  logger.info("Poll created", { pollId: poll.id, storyId: input.story_id });
  return poll;
}

// ============================================================
// Vote
// ============================================================
export async function vote(pollId: string, optionId: string, userId: string) {
  // Verify the option belongs to the poll
  const { data: option } = await supabaseAdmin
    .from("poll_options")
    .select("id, poll_id")
    .eq("id", optionId)
    .maybeSingle();

  if (!option || option.poll_id !== pollId) {
    throw HttpError.badRequest("Invalid option");
  }

  const { data, error } = await supabaseAdmin
    .from("poll_votes")
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique violation — already voted
      throw HttpError.conflict("You already voted in this poll");
    }
    logger.error("Vote insert failed", {
      pollId,
      userId,
      error: error.message,
    });
    throw HttpError.internal("Could not record vote");
  }

  // Note: vote_count and total_votes are bumped by the DB trigger
  // (poll_votes_bump) that you created in migration 012.

  logger.info("Poll vote recorded", { pollId, userId });
  return data;
}

// ============================================================
// Close — tallies votes via RPC
// ============================================================
export async function close(pollId: string): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc("tally_poll_votes", {
    p_poll_id: pollId,
  });

  if (error) {
    logger.error("Poll close failed", { pollId, error: error.message });
    throw HttpError.internal("Could not close poll");
  }

  logger.info("Poll closed", { pollId, winningOptionId: data });
  return data as string;
}

// ============================================================
// Delete
// ============================================================
export async function remove(pollId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("polls").delete().eq("id", pollId);
  if (error)
    throw HttpError.internal("Could not delete poll");
}

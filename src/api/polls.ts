import type { ApiResult } from "./supabase";

import { err, ok, supabase } from "./supabase";

interface Poll {
  id: string;
  [key: string]: unknown;
}

interface PollOption {
  [key: string]: unknown;
}

interface PollVote {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Get the poll attached to a chapter
// ---------------------------------------------------------------------------
export async function getPollForChapter(
  chapterId: string,
): Promise<ApiResult<Poll | null>> {
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("chapter_id", chapterId)
    .maybeSingle();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Get poll options
// ---------------------------------------------------------------------------
export async function getPollOptions(
  pollId: string,
): Promise<ApiResult<PollOption[]>> {
  const { data, error } = await supabase
    .from("poll_options")
    .select("*")
    .eq("poll_id", pollId)
    .order("display_order", { ascending: true });

  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Has this user voted?
// ---------------------------------------------------------------------------
export async function getUserVote(
  pollId: string,
  userId: string,
): Promise<ApiResult<PollVote | null>> {
  const { data, error } = await supabase
    .from("poll_votes")
    .select("*")
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Cast a vote
// ---------------------------------------------------------------------------
export async function vote(
  pollId: string,
  optionId: string,
): Promise<ApiResult<PollVote>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user)
    return err("Not authenticated");

  const { data, error } = await supabase
    .from("poll_votes")
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userData.user.id,
    } as never)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Author: create a poll
// ---------------------------------------------------------------------------
export interface CreatePollInput {
  story_id: string;
  author_id: string;
  chapter_id: string;
  question: string;
  description?: string;
  closes_at?: string;
  options: string[];
}

export async function createPoll(
  input: CreatePollInput,
): Promise<ApiResult<Poll>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user)
    return err("Not authenticated");

  // 1. Create poll
  const { data: pollData, error: pollError } = await supabase
    .from("polls")
    .insert({
      story_id: input.story_id,
      author_id: input.author_id,
      chapter_id: input.chapter_id,
      question: input.question,
      description: input.description ?? null,
      closes_at: input.closes_at ?? null,
      status: "open",
    } as never)
    .select()
    .single();

  if (pollError || !pollData)
    return err(pollError?.message ?? "Failed to create poll");

  // 2. Create options
  const options = input.options.map((text, i) => ({
    poll_id: (pollData as Poll).id,
    option_text: text,
    display_order: i,
  }));

  const { error: optionsError } = await supabase
    .from("poll_options")
    .insert(options as never);

  if (optionsError)
    return err(optionsError.message);
  return ok(pollData);
}

// ---------------------------------------------------------------------------
// Author: close poll + tally votes (RPC to tally_poll_votes function)
// ---------------------------------------------------------------------------
export async function closePoll(
  pollId: string,
): Promise<ApiResult<string>> {
  const { data, error } = await supabase.rpc("tally_poll_votes", {
    p_poll_id: pollId,
  } as never);

  if (error)
    return err(error.message);
  return ok(data as string);
}

// ---------------------------------------------------------------------------
// Get polls for a story (author view)
// ---------------------------------------------------------------------------
export async function getPollsForStory(
  storyId: string,
): Promise<ApiResult<Poll[]>> {
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false });

  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Delete poll
// ---------------------------------------------------------------------------
export async function deletePoll(pollId: string): Promise<ApiResult<null>> {
  const { error } = await supabase.from("polls").delete().eq("id", pollId);
  if (error)
    return err(error.message);
  return ok(null);
}

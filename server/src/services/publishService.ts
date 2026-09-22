import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// Publish all scheduled chapters whose time has passed
// Called by cron every minute.
// ============================================================
export async function publishDueChapters(): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("publish_scheduled_chapters");

  if (error) {
    logger.error("Scheduled publish failed", { error: error.message });
    throw HttpError.internal("Scheduled publish failed");
  }

  const count = typeof data === "number" ? data : 0;
  if (count > 0) {
    logger.info("Published scheduled chapters", { count });
  }
  return count;
}

// ============================================================
// Post-publish: enqueue audio generation for Spark Pro authors
// ============================================================
export async function enqueueAudioGeneration(
  chapterId: string,
  authorId: string,
  voiceId: string,
): Promise<void> {
  // Check if the author is Spark Pro
  const { data: membership } = await supabaseAdmin
    .from("memberships")
    .select("tier, status")
    .eq("user_id", authorId)
    .maybeSingle();

  const isPro = membership?.tier === "spark_pro" && (membership.status === "active" || membership.status === "trialing");

  if (!isPro) {
    logger.debug("Skipping audio generation — author not Spark Pro", {
      chapterId,
      authorId,
    });
    return;
  }

  // Create (or reset) the audio asset row to 'pending'
  await supabaseAdmin.from("audio_assets").upsert(
    {
      chapter_id: chapterId,
      voice_id: voiceId,
      status: "pending",
      error_message: null,
      generated_at: null,
    },
    { onConflict: "chapter_id,voice_id" },
  );

  logger.info("Audio generation queued", { chapterId, voiceId });
}

// ============================================================
// Publish a chapter manually and trigger side effects
// ============================================================
export async function publishChapter(
  chapterId: string,
  voiceId: string,
): Promise<void> {
  const { data: chapter, error } = await supabaseAdmin
    .from("chapters")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq("id", chapterId)
    .select("id, story_id, author_id")
    .single();

  if (error || !chapter) {
    throw HttpError.internal("Failed to publish chapter");
  }

  // Queue audio for Spark Pro authors
  await enqueueAudioGeneration(chapter.id, chapter.author_id, voiceId);
}

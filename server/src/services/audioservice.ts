import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import * as audioCache from "./audioCacheService.js";

// Spark tier + above: stream URL
export async function getStreamUrl(chapterId: string, _userId: string) {
  const asset = await audioCache.getAsset(chapterId);

  if (!asset || asset.status !== "ready" || !asset.storage_path) {
    throw HttpError.notFound("Audio not available for this chapter yet");
  }

  const url = await audioCache.getStreamUrl(asset.storage_path);
  return { url, duration: asset.duration_seconds };
}

// Spark Pro only: download URL
export async function getDownloadUrl(chapterId: string, userId: string) {
  // Check tier
  const { data: membership } = await supabaseAdmin
    .from("memberships")
    .select("tier, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (membership?.tier !== "spark_pro") {
    throw HttpError.forbidden("Spark Pro required");
  }

  const asset = await audioCache.getAsset(chapterId);
  if (!asset || asset.status !== "ready" || !asset.storage_path) {
    throw HttpError.notFound("Audio not available");
  }

  const url = await audioCache.getDownloadUrl(
    asset.storage_path,
    `chapter-${chapterId}.mp3`,
  );
  return { url, filename: `chapter-${chapterId}.mp3` };
}

export async function requestGeneration(chapterId: string, userId: string) {
  // Verify ownership
  const { data: chapter } = await supabaseAdmin
    .from("chapters")
    .select("author_id")
    .eq("id", chapterId)
    .maybeSingle();

  if (!chapter)
    throw HttpError.notFound("Chapter not found");
  if (chapter.author_id !== userId)
    throw HttpError.forbidden();

  await audioCache.upsertAsset({
    chapterId,
    storagePath: "",
    voiceId: "default",
    status: "pending",
  });

  return { jobId: `job-${chapterId}-${Date.now()}` };
}

export async function getStatus(chapterId: string, _userId: string) {
  const asset = await audioCache.getAsset(chapterId);
  return {
    status: asset?.status ?? "pending",
    error: asset?.error_message ?? undefined,
  };
}

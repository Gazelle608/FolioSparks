import type { Buffer } from "node:buffer";

import { env } from "../config/env.js";
import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// Upload — stores an MP3 and returns its path
// ============================================================
export async function uploadChapterAudio(
  storyId: string,
  chapterId: string,
  audio: Buffer,
  voiceId: string,
): Promise<{ path: string; sizeBytes: number }> {
  const path = `${storyId}/${chapterId}-${voiceId}.mp3`;

  const { error } = await supabaseAdmin.storage
    .from(env.SUPABASE_AUDIO_BUCKET)
    .upload(path, audio, {
      contentType: "audio/mpeg",
      cacheControl: "31536000", // 1 year
      upsert: true,
    });

  if (error) {
    logger.error("Audio upload failed", { chapterId, error: error.message });
    throw HttpError.internal("Could not store audio");
  }

  return { path, sizeBytes: audio.byteLength };
}

// ============================================================
// Signed URLs
// ============================================================
export async function getStreamUrl(
  storagePath: string,
  expiresIn = 900,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(env.SUPABASE_AUDIO_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data) {
    throw HttpError.internal("Could not sign audio URL");
  }
  return data.signedUrl;
}

export async function getDownloadUrl(
  storagePath: string,
  filename: string,
  expiresIn = 900,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(env.SUPABASE_AUDIO_BUCKET)
    .createSignedUrl(storagePath, expiresIn, {
      download: filename,
    });

  if (error || !data) {
    throw HttpError.internal("Could not sign audio download");
  }
  return data.signedUrl;
}

// ============================================================
// DB row management
// ============================================================
export async function upsertAsset(input: {
  chapterId: string;
  storagePath: string;
  voiceId: string;
  durationSeconds?: number;
  sizeBytes?: number;
  status: "pending" | "generating" | "ready" | "failed";
  errorMessage?: string;
}): Promise<void> {
  const { error } = await supabaseAdmin.from("audio_assets").upsert(
    {
      chapter_id: input.chapterId,
      storage_path: input.storagePath,
      voice_id: input.voiceId,
      duration_seconds: input.durationSeconds ?? null,
      size_bytes: input.sizeBytes ?? null,
      status: input.status,
      error_message: input.errorMessage ?? null,
      generated_at: input.status === "ready" ? new Date().toISOString() : null,
    },
    { onConflict: "chapter_id,voice_id" },
  );

  if (error) {
    logger.error("Failed to upsert audio asset", {
      chapterId: input.chapterId,
      error: error.message,
    });
  }
}

export async function getAsset(chapterId: string): Promise<{
  id: string;
  storage_path: string | null;
  voice_id: string;
  duration_seconds: number | null;
  status: "pending" | "generating" | "ready" | "failed";
  error_message: string | null;
} | null> {
  const { data } = await supabaseAdmin
    .from("audio_assets")
    .select(
      "id, storage_path, voice_id, duration_seconds, status, error_message",
    )
    .eq("chapter_id", chapterId)
    .maybeSingle();

  return data;
}

export async function markGenerating(
  chapterId: string,
  voiceId: string,
): Promise<void> {
  await supabaseAdmin
    .from("audio_assets")
    .update({ status: "generating" })
    .eq("chapter_id", chapterId)
    .eq("voice_id", voiceId);
}

export async function markFailed(
  chapterId: string,
  voiceId: string,
  errorMessage: string,
): Promise<void> {
  await supabaseAdmin
    .from("audio_assets")
    .update({ status: "failed", error_message: errorMessage })
    .eq("chapter_id", chapterId)
    .eq("voice_id", voiceId);
}

// ============================================================
// Cleanup
// ============================================================
export async function deleteChapterAudio(chapterId: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from("audio_assets")
    .select("storage_path")
    .eq("chapter_id", chapterId);

  if (!data || data.length === 0)
    return;

  const paths = data
    .map(a => a.storage_path)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabaseAdmin.storage.from(env.SUPABASE_AUDIO_BUCKET).remove(paths);
  }

  await supabaseAdmin.from("audio_assets").delete().eq("chapter_id", chapterId);
}

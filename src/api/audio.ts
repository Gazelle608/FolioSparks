import type { ApiResult } from "./supabase";

import { api } from "./backend";
import { err, ok, supabase } from "./supabase";

interface AudioAsset {
  status: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Get the audio asset record for a chapter (metadata only)
// ---------------------------------------------------------------------------
export async function getAudioAsset(
  chapterId: string,
): Promise<ApiResult<AudioAsset | null>> {
  const { data, error } = await supabase
    .from("audio_assets")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("status", "ready")
    .maybeSingle();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Request a signed streaming URL (Spark Pro only — server checks tier)
// ---------------------------------------------------------------------------
export async function getAudioStreamUrl(
  chapterId: string,
): Promise<ApiResult<{ url: string; duration: number | null }>> {
  return api.get(`/audio/${chapterId}/stream`);
}

// ---------------------------------------------------------------------------
// Request a signed MP3 download URL (Spark Pro only)
// ---------------------------------------------------------------------------
export async function getAudioDownloadUrl(
  chapterId: string,
): Promise<ApiResult<{ url: string; filename: string }>> {
  return api.get(`/audio/${chapterId}/download`);
}

// ---------------------------------------------------------------------------
// Author: trigger generation for a chapter (queued on server)
// ---------------------------------------------------------------------------
export async function requestAudioGeneration(
  chapterId: string,
): Promise<ApiResult<{ jobId: string }>> {
  return api.post(`/audio/${chapterId}/generate`);
}

// ---------------------------------------------------------------------------
// Author: get generation status for a chapter
// ---------------------------------------------------------------------------
export async function getAudioStatus(
  chapterId: string,
): Promise<ApiResult<{ status: AudioAsset["status"]; error?: string }>> {
  return api.get(`/audio/${chapterId}/status`);
}

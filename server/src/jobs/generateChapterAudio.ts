import cron from "node-cron";

import { supabaseAdmin } from "../config/supabase.js";
import * as audioCache from "../services/audioCacheService.js";
import {
  isEnabled as isTtsEnabled,
  synthesize,
} from "../services/ttsService.js";
import { logger } from "../utils/logger.js";
import { wrapJob } from "./runner.js";

// ============================================================
// Schedule
// ------------------------------------------------------------
// Every 10 minutes. Picks up at most BATCH_SIZE pending rows per run
// so a backlog doesn't hammer the TTS provider or the process.
// ============================================================
const SCHEDULE = "*/10 * * * *";
const BATCH_SIZE = 5;

// ============================================================
// Types
// ============================================================
interface PendingAsset {
  id: string;
  chapter_id: string;
  voice_id: string;
  status: string;
}

interface ChapterRow {
  id: string;
  story_id: string;
  title: string | null;
  chapter_number: number;
  content: string;
  word_count: number;
}

// ============================================================
// Job body
// ============================================================
async function generateChapterAudio(): Promise<number> {
  if (!isTtsEnabled()) {
    logger.debug("Audio generation skipped — TTS is not configured");
    return 0;
  }

  // 1. Find pending audio assets
  const { data: pending, error } = await supabaseAdmin
    .from("audio_assets")
    .select("id, chapter_id, voice_id, status")
    .eq("status", "pending")
    .limit(BATCH_SIZE);

  if (error) {
    throw new Error(`Failed to fetch pending audio: ${error.message}`);
  }

  if (!pending || pending.length === 0) {
    return 0;
  }

  logger.info(`Processing ${pending.length} audio generation(s)`);

  let processed = 0;

  for (const asset of pending as PendingAsset[]) {
    try {
      await processOne(asset);
      processed++;
    }
    catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Audio generation failed for asset", {
        assetId: asset.id,
        chapterId: asset.chapter_id,
        error: message,
      });

      await audioCache.markFailed(asset.chapter_id, asset.voice_id, message);
    }
  }

  return processed;
}

// ============================================================
// Process a single asset
// ============================================================
async function processOne(asset: PendingAsset): Promise<void> {
  const { chapter_id, voice_id } = asset;

  // 1. Fetch the chapter
  const { data: chapter, error: chapterError } = await supabaseAdmin
    .from("chapters")
    .select("id, story_id, title, chapter_number, content, word_count")
    .eq("id", chapter_id)
    .single();

  if (chapterError || !chapter) {
    throw new Error("Chapter not found");
  }

  const ch = chapter as ChapterRow;

  if (!ch.content || ch.content.trim().length === 0) {
    throw new Error("Chapter has no content");
  }

  // 2. Mark as generating so we don't pick it up again
  await audioCache.markGenerating(ch.id, voice_id);

  // 3. Synthesize
  logger.info("Synthesizing audio", {
    chapterId: ch.id,
    chapterNumber: ch.chapter_number,
    wordCount: ch.word_count,
    voice: voice_id,
  });

  const result = await synthesize({
    text: ch.content,
    voice: voice_id,
  });

  // 4. Upload to storage
  const { path, sizeBytes } = await audioCache.uploadChapterAudio(
    ch.story_id,
    ch.id,
    result.audio,
    voice_id,
  );

  // 5. Estimate duration from word count (180 WPM)
  const durationSeconds = Math.round((ch.word_count / 180) * 60);

  // 6. Update the asset row to ready
  await audioCache.upsertAsset({
    chapterId: ch.id,
    storagePath: path,
    voiceId: voice_id,
    durationSeconds,
    sizeBytes,
    status: "ready",
  });

  logger.info("Audio ready", {
    chapterId: ch.id,
    path,
    sizeBytes,
    durationSeconds,
  });
}

// ============================================================
// Starter
// ============================================================
export function startAudioGenerator(): void {
  cron.schedule(SCHEDULE, () => {
    wrapJob("generate-chapter-audio", generateChapterAudio);
  });

  logger.info(`Scheduled: audio generation (${SCHEDULE})`);
}

// ============================================================
// Manual trigger — useful for testing a specific chapter
// ============================================================
export async function runAudioGeneratorNow(): Promise<number> {
  return generateChapterAudio();
}

// ============================================================
// One-off enqueue — call from a controller when a chapter publishes
// ============================================================
export async function enqueueChapterAudio(
  chapterId: string,
  voiceId: string,
): Promise<void> {
  await audioCache.upsertAsset({
    chapterId,
    storagePath: "",
    voiceId,
    status: "pending",
  });

  logger.info("Audio generation enqueued", { chapterId, voiceId });
}

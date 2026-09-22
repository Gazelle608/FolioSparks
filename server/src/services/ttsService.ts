import { Buffer } from "node:buffer";

import { isTtsEnabled, TTS_ENDPOINTS, ttsConfig } from "../config/tts.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// Public API
// ============================================================
export function isEnabled(): boolean {
  return isTtsEnabled();
}

export interface SynthesizeInput {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
}

export interface SynthesizeResult {
  audio: Buffer;
  mimeType: "audio/mpeg";
  voice: string;
  provider: string;
}

/**
 * Synthesize text to MP3.
 * Splits long text into chunks, calls the provider for each, concatenates.
 */
export async function synthesize(
  input: SynthesizeInput,
): Promise<SynthesizeResult> {
  if (!isEnabled()) {
    throw HttpError.internal("TTS is not configured");
  }

  const voice = input.voice ?? ttsConfig.defaultVoice;
  const language = input.language ?? ttsConfig.defaultLanguage;

  // Split into chunks that fit the provider limit
  const chunks = chunkText(input.text, ttsConfig.maxCharsPerRequest);

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const buf = await callProvider({
      text: chunk,
      voice,
      language,
      speed: input.speed ?? 1,
    });
    buffers.push(buf);
  }

  return {
    audio: Buffer.concat(buffers),
    mimeType: "audio/mpeg",
    voice,
    provider: ttsConfig.provider,
  };
}

// ============================================================
// Chunking
// ============================================================
function chunkText(text: string, maxLen: number): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let buffer = "";

  for (const para of paragraphs) {
    if ((`${buffer}\n\n${para}`).length > maxLen) {
      if (buffer)
        chunks.push(buffer);
      // A single paragraph might exceed maxLen — split it
      if (para.length > maxLen) {
        for (let i = 0; i < para.length; i += maxLen) {
          chunks.push(para.slice(i, i + maxLen));
        }
        buffer = "";
      }
      else {
        buffer = para;
      }
    }
    else {
      buffer = buffer ? `${buffer}\n\n${para}` : para;
    }
  }
  if (buffer)
    chunks.push(buffer);

  return chunks;
}

// ============================================================
// Provider dispatch
// ============================================================
interface ProviderInput {
  text: string;
  voice: string;
  language: string;
  speed: number;
}

async function callProvider(input: ProviderInput): Promise<Buffer> {
  switch (ttsConfig.provider) {
    case "google":
      return callGoogle(input);
    case "azure":
      return callAzure(input);
    case "elevenlabs":
      return callElevenLabs(input);
    default:
      throw HttpError.internal("Unsupported TTS provider");
  }
}

// ============================================================
// Google Cloud TTS
// ============================================================
async function callGoogle(input: ProviderInput): Promise<Buffer> {
  const url = `${TTS_ENDPOINTS.google}?key=${ttsConfig.apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text: input.text },
      voice: {
        languageCode: input.language,
        name: input.voice,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: input.speed,
        sampleRateHertz: 24000,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error("Google TTS failed", { status: response.status, body });
    throw HttpError.internal("Audio generation failed");
  }

  const json = (await response.json()) as { audioContent: string };
  return Buffer.from(json.audioContent, "base64");
}

// ============================================================
// Azure TTS
// ============================================================
async function callAzure(input: ProviderInput): Promise<Buffer> {
  const ssml = `
    <speak version="1.0" xml:lang="${input.language}">
      <voice name="${input.voice}">
        <prosody rate="${input.speed}">${escapeXml(input.text)}</prosody>
      </voice>
    </speak>
  `;

  const response = await fetch(TTS_ENDPOINTS.azure, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": ttsConfig.apiKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    body: ssml,
  });

  if (!response.ok) {
    logger.error("Azure TTS failed", { status: response.status });
    throw HttpError.internal("Audio generation failed");
  }

  return Buffer.from(await response.arrayBuffer());
}

// ============================================================
// ElevenLabs
// ============================================================
async function callElevenLabs(input: ProviderInput): Promise<Buffer> {
  const response = await fetch(`${TTS_ENDPOINTS.elevenlabs}/${input.voice}`, {
    method: "POST",
    headers: {
      "xi-api-key": ttsConfig.apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text: input.text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    logger.error("ElevenLabs TTS failed", { status: response.status });
    throw HttpError.internal("Audio generation failed");
  }

  return Buffer.from(await response.arrayBuffer());
}

// ============================================================
// Helpers
// ============================================================
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

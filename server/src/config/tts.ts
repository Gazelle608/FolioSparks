import { env, isProduction } from "./env.js";

// ============================================================
// Types
// ============================================================
export interface TtsConfig {
  provider: "google" | "azure" | "elevenlabs";
  apiKey: string;
  defaultVoice: string;
  /** Maximum characters per synthesis request — provider-specific */
  maxCharsPerRequest: number;
  /** Output format for the generated MP3 */
  outputFormat: "mp3";
  /** Language code — 'en-US' etc. */
  defaultLanguage: string;
}

// ============================================================
// Provider-specific defaults
// ============================================================
const PROVIDER_DEFAULTS: Record<
  TtsConfig["provider"],
  { maxChars: number; sampleRate: number }
> = {
  google: { maxChars: 5000, sampleRate: 24000 },
  azure: { maxChars: 10000, sampleRate: 24000 },
  elevenlabs: { maxChars: 5000, sampleRate: 44100 },
};

// ============================================================
// Config
// ============================================================
export const ttsConfig: TtsConfig = {
  provider: env.TTS_PROVIDER,
  apiKey: env.TTS_API_KEY ?? "",
  defaultVoice: env.TTS_DEFAULT_VOICE,
  maxCharsPerRequest: PROVIDER_DEFAULTS[env.TTS_PROVIDER].maxChars,
  outputFormat: "mp3",
  defaultLanguage: "en-US",
};

// ============================================================
// Feature flag — is TTS actually usable right now?
// ------------------------------------------------------------
// The server should degrade gracefully if TTS is misconfigured:
// Spark Pro users get a "coming soon" message instead of an error.
// ============================================================
export function isTtsEnabled(): boolean {
  return Boolean(ttsConfig.apiKey) && ttsConfig.apiKey.length > 10;
}

// ============================================================
// Provider endpoints — used by ttsService.ts
// ============================================================
export const TTS_ENDPOINTS = {
  google: "https://texttospeech.googleapis.com/v1/text:synthesize",
  azure: `https://${env.SUPABASE_URL}.cognitiveservices.azure.com/cognitiveservices/v1`,
  elevenlabs: "https://api.elevenlabs.io/v1/text-to-speech",
} as const;

// ============================================================
// Recommended voices per provider — for author selection UI
// ============================================================
export const RECOMMENDED_VOICES: Record<
  TtsConfig["provider"],
  Array<{ id: string; label: string; accent: string }>
> = {
  google: [
    { id: "en-US-Neural2-F", label: "Ava (US)", accent: "American" },
    { id: "en-US-Neural2-D", label: "Ethan (US)", accent: "American" },
    { id: "en-GB-Neural2-A", label: "Olivia (UK)", accent: "British" },
    { id: "en-AU-Neural2-A", label: "Charlotte (AU)", accent: "Australian" },
  ],
  azure: [
    { id: "en-US-JennyNeural", label: "Jenny (US)", accent: "American" },
    { id: "en-US-GuyNeural", label: "Guy (US)", accent: "American" },
    { id: "en-GB-SoniaNeural", label: "Sonia (UK)", accent: "British" },
    { id: "en-AU-NatashaNeural", label: "Natasha (AU)", accent: "Australian" },
  ],
  elevenlabs: [
    { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel", accent: "American" },
    { id: "AZnzlk1XvdvUeBnXmlld", label: "Domi", accent: "American" },
    { id: "EXAVITQu4vr4xnSDxMaL", label: "Bella", accent: "American" },
    { id: "ErXwobaYiN019PkySvjV", label: "Antoni", accent: "American" },
  ],
};

// ============================================================
// Production warnings
// ============================================================
if (isProduction && !isTtsEnabled()) {
  console.warn(
    "⚠️  TTS is not configured. Spark Pro audio features will be disabled.",
  );
}

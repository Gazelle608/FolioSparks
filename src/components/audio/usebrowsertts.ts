import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface BrowserTTSState {
  supported: boolean;
  speaking: boolean;
  paused: boolean;
  rate: number;
  voice: SpeechSynthesisVoice | null;
  voices: SpeechSynthesisVoice[];
  /** Current position in the text, in characters */
  position: number;
  /** Estimated progress 0–1 */
  progress: number;
}

export interface BrowserTTSControls {
  speak: (text: string, fromChar?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  seek: (charIndex: number) => void;
}

// ---------------------------------------------------------------------------
// Chunking: browsers choke on very long utterances (> ~32k chars).
// We split into paragraph-sized chunks so progress tracking is per-paragraph.
// ---------------------------------------------------------------------------
interface Chunk {
  text: string;
  startChar: number;
  endChar: number;
}

function chunkText(text: string, maxLen = 3000): Chunk[] {
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const chunks: Chunk[] = [];
  let cursor = 0;
  let buffer = "";
  let bufferStart = 0;

  const flush = () => {
    if (!buffer.trim())
      return;
    chunks.push({
      text: buffer.trim(),
      startChar: bufferStart,
      endChar: bufferStart + buffer.trim().length,
    });
    cursor = bufferStart + buffer.length;
    buffer = "";
    bufferStart = cursor;
  };

  for (const para of paragraphs) {
    if (buffer.length + para.length + 2 > maxLen)
      flush();
    if (!buffer)
      bufferStart = cursor;
    buffer += (buffer ? "\n\n" : "") + para;
    cursor += para.length + 2;
  }
  flush();

  return chunks;
}

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------
export function useBrowserTTS(): BrowserTTSState & BrowserTTSControls {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRateState] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoiceState] = useState<SpeechSynthesisVoice | null>(null);
  const [position, setPosition] = useState(0);
  const [progress, setProgress] = useState(0);

  // Internal refs
  const chunksRef = useRef<Chunk[]>([]);
  const currentChunkRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cancelledRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Feature detection + voice loading
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);

      // Prefer English voices, fall back to first available
      if (!voice && list.length > 0) {
        const preferred
        = list.find(v => v.lang.startsWith("en") && v.default)
          || list.find(v => v.lang.startsWith("en"))
          || list[0];
        setVoiceState(preferred);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [voice]);

  // ---------------------------------------------------------------------------
  // Speak a chunk
  // ---------------------------------------------------------------------------
  const speakChunk = useCallback(
    (index: number) => {
      if (index >= chunksRef.current.length) {
        // Finished
        setSpeaking(false);
        setPaused(false);
        setProgress(1);
        return;
      }

      const chunk = chunksRef.current[index];
      currentChunkRef.current = index;

      const utterance = new SpeechSynthesisUtterance(chunk.text);
      utterance.rate = rate;
      if (voice)
        utterance.voice = voice;

      utterance.onstart = () => {
        setSpeaking(true);
        setPaused(false);
        setPosition(chunk.startChar);
      };

      utterance.onend = () => {
        if (cancelledRef.current)
          return;

        // Estimate progress by characters consumed
        const totalChars = chunksRef.current[chunksRef.current.length - 1]?.endChar ?? 1;
        setProgress(Math.min(1, chunk.endChar / totalChars));

        speakChunk(index + 1);
      };

      utterance.onerror = (event) => {
        // "interrupted" fires on cancel; don"t treat as error
        if (event.error === "interrupted" || event.error === "canceled")
          return;
        console.error("TTS error:", event.error);
        setSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [rate, voice],
  );

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------
  const speak = useCallback(
    (text: string, fromChar = 0) => {
      if (!supported)
        return;
      window.speechSynthesis.cancel();
      cancelledRef.current = false;

      chunksRef.current = chunkText(text);

      // Find the chunk that contains fromChar
      let startIdx = 0;
      if (fromChar > 0) {
        const found = chunksRef.current.findIndex(
          c => fromChar >= c.startChar && fromChar < c.endChar,
        );
        if (found >= 0)
          startIdx = found;
      }

      setProgress(0);
      speakChunk(startIdx);
    },
    [supported, speakChunk],
  );

  const pause = useCallback(() => {
    if (!supported)
      return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported)
      return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported)
      return;
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    setProgress(0);
    setPosition(0);
    currentChunkRef.current = 0;
  }, [supported]);

  const setRate = useCallback(
    (newRate: number) => {
      setRateState(newRate);

      // If currently speaking, restart from current chunk to apply rate
      if (speaking && !paused) {
        window.speechSynthesis.cancel();
        speakChunk(currentChunkRef.current);
      }
    },
    [speaking, paused, speakChunk],
  );

  const setVoice = useCallback(
    (newVoice: SpeechSynthesisVoice) => {
      setVoiceState(newVoice);
      if (speaking && !paused) {
        window.speechSynthesis.cancel();
        // Voice change needs a fresh speak() call to apply — restart chunk
        setTimeout(() => speakChunk(currentChunkRef.current), 50);
      }
    },
    [speaking, paused, speakChunk],
  );

  const seek = useCallback(
    (charIndex: number) => {
      if (!speaking)
        return;
      window.speechSynthesis.cancel();
      speak(chunksRef.current.map(c => c.text).join("\n\n"), charIndex);
    },
    [speaking, speak],
  );

  // ---------------------------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    supported,
    speaking,
    paused,
    rate,
    voice,
    voices,
    position,
    progress,
    speak,
    pause,
    resume,
    stop,
    setRate,
    setVoice,
    seek,
  };
}

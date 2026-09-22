import { useEffect, useRef, useState } from "react";

import { SparkFilledIcon } from "../../assets/icons";
import { AudioControls } from "./audiocontrols";
import { AudioDownloadButton } from "./audiodownloadbutton";
import { useBrowserTTS } from "./usebrowsertts";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
interface AudioPlayerBrowserProps {
  mode: "browser";
  /** The chapter text to read aloud */
  text: string;
  /** Estimated duration for display (words / 180 wpm) */
  estimatedSeconds?: number;
}

interface AudioPlayerMp3Props {
  mode: "mp3";
  /** Signed URL from server */
  src: string;
  /** Duration from the audio asset */
  durationSeconds?: number;
  /** Chapter ID — needed for the download button */
  chapterId: string;
  /** Show the download button (Spark Pro only) */
  allowDownload?: boolean;
  /** Optional title shown above controls */
  title?: string;
}

type AudioPlayerProps = (AudioPlayerBrowserProps | AudioPlayerMp3Props) & {
  /** Optional chapter title shown in the header */
  title?: string;
};

export function AudioPlayer(props: AudioPlayerProps) {
  if (props.mode === "browser")
    return <BrowserPlayer {...props} />;
  return <Mp3Player {...props} />;
}

// ---------------------------------------------------------------------------
// BROWSER TTS PLAYER — Spark tier
// ---------------------------------------------------------------------------
function BrowserPlayer({ text, estimatedSeconds, title }: AudioPlayerBrowserProps & { title?: string }) {
  const tts = useBrowserTTS();
  const [progress, setProgress] = useState(0);

  // Track progress from the hook
  useEffect(() => {
    setProgress(tts.progress);
  }, [tts.progress]);

  if (!tts.supported) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Your browser doesn"t support text-to-speech. Try Chrome, Edge, or Safari.
      </div>
    );
  }

  const duration = estimatedSeconds ?? estimateDuration(text);
  const currentTime = (progress * duration).toFixed(0);

  const handlePlayPause = () => {
    if (tts.speaking && !tts.paused) {
      tts.pause();
    }
    else if (tts.speaking && tts.paused) {
      tts.resume();
    }
    else {
      tts.speak(text);
    }
  };

  return (
    <div className="rounded-lg border border-primary-100 bg-white p-4 sm:p-5">
      <Header title={title ?? "Listen to this chapter"} />

      <AudioControls
        playing={tts.speaking}
        paused={tts.paused}
        progress={progress}
        currentTime={formatTime(Number(currentTime))}
        duration={formatTime(duration)}
        rate={tts.rate}
        voices={tts.voices}
        currentVoice={tts.voice}
        onVoiceChange={tts.setVoice}
        onPlayPause={handlePlayPause}
        onRateChange={tts.setRate}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// MP3 PLAYER — Spark Pro tier
// ---------------------------------------------------------------------------
function Mp3Player({
  src,
  durationSeconds,
  chapterId,
  allowDownload = false,
  title,
}: AudioPlayerMp3Props & { title?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Sync state to the audio element
  useEffect(() => {
    const el = audioRef.current;
    if (!el)
      return;

    const onTime = () => {
      if (el.duration > 0)
        setProgress(el.currentTime / el.duration);
    };
    const onLoaded = () => {
      if (!durationSeconds && el.duration > 0)
        setDuration(el.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(1);
    };
    const onErr = () => {
      setError("Audio failed to load. Please try again.");
      setPlaying(false);
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnd);
    el.addEventListener("error", onErr);

    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("error", onErr);
    };
  }, [durationSeconds]);

  // Sync rate
  useEffect(() => {
    if (audioRef.current)
      audioRef.current.playbackRate = rate;
  }, [rate]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el)
      return;
    if (playing) {
      el.pause();
      setPlaying(false);
    }
    else {
      el.play().then(() => setPlaying(true)).catch(() => setError("Could not start playback."));
    }
  };

  const skip = (seconds: number) => {
    const el = audioRef.current;
    if (!el)
      return;
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + seconds));
  };

  const seek = (pct: number) => {
    const el = audioRef.current;
    if (!el || !el.duration)
      return;
    el.currentTime = pct * el.duration;
  };

  const currentTime = progress * duration;

  return (
    <div className="rounded-lg border border-primary-100 bg-white p-4 sm:p-5">
      <Header title={title ?? "Listen to this chapter"} isPro />

      <audio ref={audioRef} src={src} preload="metadata" />

      <AudioControls
        playing={playing}
        progress={progress}
        currentTime={formatTime(currentTime)}
        duration={formatTime(duration)}
        rate={rate}
        onPlayPause={togglePlay}
        onSkipBack={() => skip(-15)}
        onSkipForward={() => skip(15)}
        onSeek={seek}
        onRateChange={setRate}
      />

      {allowDownload && (
        <div className="mt-4 pt-4 border-t border-primary-100">
          <AudioDownloadButton chapterId={chapterId} />
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header (shared)
// ---------------------------------------------------------------------------
function Header({ title, isPro = false }: { title: string; isPro?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-display text-sm font-bold text-primary-900">{title}</h3>
      {isPro && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-spark">
          <SparkFilledIcon size={11} />
          Spark Pro
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const WPM = 180;
  return Math.max(30, Math.round((words / WPM) * 60));
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

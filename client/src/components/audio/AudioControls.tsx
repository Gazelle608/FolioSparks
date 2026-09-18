import { Dropdown } from "../ui";

interface AudioControlsProps {
  /** Is audio currently playing? */
  playing: boolean;
  /** Is it paused (vs stopped)? */
  paused?: boolean;
  /** 0–1 progress */
  progress: number;
  /** Display position, e.g. "3:42" */
  currentTime: string;
  /** Total duration, e.g. "12:15" */
  duration: string;
  /** Playback speed */
  rate: number;
  onPlayPause: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  onSeek?: (progress: number) => void;
  onRateChange: (rate: number) => void;
  /** Optional voice picker (browser TTS only) */
  voices?: SpeechSynthesisVoice[];
  currentVoice?: SpeechSynthesisVoice | null;
  onVoiceChange?: (voice: SpeechSynthesisVoice) => void;
  className?: string;
}

const RATES = [0.75, 1, 1.25, 1.5, 2];

export function AudioControls({
  playing,
  paused = false,
  progress,
  currentTime,
  duration,
  rate,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  onSeek,
  onRateChange,
  voices,
  onVoiceChange,
  className = "",
}: AudioControlsProps) {
  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek)
      return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, pct)));
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Progress bar */}
      <div
        role="slider"
        aria-label="Audio progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        onClick={handleSeekClick}
        className="group relative h-1.5 rounded-full bg-primary-100 cursor-pointer"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary-500 group-hover:bg-primary-600 transition-colors"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary-600 shadow ring-2 ring-white opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress * 100}% - 6px)` }}
        />
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between text-xs text-primary-500 tabular-nums">
        <span>{currentTime}</span>
        <span>{duration}</span>
      </div>

      {/* Buttons row */}
      <div className="flex items-center justify-between gap-2">
        {/* Skip back */}
        <button
          type="button"
          onClick={onSkipBack}
          disabled={!onSkipBack}
          aria-label="Skip back 15 seconds"
          className="p-2 rounded-md text-primary-600 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SkipBackGlyph />
        </button>

        {/* Play/pause */}
        <button
          type="button"
          onClick={onPlayPause}
          aria-label={playing && !paused ? "Pause" : "Play"}
          className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all shadow-md"
        >
          {playing && !paused ? <PauseGlyph /> : <PlayGlyph />}
        </button>

        {/* Skip forward */}
        <button
          type="button"
          onClick={onSkipForward}
          disabled={!onSkipForward}
          aria-label="Skip forward 15 seconds"
          className="p-2 rounded-md text-primary-600 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SkipForwardGlyph />
        </button>

        {/* Right cluster: speed + voice */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Speed */}
          <Dropdown
            align="right"
            trigger={(
              <button
                type="button"
                aria-label={`Playback speed: ${rate}x`}
                className="px-2.5 h-9 rounded-md text-xs font-semibold text-primary-700 hover:bg-primary-50 tabular-nums"
              >
                {rate}
                x
              </button>
            )}
            items={RATES.map(r => ({
              id: `rate-${r}`,
              label: `${r}x`,
              onClick: () => onRateChange(r),
            }))}
          />

          {/* Voice picker (browser TTS only) */}
          {voices && voices.length > 0 && onVoiceChange && (
            <Dropdown
              align="right"
              trigger={(
                <button
                  type="button"
                  aria-label="Choose voice"
                  className="p-2 rounded-md text-primary-600 hover:bg-primary-50"
                >
                  <VoiceGlyph />
                </button>
              )}
              items={voices.slice(0, 12).map(v => ({
                id: v.name,
                label: `${v.name} (${v.lang})`,
                onClick: () => onVoiceChange(v),
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline glyphs
// ---------------------------------------------------------------------------
function PlayGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 5h4v14H6z M14 5h4v14h-4z" />
    </svg>
  );
}

function SkipBackGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 19l-9-7 9-7v14z M22 19l-9-7 9-7v14z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkipForwardGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13 5l9 7-9 7V5z M2 5l9 7-9 7V5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VoiceGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

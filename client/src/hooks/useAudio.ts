/**
 * Audio hook — thin re-export of the AudioContext provider.
 *
 * Returns nowPlaying, playing, paused, progress, volume, rate, and control actions.
 * See contexts/AudioContext.tsx for the full implementation.
 */
export { useAudio } from "../contexts/audiocontext";
export type { AudioState, NowPlaying } from "../contexts/audiocontext";

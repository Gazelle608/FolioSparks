import { useEffect, useState } from "react";

interface ProgressBarProps {
  /** Optional explicit progress 0–100. If provided, ignores scroll listener. */
  value?: number;
  /** Show the numeric percentage at the right edge */
  showPercent?: boolean;
}

export function ProgressBar({ value, showPercent = false }: ProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (value !== undefined)
      return;

    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, pct)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [value]);

  const progress = value ?? scrollProgress;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-0.5 bg-primary-100/40 z-40 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-primary-500 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showPercent && (
        <div className="fixed top-2 right-3 z-40 text-[10px] font-medium text-primary-500 tabular-nums pointer-events-none">
          {Math.round(progress)}
          %
        </div>
      )}
    </>
  );
}

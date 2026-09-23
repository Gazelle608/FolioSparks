import { useEffect, useState } from "react";

import { SparkFilledIcon } from "../../assets/icons";

interface SparkButtonProps {
  onClick: () => void;
  /** Current sparks already sent to this chapter */
  sparksSent?: number;
  /** Disabled state (e.g. reader not signed in) */
  disabled?: boolean;
}

export function SparkButton({
  onClick,
  sparksSent = 0,
  disabled = false,
}: SparkButtonProps) {
  const [visible, setVisible] = useState(false);

  // Reveal the button after the reader has scrolled a bit
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible)
    return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Send Sparks to this chapter"
      className={[
        "fixed bottom-6 right-6 z-30",
        "inline-flex items-center gap-2 h-12 pl-3 pr-4 rounded-full",
        "bg-spark text-primary-900 shadow-lg",
        "hover:bg-spark-dark hover:scale-105 active:scale-100",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      <SparkFilledIcon size={20} />
      <span className="text-sm font-bold">
        {sparksSent > 0 ? `${sparksSent} sent` : "Spark"}
      </span>
    </button>
  );
}

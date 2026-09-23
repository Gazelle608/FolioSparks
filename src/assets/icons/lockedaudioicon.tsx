import type { SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function LockedAudioIcon({ size = 24, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Headphones */}
      <path
        d="M4 14 v-2 a8 8 0 0 1 16 0 v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="3" y="14" width="4" height="6" rx="1.5" fill="currentColor" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" fill="currentColor" />
      {/* Lock */}
      <rect x="10" y="15" width="4" height="4" rx="0.6" fill="currentColor" />
      <path
        d="M10.8 15 v-1.2 a1.2 1.2 0 0 1 2.4 0 V15"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

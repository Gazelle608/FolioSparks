import type { SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function DeskIcon({ size = 24, ...props }: Props) {
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
      {/* Desk top */}
      <rect x="2" y="10" width="20" height="2" fill="currentColor" />
      {/* Legs */}
      <rect x="4" y="12" width="2" height="8" fill="currentColor" />
      <rect x="18" y="12" width="2" height="8" fill="currentColor" />
      {/* Paper on desk */}
      <rect x="8" y="5" width="8" height="5" rx="0.6" fill="currentColor" opacity="0.7" />
      {/* Pen */}
      <path
        d="M15 3 l3 3 -1.5 1.5 -3 -3 z"
        fill="currentColor"
      />
    </svg>
  );
}

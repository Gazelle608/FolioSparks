import type { SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function LogoMark({ size = 32, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect width="48" height="48" rx="12" fill="currentColor" />
      <path
        d="M24 8 L28 20 L40 24 L28 28 L24 40 L20 28 L8 24 L20 20 Z"
        fill="#FFD966"
        stroke="#DAF1DE"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

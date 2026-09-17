import type { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function AudioAvailableBadge({ size = 16, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3 9 v-2 a5 5 0 0 1 10 0 v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="2" y="9" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="11" y="9" width="3" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

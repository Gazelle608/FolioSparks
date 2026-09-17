import type { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function BmacIcon({ size = 24, ...props }: Props) {
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
      {/* Cup body */}
      <path
        d="M5 9 h11 v6 a4 4 0 0 1 -4 4 h-3 a4 4 0 0 1 -4 -4 z"
        fill="currentColor"
      />
      {/* Handle */}
      <path
        d="M16 11 h1.5 a2 2 0 0 1 0 4 H16"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Heart on cup */}
      <path
        d="M10.5 12.2 l-.7 -.7 a1 1 0 0 0 -1.4 1.4 l2.1 2.1 2.1 -2.1 a1 1 0 0 0 -1.4 -1.4 z"
        fill="#DAF1DE"
      />
    </svg>
  );
}

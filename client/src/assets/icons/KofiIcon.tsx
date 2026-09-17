import type { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function KofiIcon({ size = 24, ...props }: Props) {
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
      {/* Cup */}
      <path
        d="M4 8 h12 v8 a4 4 0 0 1 -4 4 h-4 a4 4 0 0 1 -4 -4 z"
        fill="currentColor"
      />
      {/* Handle */}
      <path
        d="M16 10 h1.5 a2.5 2.5 0 0 1 0 5 H16"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Steam */}
      <path
        d="M8 3 v3 M11 3 v3 M14 3 v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

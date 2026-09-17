import type { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function PatreonIcon({ size = 24, ...props }: Props) {
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
      <circle cx="14.5" cy="9.5" r="7" fill="currentColor" />
      <rect x="2" y="2" width="3.5" height="20" rx="0.5" fill="currentColor" />
    </svg>
  );
}

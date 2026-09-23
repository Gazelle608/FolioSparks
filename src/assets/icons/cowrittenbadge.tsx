import type { SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function CoWrittenBadge({ size = 16, ...props }: Props) {
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
      <circle cx="5.5" cy="8" r="3" fill="currentColor" />
      <circle cx="10.5" cy="8" r="3" fill="currentColor" opacity="0.65" />
    </svg>
  );
}

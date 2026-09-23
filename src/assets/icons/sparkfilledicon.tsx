import type { SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function SparkFilledIcon({ size = 24, ...props }: Props) {
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
      <path
        d="M12 1.5 L14.2 9.8 L22.5 12 L14.2 14.2 L12 22.5 L9.8 14.2 L1.5 12 L9.8 9.8 Z"
        fill="currentColor"
      />
      <path
        d="M12 6 L13 10 L17 11 L13 12 L12 16 L11 12 L7 11 L11 10 Z"
        fill="#FFF8DC"
        opacity="0.6"
      />
    </svg>
  );
}

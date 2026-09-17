import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

type Variant = "default" | "primary" | "spark" | "success" | "warning" | "danger" | "outline";
type Size = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-primary-100 text-primary-800",
  primary: "bg-primary-500 text-white",
  spark: "bg-spark text-primary-900",
  success: "bg-primary-500 text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  outline: "bg-transparent text-primary-700 border border-primary-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2   py-0.5 text-[11px] gap-1   rounded-full",
  md: "px-2.5 py-1   text-xs     gap-1.5 rounded-full",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "sm", icon, className = "", children, ...props }, ref) => (
    <span
      ref={ref}
      className={[
        "inline-flex items-center font-medium whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {icon}
      {children}
    </span>
  ),
);

Badge.displayName = "Badge";

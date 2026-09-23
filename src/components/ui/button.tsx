import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "spark";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500",
  secondary:
    "bg-primary-50 text-primary-900 hover:bg-primary-100 active:bg-primary-200 border border-primary-200 focus-visible:ring-primary-500",
  ghost:
    "bg-transparent text-primary-700 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500",
  danger:
    "bg-danger text-white hover:bg-red-800 active:bg-red-900 focus-visible:ring-red-500",
  spark:
    "bg-spark text-primary-900 hover:bg-spark-dark active:bg-spark-dark focus-visible:ring-spark font-semibold",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8  px-3 text-sm   gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm   gap-2   rounded-md",
  lg: "h-12 px-6 text-base gap-2.5 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-medium",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? "w-full" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {loading
          ? (<span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )
          : (
              leftIcon
            )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

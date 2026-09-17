import { forwardRef, type HTMLAttributes } from "react";

type Variant = "default" | "outline" | "flat";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  interactive?: boolean;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-white shadow-sm border border-primary-100",
  outline: "bg-white border border-primary-200",
  flat: "bg-primary-50 border border-transparent",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", interactive = false, className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        "rounded-lg overflow-hidden",
        variantClasses[variant],
        interactive
          ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = "Card";

// ---------- Subcomponents ----------

export function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 pt-5 pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-5 pt-3 pb-5 border-t border-primary-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

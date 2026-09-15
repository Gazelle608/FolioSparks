// client/src/components/common/Button.tsx
import React, { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant =
  | 'primary'   // solid green (main CTA)
  | 'secondary' // outline
  | 'ghost'     // no background
  | 'spark'     // accent (light green)
  | 'danger'    // destructive
  | 'link';     // text-only

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 ' +
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ' +
    'shadow-sm hover:shadow-md disabled:bg-primary-300',
  secondary:
    'bg-transparent text-primary-700 border-2 border-primary-600 ' +
    'hover:bg-primary-600 hover:text-white active:bg-primary-700 ' +
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ' +
    'disabled:border-primary-300 disabled:text-primary-300 disabled:hover:bg-transparent',
  ghost:
    'bg-transparent text-primary-700 hover:bg-primary-50 active:bg-primary-100 ' +
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ' +
    'disabled:text-primary-300 disabled:hover:bg-transparent',
  spark:
    'bg-accent text-primary-900 font-semibold hover:bg-accent-300 active:bg-primary-300 ' +
    'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ' +
    'shadow-sm hover:shadow-md disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 ' +
    'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ' +
    'disabled:bg-red-300',
  link:
    'bg-transparent text-primary-600 underline-offset-4 hover:underline ' +
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ' +
    'disabled:text-primary-300 p-0 h-auto',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-lg gap-2.5',
  icon: 'h-10 w-10 rounded-lg justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isLink = variant === 'link';
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200',
          'focus:outline-none',
          'disabled:cursor-not-allowed',
          !isLink && 'select-none',
          variantStyles[variant],
          !isLink && sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size={size === 'lg' ? 20 : 16} />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span className={cn(isLoading && 'opacity-70')}>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Inline spinner to avoid circular import
const LoadingSpinner: React.FC<{ size: number }> = ({ size }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      className="opacity-25"
    />
    <path
      d="M4 12a8 8 0 018-8"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      className="opacity-75"
    />
  </svg>
);

export default Button;
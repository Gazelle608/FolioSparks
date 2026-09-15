// client/src/components/common/Input.tsx
import React, {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';

// ============================================
// Shared field styling
// ============================================
const baseFieldStyles =
  'w-full bg-white border border-gray-300 text-primary-900 placeholder:text-gray-400 ' +
  'transition-all duration-200 ' +
  'focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 ' +
  'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ' +
  'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20';

// ============================================
// Label
// ============================================
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required,
  className,
  ...props
}) => (
  <label
    className={cn(
      'block text-sm font-medium text-primary-900 mb-1.5',
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

// ============================================
// Field wrapper (label + input + error + hint)
// ============================================
interface FieldWrapperProps {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  id,
  label,
  error,
  hint,
  required,
  children,
}) => (
  <div className="w-full">
    {label && (
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
    )}
    {children}
    {error && (
      <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
    {!error && hint && (
      <p id={`${id}-hint`} className="mt-1.5 text-sm text-gray-500">
        {hint}
      </p>
    )}
  </div>
);

// ============================================
// Input
// ============================================
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <FieldWrapper
        id={inputId}
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            required={required}
            className={cn(
              baseFieldStyles,
              'h-11 px-4 rounded-lg text-sm',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              fullWidth && 'w-full',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
      </FieldWrapper>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// Textarea
// ============================================
export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  /** Auto-resize as the user types */
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      autoResize = false,
      className,
      id,
      required,
      onChange,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <FieldWrapper
        id={textareaId}
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
          }
          required={required}
          onChange={handleChange}
          className={cn(
            baseFieldStyles,
            'px-4 py-2.5 rounded-lg text-sm resize-y min-h-[100px]',
            autoResize && 'resize-none overflow-hidden',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
      </FieldWrapper>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
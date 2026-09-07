import React, { forwardRef } from 'react';
import { IconProps } from '../../../types/icons';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.FC<IconProps>;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200';
  const stateStyles = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-primary-200 focus:ring-primary-500 focus:border-primary-500';
  const iconPadding = Icon ? (iconPosition === 'left' ? 'pl-11' : 'pr-11') : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-primary-900 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon size={20} color="#8EB69B" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            ${baseStyles}
            ${stateStyles}
            ${iconPadding}
            ${className}
          `}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon size={20} color="#8EB69B" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
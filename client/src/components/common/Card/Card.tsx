import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  variant = 'default',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white shadow-sm',
    outlined: 'bg-white border border-primary-200',
    elevated: 'bg-white shadow-lg',
  };

  const hoverClasses = hoverable ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : '';

  return (
    <div
      className={`
        rounded-xl
        ${paddingClasses[padding]}
        ${variantClasses[variant]}
        ${hoverClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
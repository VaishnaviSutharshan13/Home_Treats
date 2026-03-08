/**
 * Button Component
 * Reusable button with design system variants
 */

import React from 'react';
import { cn } from '../../styles/designSystem';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  loading = false,
  icon,
  disabled,
  ...props
}) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400 shadow-sm hover:shadow-green-500/30 hover:scale-105 transform',
    secondary: 'bg-white/5 text-gray-300 border border-green-500/30 hover:bg-green-500/10 hover:text-white focus:ring-green-400 shadow-sm hover:shadow-md hover:scale-105 transform',
    outline: 'border border-green-500/50 text-green-400 hover:bg-green-500/10 focus:ring-green-400 hover:border-green-400 hover:text-green-300',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5 focus:ring-green-400 hover:shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md hover:scale-105 transform'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
};

export default Button;

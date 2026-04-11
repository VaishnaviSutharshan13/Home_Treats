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
  const baseClasses =
    'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background inline-flex items-center justify-center gap-2';

  const variantClasses = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-primary/25 hover:scale-[1.02]',
    secondary:
      'bg-secondary text-secondary-foreground hover:opacity-90 border border-transparent shadow-sm hover:shadow-secondary/20',
    outline:
      'border border-border bg-card text-foreground hover:bg-surface-hover hover:border-primary/40 focus:ring-primary',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent',
    danger: 'bg-error text-white hover:opacity-90 focus:ring-error shadow-sm',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
};

export default Button;

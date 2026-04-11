import React from 'react';
import { cn } from '../../styles/designSystem';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'md', className }) => {
  const variantClasses = {
    primary: 'border-primary/30 bg-primary/15 text-primary',
    secondary: 'border-secondary/30 bg-secondary/15 text-secondary',
    success: 'border-success/30 bg-success/15 text-success',
    warning: 'border-warning/40 bg-warning/20 text-warning',
    error: 'border-error/30 bg-error/15 text-error',
    neutral: 'border-border bg-muted text-muted-foreground',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;

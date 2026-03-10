/**
 * Badge Component
 * Reusable badge with design system variants
 */

import React from 'react';
import { cn } from '../../styles/designSystem';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className
}) => {
  const variantClasses = {
    primary: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    secondary: 'bg-white/5 text-gray-300 border border-white/10',
    success: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
    neutral: 'bg-white/5 text-gray-400 border border-white/10'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
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

import React from 'react';
import { cn } from '../../styles/designSystem';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <div className="text-sm text-subtle">{leftIcon}</div>
          </div>
        )}

        <input
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-subtle',
            'hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            error ? 'border-error focus:border-error focus:ring-error' : '',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="text-sm text-subtle">{rightIcon}</div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-error">{error}</p>}

      {helperText && !error && <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>}
    </div>
  );
};

export default Input;

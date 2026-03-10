/**
 * Card Component
 * Reusable card with design system styling
 */

import React from 'react';
import { cn } from '../../styles/designSystem';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({ children, className, hoverable = true, padding = 'md' }) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  return (
    <div
      className={cn(
        'rounded-xl shadow-md bg-white/5 backdrop-blur-sm border border-purple-500/10',
        paddingClasses[padding],
        hoverable && 'hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-purple-500/10', className)}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

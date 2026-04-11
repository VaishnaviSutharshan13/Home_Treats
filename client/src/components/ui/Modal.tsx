/**
 * Modal Component
 * Reusable modal with design system styling
 */

import React from 'react';
import { cn } from '../../styles/designSystem';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className={cn(
          'inline-block transform overflow-hidden rounded-xl bg-white border border-gray-200 text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle sm:w-full',
          sizeClasses[size],
          className
        )}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="bg-white px-6 py-4 sm:py-6 text-gray-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

/**
 * Shared `cn()` helper and legacy layout string fragments.
 * Authoritative colors: see `globals.css` (:root / .dark + @theme inline).
 */

export const designSystem = {
  // Colors
  colors: {
    primary: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E', // Primary Color
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
      950: '#052E16',
    },
    secondary: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E', // Secondary = Green (unified)
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
      950: '#052E16',
    },
    dark: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a', // Primary Background
      950: '#0a0f1a',
    },
    neutral: {
      50: '#0f172a', // Background (dark)
      100: '#111827',
      200: '#1e293b',
      300: '#334155',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#030712',
    },
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
      950: '#052E16',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
      950: '#450A0A',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      display: ['Inter Display', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  // Spacing
  spacing: {
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    section: {
      sm: '2rem',
      md: '4rem',
      lg: '6rem',
      xl: '8rem',
    },
    card: '1.5rem', // p-6
    element: '1rem',
    component: '0.5rem',
  },

  // Cards
  card: {
    base: 'rounded-xl shadow-md bg-white/5 backdrop-blur-sm border border-primary/10',
    padding: 'p-6',
    hover: 'hover:shadow-lg hover:border-primary/20 transition-all duration-300',
    border: 'border border-primary/10',
  },

  // Buttons
  button: {
    base: 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a]',
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    },
    primary: {
      base: 'bg-primary text-white hover:bg-primary focus:ring-primary shadow-sm shadow-primary/20',
      hover: 'hover:shadow-md hover:shadow-primary/30 hover:scale-105 transform',
    },
    secondary: {
      base: 'bg-white/5 backdrop-blur-sm text-white border border-primary/20 hover:bg-primary/10 focus:ring-primary',
      hover: 'hover:shadow-md hover:border-primary/30',
    },
    outline: {
      base: 'border border-primary/50 text-primary hover:bg-primary/10 focus:ring-primary',
      hover: 'hover:border-primary hover:text-info',
    },
    ghost: {
      base: 'text-gray-400 hover:text-white hover:bg-white/5 focus:ring-primary',
      hover: 'hover:shadow-sm',
    },
    danger: {
      base: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
      hover: 'hover:shadow-md hover:scale-105 transform',
    },
  },

  // Forms
  form: {
    input: {
      base: 'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 shadow-sm transition-all duration-200',
      focus: 'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
      hover: 'hover:border-white/20',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    },
    label: {
      base: 'block text-sm font-medium text-gray-300 mb-2',
    },
    select: {
      base: 'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 shadow-sm transition-all duration-200',
      focus: 'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
      hover: 'hover:border-white/20',
    },
    textarea: {
      base: 'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 shadow-sm transition-all duration-200',
      focus: 'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
      hover: 'hover:border-white/20',
    },
    checkbox: {
      base: 'h-4 w-4 rounded border-white/10 text-primary focus:ring-primary bg-white/5',
    },
    radio: {
      base: 'h-4 w-4 border-white/10 text-primary focus:ring-primary bg-white/5',
    },
  },

  // Tables
  table: {
    base: 'min-w-full divide-y divide-green-500/10',
    header: {
      base: 'bg-white/5',
      cell: 'px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider',
    },
    body: {
      base: 'bg-transparent divide-y divide-green-500/10',
      row: 'hover:bg-white/5 transition-colors duration-150',
      cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-300',
    },
  },

  // Navigation
  nav: {
    base: 'bg-[#0f172a]/90 backdrop-blur-md shadow-sm border-b border-primary/10',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    link: {
      base: 'text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
      active: 'text-primary bg-primary/10',
    },
  },

  // Layout
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 sm:py-16 lg:py-20',
    cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    statsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6',
  },

  // Animations
  animation: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-in',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },

  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner',
  },

  // Border Radius
  borderRadius: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  },
};

// Helper functions for common patterns
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Button component styles
export const getButtonStyles = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary', size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  return cn(
    designSystem.button.base,
    designSystem.button.size[size],
    designSystem.button[variant].base,
    designSystem.button[variant].hover
  );
};

// Card component styles
export const getCardStyles = (hoverable: boolean = true) => {
  return cn(
    designSystem.card.base,
    hoverable && designSystem.card.hover
  );
};

// Input component styles
export const getInputStyles = (hasError: boolean = false) => {
  return cn(
    designSystem.form.input.base,
    designSystem.form.input.focus,
    designSystem.form.input.hover,
    hasError && designSystem.form.input.error
  );
};

export default designSystem;

'use client';

import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20',
  secondary: 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10',
  danger: 'bg-red-500/80 hover:bg-red-500 text-white',
  ghost: 'bg-transparent hover:bg-white/5 text-slate-300',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-accent/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

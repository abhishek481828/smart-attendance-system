'use client';

interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'accent';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses = {
  default: 'bg-slate-500/20 text-slate-300',
  success: 'bg-green-500/15 text-green-400',
  danger: 'bg-red-500/15 text-red-400',
  warning: 'bg-amber-500/15 text-amber-400',
  accent: 'bg-accent/15 text-accent-light',
};

export default function Badge({ variant = 'default', children, dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-0.5 rounded-full
        text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
}

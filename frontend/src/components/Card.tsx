'use client';

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  header,
  footer,
  className = '',
  glass = true,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl animate-slide-up
        ${glass ? 'glass' : 'bg-slate-800/50 border border-white/5'}
        ${!header && !footer ? paddingClasses[padding] : ''}
        ${className}
      `}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {header && (
        <div className="border-b border-white/10 px-6 py-4">
          {header}
        </div>
      )}
      {header || footer ? (
        <div className={paddingClasses[padding]}>{children}</div>
      ) : (
        children
      )}
      {footer && (
        <div className="border-t border-white/10 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}

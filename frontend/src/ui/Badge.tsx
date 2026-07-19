import * as React from 'react';
import { cn } from '../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-primary-100)',
    color: 'var(--color-primary-800)',
  },
  success: {
    backgroundColor: 'var(--color-emerald-100)',
    color: 'var(--color-emerald-800)',
  },
  warning: {
    backgroundColor: 'var(--color-amber-100)',
    color: 'var(--color-amber-800)',
  },
  danger: {
    backgroundColor: 'var(--color-red-100)',
    color: 'var(--color-red-800)',
  },
  info: {
    backgroundColor: 'var(--color-blue-100)',
    color: 'var(--color-blue-800)',
  },
  neutral: {
    backgroundColor: 'var(--color-border)',
    color: 'var(--color-muted-foreground)',
  },
};

const sizeStyles = {
  sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
  md: { padding: '0.25rem 0.625rem', fontSize: '0.75rem' },
};

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontWeight: 500,
  borderRadius: '9999px',
  whiteSpace: 'nowrap',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        style={{
          ...baseStyle,
          ...variantStyles[variant],
          ...sizeStyles[size],
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
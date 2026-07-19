import * as React from 'react';
import { cn } from '../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeStyles = {
  sm: { height: '6px' },
  md: { height: '10px' },
  lg: { height: '16px' },
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, size = 'md', showLabel = false, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-border)',
            ...sizeStyles[size],
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              borderRadius: '9999px',
              backgroundColor: 'var(--color-primary-600)',
              transition: 'width 500ms ease-out',
            }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
        {showLabel && (
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
            <span>Progreso</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
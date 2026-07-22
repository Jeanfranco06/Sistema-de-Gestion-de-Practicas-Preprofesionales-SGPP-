import * as React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('animate-pulse rounded bg-muted', {
          'h-4 w-full max-w-[200px]': variant === 'text',
          'h-10 w-10 rounded-full': variant === 'circular',
          'h-32 w-full rounded-xl': variant === 'rectangular',
        }, className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };
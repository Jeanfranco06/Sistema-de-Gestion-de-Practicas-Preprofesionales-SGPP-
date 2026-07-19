import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const [error, setError] = React.useState(false);

    if (src && !error) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative inline-flex shrink-0 overflow-hidden rounded-full',
            sizes[size],
            className
          )}
          {...props}
        >
          <img
            src={src}
            alt={alt}
            onError={() => setError(true)}
            className="aspect-square h-full w-full object-cover"
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-muted font-medium',
          sizes[size],
          className
        )}
        {...props}
      >
        {fallback}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
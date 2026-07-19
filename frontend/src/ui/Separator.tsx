import * as React from 'react';
import { cn } from '../lib/utils';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => {
    const semanticProps = decorative ? { role: 'none' } : { role: 'separator', 'aria-orientation': orientation };

    return (
      <div
        ref={ref}
        {...semanticProps}
        style={{ backgroundColor: 'var(--color-border)' }}
        className={cn(
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          'shrink-0',
          className
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = 'Separator';

export { Separator };

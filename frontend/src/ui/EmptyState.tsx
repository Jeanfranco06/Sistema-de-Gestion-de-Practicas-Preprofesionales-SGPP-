import * as React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './Button';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground mb-4">
          {icon ?? <Inbox className="h-6 w-6" />}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
        {action && (
          <Button
            variant={action.variant ?? 'primary'}
            size="md"
            className="mt-4"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState, type EmptyStateProps, type EmptyStateAction };

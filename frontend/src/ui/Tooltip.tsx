import * as React from 'react';
import { cn } from '../lib/utils';

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const Tooltip = ({ children, content, side = 'top', delayDuration = 200, ...props }: TooltipProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  const open = () => {
    if (delayDuration > 0) {
      const id = setTimeout(() => setIsOpen(true), delayDuration);
      setTimeoutId(id);
    } else {
      setIsOpen(true);
    }
  };

  const close = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsOpen(false);
  };

  return (
    <div {...props} onMouseEnter={open} onMouseLeave={close} onFocus={open} onBlur={close}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onMouseEnter: open,
            onMouseLeave: close,
            onFocus: open,
            onBlur: close,
          });
        }
        return child;
      })}
      {isOpen && (
        <div
          role="tooltip"
          className={cn(
            'fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
          style={{
            // Position will be handled by CSS or portal
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg',
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent };
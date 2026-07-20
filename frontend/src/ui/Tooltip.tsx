import * as React from 'react';
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material';
import { cn } from '../lib/utils';

export interface TooltipProps extends Omit<MuiTooltipProps, 'title' | 'children'> {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className, ...props }: TooltipProps) {
  return (
    <MuiTooltip
      title={content}
      placement={side}
      arrow
      enterDelay={200}
      enterNextDelay={200}
      leaveDelay={0}
      {...props}
      classes={{
        tooltip: cn(
          'px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg',
          className
        ),
      }}
    >
      {children}
    </MuiTooltip>
  );
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg',
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

export { Tooltip as default };

import * as React from 'react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogTriggerProps {
  children: React.ReactElement;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onOpenChange, children }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        className="fixed inset-0 z-[2000] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
        <div className="relative w-full max-h-[90vh] overflow-hidden flex justify-center items-center pointer-events-none">
          <div className="pointer-events-auto w-full flex justify-center">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Dialog.displayName = 'Dialog';

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-card rounded-2xl shadow-xl w-full mx-4 animate-in fade-in-0 zoom-in-95',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6 border-b border-border', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn('text-lg font-semibold text-foreground', className)}
        {...props}
      >
        {children}
      </h2>
    );
  }
);
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
DialogDescription.displayName = 'DialogDescription';

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-end gap-2 p-6 border-t border-border', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogFooter.displayName = 'DialogFooter';

const DialogTrigger = ({ children }: DialogTriggerProps) => {
  if (!React.isValidElement(children)) {
    throw new Error('DialogTrigger requires a single child element');
  }
  return children;
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger };
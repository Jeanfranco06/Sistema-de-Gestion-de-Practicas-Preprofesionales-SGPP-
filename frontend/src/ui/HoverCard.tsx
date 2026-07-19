import * as React from 'react';
import { cn } from '../lib/utils';

export interface HoverCardProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  openDelay?: number;
  closeDelay?: number;
  className?: string;
}

const sideOffsets: Record<string, { x: number; y: number }> = {
  top: { x: 0, y: -8 },
  right: { x: 8, y: 0 },
  bottom: { x: 0, y: 8 },
  left: { x: -8, y: 0 },
};

const HoverCard = ({ trigger, children, side = 'bottom', align = 'center', openDelay = 300, closeDelay = 150, className }: HoverCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const openTimer = React.useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>();
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleOpen = () => {
    clearTimers();
    openTimer.current = setTimeout(() => setIsOpen(true), openDelay);
  };

  const handleClose = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setIsOpen(false), closeDelay);
  };

  React.useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const offset = sideOffsets[side];

    let top = 0;
    let left = 0;

    if (side === 'top') {
      top = triggerRect.top - contentRect.height + offset.y;
      left = align === 'start' ? triggerRect.left : align === 'end' ? triggerRect.right - contentRect.width : triggerRect.left + (triggerRect.width - contentRect.width) / 2;
    } else if (side === 'bottom') {
      top = triggerRect.bottom + offset.y;
      left = align === 'start' ? triggerRect.left : align === 'end' ? triggerRect.right - contentRect.width : triggerRect.left + (triggerRect.width - contentRect.width) / 2;
    } else if (side === 'left') {
      top = triggerRect.top + (triggerRect.height - contentRect.height) / 2 + offset.y;
      left = triggerRect.left - contentRect.width + offset.x;
    } else if (side === 'right') {
      top = triggerRect.top + (triggerRect.height - contentRect.height) / 2 + offset.y;
      left = triggerRect.right + offset.x;
    }

    setPosition({ top, left });
  }, [isOpen, side, align]);

  return (
    <div
      className={cn('inline-flex', className)}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
    >
      <div ref={triggerRef}>{trigger}</div>
      {isOpen && (
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="false"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 60,
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-card-hover)',
            color: 'var(--color-foreground)',
            animation: 'fadeIn 150ms ease-out forwards',
          }}
          className="p-4 max-w-sm"
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          {children}
        </div>
      )}
    </div>
  );
};

HoverCard.displayName = 'HoverCard';

export { HoverCard };

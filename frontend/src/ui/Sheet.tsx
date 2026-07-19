import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  description?: string;
  className?: string;
}

const sizeMap = {
  left: { sm: 280, md: 360, lg: 480, xl: 600 },
  right: { sm: 280, md: 360, lg: 480, xl: 600 },
  top: { sm: 200, md: 300, lg: 400, xl: 500 },
  bottom: { sm: 200, md: 300, lg: 400, xl: 500 },
};

const Sheet = ({ open, onOpenChange, children, side = 'right', size = 'md', title, description, className }: SheetProps) => {
  const dimension = sizeMap[side][size] ?? sizeMap[side].md;
  const isHorizontal = side === 'left' || side === 'right';

  return (
    <Drawer
      anchor={side}
      open={open}
      onClose={() => onOpenChange(false)}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' },
        },
        paper: {
          sx: {
            width: isHorizontal ? dimension : '100%',
            height: isHorizontal ? '100%' : dimension,
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-foreground)',
            border: 'none',
            backgroundImage: 'none',
            boxShadow: 'var(--shadow-card-hover)',
          },
        },
      }}
    >
      <div className={cn('flex flex-col h-full', className)}>
        {(title || description) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div>
              {title && (
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-foreground)', margin: 0 }}>
                  {title}
                </h2>
              )}
              {description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginTop: '0.25rem', marginBottom: 0 }}>
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-xl)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-muted-foreground)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-foreground)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-muted-foreground)'; }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </Drawer>
  );
};

export { Sheet };

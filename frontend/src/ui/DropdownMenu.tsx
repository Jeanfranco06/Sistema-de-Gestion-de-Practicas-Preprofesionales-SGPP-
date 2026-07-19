import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { cn } from '../lib/utils';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  variant?: 'default' | 'danger';
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'end' | 'center';
  className?: string;
}

const DropdownMenu = ({ trigger, items, align = 'start', className }: DropdownMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div className={cn('inline-flex', className)}>
      <div onClick={handleClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as React.MouseEvent<HTMLElement>); }} role="button" tabIndex={0} aria-haspopup="true" aria-expanded={open}>
        {trigger}
      </div>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: align }}
        transformOrigin={{ vertical: 'top', horizontal: align }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              mt: 0.5,
              minWidth: 180,
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-card-foreground)',
              boxShadow: 'var(--shadow-card)',
            },
          },
        }}
      >
        {items.map((item, i) => {
          if (item.divider) {
            return <React.Fragment key={i}><hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.25rem 0' }} /></React.Fragment>;
          }
          return (
            <MenuItem
              key={i}
              disabled={item.disabled}
              onClick={() => { handleClose(); item.onClick(); }}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                color: item.variant === 'danger' ? '#ef4444' : 'var(--color-foreground)',
                '&:hover': {
                  backgroundColor: item.variant === 'danger'
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'var(--color-muted)',
                },
                '& .MuiListItemIcon-root': {
                  minWidth: 32,
                  color: item.variant === 'danger' ? '#ef4444' : 'var(--color-muted-foreground)',
                },
              }}
            >
              {item.icon && <span style={{ marginRight: '0.5rem', display: 'inline-flex' }}>{item.icon}</span>}
              {item.label}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

export { DropdownMenu };

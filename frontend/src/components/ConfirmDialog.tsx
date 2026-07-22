import { useEffect, useCallback } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from '@/ui';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  loading?: boolean;
}

const variantConfig = {
  danger: {
    icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    buttonVariant: 'primary' as const,
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    buttonVariant: 'primary' as const,
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'warning',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape' && !loading) {
        onOpenChange(false);
      }
      if (e.key === 'Enter' && !loading) {
        onConfirm();
      }
    },
    [open, loading, onConfirm, onOpenChange],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
              {config.icon}
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="px-6 py-4">
          <DialogDescription>{description}</DialogDescription>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={config.buttonVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

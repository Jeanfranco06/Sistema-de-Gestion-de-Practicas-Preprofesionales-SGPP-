import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Bell,
  FileText,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  X,
  History,
  Trash2,
} from 'lucide-react';
import {
  useNotificaciones,
  useContadorNotificaciones as useUnreadCount,
  useMarcarNotificacionLeida as useMarkAsReadMutation,
  useMarcarTodasLeidas as useMarkAllAsReadMutation,
  useDeleteNotificacion as useDeleteNotificacionMutation,
} from '../../../hooks/useNotificaciones';
import {
  Button,
  Badge,
  Avatar,
  Tooltip,
  Progress,
} from '../../../ui';
import { useNavigate } from 'react-router-dom';

type TipoNotificacion =
  | 'INFO'
  | 'ALERTA'
  | 'RECORDATORIO'
  | 'EXITO'
  | 'ERROR'
  | 'DOCUMENTO'
  | 'EXPEDIENTE'
  | 'REVISION'
  | 'COMITE'
  | string;

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipoNotificacion: TipoNotificacion;
  leida: boolean;
  fechaEnvio: string;
  fechaLectura?: string;
}

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notificacion | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    data: notificaciones = [],
    isLoading: loading,
    refetch: refetchNotificaciones,
  } = useNotificaciones();

  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount,
  } = useUnreadCount();

  const markAsRead = useMarkAsReadMutation();
  const markAllAsRead = useMarkAllAsReadMutation();
  const deleteNotificacion = useDeleteNotificacionMutation();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotificaciones();
      refetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchNotificaciones, refetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleClick = () => {
    setOpen((prev) => !prev);
    refetchNotificaciones();
    refetchUnreadCount();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsReadClick = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotificacion.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const openDetail = (notif: Notificacion) => {
    setSelectedNotif(notif);
    setDetailOpen(true);
    handleClose();
    if (!notif.leida) {
      handleMarkAsRead(notif.id);
    }
  };

  const getIcon = (tipo: TipoNotificacion) => {
    const iconClass = 'h-5 w-5';
    switch (tipo) {
      case 'INFO':
      case 'EXITO':
        return <CheckCircle2 className={`${iconClass} text-emerald-500`} />;
      case 'ALERTA':
      case 'ERROR':
        return <AlertTriangle className={`${iconClass} text-red-500`} />;
      case 'RECORDATORIO':
        return <Calendar className={`${iconClass} text-amber-500`} />;
      default:
        return <FileText className={`${iconClass} text-[var(--color-primary-600)]`} />;
    }
  };

  const getTipoLabel = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'INFO':
        return 'Información';
      case 'ALERTA':
        return 'Alerta';
      case 'RECORDATORIO':
        return 'Recordatorio';
      case 'EXITO':
        return 'Éxito';
      case 'ERROR':
        return 'Error';
      case 'DOCUMENTO':
        return 'Documento';
      case 'EXPEDIENTE':
        return 'Expediente';
      case 'REVISION':
        return 'Revisión';
      case 'COMITE':
        return 'Comité';
      default:
        return 'General';
    }
  };

  const getTipoBadgeVariant = (tipo: TipoNotificacion): React.ComponentProps<typeof Badge>['variant'] => {
    switch (tipo) {
      case 'INFO':
      case 'EXITO':
        return 'success';
      case 'ALERTA':
      case 'ERROR':
        return 'danger';
      case 'RECORDATORIO':
        return 'warning';
      case 'DOCUMENTO':
      case 'EXPEDIENTE':
      case 'REVISION':
      case 'COMITE':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Tooltip content="Notificaciones">
          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center justify-center rounded-xl p-2 text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2"
            aria-label="Ver notificaciones"
            aria-expanded={open}
          >
            <div className="relative">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5">
                  <Badge variant="danger" size="sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                </span>
              )}
            </div>
          </button>
        </Tooltip>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full z-40 mt-2 w-96 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="font-semibold text-[var(--color-foreground)]">Notificaciones</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsReadClick}>
                  Marcar todo leído
                </Button>
              )}
            </div>

            <div className="border-t border-[var(--color-border)]" />

            {loading ? (
              <div className="px-8 py-6">
                <Progress value={50} size="sm" />
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                    No hay notificaciones
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-border)]">
                    {(notificaciones as Notificacion[]).map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-muted)] ${
                          !notif.leida ? 'bg-[var(--color-muted)]/50' : 'bg-transparent'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => openDetail(notif)}
                          className="flex flex-1 items-start gap-3 text-left"
                        >
                          <Avatar
                            size="sm"
                            fallback={getIcon(notif.tipoNotificacion) as string}
                            className="bg-transparent"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm ${
                                  !notif.leida ? 'font-semibold' : 'font-normal'
                                } text-[var(--color-foreground)]`}
                              >
                                {notif.titulo}
                              </p>
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-sm text-[var(--color-muted-foreground)]">
                              {notif.mensaje}
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                              {formatRelativeTime(notif.fechaEnvio)}
                            </p>
                          </div>
                        </button>

                        <Tooltip content="Eliminar">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notif.id);
                            }}
                            className="mt-0.5 inline-flex items-center justify-center rounded-lg p-1 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-border)] hover:text-red-500"
                            aria-label="Eliminar notificación"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-[var(--color-border)]" />

            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  handleClose();
                  navigate('/notificaciones');
                }}
              >
                <History className="h-4 w-4" />
                Ver historial completo
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-2">
            {selectedNotif && getIcon(selectedNotif.tipoNotificacion)}
            <span className="text-lg font-semibold text-[var(--color-foreground)]">
              {selectedNotif?.titulo}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDetailOpen(false)}
            className="inline-flex items-center justify-center rounded-lg p-1 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogTitle>
        <DialogContent dividers>
          {selectedNotif && (
            <div className="flex flex-col gap-4 text-[var(--color-foreground)]">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getTipoBadgeVariant(selectedNotif.tipoNotificacion)} size="sm">
                  {getTipoLabel(selectedNotif.tipoNotificacion)}
                </Badge>
                <Badge variant={selectedNotif.leida ? 'neutral' : 'warning'} size="sm">
                  {selectedNotif.leida ? 'Leída' : 'No leída'}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed">{selectedNotif.mensaje}</p>
              <div className="text-xs text-[var(--color-muted-foreground)]">
                <span>{formatDate(selectedNotif.fechaEnvio)}</span>
                {selectedNotif.fechaLectura && (
                  <span className="ml-4">
                    Leída: {formatDate(selectedNotif.fechaLectura)}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => setDetailOpen(false)}>
            Cerrar
          </Button>
          {selectedNotif && (
            <Button
              variant="danger"
              onClick={() => {
                handleDelete(selectedNotif.id);
                setDetailOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

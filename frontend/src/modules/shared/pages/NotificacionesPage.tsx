import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import {
  useNotificaciones,
  useNotificacionesNoLeidas,
  useMarcarNotificacionLeida,
  useMarcarTodasLeidas,
  useDeleteNotificacion,
} from '../../../hooks/useNotificaciones';
import {
  Button,
  Badge,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
} from '../../../ui';
import { CardSkeleton } from '../../../ui/SkeletonLoader';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { showError } from '../../../lib/toast';

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

const getIcon = (tipo: TipoNotificacion) => {
  switch (tipo) {
    case 'INFO':
      return <Info className="h-5 w-5 text-blue-500" />;
    case 'EXITO':
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case 'ALERTA':
    case 'ERROR':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'RECORDATORIO':
      return <Bell className="h-5 w-5 text-amber-500" />;
    default:
      return <FileText className="h-5 w-5 text-[var(--color-primary-600)]" />;
  }
};

export const NotificacionesPage = () => {
  const [activeTab, setActiveTab] = useState('todas');
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  const {
    data: todas = [],
    isLoading: loadingTodas,
  } = useNotificaciones();

  const {
    data: noLeidas = [],
    isLoading: loadingNoLeidas,
  } = useNotificacionesNoLeidas();

  const leidas = React.useMemo(
    () => (todas as Notificacion[]).filter((n) => n.leida),
    [todas]
  );

  const markAsRead = useMarcarNotificacionLeida();
  const markAllAsRead = useMarcarTodasLeidas();
  const deleteNotificacion = useDeleteNotificacion();

  const unreadCount = (todas as Notificacion[]).filter((n) => !n.leida).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch {
      showError('No se pudo actualizar la notificación');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch {
      showError('No se pudieron marcar las notificaciones como leídas');
    }
  };

  const handleDelete = async () => {
    if (!notificationToDelete) return;
    try {
      await deleteNotificacion.mutateAsync(notificationToDelete);
      setNotificationToDelete(null);
    } catch {
      showError('No se pudo eliminar la notificación');
    }
  };

  const renderList = (items: Notificacion[], loading: boolean) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} lines={2} className="p-4" />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No hay notificaciones"
          description="Cuando recibas notificaciones, aparecerán aquí."
        />
      );
    }

    return (
      <div className="space-y-2">
        {items.map((notif) => (
          <div
            key={notif.id}
            className={`group flex items-start gap-3 rounded-xl border border-[var(--color-border)] p-4 transition-colors hover:bg-[var(--color-muted)] ${
              !notif.leida ? 'bg-[var(--color-muted)]/50' : 'bg-transparent'
            }`}
          >
            <div className="mt-0.5 shrink-0">{getIcon(notif.tipoNotificacion)}</div>

            <button
              type="button"
              className="flex flex-1 items-start gap-3 text-left"
              onClick={() => !notif.leida && handleMarkAsRead(notif.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm ${
                      !notif.leida ? 'font-semibold' : 'font-normal'
                    } text-[var(--color-foreground)]`}
                  >
                    {notif.titulo}
                  </p>
                  {!notif.leida && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
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
                onClick={() => setNotificationToDelete(notif.id)}
                className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-lg p-1 text-transparent transition-colors hover:bg-[var(--color-border)] hover:text-red-500 group-hover:text-[var(--color-muted-foreground)]"
                aria-label="Eliminar notificación"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 text-white md:p-8">
        <Bell className="absolute -right-6 -top-6 h-40 w-40 opacity-10 md:h-56 md:w-56" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Centro de actividad</p>
          <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">Notificaciones</h1>
          <p className="mt-2 text-sm text-white/90">
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
              : 'No tienes notificaciones sin leer'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead} loading={markAllAsRead.isPending}>
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todas">
            Todas ({(todas as Notificacion[]).length})
          </TabsTrigger>
          <TabsTrigger value="no-leidas">
            No leídas ({(noLeidas as Notificacion[]).length})
          </TabsTrigger>
          <TabsTrigger value="leidas">
            Leídas ({leidas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas">
          {renderList(todas as Notificacion[], loadingTodas)}
        </TabsContent>

        <TabsContent value="no-leidas">
          {renderList(noLeidas as Notificacion[], loadingNoLeidas)}
        </TabsContent>

        <TabsContent value="leidas">
          {renderList(leidas, loadingTodas)}
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={notificationToDelete !== null}
        onOpenChange={(open) => !open && setNotificationToDelete(null)}
        title="Eliminar notificación"
        description="Esta acción eliminará la notificación de forma permanente."
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteNotificacion.isPending}
        onConfirm={handleDelete}
      />
      </div>
    </div>
  );
};

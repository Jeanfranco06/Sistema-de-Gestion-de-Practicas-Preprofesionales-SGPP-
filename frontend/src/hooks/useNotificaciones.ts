import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacionesApi } from '../api/notificacionesApi';

export function useNotificaciones() {
  return useQuery({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      const res = await notificacionesApi.getAll();
      return res.data?.data ?? [];
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useNotificacionesNoLeidas() {
  return useQuery({
    queryKey: ['notificaciones', 'no-leidas'],
    queryFn: async () => {
      const res = await notificacionesApi.getNotRead();
      return res.data?.data ?? [];
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useContadorNotificaciones() {
  return useQuery({
    queryKey: ['notificaciones', 'contador'],
    queryFn: async () => {
      const res = await notificacionesApi.getCountNotRead();
      return res.data?.data ?? 0;
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useCreateNotificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => notificacionesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notificaciones'] }); },
  });
}

export function useMarcarNotificacionLeida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificacionesApi.markAsRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notificaciones'] }); },
  });
}

export function useMarcarTodasLeidas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificacionesApi.markAllAsRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notificaciones'] }); },
  });
}

export function useDeleteNotificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificacionesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notificaciones'] }); },
  });
}

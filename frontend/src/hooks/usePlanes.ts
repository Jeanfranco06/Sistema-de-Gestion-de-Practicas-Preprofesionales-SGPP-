import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planesApi } from '../api/planesApi';

export function usePlanActivo(expedienteId: string | undefined) {
  return useQuery({
    queryKey: ['planes', 'activo', expedienteId],
    queryFn: async () => {
      const res = await planesApi.getActivoByExpediente(expedienteId!);
      return res.data?.data ?? null;
    },
    enabled: !!expedienteId,
    staleTime: 3 * 60 * 1000,
  });
}

export function useRegistrarPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => planesApi.registrar(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['planes'] }); },
  });
}

export function useActualizarPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      planesApi.actualizar(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['planes'] });
      qc.invalidateQueries({ queryKey: ['planes', 'activo'] });
      qc.invalidateQueries({ queryKey: ['planes', id] });
    },
  });
}

export function usePresentarPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => planesApi.presentar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['planes'] }); },
  });
}

export function useObservarPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { descripcion: string } }) =>
      planesApi.observar(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['planes'] }); },
  });
}

export function useSubsanarPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      planesApi.subsanar(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['planes'] }); },
  });
}

export function useAprobarPlanGeneral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => planesApi.aprobar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['planes'] }); },
  });
}

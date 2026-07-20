import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { componentesEvaluacionApi } from '../api/componentesEvaluacionApi';

export function useComponentesEvaluacion(idExpediente: string | number | undefined) {
  return useQuery({
    queryKey: ['componentes-evaluacion', idExpediente],
    queryFn: async () => {
      const res = await componentesEvaluacionApi.listarPorExpediente(idExpediente!);
      return res.data?.data ?? [];
    },
    enabled: !!idExpediente,
    staleTime: 3 * 60 * 1000,
  });
}

export function useRegistrarComponenteEvaluacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => componentesEvaluacionApi.registrar(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['componentes-evaluacion', vars.idExpediente] });
      qc.invalidateQueries({ queryKey: ['expedientes', vars.idExpediente] });
    },
  });
}

export function useTotalComponentesEvaluacion(idExpediente: string | number | undefined) {
  return useQuery({
    queryKey: ['componentes-evaluacion', 'total', idExpediente],
    queryFn: async () => {
      const res = await componentesEvaluacionApi.calcularTotal(idExpediente!);
      return res.data?.data ?? 0;
    },
    enabled: !!idExpediente,
    staleTime: 3 * 60 * 1000,
  });
}

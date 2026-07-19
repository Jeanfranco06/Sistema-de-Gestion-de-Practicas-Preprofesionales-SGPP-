import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesApi } from '../api/evaluacionesApi';

export function useCrearEvaluacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => evaluacionesApi.crearEvaluacion(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['evaluaciones'] }); },
  });
}

export function useEvaluacionById(id: string | undefined) {
  return useQuery({
    queryKey: ['evaluaciones', id],
    queryFn: async () => {
      const res = await evaluacionesApi.obtenerEvaluacionPorId(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useEvaluacionesPorExpediente(idExpediente: string | undefined) {
  return useQuery({
    queryKey: ['evaluaciones', 'expediente', idExpediente],
    queryFn: async () => {
      const res = await evaluacionesApi.obtenerEvaluacionesPorPractica(idExpediente!);
      return res.data?.data ?? [];
    },
    enabled: !!idExpediente,
    staleTime: 3 * 60 * 1000,
  });
}

export function useCriteriosEvaluacion(tipoEvaluador: string | undefined) {
  return useQuery({
    queryKey: ['evaluaciones', 'criterios', tipoEvaluador],
    queryFn: async () => {
      const res = await evaluacionesApi.obtenerCriteriosPorTipo(tipoEvaluador!);
      return res.data?.data ?? [];
    },
    enabled: !!tipoEvaluador,
    staleTime: 10 * 60 * 1000,
  });
}

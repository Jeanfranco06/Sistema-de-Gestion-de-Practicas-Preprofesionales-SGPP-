import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesApi } from '../api/evaluacionesApi';

export function useNotasUnidad(idExpediente: string | undefined) {
  return useQuery({
    queryKey: ['notas-unidad', idExpediente],
    queryFn: async () => {
      const res = await evaluacionesApi.obtenerNotasUnidad(idExpediente!);
      return res.data?.data ?? [];
    },
    enabled: !!idExpediente,
    staleTime: 3 * 60 * 1000,
  });
}

export function useRegistrarNotaUnidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idExpediente, payload }: { idExpediente: string; payload: Record<string, unknown> }) =>
      evaluacionesApi.registrarNotaUnidad(idExpediente, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['notas-unidad', vars.idExpediente] });
      qc.invalidateQueries({ queryKey: ['expedientes', vars.idExpediente] });
    },
  });
}

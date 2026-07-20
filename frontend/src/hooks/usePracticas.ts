import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { practicaApi, tipoPracticaApi } from '../api/practicasApi';

export function useMiPractica() {
  return useQuery({
    queryKey: ['practicas', 'mi-practica'],
    queryFn: async () => {
      const res = await practicaApi.getMiPractica();
      return res.data?.data ?? null;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useSeleccionarSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sedeId: string) => practicaApi.seleccionarSede(sedeId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['practicas'] }); },
  });
}

export function useSolicitarPractica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sedeId, tipoPracticaId }: { sedeId: string; tipoPracticaId: string }) =>
      practicaApi.solicitarPractica(sedeId, tipoPracticaId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['practicas'] }); },
  });
}

export function useTiposPractica() {
  return useQuery({
    queryKey: ['tipo-practica'],
    queryFn: async () => {
      const res = await tipoPracticaApi.listar();
      return res.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { horasEstudianteApi } from '../api/horasApi';

export function useIniciarControlHoras() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idExpediente, idUsuario }: { idExpediente: string; idUsuario: string }) =>
      horasEstudianteApi.iniciarControl(idExpediente, idUsuario),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['horas'] }); },
  });
}

export function useRegistrarHoras() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idExpediente, payload }: { idExpediente: string; payload: Record<string, unknown> }) =>
      horasEstudianteApi.registrar(idExpediente, payload),
    onSuccess: (_, { idExpediente }) => {
      qc.invalidateQueries({ queryKey: ['horas', 'control', idExpediente] });
      qc.invalidateQueries({ queryKey: ['horas', 'registros', idExpediente] });
      qc.invalidateQueries({ queryKey: ['horas', 'cumplimiento', idExpediente] });
      qc.invalidateQueries({ queryKey: ['cumplimiento', idExpediente] });
    },
  });
}

export function useValidarHoras() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idRegistro, payload }: { idRegistro: string; payload: Record<string, unknown> }) =>
      horasEstudianteApi.validar(idRegistro, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['horas'] }); },
  });
}

export function useControlHoras(idExpediente: string | undefined) {
  return useQuery({
    queryKey: ['horas', 'control', idExpediente],
    queryFn: async () => {
      const res = await horasEstudianteApi.getControl(idExpediente!);
      return res.data?.data ?? null;
    },
    enabled: !!idExpediente,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRegistrosHoras(idExpediente: string | undefined) {
  return useQuery({
    queryKey: ['horas', 'registros', idExpediente],
    queryFn: async () => {
      const res = await horasEstudianteApi.getRegistros(idExpediente!);
      return res.data?.data ?? [];
    },
    enabled: !!idExpediente,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCumplimientoHoras(idExpediente: string | undefined) {
  return useQuery({
    queryKey: ['horas', 'cumplimiento', idExpediente],
    queryFn: async () => {
      const res = await horasEstudianteApi.getCumplimiento(idExpediente!);
      return res.data?.data ?? {};
    },
    enabled: !!idExpediente,
    staleTime: 2 * 60 * 1000,
  });
}

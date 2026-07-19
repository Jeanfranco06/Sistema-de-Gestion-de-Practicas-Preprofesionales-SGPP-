import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { validacionApi, academicoApi } from '../api/validacionesApi';

export function useValidacionesSede() {
  return useQuery({
    queryKey: ['validaciones-sede'],
    queryFn: async () => {
      const res = await validacionApi.getAll();
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useValidacionSedeById(id: string | undefined) {
  return useQuery({
    queryKey: ['validaciones-sede', id],
    queryFn: async () => {
      const res = await validacionApi.getById(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useValidacionesBySede(sedeId: string | undefined) {
  return useQuery({
    queryKey: ['validaciones-sede', 'sede', sedeId],
    queryFn: async () => {
      const res = await validacionApi.getBySede(sedeId!);
      return res.data?.data ?? [];
    },
    enabled: !!sedeId,
  });
}

export function useHistorialValidaciones(sedeId: string | undefined) {
  return useQuery({
    queryKey: ['validaciones-sede', 'historial', sedeId],
    queryFn: async () => {
      const res = await validacionApi.getHistorial(sedeId!);
      return res.data?.data ?? [];
    },
    enabled: !!sedeId,
  });
}

export function useValidacionVigente(sedeId: string | undefined) {
  return useQuery({
    queryKey: ['validaciones-sede', 'vigente', sedeId],
    queryFn: async () => {
      const res = await validacionApi.getVigente(sedeId!);
      return res.data?.data ?? null;
    },
    enabled: !!sedeId,
  });
}

export function useCreateValidacionSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => validacionApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['validaciones-sede'] }); },
  });
}

export function useUpdateValidacionSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      validacionApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['validaciones-sede'] }); },
  });
}

export function useDeleteValidacionSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => validacionApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['validaciones-sede'] }); },
  });
}

export function useValidarAcademico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => academicoApi.validar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['validacion-academica'] }); },
  });
}

export function useResultadoValidacion(id: string | undefined) {
  return useQuery({
    queryKey: ['validacion-academica', 'resultado', id],
    queryFn: async () => {
      const res = await academicoApi.getResultadoById(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useResultadosByEstudiante(estudianteId: string | undefined, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['validacion-academica', 'resultados', estudianteId, params],
    queryFn: async () => {
      const res = await academicoApi.getResultadosByEstudiante(estudianteId!, params);
      return res.data?.data ?? [];
    },
    enabled: !!estudianteId,
  });
}

export function useUltimoResultado(estudianteId: string | undefined, tipoPractica: string | undefined) {
  return useQuery({
    queryKey: ['validacion-academica', 'ultimo', estudianteId, tipoPractica],
    queryFn: async () => {
      const res = await academicoApi.getUltimoResultado(estudianteId!, tipoPractica!);
      return res.data?.data ?? null;
    },
    enabled: !!estudianteId && !!tipoPractica,
  });
}

export function useReglasValidacion(tipoPractica: string | undefined) {
  return useQuery({
    queryKey: ['validacion-academica', 'reglas', tipoPractica],
    queryFn: async () => {
      const res = await academicoApi.getReglas(tipoPractica!);
      return res.data?.data ?? [];
    },
    enabled: !!tipoPractica,
    staleTime: 10 * 60 * 1000,
  });
}

export function useNormasValidacion() {
  return useQuery({
    queryKey: ['validacion-academica', 'normas'],
    queryFn: async () => {
      const res = await academicoApi.getNormas();
      return res.data?.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

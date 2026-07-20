import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parametrosApi, reglasPlazoApi, requisitosAcademicosApi } from '../api/configuracionApi';

export function useParametrosSistema() {
  return useQuery({
    queryKey: ['parametros-sistema'],
    queryFn: async () => {
      const res = await parametrosApi.getAll();
      return res.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateParametro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => parametrosApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parametros-sistema'] }); },
  });
}

export function useUpdateParametro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      parametrosApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parametros-sistema'] }); },
  });
}

export function useDisableParametro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => parametrosApi.disable(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parametros-sistema'] }); },
  });
}

export function useReglasPlazo() {
  return useQuery({
    queryKey: ['reglas-plazo'],
    queryFn: async () => {
      const res = await reglasPlazoApi.getAll();
      return res.data?.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useReglasPlazoByTipoPractica(codigo: string | undefined) {
  return useQuery({
    queryKey: ['reglas-plazo', codigo],
    queryFn: async () => {
      const res = await reglasPlazoApi.getByTipoPractica(codigo!);
      return res.data?.data ?? [];
    },
    enabled: !!codigo,
  });
}

export function useCreateReglaPlazo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => reglasPlazoApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reglas-plazo'] }); },
  });
}

export function useUpdateReglaPlazo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      reglasPlazoApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reglas-plazo'] }); },
  });
}

export function useDisableReglaPlazo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reglasPlazoApi.disable(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reglas-plazo'] }); },
  });
}

export function useRequisitosAcademicos() {
  return useQuery({
    queryKey: ['requisitos-academicos'],
    queryFn: async () => {
      const res = await requisitosAcademicosApi.getAll();
      return res.data?.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateRequisitoAcademico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => requisitosAcademicosApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requisitos-academicos'] }); },
  });
}

export function useUpdateRequisitoAcademico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      requisitosAcademicosApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requisitos-academicos'] }); },
  });
}

export function useDisableRequisitoAcademico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requisitosAcademicosApi.disable(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requisitos-academicos'] }); },
  });
}

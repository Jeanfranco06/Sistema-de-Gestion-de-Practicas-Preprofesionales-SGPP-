import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empresaApi, sedeApi, convenioApi } from '../api/sedesApi';

export function useEmpresas() {
  return useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      const res = await empresaApi.getAll();
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmpresaById(id: string | undefined) {
  return useQuery({
    queryKey: ['empresas', id],
    queryFn: async () => {
      const res = await empresaApi.getById(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => empresaApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['empresas'] }); },
  });
}

export function useUpdateEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      empresaApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['empresas'] }); },
  });
}

export function useDisableEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => empresaApi.disable(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['empresas'] }); },
  });
}

export function useValidateEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => empresaApi.validate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['empresas'] }); },
  });
}

export function useSedes() {
  return useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const res = await sedeApi.getAllActive();
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSedesByEmpresa(empresaId: string | undefined) {
  return useQuery({
    queryKey: ['sedes', 'empresa', empresaId],
    queryFn: async () => {
      const res = await sedeApi.getByEmpresa(empresaId!);
      return res.data?.data ?? [];
    },
    enabled: !!empresaId,
  });
}

export function useSedeById(id: string | undefined) {
  return useQuery({
    queryKey: ['sedes', id],
    queryFn: async () => {
      const res = await sedeApi.getById(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCatalogoSedes() {
  return useQuery({
    queryKey: ['sedes', 'catalogo'],
    queryFn: async () => {
      const res = await sedeApi.getCatalogo();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSedeDetalle(id: string | undefined) {
  return useQuery({
    queryKey: ['sedes', 'detalle', id],
    queryFn: async () => {
      const res = await sedeApi.getDetalle(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => sedeApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sedes'] }); },
  });
}

export function useUpdateSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      sedeApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sedes'] }); },
  });
}

export function useDisableSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sedeApi.disable(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sedes'] }); },
  });
}

export function useConvenios() {
  return useQuery({
    queryKey: ['convenios'],
    queryFn: async () => {
      const res = await convenioApi.getAllActive();
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useConveniosByEmpresa(empresaId: string | undefined) {
  return useQuery({
    queryKey: ['convenios', 'empresa', empresaId],
    queryFn: async () => {
      const res = await convenioApi.getByEmpresa(empresaId!);
      return res.data?.data ?? [];
    },
    enabled: !!empresaId,
  });
}

export function useConvenioById(id: string | undefined) {
  return useQuery({
    queryKey: ['convenios', id],
    queryFn: async () => {
      const res = await convenioApi.getById(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useConveniosPorVencer(dias = 30) {
  return useQuery({
    queryKey: ['convenios', 'por-vencer', dias],
    queryFn: async () => {
      const res = await convenioApi.getExpiring(dias);
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateConvenio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => convenioApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['convenios'] }); },
  });
}

export function useUpdateConvenio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      convenioApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['convenios'] }); },
  });
}

export function useDisableConvenio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => convenioApi.disable(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['convenios'] }); },
  });
}

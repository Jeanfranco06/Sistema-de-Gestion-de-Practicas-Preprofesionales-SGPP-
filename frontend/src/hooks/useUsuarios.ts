import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi, tutoresApi, secretariaApi } from '../api/usuariosApi';

export function useUsuarios(config?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['usuarios', config],
    queryFn: async () => {
      const res = await usuariosApi.getAll(config);
      return res.data?.data ?? [];
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useUsuarioById(id: string | undefined) {
  return useQuery({
    queryKey: ['usuarios', id],
    queryFn: async () => {
      const res = await usuariosApi.getById(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useUsuarioDetalle(id: string | undefined) {
  return useQuery({
    queryKey: ['usuarios', 'detalle', id],
    queryFn: async () => {
      const res = await usuariosApi.getDetalle(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => usuariosApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); },
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      usuariosApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); },
  });
}

export function useDisableUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuariosApi.disable(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); },
  });
}

export function useUnlockUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuariosApi.unlock(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); },
  });
}

export function useCambiarEstadoUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      usuariosApi.cambiarEstado(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); },
  });
}

export function useAssignRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      usuariosApi.assignRoles(id, roles),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); },
  });
}

export function usePerfilAcademico() {
  return useQuery({
    queryKey: ['perfil-academico'],
    queryFn: async () => {
      const res = await usuariosApi.obtenerPerfilAcademico();
      return res.data?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useActualizarPerfilAcademico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => usuariosApi.actualizarPerfilAcademico(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['perfil-academico'] }); },
  });
}

export function useFotoPerfil(userId?: number) {
  return useQuery({
    queryKey: ['perfil', 'foto', userId],
    queryFn: async () => {
      const res = await usuariosApi.obtenerFotoPerfil();
      return res.data as Blob;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(userId),
  });
}

export function useActualizarFotoPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (foto: File) => usuariosApi.actualizarFotoPerfil(foto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['perfil', 'foto'] }); },
  });
}

export function useTutores() {
  return useQuery({
    queryKey: ['tutores'],
    queryFn: async () => {
      const res = await tutoresApi.getAll();
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => tutoresApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tutores'] }); },
  });
}

export function useUpdateTutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      tutoresApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tutores'] }); },
  });
}

export function useSecretariaEstudiantes() {
  return useQuery({
    queryKey: ['secretaria', 'estudiantes'],
    queryFn: async () => {
      const res = await secretariaApi.getAllEstudiantes();
      return res.data?.data ?? [];
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useValidarRequisitosEstudiante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => secretariaApi.validarRequisitos(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['secretaria'] }); },
  });
}

export function useRegistrarIncidencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ expedienteId, incidencia }: { expedienteId: string; incidencia: string }) =>
      secretariaApi.registrarIncidencia(expedienteId, incidencia),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useUpdateDatosAcademicos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      secretariaApi.updateDatosAcademicos(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['secretaria', 'estudiantes'] }); },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expedientesApi } from '../api/expedientesApi';

export function useExpedientes() {
  return useQuery({
    queryKey: ['expedientes'],
    queryFn: async () => {
      const res = await expedientesApi.getAll();
      return res.data?.data ?? [];
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useExpedienteById(id: string | undefined) {
  return useQuery({
    queryKey: ['expedientes', id],
    queryFn: async () => {
      const res = await expedientesApi.getById(id!);
      return res.data?.data ?? null;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
}

export function useMisExpedientes() {
  return useQuery({
    queryKey: ['expedientes', 'mis-expedientes'],
    queryFn: async () => {
      const res = await expedientesApi.getMisExpedientes();
      return res.data?.data ?? [];
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useExpedientesByEstudiante(estudianteId: string | undefined) {
  return useQuery({
    queryKey: ['expedientes', 'estudiante', estudianteId],
    queryFn: async () => {
      const res = await expedientesApi.getByEstudiante(estudianteId!);
      return res.data?.data ?? [];
    },
    enabled: !!estudianteId,
  });
}

export function useExpedientesByTutor(usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['expedientes', 'tutor', usuarioId],
    queryFn: async () => {
      const res = await expedientesApi.getByTutor(usuarioId!);
      return res.data?.data ?? [];
    },
    enabled: !!usuarioId,
  });
}

export function useExpedientesByAsesor(asesorId: string | undefined) {
  return useQuery({
    queryKey: ['expedientes', 'asesor', asesorId],
    queryFn: async () => {
      const res = await expedientesApi.getByAsesor(asesorId!);
      return res.data?.data ?? [];
    },
    enabled: !!asesorId,
  });
}

export function useComiteIntegrantesActivos() {
  return useQuery({
    queryKey: ['comite', 'integrantes-activos'],
    queryFn: async () => {
      const res = await expedientesApi.getComiteIntegrantesActivos();
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useValidarExpediente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expedientesApi.validarExpediente(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useEmitirCartaPresentacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expedientesApi.emitirCartaPresentacion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function usePresentarCartaAceptacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expedientesApi.presentarCartaAceptacion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useAsignarAsesor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      expedientesApi.asignarAsesor(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useAsignarComite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      expedientesApi.asignarComite(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useAprobarPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expedientesApi.aprobarPlan(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useIniciarEjecucion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fechaInicio, duracionSemanas }: { id: string; fechaInicio: string; duracionSemanas: number }) =>
      expedientesApi.iniciarEjecucion(id, fechaInicio, duracionSemanas),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useAprobarInformeFinal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expedientesApi.aprobarInformeFinal(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useEmitirDictamen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dictamen }: { id: string; dictamen: string }) =>
      expedientesApi.emitirDictamen(id, dictamen),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useCerrarExpediente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observacion }: { id: string; observacion?: string }) =>
      expedientesApi.cerrarExpediente(id, observacion),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function usePresentarInformeParcial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expedientesApi.presentarInformeParcial(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function usePresentarInformeFinal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expedientesApi.presentarInformeFinal(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useHabilitarExamenAplazados() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expedientesApi.habilitarExamenAplazados(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useRegistrarExamenAplazados() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      expedientesApi.registrarExamenAplazados(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useEliminarDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, idDocumento }: { id: string; idDocumento: string }) =>
      expedientesApi.eliminarDocumento(id, idDocumento),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useEvaluarDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, idDocumento, estado, observaciones }: { id: string; idDocumento: string; estado: string; observaciones?: string }) =>
      expedientesApi.evaluarDocumento(id, idDocumento, estado, observaciones),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useAgregarObservacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, descripcion }: { id: string; descripcion: string }) =>
      expedientesApi.agregarObservacion(id, descripcion),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return expedientesApi.uploadFile(formData);
    },
  });
}

export function useCambiarEstadoManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { nuevoEstado: string; observacion?: string } }) =>
      expedientesApi.cambiarEstadoManual(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expedientes'] }); },
  });
}

export function useHistorialEstados(id: string | undefined) {
  return useQuery({
    queryKey: ['expedientes', id, 'historial-estados'],
    queryFn: async () => {
      const res = await expedientesApi.getHistorialEstados(id!);
      return res.data?.data ?? [];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

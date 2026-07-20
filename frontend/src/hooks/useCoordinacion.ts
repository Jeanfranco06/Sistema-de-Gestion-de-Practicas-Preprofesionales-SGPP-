import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, reportesCoordinacionApi, trazabilidadApi, coordinacionApi } from '../api/coordinacionApi';

function cleanFilters(filtros?: Record<string, unknown>): Record<string, string> {
  const cleaned: Record<string, string> = {};
  if (!filtros) return cleaned;
  for (const [k, v] of Object.entries(filtros)) {
    if (v != null && v !== '' && v !== undefined) cleaned[k] = String(v);
  }
  return cleaned;
}

export function useResumenEjecutivo(filtros?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['coordinacion', 'resumen-ejecutivo', filtros],
    queryFn: async () => {
      const res = await dashboardApi.getResumenEjecutivo(cleanFilters(filtros));
      return res.data?.data ?? {};
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useDashboardKpis(filtros?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['coordinacion', 'kpis', filtros],
    queryFn: async () => {
      const res = await dashboardApi.getDashboardKpis(cleanFilters(filtros));
      return res.data?.data ?? {};
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useExpedientesActivos(filtros?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['coordinacion', 'expedientes-activos', filtros],
    queryFn: async () => {
      const res = await reportesCoordinacionApi.getExpedientesActivos(cleanFilters(filtros));
      return res.data?.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useExpedientesCerrados(filtros?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['coordinacion', 'expedientes-cerrados', filtros],
    queryFn: async () => {
      const res = await reportesCoordinacionApi.getExpedientesCerrados(cleanFilters(filtros));
      return res.data?.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useConveniosVigentes(filtros?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['coordinacion', 'convenios-vigentes', filtros],
    queryFn: async () => {
      const res = await reportesCoordinacionApi.getConveniosVigentes(cleanFilters(filtros));
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubsanacionesPendientes(filtros?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['coordinacion', 'subsanaciones-pendientes', filtros],
    queryFn: async () => {
      const res = await reportesCoordinacionApi.getSubsanacionesPendientes(cleanFilters(filtros));
      return res.data?.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useReportePorTipo(tipoReporte: string | undefined, filtros?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['coordinacion', 'reporte', tipoReporte, filtros],
    queryFn: async () => {
      const res = await reportesCoordinacionApi.getReportePorTipo(tipoReporte!, cleanFilters(filtros));
      return res.data?.data ?? [];
    },
    enabled: !!tipoReporte,
    staleTime: 2 * 60 * 1000,
  });
}

export function useExportarReporte() {
  return useMutation({
    mutationFn: ({ tipoReporte, formato, filtros }: { tipoReporte: string; formato: string; filtros?: Record<string, unknown> }) =>
      reportesCoordinacionApi.descargarReporte(tipoReporte, formato, cleanFilters(filtros)),
  });
}

export function useHistorialGeneracion(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['coordinacion', 'historial-generacion', params],
    queryFn: async () => {
      const res = await reportesCoordinacionApi.getHistorialGeneracion(params);
      return res.data?.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrazabilidadExpediente(idExpediente: string | undefined) {
  return useQuery({
    queryKey: ['coordinacion', 'trazabilidad', idExpediente],
    queryFn: async () => {
      const res = await trazabilidadApi.getExpediente(idExpediente!);
      return res.data?.data ?? null;
    },
    enabled: !!idExpediente,
    staleTime: 2 * 60 * 1000,
  });
}

export function useEmitirCartaCoordinacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coordinacionApi.emitirCartaPresentacion(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['expedientes'] });
      qc.invalidateQueries({ queryKey: ['expedientes', id] });
    },
  });
}

export function useEmitirConstancia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coordinacionApi.emitirConstancia(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['expedientes'] });
      qc.invalidateQueries({ queryKey: ['expedientes', id] });
    },
  });
}

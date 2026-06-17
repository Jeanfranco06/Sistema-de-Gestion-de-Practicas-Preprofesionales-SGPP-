import api from './axios';

const limpiarFiltros = (filtros = {}) =>
  Object.fromEntries(
    Object.entries(filtros).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

const obtenerNombreArchivo = (headers, fallback) => {
  const disposition = headers?.['content-disposition'] || headers?.['Content-Disposition'];
  const match = disposition?.match(/filename="?(?<filename>[^"]+)"?/i);
  return match?.groups?.filename || fallback;
};

export const dashboardApi = {
  getResumenEjecutivo: (filtros = {}) =>
    api.get('/admin/reportes/resumen-ejecutivo', { params: limpiarFiltros(filtros) }),

  getDashboardKpis: (filtros = {}) =>
    api.get('/admin/dashboard/kpis', { params: limpiarFiltros(filtros) }),
};

export const reportesCoordinacionApi = {
  getExpedientesActivos: (filtros = {}) =>
    api.get('/admin/reportes/expedientes-activos', { params: limpiarFiltros(filtros) }),

  getExpedientesCerrados: (filtros = {}) =>
    api.get('/admin/reportes/expedientes-cerrados', { params: limpiarFiltros(filtros) }),

  getConveniosVigentes: (filtros = {}) =>
    api.get('/admin/reportes/convenios-vigentes', { params: limpiarFiltros(filtros) }),

  getSubsanacionesPendientes: (filtros = {}) =>
    api.get('/admin/reportes/subsanaciones-pendientes', { params: limpiarFiltros(filtros) }),

  getReportePorTipo: (tipoReporte, filtros = {}) =>
    api.get(`/admin/reportes/${tipoReporte}`, { params: limpiarFiltros(filtros) }),

  exportarReporte: (tipoReporte, formato, filtros = {}) =>
    api.get(`/admin/exportacion/reportes/${tipoReporte}`, {
      params: { ...limpiarFiltros(filtros), formato },
      responseType: 'blob',
    }),

  async descargarReporte(tipoReporte, formato, filtros = {}) {
    const response = await this.exportarReporte(tipoReporte, formato, filtros);
    const extension = formato?.toLowerCase() === 'csv' ? 'csv' : 'pdf';
    const nombreArchivo = obtenerNombreArchivo(
      response.headers,
      `${tipoReporte.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.${extension}`
    );
    const blob = new Blob([response.data], {
      type: response.headers?.['content-type'] || 'application/octet-stream',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return {
      nombreArchivo,
      trazabilidad: response.headers?.['x-sgpp-trazabilidad'],
      registroId: response.headers?.['x-sgpp-registro-id'],
    };
  },

  getHistorialGeneracion: (params = {}) =>
    api.get('/admin/exportacion/historial', { params: limpiarFiltros(params) }),
};

export const trazabilidadApi = {
  getExpediente: (idExpediente) => api.get(`/admin/auditoria/expediente/${idExpediente}/trazabilidad`),
};

export const horasApi = {
  getControl: (idExpediente) => api.get(`/horas/control/${idExpediente}`),
  getCumplimiento: (idExpediente) => api.get(`/horas/cumplimiento/${idExpediente}`),
  getRegistros: (idExpediente) => api.get(`/horas/registros/${idExpediente}`),
};


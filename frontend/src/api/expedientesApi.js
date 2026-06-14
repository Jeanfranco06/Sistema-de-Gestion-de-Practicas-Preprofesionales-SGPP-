import api from './axios';

export const expedientesApi = {
    getAll: () => api.get('/expedientes'),
    getById: (id) => api.get(`/expedientes/${id}`),
    getByEstudiante: (estudianteId) => api.get(`/expedientes/estudiante/${estudianteId}`),
    aprobarPlan: (id) => api.put(`/expedientes/${id}/aprobar-plan`),
    aprobarInformeFinal: (id) => api.put(`/expedientes/${id}/aprobar-informe-final`),
    emitirDictamen: (id, dictamen) => api.post(`/expedientes/${id}/emitir-dictamen?dictamen=${encodeURIComponent(dictamen)}`),
    cerrarExpediente: (id, observacion) => api.put(`/expedientes/${id}/cerrar${observacion ? '?observacion='+encodeURIComponent(observacion) : ''}`)
};

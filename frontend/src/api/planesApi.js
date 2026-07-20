import api from './axios';

export const planesApi = {
  getActivoByExpediente: (expedienteId) => api.get(`/planes/expediente/${expedienteId}/activo`),
  getById: (id) => api.get(`/planes/${id}`),
  registrar: (payload) => api.post('/planes', payload),
  actualizar: (id, payload) => api.put(`/planes/${id}`, payload),
  presentar: (id) => api.put(`/planes/${id}/presentar`),
  observar: (id, payload) => api.put(`/planes/${id}/observar`, payload),
  subsanar: (id, payload) => api.put(`/planes/${id}/subsanar`, payload),
  aprobar: (id) => api.put(`/planes/${id}/aprobar`),
  rechazar: (id, observacion) => api.put(`/planes/${id}/rechazar`, null, { params: { observacion } }),
};

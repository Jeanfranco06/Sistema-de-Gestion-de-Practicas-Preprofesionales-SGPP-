import api from './axios';

export const planesApi = {
  getActivoByExpediente: (expedienteId) => api.get(`/planes/expediente/${expedienteId}/activo`),
  registrar: (payload) => api.post('/planes', payload),
  presentar: (id) => api.put(`/planes/${id}/presentar`),
};

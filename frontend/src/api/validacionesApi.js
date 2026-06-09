import api from './axios';

export const validacionApi = {
    getAll: () => api.get('/validaciones-sedes'),
    getById: (id) => api.get(`/validaciones-sedes/${id}`),
    getBySede: (sedeId) => api.get(`/validaciones-sedes/sede/${sedeId}`),
    getHistorial: (sedeId) => api.get(`/validaciones-sedes/sede/${sedeId}/historial`),
    getVigente: (sedeId) => api.get(`/validaciones-sedes/sede/${sedeId}/vigente`),
    create: (data) => api.post('/validaciones-sedes', data),
    update: (id, data) => api.put(`/validaciones-sedes/${id}`, data),
    delete: (id) => api.delete(`/validaciones-sedes/${id}`)
};

import api from './axios';

// Puedes interceptar requests para añadir el token JWT aquí

export const empresaApi = {
    getAll: () => api.get('/api/empresas'),
    getById: (id) => api.get(`/api/empresas/${id}`),
    create: (data) => api.post('/api/empresas', data),
    update: (id, data) => api.put(`/api/empresas/${id}`, data),
    disable: (id) => api.delete(`/api/empresas/${id}/disable`),
    validate: (id) => api.put(`/api/empresas/${id}/validate`)
};

export const sedeApi = {
    getAllActive: () => api.get('/api/sedes'),
    getByEmpresa: (empresaId) => api.get(`/api/sedes/empresa/${empresaId}`),
    getById: (id) => api.get(`/api/sedes/${id}`),
    create: (data) => api.post('/api/sedes', data),
    update: (id, data) => api.put(`/api/sedes/${id}`, data),
    disable: (id) => api.delete(`/api/sedes/${id}/disable`)
};

export const convenioApi = {
    getAllActive: () => api.get('/api/convenios'),
    getByEmpresa: (empresaId) => api.get(`/api/convenios/empresa/${empresaId}`),
    getById: (id) => api.get(`/api/convenios/${id}`),
    create: (data) => api.post('/api/convenios', data),
    update: (id, data) => api.put(`/api/convenios/${id}`, data),
    disable: (id) => api.delete(`/api/convenios/${id}/disable`),
    getExpiring: (dias = 30) => api.get(`/api/convenios/alertas/vencer?dias=${dias}`)
};

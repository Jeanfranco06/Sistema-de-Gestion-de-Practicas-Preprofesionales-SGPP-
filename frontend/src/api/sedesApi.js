import api from './axios';

// Puedes interceptar requests para añadir el token JWT aquí

export const empresaApi = {
    getAll: () => api.get('/empresas'),
    getById: (id) => api.get(`/empresas/${id}`),
    create: (data) => api.post('/empresas', data),
    update: (id, data) => api.put(`/empresas/${id}`, data),
    disable: (id) => api.delete(`/empresas/${id}/disable`),
    validate: (id) => api.put(`/empresas/${id}/validate`)
};

export const sedeApi = {
    getAllActive: () => api.get('/sedes'),
    getByEmpresa: (empresaId) => api.get(`/sedes/empresa/${empresaId}`),
    getById: (id) => api.get(`/sedes/${id}`),
    getCatalogo: () => api.get('/sedes/catalogo'),
    getDetalle: (id) => api.get(`/sedes/${id}/detalle`),
    create: (data) => api.post('/sedes', data),
    update: (id, data) => api.put(`/sedes/${id}`, data),
    disable: (id) => api.delete(`/sedes/${id}/disable`)
};

export const convenioApi = {
    getAllActive: () => api.get('/convenios'),
    getByEmpresa: (empresaId) => api.get(`/convenios/empresa/${empresaId}`),
    getById: (id) => api.get(`/convenios/${id}`),
    create: (data) => api.post('/convenios', data),
    update: (id, data) => api.put(`/convenios/${id}`, data),
    disable: (id) => api.delete(`/convenios/${id}/disable`),
    getExpiring: (dias = 30) => api.get(`/convenios/alertas/vencer?dias=${dias}`)
};

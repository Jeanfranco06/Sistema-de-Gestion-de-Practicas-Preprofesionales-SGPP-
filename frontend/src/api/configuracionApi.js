import api from './axios';

export const parametrosApi = {
    getAll: () => api.get('/parametros-sistema'),
    getById: (id) => api.get(`/parametros-sistema/${id}`),
    getByClave: (clave) => api.get(`/parametros-sistema/clave/${clave}`),
    create: (data) => api.post('/parametros-sistema', data),
    update: (id, data) => api.put(`/parametros-sistema/${id}`, data),
    disable: (id) => api.delete(`/parametros-sistema/${id}`)
};

export const reglasPlazoApi = {
    getAll: () => api.get('/plazos/reglas'),
    getById: (id) => api.get(`/plazos/reglas/${id}`),
    getByTipoPractica: (codigo) => api.get(`/plazos/reglas/tipo-practica/${codigo}`),
    create: (data) => api.post('/plazos/reglas', data),
    update: (id, data) => api.put(`/plazos/reglas/${id}`, data),
    disable: (id) => api.delete(`/plazos/reglas/${id}`)
};

export const requisitosAcademicosApi = {
    getAll: () => api.get('/requisitos-academicos'),
    getById: (id) => api.get(`/requisitos-academicos/${id}`),
    getByTipoPractica: (codigo) => api.get(`/requisitos-academicos/tipo-practica/${codigo}`),
    create: (data) => api.post('/requisitos-academicos', data),
    update: (id, data) => api.put(`/requisitos-academicos/${id}`, data),
    disable: (id) => api.delete(`/requisitos-academicos/${id}`)
};

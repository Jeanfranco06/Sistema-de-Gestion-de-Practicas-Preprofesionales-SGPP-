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

export const academicoApi = {
    validar: (data) => api.post('/validacion-academica/validar', data),
    getResultadoById: (id) => api.get(`/validacion-academica/resultados/${id}`),
    getResultadosByEstudiante: (estudianteId, params) => api.get(`/validacion-academica/estudiantes/${estudianteId}/resultados`, { params }),
    getUltimoResultado: (estudianteId, tipoPractica) => api.get(`/validacion-academica/estudiantes/${estudianteId}/ultimo`, { params: { tipoPractica } }),
    getReglas: (tipoPractica) => api.get('/validacion-academica/reglas', { params: { tipoPractica } }),
    getNormas: () => api.get('/validacion-academica/normas')
};

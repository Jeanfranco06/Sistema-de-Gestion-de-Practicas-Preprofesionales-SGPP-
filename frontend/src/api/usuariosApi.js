import api from './axios';

export const usuariosApi = {
    getAll: (config) => api.get('/usuarios', config),
    getById: (id) => api.get(`/usuarios/${id}`),
    getDetalle: (id) => api.get(`/usuarios/${id}/detalle`),
    create: (data) => api.post('/usuarios', data),
    update: (id, data) => api.put(`/usuarios/${id}`, data),
    disable: (id) => api.delete(`/usuarios/${id}`),
    unlock: (id) => api.post(`/usuarios/${id}/unlock`),
    cambiarEstado: (id, data) => api.patch(`/usuarios/${id}/estado`, data),
    assignRoles: (id, roles) => api.post(`/usuarios/${id}/roles`, roles)
};

export const tutoresApi = {
    getAll: () => api.get('/tutores-externos'),
    getById: (id) => api.get(`/tutores-externos/${id}`),
    create: (data) => api.post('/tutores-externos', data),
    update: (id, data) => api.put(`/tutores-externos/${id}`, data),
    disable: (id) => api.delete(`/tutores-externos/${id}`)
};

export const secretariaApi = {
    getAllEstudiantes: () => api.get('/secretaria/estudiantes'),
    validarRequisitos: (id) => api.get(`/secretaria/estudiantes/${id}/validar`),
    updateDatosAcademicos: (id, data) => api.put(`/secretaria/estudiantes/${id}/datos-academicos`, data)
};

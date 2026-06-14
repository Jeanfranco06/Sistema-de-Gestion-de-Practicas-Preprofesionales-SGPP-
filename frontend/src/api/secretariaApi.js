import api from './axios';

export const secretariaApi = {
    emitirCartaPresentacion: (expedienteId) => api.post(`/secretaria/expediente/${expedienteId}/emitir-carta-presentacion`),
    emitirConstancia: (expedienteId) => api.post(`/secretaria/expediente/${expedienteId}/emitir-constancia`),
    registrarIncidencia: (expedienteId, incidencia) => api.post(`/secretaria/expediente/${expedienteId}/registrar-incidencia?incidencia=${encodeURIComponent(incidencia)}`)
};

import api from './axios';

export const secretariaApi = {
    registrarIncidencia: (expedienteId, incidencia) => api.post(`/secretaria/expediente/${expedienteId}/registrar-incidencia?incidencia=${encodeURIComponent(incidencia)}`)
};

import api from './axios';

export const practicaApi = {
    seleccionarSede: (sedeId) => api.post(`/sedes/${sedeId}/seleccionar`)
};

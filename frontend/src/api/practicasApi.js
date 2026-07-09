import api from './axios';

export const practicaApi = {
    seleccionarSede: (sedeId) => api.post(`/sedes/${sedeId}/seleccionar`),
    solicitarPractica: (sedeId, tipoPracticaId) => api.post('/practicas/solicitar', { sedeId, tipoPracticaId }),
    getMiPractica: () => api.get('/practicas/mi-practica'),
};

export const tipoPracticaApi = {
    listar: () => api.get('/tipo-practica'),
};

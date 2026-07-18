import api from './axios';

export const evaluacionesApi = {
    crearEvaluacion: (data) => api.post('/evaluaciones', data),
    obtenerEvaluacionPorId: (id) => api.get(`/evaluaciones/${id}`),
    obtenerEvaluacionesPorPractica: (idExpediente) => api.get(`/evaluaciones/expediente/${idExpediente}`),
    obtenerCriteriosPorTipo: (tipoEvaluador) => api.get(`/evaluaciones/criterios/${tipoEvaluador}`)
};


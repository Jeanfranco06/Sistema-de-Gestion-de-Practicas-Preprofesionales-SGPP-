import api from './axios';

export const evaluacionesApi = {
    crearEvaluacion: (data) => api.post('/evaluaciones', data),
    obtenerEvaluacionPorId: (id) => api.get(`/evaluaciones/${id}`),
    obtenerEvaluacionesPorPractica: (idPractica) => api.get(`/evaluaciones/practica/${idPractica}`),
    obtenerCriteriosPorTipo: (tipoEvaluador) => api.get(`/evaluaciones/criterios/${tipoEvaluador}`)
};


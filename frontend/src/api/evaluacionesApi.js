import api from './axios';

export const evaluacionesApi = {
    crearEvaluacion: (data) => api.post('/evaluaciones', data),
    actualizarEvaluacion: (id, data) => api.put(`/evaluaciones/${id}`, data),
    obtenerEvaluacionPorId: (id) => api.get(`/evaluaciones/${id}`),
    obtenerEvaluacionesPorPractica: (idExpediente) => api.get(`/evaluaciones/expediente/${idExpediente}`),
    obtenerCriteriosPorTipo: (tipoEvaluador) => api.get(`/evaluaciones/criterios/${tipoEvaluador}`),
    registrarNotaUnidad: (idExpediente, data) => api.post(`/evaluaciones/notas-unidad/expediente/${idExpediente}`, data),
    obtenerNotasUnidad: (idExpediente) => api.get(`/evaluaciones/notas-unidad/expediente/${idExpediente}`),
    obtenerNotaUnidad: (idExpediente, numeroUnidad) => api.get(`/evaluaciones/notas-unidad/expediente/${idExpediente}/unidad/${numeroUnidad}`),
};


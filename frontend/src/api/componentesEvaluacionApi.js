import api from './axios';

export const componentesEvaluacionApi = {
    listarPorExpediente: (idExpediente) =>
        api.get(`/evaluaciones/componentes/expediente/${idExpediente}`),
    registrar: (payload) =>
        api.post('/evaluaciones/componentes', payload),
    calcularTotal: (idExpediente) =>
        api.get(`/evaluaciones/componentes/expediente/${idExpediente}/total`),
    estanCompletados: (idExpediente) =>
        api.get(`/evaluaciones/componentes/expediente/${idExpediente}/completado`),
};

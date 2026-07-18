import api from './axios';

export const horasEstudianteApi = {
    iniciarControl: (idExpediente, idUsuario) =>
        api.post(`/horas/iniciar/${idExpediente}?idUsuario=${idUsuario}`),
    registrar: (idExpediente, payload) =>
        api.post(`/horas/registrar/${idExpediente}`, payload),
    validar: (idRegistro, payload) =>
        api.put(`/horas/validar/${idRegistro}`, payload),
    getControl: (idExpediente) => api.get(`/horas/control/${idExpediente}`),
    getRegistros: (idExpediente) => api.get(`/horas/registros/${idExpediente}`),
    getCumplimiento: (idExpediente) => api.get(`/horas/cumplimiento/${idExpediente}`),
};

import api from './axios';

export const notificacionesApi = {
    getAll: () => api.get('/notificaciones'),
    getNotRead: () => api.get('/notificaciones/no-leidas'),
    getCountNotRead: () => api.get('/notificaciones/contador-no-leidas'),
    create: (data) => api.post('/notificaciones', data),
    markAsRead: (id) => api.patch(`/notificaciones/${id}/leer`),
    markAllAsRead: () => api.patch('/notificaciones/leer-todas'),
    delete: (id) => api.delete(`/notificaciones/${id}`)
};

import api from './axios';

export const expedientesApi = {
    getAll: () => api.get('/expedientes'),
    getById: (id) => api.get(`/expedientes/${id}`),
    getMisExpedientes: () => api.get('/expedientes/mis-expedientes'),
    getByEstudiante: (estudianteId) => api.get(`/expedientes/estudiante/${estudianteId}`),
    getByTutor: (usuarioId) => api.get(`/expedientes/tutor-usuario/${usuarioId}`),
    getByAsesor: (asesorId) => api.get(`/expedientes/asesor/${asesorId}`),
    validarExpediente: (id) => api.put(`/expedientes/${id}/validar`),
    emitirCartaPresentacion: (id) => api.put(`/expedientes/${id}/emitir-carta-presentacion`),
    presentarCartaAceptacion: (id) => api.put(`/expedientes/${id}/presentar-carta-aceptacion`),
    asignarAsesor: (id, payload) => api.put(`/expedientes/${id}/asignar-asesor`, payload),
    asignarComite: (id, payload) => api.put(`/expedientes/${id}/asignar-comite`, payload),
    getComiteIntegrantesActivos: () => api.get('/comite-practicas/integrantes/activos'),
    aprobarPlan: (id) => api.put(`/expedientes/${id}/aprobar-plan`),
    aprobarInformeFinal: (id) => api.put(`/expedientes/${id}/aprobar-informe-final`),
    emitirDictamen: (id, dictamen) => api.post(`/expedientes/${id}/emitir-dictamen?dictamen=${encodeURIComponent(dictamen)}`),
    cerrarExpediente: (id, observacion) => api.put(`/expedientes/${id}/cerrar${observacion ? '?observacion='+encodeURIComponent(observacion) : ''}`),
    presentarPlan: (id, payload) => api.put(`/expedientes/${id}/presentar-plan`, payload),
    presentarInformeParcial: (id) => api.put(`/expedientes/${id}/informe-parcial`),
    presentarInformeFinal: (id) => api.put(`/expedientes/${id}/informe-final`),
    evaluar: (id, payload) => api.put(`/expedientes/${id}/evaluar`, payload),
    eliminarDocumento: (id, idDocumento) => api.delete(`/expedientes/${id}/documentos/${idDocumento}`),
    evaluarDocumento: (id, idDocumento, estado, observaciones) => api.put(`/expedientes/${id}/documentos/${idDocumento}/evaluar`, null, {
        params: { estado, observaciones }
    }),
    agregarObservacion: (id, descripcion) => api.post(`/expedientes/${id}/observaciones`, { descripcion }),
    uploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/documentos/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

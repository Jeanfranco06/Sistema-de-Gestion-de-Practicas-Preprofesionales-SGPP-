import api from './axios';

export const exportacionApi = {
    descargarPlantillaInformeFinal: (idExpediente) =>
        api.get('/exportacion/plantilla-informe-final', {
            params: idExpediente ? { idExpediente } : {},
            responseType: 'blob',
        }),
};

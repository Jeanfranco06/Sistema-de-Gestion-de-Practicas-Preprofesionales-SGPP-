package edu.unt.ingenieria_industrial.sgpp.core.service;

public interface NotificacionEventoService {

    void notificarPorUsername(String username, String tipoNotificacion, String titulo, String mensaje);

    void notificarPorUsuarioId(Long idUsuario, String tipoNotificacion, String titulo, String mensaje);

    void notificarCambioEstadoExpediente(Long idUsuarioDestino, String codigoExpediente, String estadoNuevo);

    void notificarAsignacionAsesor(Long idAsesor, String codigoExpediente, String nombreEstudiante);

    void notificarDocumentoEvaluado(String usernameEstudiante, String tipoDocumento, String resultado);

    void notificarPlanAprobado(String usernameEstudiante, String codigoExpediente);
}

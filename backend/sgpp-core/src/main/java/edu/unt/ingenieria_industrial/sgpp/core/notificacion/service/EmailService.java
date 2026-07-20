package edu.unt.ingenieria_industrial.sgpp.core.notificacion.service;

/**
 * Servicio de envío de correo electrónico para notificaciones del sistema.
 */
public interface EmailService {

    /**
     * Envía un correo simple a un destinatario.
     *
     * @param destinatario dirección de correo electrónico destino
     * @param asunto       asunto del mensaje
     * @param mensaje      cuerpo en texto plano
     * @return true si el envío fue exitoso; false en caso contrario
     */
    boolean enviarCorreo(String destinatario, String asunto, String mensaje);

    /**
     * Envía un correo HTML a un destinatario.
     *
     * @param destinatario dirección de correo electrónico destino
     * @param asunto       asunto del mensaje
     * @param htmlBody     cuerpo en formato HTML
     * @return true si el envío fue exitoso; false en caso contrario
     */
    boolean enviarCorreoHtml(String destinatario, String asunto, String htmlBody);
}

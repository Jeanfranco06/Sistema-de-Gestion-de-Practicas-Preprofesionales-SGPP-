package edu.unt.ingenieria_industrial.sgpp.core.notificacion.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Implementación de envío de correo electrónico mediante Spring Mail.
 * Si el remitente no está configurado o el envío falla, el error se registra
 * pero no se interrumpe el flujo de notificaciones in-app.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String remitente;

    @Value("${sgpp.notificaciones.email.enabled:true}")
    private boolean emailEnabled;

    @Override
    public boolean enviarCorreo(String destinatario, String asunto, String mensaje) {
        if (!emailEnabled || remitente == null || remitente.isBlank()) {
            log.debug("Envío de correo deshabilitado o remitente no configurado");
            return false;
        }
        if (destinatario == null || destinatario.isBlank()) {
            log.warn("No se puede enviar correo: destinatario vacío");
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remitente);
            message.setTo(destinatario);
            message.setSubject(asunto);
            message.setText(mensaje);
            mailSender.send(message);
            log.info("Correo enviado a {} | Asunto: {}", destinatario, asunto);
            return true;
        } catch (MailException e) {
            log.error("Error al enviar correo a {}: {}", destinatario, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean enviarCorreoHtml(String destinatario, String asunto, String htmlBody) {
        if (!emailEnabled || remitente == null || remitente.isBlank()) {
            log.debug("Envío de correo HTML deshabilitado o remitente no configurado");
            return false;
        }
        if (destinatario == null || destinatario.isBlank()) {
            log.warn("No se puede enviar correo HTML: destinatario vacío");
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(remitente);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Correo HTML enviado a {} | Asunto: {}", destinatario, asunto);
            return true;
        } catch (MailException | jakarta.mail.MessagingException e) {
            log.error("Error al enviar correo HTML a {}: {}", destinatario, e.getMessage(), e);
            return false;
        }
    }
}

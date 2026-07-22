package edu.unt.ingenieria_industrial.sgpp.core.seguridad.event;

import edu.unt.ingenieria_industrial.sgpp.core.notificacion.service.EmailService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class UsuarioCreadoListener {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;

    @Value("${sgpp.frontend.base-url:}")
    private String frontendBaseUrl;

    @Value("${sgpp.notificaciones.email.enabled:false}")
    private boolean emailEnabled;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void enviarBienvenida(UsuarioCreadoEvent event) {
        if (!emailEnabled || frontendBaseUrl.isBlank()) {
            log.warn("No se envió bienvenida al usuario {}: correo o URL del frontend no configurados", event.usuarioId());
            return;
        }

        try {
            Usuario usuario = usuarioRepository.findById(event.usuarioId())
                    .orElseThrow(() -> new IllegalStateException("Usuario creado no encontrado"));
            String token = passwordResetService.generarTokenReset(usuario.getEmail());
            String enlace = frontendBaseUrl.replaceAll("/+$", "") + "/reset-password?token=" + token;
            String nombre = escaparHtml(usuario.getNombres());
            String username = escaparHtml(usuario.getUsername());
            String html = "<p>Hola " + nombre + ",</p>"
                    + "<p>Se creó tu cuenta en el Sistema de Gestión de Prácticas Preprofesionales.</p>"
                    + "<p><strong>Usuario:</strong> " + username + "</p>"
                    + "<p>Para definir tu contraseña, usa este enlace de un solo uso (vigente por 24 horas):</p>"
                    + "<p><a href=\"" + enlace + "\">Configurar mi contraseña</a></p>"
                    + "<p>Si no esperabas este mensaje, contacta a la administración.</p>";
            emailService.enviarCorreoHtml(usuario.getEmail(), "Bienvenido al sistema SGPP", html);
        } catch (RuntimeException ex) {
            log.error("No se pudo preparar el correo de bienvenida para el usuario {}", event.usuarioId(), ex);
        }
    }

    private String escaparHtml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}

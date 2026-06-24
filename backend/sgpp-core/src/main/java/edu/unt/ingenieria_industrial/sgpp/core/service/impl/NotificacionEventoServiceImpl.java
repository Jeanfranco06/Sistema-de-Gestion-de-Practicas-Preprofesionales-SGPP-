package edu.unt.ingenieria_industrial.sgpp.core.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.dto.NotificacionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.service.NotificacionEventoService;
import edu.unt.ingenieria_industrial.sgpp.core.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacionEventoServiceImpl implements NotificacionEventoService {

    private final NotificacionService notificacionService;
    private final UsuarioRepository usuarioRepository;

    @Override
    public void notificarPorUsername(String username, String tipoNotificacion, String titulo, String mensaje) {
        if (username == null || username.isBlank()) {
            return;
        }
        notificacionService.create(NotificacionDTO.builder()
                .usuarioDestino(username)
                .tipoNotificacion(tipoNotificacion)
                .titulo(titulo)
                .mensaje(mensaje)
                .build());

        usuarioRepository.findByUsername(username)
                .map(Usuario::getEmail)
                .ifPresent(email -> enviarCorreoSimulado(email, titulo, mensaje));
    }

    @Override
    public void notificarPorUsuarioId(Long idUsuario, String tipoNotificacion, String titulo, String mensaje) {
        if (idUsuario == null) {
            return;
        }
        usuarioRepository.findById(idUsuario).ifPresent(usuario ->
                notificarPorUsername(usuario.getUsername(), tipoNotificacion, titulo, mensaje));
    }

    @Override
    public void notificarCambioEstadoExpediente(Long idUsuarioDestino, String codigoExpediente, String estadoNuevo) {
        notificarPorUsuarioId(idUsuarioDestino, "EXPEDIENTE",
                "Actualización de expediente " + codigoExpediente,
                "Su expediente cambió al estado: " + estadoNuevo.replace('_', ' '));
    }

    @Override
    public void notificarAsignacionAsesor(Long idAsesor, String codigoExpediente, String nombreEstudiante) {
        notificarPorUsuarioId(idAsesor, "REVISION",
                "Nuevo practicante asignado",
                "Se le asignó el expediente " + codigoExpediente + " del estudiante " + nombreEstudiante + ".");
    }

    @Override
    public void notificarDocumentoEvaluado(String usernameEstudiante, String tipoDocumento, String resultado) {
        notificarPorUsername(usernameEstudiante, "DOCUMENTO",
                "Documento evaluado: " + tipoDocumento,
                "Su documento fue evaluado con resultado: " + resultado + ".");
    }

    @Override
    public void notificarPlanAprobado(String usernameEstudiante, String codigoExpediente) {
        notificarPorUsername(usernameEstudiante, "EXITO",
                "Plan de prácticas aprobado",
                "El plan de trabajo del expediente " + codigoExpediente + " fue aprobado.");
    }

    private void enviarCorreoSimulado(String email, String titulo, String mensaje) {
        if (email == null || email.isBlank()) {
            return;
        }
        log.info("[NOTIFICACION-EMAIL] Para: {} | Asunto: {} | Mensaje: {}", email, titulo, mensaje);
    }
}

package edu.unt.ingenieria_industrial.sgpp.core.service.impl;

import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.core.dto.NotificacionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.model.Notificacion;
import edu.unt.ingenieria_industrial.sgpp.core.repository.NotificacionRepository;
import edu.unt.ingenieria_industrial.sgpp.core.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificacionDTO> findByUsuarioDestino(String usuarioDestino) {
        return notificacionRepository.findByUsuarioDestinoOrderByFechaEnvioDesc(usuarioDestino)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificacionDTO> findNotReadByUsuarioDestino(String usuarioDestino) {
        return notificacionRepository.findByUsuarioDestinoAndLeidaFalseOrderByFechaEnvioDesc(usuarioDestino)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countNotReadByUsuarioDestino(String usuarioDestino) {
        return notificacionRepository.countByUsuarioDestinoAndLeidaFalse(usuarioDestino);
    }

    @Override
    @Transactional
    public NotificacionDTO create(NotificacionDTO dto) {
        Notificacion notificacion = Notificacion.builder()
                .usuarioDestino(dto.getUsuarioDestino())
                .tipoNotificacion(dto.getTipoNotificacion())
                .titulo(dto.getTitulo())
                .mensaje(dto.getMensaje())
                .fechaEnvio(LocalDateTime.now())
                .leida(false)
                .activo(true)
                .build();
        return toDto(notificacionRepository.save(notificacion));
    }

    @Override
    @Transactional
    public NotificacionDTO markAsRead(Long id) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Notificación no encontrada"));
        notificacion.setLeida(true);
        notificacion.setFechaLectura(LocalDateTime.now());
        return toDto(notificacionRepository.save(notificacion));
    }

    @Override
    @Transactional
    public void markAllAsRead(String usuarioDestino) {
        List<Notificacion> notificaciones = notificacionRepository.findByUsuarioDestinoAndLeidaFalseOrderByFechaEnvioDesc(usuarioDestino);
        for (Notificacion notificacion : notificaciones) {
            notificacion.setLeida(true);
            notificacion.setFechaLectura(LocalDateTime.now());
            notificacionRepository.save(notificacion);
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        notificacionRepository.deleteById(id);
    }

    private NotificacionDTO toDto(Notificacion entity) {
        return NotificacionDTO.builder()
                .id(entity.getId())
                .usuarioDestino(entity.getUsuarioDestino())
                .tipoNotificacion(entity.getTipoNotificacion())
                .titulo(entity.getTitulo())
                .mensaje(entity.getMensaje())
                .fechaEnvio(entity.getFechaEnvio())
                .leida(entity.getLeida())
                .fechaLectura(entity.getFechaLectura())
                .activo(entity.getActivo())
                .build();
    }
}

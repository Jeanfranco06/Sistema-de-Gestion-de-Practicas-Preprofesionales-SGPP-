package edu.unt.ingenieria_industrial.sgpp.core.service;

import edu.unt.ingenieria_industrial.sgpp.core.dto.NotificacionDTO;
import java.util.List;

public interface NotificacionService {
    
    List<NotificacionDTO> findByUsuarioDestino(String usuarioDestino);
    
    List<NotificacionDTO> findNotReadByUsuarioDestino(String usuarioDestino);
    
    long countNotReadByUsuarioDestino(String usuarioDestino);
    
    NotificacionDTO create(NotificacionDTO dto);
    
    NotificacionDTO markAsRead(Long id);
    
    void markAllAsRead(String usuarioDestino);
    
    void delete(Long id);
}

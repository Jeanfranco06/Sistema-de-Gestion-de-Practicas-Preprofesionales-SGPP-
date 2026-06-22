package edu.unt.ingenieria_industrial.sgpp.core.repository;

import edu.unt.ingenieria_industrial.sgpp.core.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    List<Notificacion> findByUsuarioDestinoOrderByFechaEnvioDesc(String usuarioDestino);
    
    List<Notificacion> findByUsuarioDestinoAndLeidaFalseOrderByFechaEnvioDesc(String usuarioDestino);
    
    long countByUsuarioDestinoAndLeidaFalse(String usuarioDestino);
}

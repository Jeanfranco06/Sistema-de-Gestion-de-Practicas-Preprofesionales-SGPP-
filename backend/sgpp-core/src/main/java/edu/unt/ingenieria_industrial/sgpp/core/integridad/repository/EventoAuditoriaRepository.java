package edu.unt.ingenieria_industrial.sgpp.core.integridad.repository;

import edu.unt.ingenieria_industrial.sgpp.core.integridad.model.EventoAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventoAuditoriaRepository extends JpaRepository<EventoAuditoria, Long> {

    @Query("""
            SELECT e FROM EventoAuditoria e
            LEFT JOIN FETCH e.usuario u
            LEFT JOIN FETCH e.expediente exp
            WHERE (:idExpediente IS NULL OR e.expediente.id = :idExpediente)
              AND (:idUsuario IS NULL OR e.usuario.id = :idUsuario)
              AND (:tipoEntidad IS NULL OR e.tipoEntidad = :tipoEntidad)
              AND (:accion IS NULL OR e.accion = :accion)
              AND (:resultado IS NULL OR e.resultado = :resultado)
              AND (:desde IS NULL OR e.fechaHora >= :desde)
              AND (:hasta IS NULL OR e.fechaHora <= :hasta)
            ORDER BY e.fechaHora DESC
            """)
    List<EventoAuditoria> buscarConFiltros(
            @Param("idExpediente") Long idExpediente,
            @Param("idUsuario") Long idUsuario,
            @Param("tipoEntidad") String tipoEntidad,
            @Param("accion") String accion,
            @Param("resultado") String resultado,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta);

    List<EventoAuditoria> findByExpedienteIdOrderByFechaHoraAsc(Long idExpediente);

    List<EventoAuditoria> findByUsuarioIdOrderByFechaHoraDesc(Long idUsuario);
}

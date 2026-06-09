package edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.ComiteIntegrante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.ComiteIntegrante.RolComite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComiteIntegranteRepository extends JpaRepository<ComiteIntegrante, Long> {

    List<ComiteIntegrante> findByEstado(String estado);

    List<ComiteIntegrante> findByRolComite(RolComite rolComite);

    List<ComiteIntegrante> findByPeriodoAcademico(String periodoAcademico);

    @Query("SELECT ci FROM ComiteIntegrante ci WHERE ci.estado = 'ACTIVO' AND ci.rolComite = :rol")
    Optional<ComiteIntegrante> findActivePresidente(@Param("rol") RolComite rol);

    @Query("SELECT ci FROM ComiteIntegrante ci WHERE ci.usuario.id = :usuarioId AND ci.estado = 'ACTIVO' AND (ci.fechaFin IS NULL OR ci.fechaFin >= :fecha)")
    Optional<ComiteIntegrante> findActiveByUsuarioId(@Param("usuarioId") Long usuarioId, @Param("fecha") LocalDate fecha);

    @Query("SELECT ci FROM ComiteIntegrante ci WHERE ci.docente.id = :docenteId AND ci.estado = 'ACTIVO' AND (ci.fechaFin IS NULL OR ci.fechaFin >= :fecha)")
    Optional<ComiteIntegrante> findActiveByDocenteId(@Param("docenteId") Long docenteId, @Param("fecha") LocalDate fecha);

    @Query("SELECT ci FROM ComiteIntegrante ci WHERE ci.estado = 'ACTIVO' ORDER BY ci.rolComite DESC, ci.fechaInicio DESC")
    List<ComiteIntegrante> findAllActive();

    @Query("SELECT ci FROM ComiteIntegrante ci WHERE ci.estado = 'ACTIVO' "
            + "AND ci.fechaInicio <= :fecha "
            + "AND (ci.fechaFin IS NULL OR ci.fechaFin >= :fecha) "
            + "ORDER BY ci.rolComite DESC, ci.fechaInicio DESC")
    List<ComiteIntegrante> findVigentes(LocalDate fecha);
}

package edu.unt.ingenieria_industrial.sgpp.core.responsables.repository;

import edu.unt.ingenieria_industrial.sgpp.core.responsables.model.AsignacionAsesor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionAsesorRepository extends JpaRepository<AsignacionAsesor, Long> {

    List<AsignacionAsesor> findByDocenteIdAndActivoTrue(Long docenteId);

    List<AsignacionAsesor> findByEstudianteIdAndActivoTrue(Long estudianteId);

    Optional<AsignacionAsesor> findTopByEstudianteIdAndActivoTrueOrderByFechaInicioDesc(Long estudianteId);

    @Query("SELECT a FROM AsignacionAsesor a WHERE a.docente.id = :docenteId "
            + "AND a.activo = true AND a.estado = 'ACTIVO' "
            + "AND (a.fechaFin IS NULL OR a.fechaFin >= :hoy)")
    List<AsignacionAsesor> findActiveByDocenteId(Long docenteId, LocalDate hoy);

    @Query("SELECT a FROM AsignacionAsesor a WHERE a.estudiante.id = :estudianteId "
            + "AND a.activo = true AND a.estado = 'ACTIVO' "
            + "AND (a.fechaFin IS NULL OR a.fechaFin >= :hoy)")
    Optional<AsignacionAsesor> findActiveByEstudianteId(Long estudianteId, LocalDate hoy);

    long countByDocenteIdAndEstadoAndActivoTrue(Long docenteId, String estado);
}

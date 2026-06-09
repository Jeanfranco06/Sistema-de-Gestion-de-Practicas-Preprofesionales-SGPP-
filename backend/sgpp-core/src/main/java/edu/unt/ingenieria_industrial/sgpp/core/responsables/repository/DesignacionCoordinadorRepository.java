package edu.unt.ingenieria_industrial.sgpp.core.responsables.repository;

import edu.unt.ingenieria_industrial.sgpp.core.responsables.model.DesignacionCoordinador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DesignacionCoordinadorRepository extends JpaRepository<DesignacionCoordinador, Long> {

    List<DesignacionCoordinador> findByPeriodoAcademico(String periodoAcademico);

    List<DesignacionCoordinador> findByDocenteIdAndActivoTrue(Long docenteId);

    @Query("SELECT d FROM DesignacionCoordinador d WHERE d.periodoAcademico = :periodo "
            + "AND d.activo = true AND d.estado = 'ACTIVO' "
            + "AND (d.fechaFin IS NULL OR d.fechaFin >= :hoy)")
    Optional<DesignacionCoordinador> findActiveByPeriodo(String periodo, LocalDate hoy);

    @Query("SELECT d FROM DesignacionCoordinador d WHERE d.activo = true AND d.estado = 'ACTIVO' "
            + "AND d.fechaInicio <= :hoy "
            + "AND (d.fechaFin IS NULL OR d.fechaFin >= :hoy)")
    Optional<DesignacionCoordinador> findVigente(LocalDate hoy);
}

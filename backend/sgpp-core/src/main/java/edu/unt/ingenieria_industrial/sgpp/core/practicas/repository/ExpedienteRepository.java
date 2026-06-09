package edu.unt.ingenieria_industrial.sgpp.core.practicas.repository;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.Expediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpedienteRepository extends JpaRepository<Expediente, Long> {

    Optional<Expediente> findByEstudianteId(Long estudianteId);

    List<Expediente> findByEstudianteIdAndActivoTrue(Long estudianteId);

    List<Expediente> findByTutorEmpresaId(Long tutorEmpresaId);

    List<Expediente> findByTutorEmpresaIdAndActivoTrue(Long tutorEmpresaId);

    @Query("SELECT e FROM Expediente e WHERE e.estudiante.id = ?1 AND e.activo = true ORDER BY e.fechaApertura DESC")
    List<Expediente> findActiveByEstudianteIdOrderByFechaAperturaDesc(Long estudianteId);

    @Query("SELECT e FROM Expediente e WHERE e.tutorEmpresa.id = ?1 AND e.activo = true")
    List<Expediente> findActiveByTutorEmpresaId(Long tutorEmpresaId);
}

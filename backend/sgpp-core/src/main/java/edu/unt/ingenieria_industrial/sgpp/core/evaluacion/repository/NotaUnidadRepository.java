package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.NotaUnidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaUnidadRepository extends JpaRepository<NotaUnidad, Long> {

    List<NotaUnidad> findByExpedienteIdAndActivoTrueOrderByNumeroUnidadAsc(Long idExpediente);

    Optional<NotaUnidad> findByExpedienteIdAndNumeroUnidadAndActivoTrue(Long idExpediente, Integer numeroUnidad);

    boolean existsByExpedienteIdAndNumeroUnidadAndActivoTrue(Long idExpediente, Integer numeroUnidad);
}

package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    Optional<Evaluacion> findByExpedienteIdAndTipoEvaluador(Long expedienteId, String tipoEvaluador);
    List<Evaluacion> findByExpedienteId(Long expedienteId);
    List<Evaluacion> findByActivoTrue();
    List<Evaluacion> findByExpedienteIdAndActivoTrue(Long expedienteId);
}


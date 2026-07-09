package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.ComponenteEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComponenteEvaluacionRepository extends JpaRepository<ComponenteEvaluacion, Long> {

    List<ComponenteEvaluacion> findByExpedienteIdAndActivoTrue(Long expedienteId);

    Optional<ComponenteEvaluacion> findByExpedienteIdAndTipoComponenteAndActivoTrue(
            Long expedienteId, String tipoComponente);

    List<ComponenteEvaluacion> findByExpedienteIdAndEstadoAndActivoTrue(
            Long expedienteId, String estado);
}

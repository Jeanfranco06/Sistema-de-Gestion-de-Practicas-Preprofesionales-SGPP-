package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.CriterioEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CriterioEvaluacionRepository extends JpaRepository<CriterioEvaluacion, Long> {
    List<CriterioEvaluacion> findByTipoEvaluadorAndActivoTrue(String tipoEvaluador);
    Optional<CriterioEvaluacion> findByCodigoAndActivoTrue(String codigo);
}


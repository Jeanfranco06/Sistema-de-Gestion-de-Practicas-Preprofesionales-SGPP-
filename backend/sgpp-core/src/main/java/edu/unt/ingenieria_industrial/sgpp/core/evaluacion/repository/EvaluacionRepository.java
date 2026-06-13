package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    Optional<Evaluacion> findByPracticaIdAndTipoEvaluador(Long practicaId, String tipoEvaluador);
    List<Evaluacion> findByPracticaId(Long practicaId);
    List<Evaluacion> findByActivoTrue();
    List<Evaluacion> findByPracticaIdAndActivoTrue(Long practicaId);
}


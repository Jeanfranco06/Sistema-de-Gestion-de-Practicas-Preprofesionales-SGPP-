package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.DetalleEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleEvaluacionRepository extends JpaRepository<DetalleEvaluacion, Long> {
    List<DetalleEvaluacion> findByEvaluacionId(Long evaluacionId);
}


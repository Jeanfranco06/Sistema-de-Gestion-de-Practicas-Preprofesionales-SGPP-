package edu.unt.ingenieria_industrial.sgpp.core.academico.repository;

import edu.unt.ingenieria_industrial.sgpp.core.academico.model.ResultadoValidacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultadoValidacionRepository extends JpaRepository<ResultadoValidacion, Long> {

    List<ResultadoValidacion> findByEstudianteIdOrderByFechaValidacionDesc(Long estudianteId);

    Optional<ResultadoValidacion> findTopByEstudianteIdAndTipoPracticaIdAndActivoTrueOrderByFechaValidacionDesc(
            Long estudianteId, Long tipoPracticaId);
}

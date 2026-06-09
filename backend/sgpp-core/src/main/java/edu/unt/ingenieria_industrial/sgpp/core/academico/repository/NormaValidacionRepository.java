package edu.unt.ingenieria_industrial.sgpp.core.academico.repository;

import edu.unt.ingenieria_industrial.sgpp.core.academico.model.NormaValidacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface NormaValidacionRepository extends JpaRepository<NormaValidacion, Long> {

    List<NormaValidacion> findByActivoTrue();

    Optional<NormaValidacion> findByCodigoAndActivoTrue(String codigo);

    List<NormaValidacion> findByActivoTrueAndFechaVigenciaInicioLessThanEqualAndFechaVigenciaFinIsNullOrFechaVigenciaFinGreaterThanEqual(
            LocalDate fecha, LocalDate fecha2);
}

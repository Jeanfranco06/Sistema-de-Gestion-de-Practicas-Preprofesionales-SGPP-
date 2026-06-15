package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.repository;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.model.Rubrica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RubricaRepository extends JpaRepository<Rubrica, Long> {
    List<Rubrica> findByTipoEvaluadorAndActivoTrue(String tipoEvaluador);
    Optional<Rubrica> findByNombreAndActivoTrue(String nombre);
}


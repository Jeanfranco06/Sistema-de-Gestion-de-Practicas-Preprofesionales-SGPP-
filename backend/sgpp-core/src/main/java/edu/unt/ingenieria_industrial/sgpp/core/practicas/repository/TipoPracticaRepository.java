package edu.unt.ingenieria_industrial.sgpp.core.practicas.repository;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TipoPracticaRepository extends JpaRepository<TipoPractica, Long> {

    Optional<TipoPractica> findByCodigo(String codigo);
}

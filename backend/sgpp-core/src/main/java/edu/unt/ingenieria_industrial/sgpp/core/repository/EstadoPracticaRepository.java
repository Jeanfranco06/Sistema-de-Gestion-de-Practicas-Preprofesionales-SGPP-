package edu.unt.ingenieria_industrial.sgpp.core.repository;

import edu.unt.ingenieria_industrial.sgpp.core.model.EstadoPractica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoPracticaRepository extends JpaRepository<EstadoPractica, Long> {
    Optional<EstadoPractica> findByCodigo(String codigo);
}

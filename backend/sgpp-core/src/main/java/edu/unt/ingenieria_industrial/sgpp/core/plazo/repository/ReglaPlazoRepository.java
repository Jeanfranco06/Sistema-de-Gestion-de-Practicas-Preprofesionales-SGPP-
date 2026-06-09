package edu.unt.ingenieria_industrial.sgpp.core.plazo.repository;

import edu.unt.ingenieria_industrial.sgpp.core.plazo.model.ReglaPlazo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReglaPlazoRepository extends JpaRepository<ReglaPlazo, Long> {
    Optional<ReglaPlazo> findByCodigoAndActivoTrue(String codigo);
    List<ReglaPlazo> findByActivoTrueOrderByOrdenAsc();
    List<ReglaPlazo> findByTipoPracticaCodigoAndActivoTrueOrderByOrdenAsc(String codigoTipoPractica);
}

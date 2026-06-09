package edu.unt.ingenieria_industrial.sgpp.core.academico.repository;

import edu.unt.ingenieria_industrial.sgpp.core.academico.model.ReglaValidacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReglaValidacionRepository extends JpaRepository<ReglaValidacion, Long> {

    List<ReglaValidacion> findByTipoPracticaCodigoAndActivoTrueOrderByOrdenAsc(String codigoTipoPractica);

    List<ReglaValidacion> findByTipoPracticaCodigoAndNormaCodigoAndActivoTrueOrderByOrdenAsc(
            String codigoTipoPractica, String codigoNorma);
}

package edu.unt.ingenieria_industrial.sgpp.core.academico.repository;

import edu.unt.ingenieria_industrial.sgpp.core.academico.model.ReglaValidacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ReglaValidacionRepository extends JpaRepository<ReglaValidacion, Long> {

    List<ReglaValidacion> findByTipoPracticaCodigoAndActivoTrueOrderByOrdenAsc(String codigoTipoPractica);

    @Query("SELECT DISTINCT r.norma.codigo FROM ReglaValidacion r "
            + "WHERE r.tipoPractica.codigo = :codigoTipoPractica AND r.activo = true")
    List<String> findDistinctNormaCodigosByTipoPracticaCodigo(String codigoTipoPractica);

    @Query("SELECT r FROM ReglaValidacion r JOIN FETCH r.norma JOIN FETCH r.tipoPractica "
            + "WHERE r.tipoPractica.codigo = :codigoTipoPractica AND r.norma.codigo IN :codigosNormas "
            + "AND r.activo = true ORDER BY r.orden ASC")
    List<ReglaValidacion> findWithNormaByTipoPracticaAndNormas(
            String codigoTipoPractica, Set<String> codigosNormas);
}

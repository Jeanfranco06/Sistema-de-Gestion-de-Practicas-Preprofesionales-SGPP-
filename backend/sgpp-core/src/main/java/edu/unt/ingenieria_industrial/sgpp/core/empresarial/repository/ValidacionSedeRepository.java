package edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.ValidacionSede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ValidacionSedeRepository extends JpaRepository<ValidacionSede, Long> {
    List<ValidacionSede> findBySedeId(Long sedeId);
    
    List<ValidacionSede> findBySedeIdOrderByFechaValidacionDesc(Long sedeId);
    
    @Query("SELECT v FROM ValidacionSede v WHERE v.sede.id = :sedeId " +
           "AND v.resultadoValidacion = 'APROBADA' " +
           "AND :fechaActual BETWEEN v.fechaVigenciaDesde AND v.fechaVigenciaHasta " +
           "ORDER BY v.fechaValidacion DESC")
    Optional<ValidacionSede> findValidacionVigente(@Param("sedeId") Long sedeId, 
                                                     @Param("fechaActual") LocalDate fechaActual);
    
    @Query("SELECT v FROM ValidacionSede v WHERE v.sede.id = :sedeId " +
           "AND v.resultadoValidacion = 'APROBADA' " +
           "AND v.fechaVigenciaDesde <= :fechaActual " +
           "ORDER BY v.fechaValidacion DESC")
    List<ValidacionSede> findValidacionesAprobadas(@Param("sedeId") Long sedeId,
                                                     @Param("fechaActual") LocalDate fechaActual);
}

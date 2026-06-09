package edu.unt.ingenieria_industrial.sgpp.core.academico.repository;

import edu.unt.ingenieria_industrial.sgpp.core.academico.model.DetalleValidacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleValidacionRepository extends JpaRepository<DetalleValidacion, Long> {

    List<DetalleValidacion> findByResultadoValidacionIdOrderByOrdenAsc(Long resultadoId);
}

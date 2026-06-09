package edu.unt.ingenieria_industrial.sgpp.core.expediente.repository;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpedienteEstadoRepository extends JpaRepository<ExpedienteEstado, Long> {
    List<ExpedienteEstado> findByExpedienteIdOrderByFechaCambioAsc(Long expedienteId);
}

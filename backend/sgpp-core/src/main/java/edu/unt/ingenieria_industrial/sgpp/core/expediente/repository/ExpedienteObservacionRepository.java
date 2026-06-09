package edu.unt.ingenieria_industrial.sgpp.core.expediente.repository;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteObservacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpedienteObservacionRepository extends JpaRepository<ExpedienteObservacion, Long> {
    List<ExpedienteObservacion> findByExpedienteIdOrderByFechaCreacionAsc(Long expedienteId);
    List<ExpedienteObservacion> findByExpedienteIdAndSubsanadoFalse(Long expedienteId);
}

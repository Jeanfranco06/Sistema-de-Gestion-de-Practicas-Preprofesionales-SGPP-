package edu.unt.ingenieria_industrial.sgpp.core.expediente.repository;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteComite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpedienteComiteRepository extends JpaRepository<ExpedienteComite, Long> {
    List<ExpedienteComite> findByExpedienteIdAndActivoTrue(Long expedienteId);
    List<ExpedienteComite> findByExpedienteId(Long expedienteId);
}

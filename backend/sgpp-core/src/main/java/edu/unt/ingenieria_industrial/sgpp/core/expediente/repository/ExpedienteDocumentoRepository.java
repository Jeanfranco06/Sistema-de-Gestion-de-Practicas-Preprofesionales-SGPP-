package edu.unt.ingenieria_industrial.sgpp.core.expediente.repository;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpedienteDocumentoRepository extends JpaRepository<ExpedienteDocumento, Long> {
    List<ExpedienteDocumento> findByExpedienteIdOrderByFechaSubidaDesc(Long expedienteId);
    List<ExpedienteDocumento> findByExpedienteIdAndTipoDocumento(Long expedienteId, String tipoDocumento);
}

package edu.unt.ingenieria_industrial.sgpp.core.exportacion.repository;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.model.RegistroGeneracionDocumental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroGeneracionDocumentalRepository extends JpaRepository<RegistroGeneracionDocumental, Long> {

    List<RegistroGeneracionDocumental> findByExpedienteIdOrderByFechaGeneracionDesc(Long expedienteId);

    List<RegistroGeneracionDocumental> findByUsuarioSolicitanteIdOrderByFechaGeneracionDesc(Long usuarioId);
}

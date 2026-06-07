package edu.unt.ingenieria_industrial.sgpp.core.documental.repository;

import edu.unt.ingenieria_industrial.sgpp.core.documental.model.ObservacionDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservacionDocumentoRepository extends JpaRepository<ObservacionDocumento, Long> {
    List<ObservacionDocumento> findByDocumentoIdAndResueltaFalse(Long documentoId);
    List<ObservacionDocumento> findByDocumentoIdOrderByFechaObservacionDesc(Long documentoId);
}


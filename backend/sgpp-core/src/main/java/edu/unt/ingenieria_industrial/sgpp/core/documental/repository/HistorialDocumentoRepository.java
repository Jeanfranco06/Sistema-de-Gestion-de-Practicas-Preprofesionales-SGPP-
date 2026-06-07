package edu.unt.ingenieria_industrial.sgpp.core.documental.repository;

import edu.unt.ingenieria_industrial.sgpp.core.documental.model.HistorialDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialDocumentoRepository extends JpaRepository<HistorialDocumento, Long> {
    List<HistorialDocumento> findByDocumentoIdOrderByFechaCambioDesc(Long documentoId);
}


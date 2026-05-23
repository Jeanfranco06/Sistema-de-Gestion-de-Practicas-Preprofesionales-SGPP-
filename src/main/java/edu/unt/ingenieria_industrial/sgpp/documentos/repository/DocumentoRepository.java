package edu.unt.ingenieria_industrial.sgpp.documentos.repository;

import edu.unt.ingenieria_industrial.sgpp.documentos.model.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    Optional<Documento> findByPracticaIdAndTipoDocumentoId(Long practicaId, Long tipoDocumentoId);
    List<Documento> findByPracticaId(Long practicaId);
    List<Documento> findByActivoTrue();
}

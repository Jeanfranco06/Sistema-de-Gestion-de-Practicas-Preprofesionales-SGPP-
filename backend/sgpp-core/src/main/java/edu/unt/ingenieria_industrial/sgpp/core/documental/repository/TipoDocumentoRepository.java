package edu.unt.ingenieria_industrial.sgpp.core.documental.repository;

import edu.unt.ingenieria_industrial.sgpp.core.documental.model.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {
    Optional<TipoDocumento> findByNombre(String nombre);
    List<TipoDocumento> findByActivoTrue();
}


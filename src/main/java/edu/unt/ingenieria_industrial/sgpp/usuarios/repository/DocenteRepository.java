package edu.unt.ingenieria_industrial.sgpp.usuarios.repository;

import edu.unt.ingenieria_industrial.sgpp.usuarios.model.Docente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocenteRepository extends JpaRepository<Docente, Long> {

    Optional<Docente> findByUsuarioId(Long usuarioId);

    Optional<Docente> findByCodigoDocente(String codigoDocente);

    Boolean existsByCodigoDocente(String codigoDocente);
}

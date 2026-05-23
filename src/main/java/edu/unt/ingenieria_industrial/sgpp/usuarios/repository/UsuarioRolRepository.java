package edu.unt.ingenieria_industrial.sgpp.usuarios.repository;

import edu.unt.ingenieria_industrial.sgpp.usuarios.model.UsuarioRol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, Long> {

    List<UsuarioRol> findByUsuarioId(Long usuarioId);

    Optional<UsuarioRol> findByUsuarioIdAndRolId(Long usuarioId, Long rolId);

    void deleteByUsuarioId(Long usuarioId);
}

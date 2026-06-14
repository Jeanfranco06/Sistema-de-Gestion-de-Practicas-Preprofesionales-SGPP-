package edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.usuarioRoles ur LEFT JOIN FETCH ur.rol WHERE u.username = :identifier OR u.email = :identifier")
    Optional<Usuario> findByUsernameWithRoles(@org.springframework.data.repository.query.Param("identifier") String identifier);

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByNumeroDocumento(String numeroDocumento);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Boolean existsByNumeroDocumento(String numeroDocumento);

    @Query("SELECT u FROM Usuario u JOIN u.usuarioRoles ur JOIN ur.rol r WHERE r.nombre = :rolNombre AND u.activo = true")
    java.util.List<Usuario> findByRolNombre(String rolNombre);
}


package edu.unt.ingenieria_industrial.sgpp.usuarios.repository;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.RolSistema;
import edu.unt.ingenieria_industrial.sgpp.usuarios.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(RolSistema nombre);

    Boolean existsByNombre(RolSistema nombre);
}

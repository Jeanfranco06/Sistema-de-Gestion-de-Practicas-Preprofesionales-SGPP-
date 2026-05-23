package edu.unt.ingenieria_industrial.sgpp.usuarios.repository;

import edu.unt.ingenieria_industrial.sgpp.usuarios.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    Optional<Estudiante> findByUsuarioId(Long usuarioId);

    Optional<Estudiante> findByCodigoEstudiantil(String codigoEstudiantil);

    Boolean existsByCodigoEstudiantil(String codigoEstudiantil);
}

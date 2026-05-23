package edu.unt.ingenieria_industrial.sgpp.usuarios.repository;

import edu.unt.ingenieria_industrial.sgpp.usuarios.model.TutorExterno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TutorExternoRepository extends JpaRepository<TutorExterno, Long> {

    Optional<TutorExterno> findByUsuarioId(Long usuarioId);
}

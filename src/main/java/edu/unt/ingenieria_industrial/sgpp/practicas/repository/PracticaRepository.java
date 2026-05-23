package edu.unt.ingenieria_industrial.sgpp.practicas.repository;

import edu.unt.ingenieria_industrial.sgpp.practicas.model.Practica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PracticaRepository extends JpaRepository<Practica, Long> {
    Optional<Practica> findByEstudianteIdAndActivoTrue(Long estudianteId);
    List<Practica> findByEstudianteId(Long estudianteId);
    List<Practica> findBySedeIdAndActivoTrue(Long sedeId);
    List<Practica> findByActivoTrue();
}

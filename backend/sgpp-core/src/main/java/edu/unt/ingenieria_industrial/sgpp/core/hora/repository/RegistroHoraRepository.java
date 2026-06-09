package edu.unt.ingenieria_industrial.sgpp.core.hora.repository;

import edu.unt.ingenieria_industrial.sgpp.core.hora.model.RegistroHora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RegistroHoraRepository extends JpaRepository<RegistroHora, Long> {

    List<RegistroHora> findByControlHoraIdOrderByFechaAsc(Long controlHoraId);

    List<RegistroHora> findByControlHoraIdAndFechaBetweenOrderByFechaAsc(Long controlHoraId, LocalDate desde, LocalDate hasta);
}

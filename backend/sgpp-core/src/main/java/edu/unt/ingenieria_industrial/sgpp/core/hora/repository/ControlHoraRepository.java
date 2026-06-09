package edu.unt.ingenieria_industrial.sgpp.core.hora.repository;

import edu.unt.ingenieria_industrial.sgpp.core.hora.model.ControlHora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ControlHoraRepository extends JpaRepository<ControlHora, Long> {

    @Query("SELECT ch FROM ControlHora ch LEFT JOIN FETCH ch.registros WHERE ch.expediente.id = :idExpediente AND ch.activo = true")
    Optional<ControlHora> findByExpedienteIdWithRegistros(@Param("idExpediente") Long idExpediente);

    Optional<ControlHora> findByExpedienteIdAndActivoTrue(Long idExpediente);

    @Query("SELECT COALESCE(SUM(r.horas), 0) FROM RegistroHora r WHERE r.controlHora.id = :idControl")
    Integer sumHorasByControlId(@Param("idControl") Long idControl);
}

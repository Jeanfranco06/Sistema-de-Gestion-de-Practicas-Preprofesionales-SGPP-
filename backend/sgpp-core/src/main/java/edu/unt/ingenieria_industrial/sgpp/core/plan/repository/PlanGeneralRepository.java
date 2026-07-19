package edu.unt.ingenieria_industrial.sgpp.core.plan.repository;

import edu.unt.ingenieria_industrial.sgpp.core.plan.model.PlanGeneral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlanGeneralRepository extends JpaRepository<PlanGeneral, Long> {

    Optional<PlanGeneral> findTopByExpedienteIdAndActivoTrueOrderByVersionDesc(Long expedienteId);

    List<PlanGeneral> findByExpedienteIdOrderByVersionDesc(Long expedienteId);

    @Query("SELECT p FROM PlanGeneral p JOIN FETCH p.expediente WHERE p.id = :id")
    Optional<PlanGeneral> findByIdWithExpediente(Long id);

    List<PlanGeneral> findByExpedienteIdAndEstadoAndActivoTrue(Long expedienteId, String estado);

    boolean existsByExpedienteIdAndEstadoInAndActivoTrue(Long expedienteId, List<String> estados);
}

package edu.unt.ingenieria_industrial.sgpp.core.plan.repository;

import edu.unt.ingenieria_industrial.sgpp.core.plan.model.PlanObjetivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanObjetivoRepository extends JpaRepository<PlanObjetivo, Long> {
    List<PlanObjetivo> findByPlanIdAndActivoTrueOrderByOrdenAsc(Long planId);
    List<PlanObjetivo> findByPlanIdAndTipoAndActivoTrueOrderByOrdenAsc(Long planId, String tipo);
    long countByPlanIdAndTipoAndActivoTrue(Long planId, String tipo);
}

package edu.unt.ingenieria_industrial.sgpp.core.plan.repository;

import edu.unt.ingenieria_industrial.sgpp.core.plan.model.PlanHistorialEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanHistorialEstadoRepository extends JpaRepository<PlanHistorialEstado, Long> {
    List<PlanHistorialEstado> findByPlanIdOrderByFechaCambioAsc(Long planId);
}

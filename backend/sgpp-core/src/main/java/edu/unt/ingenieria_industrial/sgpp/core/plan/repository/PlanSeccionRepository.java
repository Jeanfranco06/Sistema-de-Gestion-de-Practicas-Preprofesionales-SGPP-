package edu.unt.ingenieria_industrial.sgpp.core.plan.repository;

import edu.unt.ingenieria_industrial.sgpp.core.plan.model.PlanSeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanSeccionRepository extends JpaRepository<PlanSeccion, Long> {
    List<PlanSeccion> findByPlanIdAndActivoTrueOrderByOrdenAsc(Long planId);
}

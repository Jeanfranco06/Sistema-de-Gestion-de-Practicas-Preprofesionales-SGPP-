package edu.unt.ingenieria_industrial.sgpp.core.academico.repository;

import edu.unt.ingenieria_industrial.sgpp.core.academico.model.ParametroRegla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParametroReglaRepository extends JpaRepository<ParametroRegla, Long> {

    List<ParametroRegla> findByReglaValidacionIdAndActivoTrue(Long reglaId);
}

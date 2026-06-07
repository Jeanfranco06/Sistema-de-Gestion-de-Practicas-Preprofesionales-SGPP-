package edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SedePracticaRepository extends JpaRepository<SedePractica, Long> {
    List<SedePractica> findByEmpresaIdAndActivoTrue(Long empresaId);
    List<SedePractica> findByActivoTrue();
}


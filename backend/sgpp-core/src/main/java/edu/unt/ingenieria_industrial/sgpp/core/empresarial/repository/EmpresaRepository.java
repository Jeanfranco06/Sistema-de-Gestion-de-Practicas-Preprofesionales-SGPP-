package edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByRuc(String ruc);
    boolean existsByRuc(String ruc);
}


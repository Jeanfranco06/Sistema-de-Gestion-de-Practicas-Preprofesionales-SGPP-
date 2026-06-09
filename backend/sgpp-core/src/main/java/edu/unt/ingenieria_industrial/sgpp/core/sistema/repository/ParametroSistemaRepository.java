package edu.unt.ingenieria_industrial.sgpp.core.sistema.repository;

import edu.unt.ingenieria_industrial.sgpp.core.model.ParametroSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParametroSistemaRepository extends JpaRepository<ParametroSistema, Long> {

    Optional<ParametroSistema> findByClave(String clave);

    List<ParametroSistema> findByActivoTrue();

    boolean existsByClave(String clave);
}

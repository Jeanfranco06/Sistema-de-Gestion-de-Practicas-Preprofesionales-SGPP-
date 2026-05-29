package edu.unt.ingenieria_industrial.sgpp.sedes.repository;

import edu.unt.ingenieria_industrial.sgpp.sedes.model.Convenio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConvenioRepository extends JpaRepository<Convenio, Long> {
    Optional<Convenio> findByNumeroConvenio(String numeroConvenio);
    List<Convenio> findByEmpresaIdAndVigenteTrue(Long empresaId);
    List<Convenio> findByVigenteTrue();
    List<Convenio> findByVigenteTrueAndFechaFinBetween(LocalDate start, LocalDate end);
}

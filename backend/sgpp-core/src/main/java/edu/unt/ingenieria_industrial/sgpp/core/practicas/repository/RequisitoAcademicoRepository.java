package edu.unt.ingenieria_industrial.sgpp.core.practicas.repository;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.RequisitoAcademico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequisitoAcademicoRepository extends JpaRepository<RequisitoAcademico, Long> {
    List<RequisitoAcademico> findByTipoPracticaCodigoAndActivoTrue(String codigoTipoPractica);
    List<RequisitoAcademico> findByActivoTrueOrderByTipoPracticaNombreAsc();
}

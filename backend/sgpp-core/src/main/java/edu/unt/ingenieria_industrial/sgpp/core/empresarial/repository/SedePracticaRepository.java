package edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SedePracticaRepository extends JpaRepository<SedePractica, Long> {
    Optional<SedePractica> findByNombreSedeAndEmpresaId(String nombreSede, Long empresaId);
    List<SedePractica> findByEmpresaIdAndActivoTrue(Long empresaId);
    List<SedePractica> findByActivoTrue();

    @Query("SELECT s FROM SedePractica s WHERE s.empresa.id IN " +
           "(SELECT c.empresa.id FROM Convenio c WHERE c.vigente = true AND c.activo = true) " +
           "AND s.activo = true")
    List<SedePractica> findWithValidConvenios();

    // Filtrado por estado_sede
    List<SedePractica> findByEstadoSede(String estadoSede);

    // Filtrado por empresa y estado
    List<SedePractica> findByEmpresaIdAndEstadoSede(Long empresaId, String estadoSede);

    // Filtrado por ubicación (distrito, provincia, departamento)
    List<SedePractica> findByDistritoContainingIgnoreCase(String distrito);
    List<SedePractica> findByProvinciaContainingIgnoreCase(String provincia);
    List<SedePractica> findByDepartamentoContainingIgnoreCase(String departamento);

    // Filtrado por capacidad mínima
    List<SedePractica> findByCapacidadMaximaGreaterThanEqual(Integer capacidadMinima);

    // Filtrado combinado para estudiantes (solo sedes aprobadas y con validación vigente)
    @Query("SELECT s FROM SedePractica s WHERE s.estadoSede = 'ACTIVA' " +
           "AND s.activo = true " +
           "AND EXISTS (SELECT v FROM ValidacionSede v WHERE v.sede.id = s.id " +
           "AND v.resultadoValidacion = 'APROBADA' " +
           "AND CURRENT_DATE BETWEEN v.fechaVigenciaDesde AND v.fechaVigenciaHasta)")
    List<SedePractica> findAvailableForStudents();
}


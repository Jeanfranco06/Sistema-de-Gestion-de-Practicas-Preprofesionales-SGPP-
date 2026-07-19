package edu.unt.ingenieria_industrial.sgpp.core.expediente.repository;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpedienteRepository extends JpaRepository<Expediente, Long> {
    Optional<Expediente> findByCodigoExpediente(String codigoExpediente);

    List<Expediente> findByEstudianteIdOrderByFechaCreacionDesc(Long estudianteId);

    List<Expediente> findByEmpresaIdAndActivoTrue(Long empresaId);

    List<Expediente> findByAsesorIdAndActivoTrue(Long asesorId);

    List<Expediente> findByEstadoAndActivoTrue(String estado);

    @Query("SELECT e FROM Expediente e WHERE e.activo = true ORDER BY e.fechaCreacion DESC")
    List<Expediente> findAllActive();

    @Query("SELECT e FROM Expediente e WHERE e.estudiante.id = :idEstudiante AND e.activo = true AND e.estado NOT IN ('CERRADO')")
    List<Expediente> findActiveByEstudianteId(@Param("idEstudiante") Long idEstudiante);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(e.codigoExpediente, LENGTH(e.codigoExpediente) - 3) AS integer)), 0) " +
           "FROM Expediente e WHERE e.codigoExpediente LIKE CONCAT(:prefix, '%')")
    Integer findMaxCorrelativoByPrefix(@Param("prefix") String prefix);

    @Query("SELECT e FROM Expediente e LEFT JOIN FETCH e.empresa LEFT JOIN FETCH e.sedePractica " +
           "LEFT JOIN FETCH e.tipoPractica LEFT JOIN FETCH e.asesor LEFT JOIN FETCH e.tutorEmpresa " +
           "LEFT JOIN FETCH e.estudiante est LEFT JOIN FETCH est.usuario WHERE e.id = :id")
    Optional<Expediente> findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT e FROM Expediente e JOIN e.tutorEmpresa te WHERE te.usuario.id = :usuarioId AND e.activo = true")
    List<Expediente> findByTutorUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query("SELECT e FROM Expediente e JOIN TutorExterno te ON te.empresa.id = e.empresa.id " +
           "WHERE te.usuario.id = :usuarioId AND e.activo = true AND e.tutorEmpresa IS NULL")
    List<Expediente> findByTutorEmpresaUsuarioId(@Param("usuarioId") Long usuarioId);
}

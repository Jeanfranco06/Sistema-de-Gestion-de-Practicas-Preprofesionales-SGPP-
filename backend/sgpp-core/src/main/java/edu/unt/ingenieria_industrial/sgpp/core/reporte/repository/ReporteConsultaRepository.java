package edu.unt.ingenieria_industrial.sgpp.core.reporte.repository;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Convenio;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.Empresa;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.ValidacionSede;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteObservacion;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.model.TipoPractica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReporteConsultaRepository extends JpaRepository<Expediente, Long> {

    @Query("""
            SELECT DISTINCT e FROM Expediente e
            LEFT JOIN FETCH e.estudiante est
            LEFT JOIN FETCH est.usuario uEst
            LEFT JOIN FETCH e.tipoPractica tp
            LEFT JOIN FETCH e.empresa emp
            LEFT JOIN FETCH e.sedePractica sed
            LEFT JOIN FETCH e.asesor ases
            LEFT JOIN FETCH e.convenio conv
            WHERE e.activo = true
              AND e.estado <> 'CERRADO'
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:estado IS NULL OR e.estado = :estado)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
              AND (:idComite IS NULL OR EXISTS (
                    SELECT 1 FROM ExpedienteComite ec
                    WHERE ec.expediente.id = e.id AND ec.usuario.id = :idComite AND ec.activo = true))
              AND (:convenioVigente IS NULL OR (
                    (:convenioVigente = true AND conv IS NOT NULL AND conv.vigente = true
                        AND conv.fechaFin >= :hoy)
                    OR (:convenioVigente = false AND (conv IS NULL OR conv.vigente = false
                        OR conv.fechaFin < :hoy))))
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            ORDER BY e.fechaCreacion DESC
            """)
    List<Expediente> buscarExpedientesActivos(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("estado") String estado,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor,
            @Param("idComite") Long idComite,
            @Param("convenioVigente") Boolean convenioVigente,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta,
            @Param("hoy") LocalDate hoy);

    @Query("""
            SELECT DISTINCT e FROM Expediente e
            LEFT JOIN FETCH e.estudiante est
            LEFT JOIN FETCH est.usuario uEst
            LEFT JOIN FETCH e.tipoPractica tp
            LEFT JOIN FETCH e.empresa emp
            LEFT JOIN FETCH e.sedePractica sed
            LEFT JOIN FETCH e.asesor ases
            WHERE e.estado = 'CERRADO'
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
              AND (:idComite IS NULL OR EXISTS (
                    SELECT 1 FROM ExpedienteComite ec
                    WHERE ec.expediente.id = e.id AND ec.usuario.id = :idComite AND ec.activo = true))
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            ORDER BY e.fechaActualizacion DESC
            """)
    List<Expediente> buscarExpedientesCerrados(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor,
            @Param("idComite") Long idComite,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT tp FROM TipoPractica tp
            WHERE tp.activo = true
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
            ORDER BY tp.codigo
            """)
    List<TipoPractica> buscarTiposPracticaActivos(@Param("tipoPractica") String tipoPractica);

    @Query("""
            SELECT COUNT(e) FROM Expediente e
            WHERE e.tipoPractica.id = :idTipo
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:idEmpresa IS NULL OR e.empresa.id = :idEmpresa)
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            """)
    long contarExpedientesPorTipo(
            @Param("idTipo") Long idTipo,
            @Param("periodo") String periodo,
            @Param("idEmpresa") Long idEmpresa,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT COUNT(e) FROM Expediente e
            WHERE e.tipoPractica.id = :idTipo
              AND e.activo = true AND e.estado <> 'CERRADO'
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
            """)
    long contarActivosPorTipo(@Param("idTipo") Long idTipo, @Param("periodo") String periodo);

    @Query("""
            SELECT COUNT(e) FROM Expediente e
            WHERE e.tipoPractica.id = :idTipo AND e.estado = 'CERRADO'
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
            """)
    long contarCerradosPorTipo(@Param("idTipo") Long idTipo, @Param("periodo") String periodo);

    @Query("""
            SELECT e.estado, COUNT(e) FROM Expediente e
            WHERE e.tipoPractica.id = :idTipo
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
            GROUP BY e.estado
            """)
    List<Object[]> distribucionEstadosPorTipo(@Param("idTipo") Long idTipo, @Param("periodo") String periodo);

    @Query("""
            SELECT DISTINCT emp FROM Empresa emp
            WHERE emp.activo = true
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND EXISTS (
                    SELECT 1 FROM Expediente e
                    WHERE e.empresa.id = emp.id
                      AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
                      AND (:tipoPractica IS NULL OR e.tipoPractica.codigo = :tipoPractica)
                      AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
                      AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta))
            ORDER BY emp.razonSocial
            """)
    List<Empresa> buscarEmpresasReceptoras(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("idEmpresa") Long idEmpresa,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT COUNT(e) FROM Expediente e
            WHERE e.empresa.id = :idEmpresa
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR e.tipoPractica.codigo = :tipoPractica)
            """)
    long contarExpedientesPorEmpresa(
            @Param("idEmpresa") Long idEmpresa,
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica);

    @Query("""
            SELECT COUNT(e) FROM Expediente e
            WHERE e.empresa.id = :idEmpresa AND e.activo = true AND e.estado <> 'CERRADO'
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
            """)
    long contarExpedientesActivosPorEmpresa(@Param("idEmpresa") Long idEmpresa, @Param("periodo") String periodo);

    @Query("""
            SELECT DISTINCT e.tipoPractica.codigo FROM Expediente e
            WHERE e.empresa.id = :idEmpresa
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
            """)
    List<String> tiposPracticaPorEmpresa(@Param("idEmpresa") Long idEmpresa, @Param("periodo") String periodo);

    @Query("""
            SELECT COUNT(c) FROM Convenio c
            WHERE c.empresa.id = :idEmpresa AND c.activo = true AND c.vigente = true
              AND c.fechaFin >= :hoy
            """)
    long contarConveniosVigentesPorEmpresa(@Param("idEmpresa") Long idEmpresa, @Param("hoy") LocalDate hoy);

    @Query("""
            SELECT c.numeroConvenio FROM Convenio c
            WHERE c.empresa.id = :idEmpresa AND c.activo = true AND c.vigente = true
              AND c.fechaFin >= :hoy
            """)
    List<String> numerosConvenioVigentesPorEmpresa(@Param("idEmpresa") Long idEmpresa, @Param("hoy") LocalDate hoy);

    @Query("""
            SELECT COUNT(s) FROM SedePractica s
            WHERE s.empresa.id = :idEmpresa AND s.activo = true
            """)
    long contarSedesPorEmpresa(@Param("idEmpresa") Long idEmpresa);

    @Query("""
            SELECT COUNT(DISTINCT v.sede.id) FROM ValidacionSede v
            WHERE v.sede.empresa.id = :idEmpresa
              AND v.resultadoValidacion = 'APROBADA'
              AND :hoy BETWEEN v.fechaVigenciaDesde AND v.fechaVigenciaHasta
            """)
    long contarSedesValidadasVigentesPorEmpresa(@Param("idEmpresa") Long idEmpresa, @Param("hoy") LocalDate hoy);

    @Query("""
            SELECT v FROM ValidacionSede v
            JOIN FETCH v.sede s
            JOIN FETCH s.empresa emp
            JOIN FETCH v.usuarioValidador val
            WHERE v.resultadoValidacion = 'APROBADA'
              AND (:idSede IS NULL OR s.id = :idSede)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:fechaDesde IS NULL OR v.fechaVigenciaDesde >= :fechaDesde)
              AND (:fechaHasta IS NULL OR v.fechaVigenciaHasta <= :fechaHasta)
            ORDER BY emp.razonSocial, s.nombreSede, v.fechaValidacion DESC
            """)
    List<ValidacionSede> buscarValidacionesSede(
            @Param("idSede") Long idSede,
            @Param("idEmpresa") Long idEmpresa,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT COUNT(e) FROM Expediente e
            WHERE e.sedePractica.id = :idSede
            """)
    long contarExpedientesPorSede(@Param("idSede") Long idSede);

    @Query("""
            SELECT COUNT(e) FROM Expediente e
            WHERE e.sedePractica.id = :idSede AND e.activo = true AND e.estado <> 'CERRADO'
            """)
    long contarExpedientesActivosPorSede(@Param("idSede") Long idSede);

    @Query("""
            SELECT c FROM Convenio c
            JOIN FETCH c.empresa emp
            WHERE c.activo = true
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:convenioVigente IS NULL OR (
                    (:convenioVigente = true AND c.vigente = true AND c.fechaFin >= :hoy)
                    OR (:convenioVigente = false AND (c.vigente = false OR c.fechaFin < :hoy))))
              AND (:fechaDesde IS NULL OR c.fechaInicio >= :fechaDesde)
              AND (:fechaHasta IS NULL OR c.fechaFin <= :fechaHasta)
            ORDER BY c.fechaFin DESC
            """)
    List<Convenio> buscarConvenios(
            @Param("idEmpresa") Long idEmpresa,
            @Param("convenioVigente") Boolean convenioVigente,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta,
            @Param("hoy") LocalDate hoy);

    @Query("""
            SELECT COUNT(e) FROM Expediente e
            WHERE e.convenio.id = :idConvenio AND e.estado = 'EN_EJECUCION'
            """)
    long contarExpedientesEnEjecucionPorConvenio(@Param("idConvenio") Long idConvenio);

    @Query("""
            SELECT COUNT(e) FROM Expediente e WHERE e.convenio.id = :idConvenio
            """)
    long contarExpedientesPorConvenio(@Param("idConvenio") Long idConvenio);

    @Query("""
            SELECT obs FROM ExpedienteObservacion obs
            JOIN FETCH obs.expediente e
            JOIN FETCH e.estudiante est
            JOIN FETCH est.usuario uEst
            JOIN FETCH e.tipoPractica tp
            JOIN FETCH obs.usuarioOrigen orig
            WHERE obs.subsanado = false
              AND e.activo = true
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:estado IS NULL OR e.estado = :estado)
              AND (:idEmpresa IS NULL OR e.empresa.id = :idEmpresa)
              AND (:idAsesor IS NULL OR e.asesor.id = :idAsesor)
            ORDER BY obs.fechaCreacion ASC
            """)
    List<ExpedienteObservacion> buscarObservacionesPendientes(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("estado") String estado,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idAsesor") Long idAsesor);

    @Query("""
            SELECT COUNT(e) FROM Expediente e
            WHERE e.activo = true AND e.estado <> 'CERRADO'
            """)
    long contarTotalExpedientesActivos();

    @Query("""
            SELECT COUNT(e) FROM Expediente e WHERE e.estado = 'CERRADO'
            """)
    long contarTotalExpedientesCerrados();

    @Query("""
            SELECT COUNT(obs) FROM ExpedienteObservacion obs
            WHERE obs.subsanado = false AND obs.expediente.activo = true
            """)
    long contarObservacionesPendientes();

    @Query("""
            SELECT COUNT(DISTINCT v.sede.id) FROM ValidacionSede v
            WHERE v.resultadoValidacion = 'APROBADA'
              AND :hoy BETWEEN v.fechaVigenciaDesde AND v.fechaVigenciaHasta
            """)
    long contarSedesValidadasVigentes(@Param("hoy") LocalDate hoy);

    @Query("""
            SELECT COUNT(c) FROM Convenio c
            WHERE c.activo = true AND c.vigente = true AND c.fechaFin >= :hoy
            """)
    long contarConveniosVigentes(@Param("hoy") LocalDate hoy);
}

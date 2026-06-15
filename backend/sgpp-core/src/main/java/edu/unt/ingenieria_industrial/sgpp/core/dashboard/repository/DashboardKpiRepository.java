package edu.unt.ingenieria_industrial.sgpp.core.dashboard.repository;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteEstado;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteObservacion;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.model.ControlPlazo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DashboardKpiRepository extends JpaRepository<Expediente, Long> {

    @Query("""
            SELECT tp.codigo, tp.nombre, COUNT(e),
                   SUM(CASE WHEN e.activo = true AND e.estado <> 'CERRADO' THEN 1 ELSE 0 END),
                   SUM(CASE WHEN e.estado = 'CERRADO' THEN 1 ELSE 0 END)
            FROM Expediente e
            JOIN e.tipoPractica tp
            LEFT JOIN e.empresa emp
            LEFT JOIN e.sedePractica sed
            LEFT JOIN e.asesor ases
            WHERE (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:estado IS NULL OR e.estado = :estado)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            GROUP BY tp.codigo, tp.nombre
            ORDER BY tp.codigo
            """)
    List<Object[]> contarExpedientesPorTipo(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("estado") String estado,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT e.id FROM Expediente e
            JOIN e.tipoPractica tp
            LEFT JOIN e.empresa emp
            LEFT JOIN e.sedePractica sed
            LEFT JOIN e.asesor ases
            WHERE (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:estado IS NULL OR e.estado = :estado)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            """)
    List<Long> idsExpedientesFiltrados(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("estado") String estado,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT ee FROM ExpedienteEstado ee
            JOIN FETCH ee.expediente e
            WHERE e.id IN :idsExpediente
            ORDER BY e.id, ee.fechaCambio ASC
            """)
    List<ExpedienteEstado> historialEstadosPorExpedientes(@Param("idsExpediente") List<Long> idsExpediente);

    @Query("""
            SELECT c.estado, COUNT(c) FROM ControlPlazo c
            JOIN c.expediente e
            JOIN e.tipoPractica tp
            LEFT JOIN e.empresa emp
            LEFT JOIN e.sedePractica sed
            LEFT JOIN e.asesor ases
            WHERE (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:estado IS NULL OR e.estado = :estado)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            GROUP BY c.estado
            """)
    List<Object[]> distribucionPlazosPorEstado(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("estado") String estado,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT rp.codigo, rp.nombre, c.estado, COUNT(c) FROM ControlPlazo c
            JOIN c.reglaPlazo rp
            JOIN c.expediente e
            JOIN e.tipoPractica tp
            LEFT JOIN e.empresa emp
            LEFT JOIN e.sedePractica sed
            LEFT JOIN e.asesor ases
            WHERE (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:estado IS NULL OR e.estado = :estado)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            GROUP BY rp.codigo, rp.nombre, c.estado
            """)
    List<Object[]> plazosPorReglaYEstado(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("estado") String estado,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT c FROM ControlPlazo c
            JOIN FETCH c.reglaPlazo rp
            JOIN FETCH c.expediente e
            WHERE c.estado IN ('VIGENTE', 'PROXIMO_A_VENCER')
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
            ORDER BY c.fechaLimite ASC
            """)
    List<ControlPlazo> plazosEnRiesgo(@Param("periodo") String periodo);

    @Query("""
            SELECT sed.id, sed.nombreSede, emp.razonSocial, sed.departamento, COUNT(e),
                   SUM(CASE WHEN e.activo = true AND e.estado <> 'CERRADO' THEN 1 ELSE 0 END)
            FROM Expediente e
            JOIN e.sedePractica sed
            JOIN sed.empresa emp
            JOIN e.tipoPractica tp
            LEFT JOIN e.asesor ases
            WHERE (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:estado IS NULL OR e.estado = :estado)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            GROUP BY sed.id, sed.nombreSede, emp.razonSocial, sed.departamento
            ORDER BY COUNT(e) DESC
            """)
    List<Object[]> distribucionPorSede(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("estado") String estado,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT COUNT(DISTINCT v.sede.id) FROM ValidacionSede v
            WHERE v.resultadoValidacion = 'APROBADA'
              AND :hoy BETWEEN v.fechaVigenciaDesde AND v.fechaVigenciaHasta
            """)
    long contarSedesValidadasVigentes(@Param("hoy") LocalDate hoy);

    @Query("""
            SELECT CASE WHEN EXISTS (
                SELECT 1 FROM ValidacionSede v
                WHERE v.sede.id = :idSede AND v.resultadoValidacion = 'APROBADA'
                  AND :hoy BETWEEN v.fechaVigenciaDesde AND v.fechaVigenciaHasta
            ) THEN true ELSE false END
            """)
    boolean sedeTieneValidacionVigente(@Param("idSede") Long idSede, @Param("hoy") LocalDate hoy);

    @Query("""
            SELECT emp.id, emp.ruc, emp.razonSocial, COUNT(e),
                   SUM(CASE WHEN e.activo = true AND e.estado <> 'CERRADO' THEN 1 ELSE 0 END)
            FROM Expediente e
            JOIN e.empresa emp
            JOIN e.tipoPractica tp
            LEFT JOIN e.sedePractica sed
            LEFT JOIN e.asesor ases
            WHERE emp IS NOT NULL
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:estado IS NULL OR e.estado = :estado)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            GROUP BY emp.id, emp.ruc, emp.razonSocial
            ORDER BY COUNT(e) DESC
            """)
    List<Object[]> rankingEmpresas(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("estado") String estado,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

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
    long conveniosVigentesPorEmpresa(@Param("idEmpresa") Long idEmpresa, @Param("hoy") LocalDate hoy);

    @Query("""
            SELECT obs.subsanado, COUNT(obs) FROM ExpedienteObservacion obs
            JOIN obs.expediente e
            JOIN e.tipoPractica tp
            LEFT JOIN e.empresa emp
            LEFT JOIN e.sedePractica sed
            LEFT JOIN e.asesor ases
            WHERE (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:estado IS NULL OR e.estado = :estado)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
              AND (:fechaDesde IS NULL OR CAST(e.fechaCreacion AS date) >= :fechaDesde)
              AND (:fechaHasta IS NULL OR CAST(e.fechaCreacion AS date) <= :fechaHasta)
            GROUP BY obs.subsanado
            """)
    List<Object[]> observacionesPorSubsanado(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("estado") String estado,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);

    @Query("""
            SELECT obs.tipo, COUNT(obs) FROM ExpedienteObservacion obs
            JOIN obs.expediente e
            JOIN e.tipoPractica tp
            LEFT JOIN e.empresa emp
            LEFT JOIN e.sedePractica sed
            LEFT JOIN e.asesor ases
            WHERE obs.subsanado = false
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
            GROUP BY obs.tipo
            """)
    List<Object[]> observacionesPendientesPorTipo(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor);

    @Query("""
            SELECT e.estado, COUNT(obs) FROM ExpedienteObservacion obs
            JOIN obs.expediente e
            JOIN e.tipoPractica tp
            WHERE obs.subsanado = false
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
            GROUP BY e.estado
            """)
    List<Object[]> observacionesPendientesPorEstadoExpediente(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica);

    @Query("""
            SELECT COUNT(obs) FROM ExpedienteObservacion obs
            JOIN obs.expediente e
            JOIN e.tipoPractica tp
            LEFT JOIN e.empresa emp
            LEFT JOIN e.sedePractica sed
            LEFT JOIN e.asesor ases
            WHERE obs.subsanado = false
              AND EXISTS (
                    SELECT 1 FROM ControlPlazo c
                    JOIN c.reglaPlazo rp
                    WHERE c.expediente.id = e.id
                      AND rp.codigo IN ('SUBSANACION_DOCUMENTO', 'SUBSANACION_PLAN')
                      AND c.estado = 'VENCIDO')
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
              AND (:tipoPractica IS NULL OR tp.codigo = :tipoPractica)
              AND (:idEmpresa IS NULL OR emp.id = :idEmpresa)
              AND (:idSede IS NULL OR sed.id = :idSede)
              AND (:idAsesor IS NULL OR ases.id = :idAsesor)
            """)
    long contarObservacionesVencidas(
            @Param("periodo") String periodo,
            @Param("tipoPractica") String tipoPractica,
            @Param("idEmpresa") Long idEmpresa,
            @Param("idSede") Long idSede,
            @Param("idAsesor") Long idAsesor);

    @Query("""
            SELECT COUNT(obs) FROM ExpedienteObservacion obs
            JOIN obs.expediente e
            WHERE obs.subsanado = false AND e.estado IN ('EN_REVISION', 'SUBSANADO')
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
            """)
    long contarObservacionesEnRevision(@Param("periodo") String periodo);

    @Query("""
            SELECT COUNT(obs) FROM ExpedienteObservacion obs
            JOIN obs.expediente e
            WHERE obs.subsanado = false
              AND EXISTS (
                    SELECT 1 FROM ControlPlazo c
                    JOIN c.reglaPlazo rp
                    WHERE c.expediente.id = e.id
                      AND rp.codigo IN ('SUBSANACION_DOCUMENTO', 'SUBSANACION_PLAN')
                      AND c.estado = 'PROXIMO_A_VENCER')
              AND (:periodo IS NULL OR e.periodoAcademico = :periodo)
            """)
    long contarObservacionesProximasAVencer(@Param("periodo") String periodo);
}

package edu.unt.ingenieria_industrial.sgpp.core.reporte.controller;

import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.service.ReporteService;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.CondicionSubsanacionFiltro;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoSalidaReporte;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoReporte;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/admin/reportes")
@RequiredArgsConstructor
@Tag(name = "Reportes Institucionales", description = "Módulo de reporting para Dirección, coordinación y comité de prácticas")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/resumen-ejecutivo")
    @Operation(summary = "Resumen ejecutivo para panel de monitoreo institucional")
    public ResponseEntity<ApiResponse<ResumenDashboardDTO>> resumenEjecutivo(
            @ModelAttribute ReporteFiltroDTO filtros) {
        ResumenDashboardDTO data = reporteService.obtenerResumenEjecutivo(filtros);
        return ok("Resumen ejecutivo generado", data);
    }

    @GetMapping("/expedientes-activos")
    @Operation(summary = "Reporte de expedientes activos en curso")
    public ResponseEntity<ApiResponse<ReporteResultadoDTO<ExpedienteActivoItemDTO>>> expedientesActivos(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("Reporte de expedientes activos generado",
                reporteService.generarExpedientesActivos(filtros));
    }

    @GetMapping("/expedientes-cerrados")
    @Operation(summary = "Reporte de expedientes cerrados satisfactoriamente")
    public ResponseEntity<ApiResponse<ReporteResultadoDTO<ExpedienteCerradoItemDTO>>> expedientesCerrados(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("Reporte de expedientes cerrados generado",
                reporteService.generarExpedientesCerrados(filtros));
    }

    @GetMapping("/practicas-por-tipo")
    @Operation(summary = "Reporte de prácticas clasificadas por tipo institucional")
    public ResponseEntity<ApiResponse<ReporteResultadoDTO<PracticaPorTipoItemDTO>>> practicasPorTipo(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("Reporte de prácticas por tipo generado",
                reporteService.generarPracticasPorTipo(filtros));
    }

    @GetMapping("/empresas-receptoras")
    @Operation(summary = "Reporte consolidado de empresas receptoras")
    public ResponseEntity<ApiResponse<ReporteResultadoDTO<EmpresaReceptoraItemDTO>>> empresasReceptoras(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("Reporte de empresas receptoras generado",
                reporteService.generarEmpresasReceptoras(filtros));
    }

    @GetMapping("/sedes-validadas")
    @Operation(summary = "Reporte de sedes validadas y habilitadas")
    public ResponseEntity<ApiResponse<ReporteResultadoDTO<SedeValidadaItemDTO>>> sedesValidadas(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("Reporte de sedes validadas generado",
                reporteService.generarSedesValidadas(filtros));
    }

    @GetMapping("/convenios-vigentes")
    @Operation(summary = "Reporte de convenios vigentes y su relación con expedientes")
    public ResponseEntity<ApiResponse<ReporteResultadoDTO<ConvenioVigenteItemDTO>>> conveniosVigentes(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("Reporte de convenios vigentes generado",
                reporteService.generarConveniosVigentes(filtros));
    }

    @GetMapping("/subsanaciones-pendientes")
    @Operation(summary = "Reporte de estudiantes con observaciones pendientes de subsanación")
    public ResponseEntity<ApiResponse<ReporteResultadoDTO<SubsanacionPendienteItemDTO>>> subsanacionesPendientes(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("Reporte de subsanaciones pendientes generado",
                reporteService.generarSubsanacionesPendientes(filtros));
    }

    @GetMapping("/{tipo}")
    @Operation(summary = "Generador genérico de reportes por tipo")
    public ResponseEntity<ApiResponse<ReporteResultadoDTO<?>>> generarPorTipo(
            @PathVariable TipoReporte tipo,
            @RequestParam(required = false) String periodoAcademico,
            @RequestParam(required = false) String codigoTipoPractica,
            @RequestParam(required = false) String estadoExpediente,
            @RequestParam(required = false) Long idEmpresa,
            @RequestParam(required = false) Long idSede,
            @RequestParam(required = false) Long idAsesor,
            @RequestParam(required = false) Long idComiteUsuario,
            @RequestParam(required = false) Boolean convenioVigente,
            @RequestParam(required = false) CondicionSubsanacionFiltro condicionSubsanacion,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false, defaultValue = "COMPLETO") FormatoSalidaReporte formato) {

        ReporteFiltroDTO filtros = ReporteFiltroDTO.builder()
                .periodoAcademico(periodoAcademico)
                .codigoTipoPractica(codigoTipoPractica)
                .estadoExpediente(estadoExpediente)
                .idEmpresa(idEmpresa)
                .idSede(idSede)
                .idAsesor(idAsesor)
                .idComiteUsuario(idComiteUsuario)
                .convenioVigente(convenioVigente)
                .condicionSubsanacion(condicionSubsanacion)
                .fechaDesde(fechaDesde)
                .fechaHasta(fechaHasta)
                .formato(formato)
                .build();

        return ok("Reporte " + tipo + " generado", reporteService.generarReporte(tipo, filtros));
    }

    private <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity.ok(ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build());
    }
}

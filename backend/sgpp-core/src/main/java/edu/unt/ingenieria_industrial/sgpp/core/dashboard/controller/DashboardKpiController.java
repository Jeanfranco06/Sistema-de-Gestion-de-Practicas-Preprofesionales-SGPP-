package edu.unt.ingenieria_industrial.sgpp.core.dashboard.controller;

import edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.dashboard.service.DashboardKpiService;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteFiltroDTO;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.CodigoKpi;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard KPIs", description = "Indicadores agregados para Dirección, coordinación y comité de prácticas")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class DashboardKpiController {

    private final DashboardKpiService dashboardKpiService;

    @GetMapping("/kpis")
    @Operation(summary = "Dashboard consolidado con todos los KPIs institucionales")
    public ResponseEntity<ApiResponse<DashboardKpiConsolidadoDTO>> dashboardConsolidado(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("Dashboard KPI consolidado generado",
                dashboardKpiService.obtenerDashboardConsolidado(filtros));
    }

    @GetMapping("/kpis/expedientes-por-tipo")
    @Operation(summary = "KPI: expedientes segmentados por tipo de práctica institucional")
    public ResponseEntity<ApiResponse<KpiResponseDTO<ExpedientesPorTipoKpiDTO>>> expedientesPorTipo(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("KPI expedientes por tipo", dashboardKpiService.kpiExpedientesPorTipo(filtros));
    }

    @GetMapping("/kpis/tiempos-aprobacion")
    @Operation(summary = "KPI: tiempos de aprobación basados en historial de estados")
    public ResponseEntity<ApiResponse<KpiResponseDTO<TiemposAprobacionKpiDTO>>> tiemposAprobacion(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("KPI tiempos de aprobación", dashboardKpiService.kpiTiemposAprobacion(filtros));
    }

    @GetMapping("/kpis/cumplimiento-plazos")
    @Operation(summary = "KPI: cumplimiento de plazos normativos del sistema")
    public ResponseEntity<ApiResponse<KpiResponseDTO<CumplimientoPlazosKpiDTO>>> cumplimientoPlazos(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("KPI cumplimiento de plazos", dashboardKpiService.kpiCumplimientoPlazos(filtros));
    }

    @GetMapping("/kpis/distribucion-sedes")
    @Operation(summary = "KPI: distribución de expedientes entre sedes validadas")
    public ResponseEntity<ApiResponse<KpiResponseDTO<DistribucionSedesKpiDTO>>> distribucionSedes(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("KPI distribución de sedes", dashboardKpiService.kpiDistribucionSedes(filtros));
    }

    @GetMapping("/kpis/empresas-recurrentes")
    @Operation(summary = "KPI: empresas receptoras con mayor concentración de practicantes")
    public ResponseEntity<ApiResponse<KpiResponseDTO<EmpresasRecurrentesKpiDTO>>> empresasRecurrentes(
            @ModelAttribute ReporteFiltroDTO filtros,
            @RequestParam(required = false, defaultValue = "10") Integer limite) {
        return ok("KPI empresas recurrentes",
                dashboardKpiService.kpiEmpresasRecurrentes(filtros, limite));
    }

    @GetMapping("/kpis/estado-observaciones")
    @Operation(summary = "KPI: estado de observaciones y subsanaciones del flujo documental")
    public ResponseEntity<ApiResponse<KpiResponseDTO<EstadoObservacionesKpiDTO>>> estadoObservaciones(
            @ModelAttribute ReporteFiltroDTO filtros) {
        return ok("KPI estado de observaciones", dashboardKpiService.kpiEstadoObservaciones(filtros));
    }

    @GetMapping("/kpis/{codigo}")
    @Operation(summary = "Obtener un KPI específico por código")
    public ResponseEntity<ApiResponse<KpiResponseDTO<?>>> kpiPorCodigo(
            @PathVariable CodigoKpi codigo,
            @ModelAttribute ReporteFiltroDTO filtros,
            @RequestParam(required = false) Integer limite) {
        return ok("KPI " + codigo, dashboardKpiService.kpiPorCodigo(codigo, filtros, limite));
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

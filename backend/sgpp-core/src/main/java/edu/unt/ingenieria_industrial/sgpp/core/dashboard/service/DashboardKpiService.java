package edu.unt.ingenieria_industrial.sgpp.core.dashboard.service;

import edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteFiltroDTO;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.CodigoKpi;

public interface DashboardKpiService {

    DashboardKpiConsolidadoDTO obtenerDashboardConsolidado(ReporteFiltroDTO filtros);

    KpiResponseDTO<ExpedientesPorTipoKpiDTO> kpiExpedientesPorTipo(ReporteFiltroDTO filtros);

    KpiResponseDTO<TiemposAprobacionKpiDTO> kpiTiemposAprobacion(ReporteFiltroDTO filtros);

    KpiResponseDTO<CumplimientoPlazosKpiDTO> kpiCumplimientoPlazos(ReporteFiltroDTO filtros);

    KpiResponseDTO<DistribucionSedesKpiDTO> kpiDistribucionSedes(ReporteFiltroDTO filtros);

    KpiResponseDTO<EmpresasRecurrentesKpiDTO> kpiEmpresasRecurrentes(ReporteFiltroDTO filtros, Integer limite);

    KpiResponseDTO<EstadoObservacionesKpiDTO> kpiEstadoObservaciones(ReporteFiltroDTO filtros);

    KpiResponseDTO<?> kpiPorCodigo(CodigoKpi codigo, ReporteFiltroDTO filtros, Integer limite);
}

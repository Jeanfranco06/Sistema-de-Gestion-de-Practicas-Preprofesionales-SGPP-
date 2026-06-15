package edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKpiConsolidadoDTO {

    private LocalDateTime generadoEn;
    private KpiResponseDTO<ExpedientesPorTipoKpiDTO> expedientesPorTipo;
    private KpiResponseDTO<TiemposAprobacionKpiDTO> tiemposAprobacion;
    private KpiResponseDTO<CumplimientoPlazosKpiDTO> cumplimientoPlazos;
    private KpiResponseDTO<DistribucionSedesKpiDTO> distribucionSedes;
    private KpiResponseDTO<EmpresasRecurrentesKpiDTO> empresasRecurrentes;
    private KpiResponseDTO<EstadoObservacionesKpiDTO> estadoObservaciones;
}

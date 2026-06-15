package edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TiemposAprobacionKpiDTO {

    private long expedientesAnalizados;
    private ResumenEstadistico aprobacionPlan;
    private ResumenEstadistico aprobacionExpediente;
    private List<DetalleEtapa> porEtapa;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumenEstadistico {
        private Double promedioDias;
        private Double medianaDias;
        private Integer minimoDias;
        private Integer maximoDias;
        private long muestras;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleEtapa {
        private String etapa;
        private String estadoInicio;
        private String estadoFin;
        private Double promedioDias;
        private Double medianaDias;
        private long muestras;
    }
}

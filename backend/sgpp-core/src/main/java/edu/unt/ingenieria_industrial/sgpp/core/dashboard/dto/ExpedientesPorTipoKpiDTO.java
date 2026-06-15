package edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpedientesPorTipoKpiDTO {

    private long totalExpedientes;
    private List<SegmentoTipoPractica> segmentos;
    private Map<String, Long> distribucionPorCodigo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SegmentoTipoPractica {
        private String codigoTipoPractica;
        private String nombreTipoPractica;
        private long cantidad;
        private double porcentaje;
        private long activos;
        private long cerrados;
    }
}

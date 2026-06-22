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
public class CumplimientoPlazosKpiDTO {

    private long totalPlazos;
    private long cumplidosEnPlazo;
    private long cumplidosFueraPlazo;
    private long vigentes;
    private long proximosAVencer;
    private long vencidos;
    private double tasaCumplimiento;
    private Map<String, Long> distribucionPorEstado;
    private List<DetalleRegla> porRegla;
    private List<CasoRiesgo> casosEnRiesgo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleRegla {
        private String codigoRegla;
        private String nombreRegla;
        private long total;
        private long cumplidos;
        private long vencidos;
        private double tasaCumplimiento;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CasoRiesgo {
        private Long idExpediente;
        private String codigoExpediente;
        private String codigoRegla;
        private String estadoPlazo;
        private String fechaLimite;
        private long diasRestantes;
    }
}

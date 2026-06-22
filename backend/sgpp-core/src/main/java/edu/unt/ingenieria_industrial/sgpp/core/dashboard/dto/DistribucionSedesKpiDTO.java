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
public class DistribucionSedesKpiDTO {

    private long totalExpedientesConSede;
    private long sedesConExpedientes;
    private long sedesValidadasVigentes;
    private List<SegmentoSede> segmentos;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SegmentoSede {
        private Long idSede;
        private String nombreSede;
        private String razonSocialEmpresa;
        private String departamento;
        private boolean sedeValidadaVigente;
        private long totalExpedientes;
        private long expedientesActivos;
        private double porcentaje;
    }
}

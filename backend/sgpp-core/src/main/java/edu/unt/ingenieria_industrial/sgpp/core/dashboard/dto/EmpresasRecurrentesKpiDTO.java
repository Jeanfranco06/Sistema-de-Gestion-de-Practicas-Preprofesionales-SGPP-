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
public class EmpresasRecurrentesKpiDTO {

    private long totalEmpresas;
    private List<RankingEmpresa> ranking;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankingEmpresa {
        private int posicion;
        private Long idEmpresa;
        private String ruc;
        private String razonSocial;
        private long totalExpedientes;
        private long expedientesActivos;
        private double porcentajeDelTotal;
        private List<String> tiposPracticaAtendidos;
        private long conveniosVigentes;
    }
}

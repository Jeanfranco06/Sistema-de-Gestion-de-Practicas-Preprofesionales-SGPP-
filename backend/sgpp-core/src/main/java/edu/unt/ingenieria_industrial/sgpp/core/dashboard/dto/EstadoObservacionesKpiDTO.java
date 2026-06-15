package edu.unt.ingenieria_industrial.sgpp.core.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadoObservacionesKpiDTO {

    private long totalObservaciones;
    private long pendientes;
    private long subsanadas;
    private long vencidas;
    private long enRevision;
    private long proximasAVencer;
    private Map<String, Long> distribucionPorTipo;
    private Map<String, Long> distribucionPorEstadoExpediente;
    private double tasaSubsanacion;
}

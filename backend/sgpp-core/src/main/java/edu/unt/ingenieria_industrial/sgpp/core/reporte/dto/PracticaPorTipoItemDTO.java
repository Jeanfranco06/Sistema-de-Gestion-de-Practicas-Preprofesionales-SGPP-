package edu.unt.ingenieria_industrial.sgpp.core.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticaPorTipoItemDTO {

    private String codigoTipoPractica;
    private String nombreTipoPractica;
    private Integer horasRequeridas;
    private long totalExpedientes;
    private long expedientesActivos;
    private long expedientesCerrados;
    private long enEjecucion;
    private long conObservaciones;
    private Map<String, Long> distribucionPorEstado;
}

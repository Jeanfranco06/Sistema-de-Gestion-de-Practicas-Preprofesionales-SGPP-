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
public class ResumenDashboardDTO {

    private long totalRegistros;
    private Map<String, Long> conteoPorEstado;
    private Map<String, Long> conteoPorTipoPractica;
    private Map<String, Long> conteoPorPeriodo;
    private long expedientesActivos;
    private long expedientesCerrados;
    private long subsanacionesPendientes;
    private long subsanacionesVencidas;
    private long conveniosVigentes;
    private long sedesValidadasVigentes;
}

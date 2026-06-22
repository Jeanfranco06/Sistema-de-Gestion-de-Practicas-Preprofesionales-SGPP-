package edu.unt.ingenieria_industrial.sgpp.core.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaReceptoraItemDTO {

    private Long idEmpresa;
    private String ruc;
    private String razonSocial;
    private String nombreComercial;
    private String sectorEconomico;
    private boolean validada;
    private long totalExpedientes;
    private long expedientesActivos;
    private List<String> tiposPracticaAtendidos;
    private long conveniosVigentes;
    private List<String> numerosConvenio;
    private long sedesAsociadas;
    private long sedesValidadasVigentes;
}

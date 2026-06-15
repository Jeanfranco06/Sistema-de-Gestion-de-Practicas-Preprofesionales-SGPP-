package edu.unt.ingenieria_industrial.sgpp.core.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvenioVigenteItemDTO {

    private Long idConvenio;
    private String numeroConvenio;
    private Long idEmpresa;
    private String razonSocialEmpresa;
    private String rucEmpresa;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private boolean vigente;
    private String estadoVigencia;
    private String objetivo;
    private long expedientesEnEjecucion;
    private long totalExpedientesAsociados;
}

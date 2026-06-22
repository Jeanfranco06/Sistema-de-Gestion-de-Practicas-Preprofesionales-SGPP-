package edu.unt.ingenieria_industrial.sgpp.core.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SedeValidadaItemDTO {

    private Long idSede;
    private String nombreSede;
    private String direccion;
    private String estadoSede;
    private Long idEmpresa;
    private String razonSocialEmpresa;
    private Long idValidacion;
    private String resultadoValidacion;
    private LocalDate fechaVigenciaDesde;
    private LocalDate fechaVigenciaHasta;
    private boolean vigente;
    private LocalDateTime fechaValidacion;
    private String validador;
    private long expedientesVinculados;
    private long expedientesActivos;
}

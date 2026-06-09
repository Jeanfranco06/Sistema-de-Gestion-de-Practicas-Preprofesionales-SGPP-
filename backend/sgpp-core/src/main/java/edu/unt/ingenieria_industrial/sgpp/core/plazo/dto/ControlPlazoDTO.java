package edu.unt.ingenieria_industrial.sgpp.core.plazo.dto;

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
public class ControlPlazoDTO {
    private Long id;
    private Long idExpediente;
    private String codigoExpediente;
    private Long idReglaPlazo;
    private String codigoRegla;
    private String nombreRegla;
    private Long idPlan;
    private Long idDocumento;
    private LocalDate fechaBase;
    private LocalDate fechaLimite;
    private LocalDateTime fechaCumplimiento;
    private String estado;
    private Boolean cumplidoEnPlazo;
    private String observacion;
    private long diasRestantes;
    private long diasTranscurridos;
    private LocalDateTime fechaCreacion;
}

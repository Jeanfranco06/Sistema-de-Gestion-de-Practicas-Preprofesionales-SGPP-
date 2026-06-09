package edu.unt.ingenieria_industrial.sgpp.core.practicas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpedienteDTO {
    private Long id;
    private Long idEstudiante;
    private String nombreEstudiante;
    private Long idTutorEmpresa;
    private String nombreTutorEmpresa;
    private String numeroExpediente;
    private LocalDate fechaApertura;
    private LocalDate fechaCierre;
    private String estado;
    private String observaciones;
    private Boolean activo;
}

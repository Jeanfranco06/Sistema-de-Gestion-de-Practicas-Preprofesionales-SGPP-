package edu.unt.ingenieria_industrial.sgpp.core.responsables.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignacionCoordinadorRequest {

    @NotNull(message = "El ID del docente coordinador es obligatorio")
    private Long idDocente;

    @NotBlank(message = "El periodo académico es obligatorio")
    private String periodoAcademico;

    @NotNull(message = "La fecha de designación es obligatoria")
    private LocalDate fechaDesignacion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private String resolucionDesignacion;

    private String observaciones;
}

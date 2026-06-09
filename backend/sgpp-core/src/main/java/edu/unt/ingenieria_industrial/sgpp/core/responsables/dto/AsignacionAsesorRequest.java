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
public class AsignacionAsesorRequest {

    @NotNull(message = "El ID del docente asesor es obligatorio")
    private Long idDocente;

    @NotNull(message = "El ID del estudiante es obligatorio")
    private Long idEstudiante;

    @NotBlank(message = "El código del tipo de práctica es obligatorio")
    private String codigoTipoPractica;

    @NotBlank(message = "El periodo académico es obligatorio")
    private String periodoAcademico;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private String resolucionDesignacion;
}

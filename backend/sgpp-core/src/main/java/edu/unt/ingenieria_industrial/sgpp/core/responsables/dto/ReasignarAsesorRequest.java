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
public class ReasignarAsesorRequest {

    @NotNull(message = "El ID de la asignación actual es obligatorio")
    private Long idAsignacionActual;

    @NotNull(message = "El ID del nuevo docente asesor es obligatorio")
    private Long idDocenteNuevo;

    @NotNull(message = "La fecha de la reasignación es obligatoria")
    private LocalDate fechaReasignacion;

    @NotBlank(message = "El motivo de la reasignación es obligatorio")
    private String motivoReasignacion;

    private String resolucionDesignacion;
}

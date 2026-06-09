package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.ComiteIntegrante;
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
public class ComiteIntegranteRequest {
    @NotNull(message = "El ID de usuario es obligatorio")
    private Long idUsuario;

    private Long idDocente;

    @NotNull(message = "El rol en el comité es obligatorio")
    private ComiteIntegrante.RolComite rolComite;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private String resolucionDesignacion;

    private String periodoAcademico;
}

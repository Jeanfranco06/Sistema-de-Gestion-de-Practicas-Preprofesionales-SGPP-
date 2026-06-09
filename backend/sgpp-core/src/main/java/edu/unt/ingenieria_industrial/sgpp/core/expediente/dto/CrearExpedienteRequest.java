package edu.unt.ingenieria_industrial.sgpp.core.expediente.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearExpedienteRequest {
    @NotNull
    private Long idEstudiante;

    @NotNull
    private Long idTipoPractica;

    @NotBlank
    private String condicionSolicitante;

    private String periodoAcademico;
}

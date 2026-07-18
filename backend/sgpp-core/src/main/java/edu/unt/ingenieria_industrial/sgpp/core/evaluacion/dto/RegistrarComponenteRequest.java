package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class RegistrarComponenteRequest {

    @NotNull
    private Long idExpediente;

    @NotBlank
    private String tipoComponente;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer puntaje;

    private String observaciones;
}

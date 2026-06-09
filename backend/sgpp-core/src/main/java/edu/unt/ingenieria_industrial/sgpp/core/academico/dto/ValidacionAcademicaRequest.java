package edu.unt.ingenieria_industrial.sgpp.core.academico.dto;

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
public class ValidacionAcademicaRequest {

    @NotNull(message = "El ID del estudiante es obligatorio")
    private Long estudianteId;

    @NotBlank(message = "El código del tipo de práctica es obligatorio")
    private String codigoTipoPractica;

    private String periodoAcademico;
}

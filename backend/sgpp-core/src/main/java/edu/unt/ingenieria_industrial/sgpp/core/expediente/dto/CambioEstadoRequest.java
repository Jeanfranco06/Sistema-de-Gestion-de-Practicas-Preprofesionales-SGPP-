package edu.unt.ingenieria_industrial.sgpp.core.expediente.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CambioEstadoRequest {
    @NotBlank
    private String estado;

    private String observacion;

    private String tipoCambio;
}

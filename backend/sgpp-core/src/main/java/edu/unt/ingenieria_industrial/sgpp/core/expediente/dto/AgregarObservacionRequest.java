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
public class AgregarObservacionRequest {
    @NotBlank
    private String descripcion;
}

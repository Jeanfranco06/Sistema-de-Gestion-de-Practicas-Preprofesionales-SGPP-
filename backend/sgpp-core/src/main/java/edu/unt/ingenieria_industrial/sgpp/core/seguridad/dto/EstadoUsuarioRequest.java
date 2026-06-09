package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadoUsuarioRequest {
    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "ACTIVO|INACTIVO|BLOQUEADO", message = "El estado debe ser ACTIVO, INACTIVO o BLOQUEADO")
    private String estado;
}

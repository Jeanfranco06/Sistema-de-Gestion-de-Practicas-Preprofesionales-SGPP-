package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

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
public class TutorEmpresaRequest {
    @NotNull(message = "El ID de usuario es obligatorio")
    private Long idUsuario;

    @NotNull(message = "El ID de empresa es obligatorio")
    private Long idEmpresa;

    private Long idSede;

    @NotBlank(message = "El cargo es obligatorio")
    private String cargo;

    private String area;

    private String empresaNombre;
}

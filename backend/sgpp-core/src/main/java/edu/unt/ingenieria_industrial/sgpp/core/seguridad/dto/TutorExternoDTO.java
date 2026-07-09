package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorExternoDTO {
    private Long id;

    @NotNull(message = "El usuario es requerido")
    private Long idUsuario;

    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String correo;
    private String telefono;

    private Long idEmpresa;
    private String razonSocialEmpresa;

    private Long idSede;
    private String nombreSede;

    @NotBlank(message = "El cargo es requerido")
    @Size(max = 100, message = "El cargo no puede exceder 100 caracteres")
    private String cargo;

    @Size(max = 100, message = "El área no puede exceder 100 caracteres")
    private String area;

    @Size(max = 200, message = "El nombre de empresa no puede exceder 200 caracteres")
    private String empresaNombre;

    private Boolean activo;

    private String estadoTutor;
}


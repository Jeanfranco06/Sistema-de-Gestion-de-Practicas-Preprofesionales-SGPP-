package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

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
    private String cargo;
    private String area;
    private String empresaNombre;
    private Boolean activo;
    private String estadoTutor;
}


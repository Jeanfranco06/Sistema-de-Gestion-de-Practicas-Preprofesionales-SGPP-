package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorEmpresaResponse {
    private Long id;
    private Long idUsuario;
    private String nombres;
    private String apellidos;
    private String email;
    private Long idEmpresa;
    private String empresaNombre;
    private Long idSede;
    private String sedeNombre;
    private String cargo;
    private String area;
    private String estadoTutor;
    private Boolean activo;
    private LocalDateTime fechaRegistro;
}

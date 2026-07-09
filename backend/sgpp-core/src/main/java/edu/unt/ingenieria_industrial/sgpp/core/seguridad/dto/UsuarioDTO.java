package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String username;
    private String email;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String numeroDocumento;
    private String tipoDocumento;
    private String telefono;
    private String tipoUsuario;
    private Boolean activo;
    private Boolean cuentaBloqueada;
    private java.util.List<String> roles;
    private String password;
    private String codigoMatricula;
    private String semestre;
    private String codigoDocente;
    private String categoria;
    private String especialidad;
    private String departamento;
    private Long idEmpresa;
    private Long idSede;
    private String empresaNombre;
    private String cargo;
    private String area;
}

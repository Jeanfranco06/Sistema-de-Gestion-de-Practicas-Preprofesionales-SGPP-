package edu.unt.ingenieria_industrial.sgpp.api.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long expiresIn;
    private UsuarioResponse usuario;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioResponse {
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
        private List<String> roles;
        private String codigoMatricula;
        private String semestre;
        private String codigoDocente;
        private String categoria;
        private String especialidad;
        private String departamento;
        private String empresaNombre;
        private String cargo;
        private String area;
    }
}


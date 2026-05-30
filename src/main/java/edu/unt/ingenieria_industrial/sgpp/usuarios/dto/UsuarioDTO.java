package edu.unt.ingenieria_industrial.sgpp.usuarios.dto;

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
    private Boolean activo;
    private Boolean cuentaBloqueada;
    private java.util.List<String> roles;
}

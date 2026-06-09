package edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumento;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDetalleResponse {
    private Long id;
    private String username;
    private String email;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String numeroDocumento;
    private TipoDocumento tipoDocumento;
    private String telefono;
    private String codigoInstitucional;
    private TipoUsuario tipoUsuario;
    private Boolean activo;
    private Boolean cuentaBloqueada;
    private LocalDateTime fechaUltimoAcceso;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaActualizacion;
    private List<RolDTO> roles;
    private EstudianteDTO estudiante;
    private DocenteDTO docente;
    private TutorExternoDTO tutorExterno;
}

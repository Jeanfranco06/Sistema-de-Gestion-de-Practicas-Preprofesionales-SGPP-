package edu.unt.ingenieria_industrial.sgpp.core.integridad.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoAuditoriaResponseDTO {

    private Long id;
    private String tipoEntidad;
    private Long entidadId;
    private Long idExpediente;
    private String codigoExpediente;
    private String accion;
    private String descripcionAccion;
    private Long idUsuario;
    private String usernameUsuario;
    private String nombreUsuario;
    private String rolUsuario;
    private LocalDateTime fechaHora;
    private String valorAnterior;
    private String valorNuevo;
    private String motivo;
    private String origen;
    private String resultado;
    private String ipOrigen;
    private String detalleAdicional;
    private Boolean cumplimientoPlazo;
    private Long idControlPlazo;
}

package edu.unt.ingenieria_industrial.sgpp.core.integridad.dto;

import edu.unt.ingenieria_industrial.sgpp.shared.enums.AccionAuditoria;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.OrigenAccionAuditoria;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.ResultadoOperacionAuditoria;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoEntidadAuditable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarEventoAuditoriaDTO {

    private TipoEntidadAuditable tipoEntidad;
    private Long entidadId;
    private Long idExpediente;
    private AccionAuditoria accion;
    private Long idUsuario;
    private Map<String, Object> valorAnterior;
    private Map<String, Object> valorNuevo;
    private String motivo;
    @Builder.Default
    private OrigenAccionAuditoria origen = OrigenAccionAuditoria.API;
    @Builder.Default
    private ResultadoOperacionAuditoria resultado = ResultadoOperacionAuditoria.EXITOSO;
    private String ipOrigen;
    private String detalleAdicional;
    private Boolean cumplimientoPlazo;
    private Long idControlPlazo;
}

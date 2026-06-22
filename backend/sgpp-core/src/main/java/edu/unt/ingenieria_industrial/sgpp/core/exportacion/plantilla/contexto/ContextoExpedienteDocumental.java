package edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla.contexto;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ContextoExpedienteDocumental {
    private Expediente expediente;
    private Usuario solicitante;
    private List<String> miembrosComite;
    private String codigoTrazabilidad;
    private LocalDateTime fechaGeneracion;
    private String observacionesAdicionales;
}

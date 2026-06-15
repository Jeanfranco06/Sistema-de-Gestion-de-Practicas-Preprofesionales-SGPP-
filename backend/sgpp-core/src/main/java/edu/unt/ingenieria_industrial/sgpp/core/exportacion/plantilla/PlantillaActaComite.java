package edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.config.ExportacionProperties;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain.DocumentoRenderizable;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla.contexto.ContextoExpedienteDocumental;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.util.UsuarioAutenticadoHelper;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PlantillaActaComite implements PlantillaDocumento<ContextoExpedienteDocumental> {

    private final ExportacionProperties properties;

    @Override
    public TipoDocumentoInstitucional getTipoDocumento() {
        return TipoDocumentoInstitucional.ACTA_COMITE;
    }

    @Override
    public DocumentoRenderizable construir(ContextoExpedienteDocumental ctx) {
        Expediente e = ctx.getExpediente();

        Map<String, String> campos = new LinkedHashMap<>();
        campos.put("Expediente", e.getCodigoExpediente());
        campos.put("Estudiante", UsuarioAutenticadoHelper.nombreCompleto(e.getEstudiante().getUsuario()));
        campos.put("Tipo de práctica", e.getTipoPractica().getNombre());
        campos.put("Periodo", e.getPeriodoAcademico());
        campos.put("Estado actual", e.getEstado());
        campos.put("Empresa receptora", e.getEmpresa() != null ? e.getEmpresa().getRazonSocial() : "—");
        campos.put("Miembros del comité", ctx.getMiembrosComite() != null
                ? String.join(", ", ctx.getMiembrosComite()) : "—");
        campos.put("Secretario/a o responsable", UsuarioAutenticadoHelper.nombreCompleto(ctx.getSolicitante()));

        String acuerdos = ctx.getObservacionesAdicionales() != null
                ? ctx.getObservacionesAdicionales()
                : "Se deja constancia de la revisión documental y seguimiento del expediente conforme al reglamento de prácticas preprofesionales.";

        return DocumentoRenderizable.builder()
                .metadatos(DocumentoRenderizable.MetadatosDocumento.builder()
                        .titulo("ACTA DE COMITÉ DE PRÁCTICAS PREPROFESIONALES")
                        .institucion(properties.getNombreInstitucion())
                        .unidadAcademica(properties.getUnidadAcademica())
                        .tipoDocumento(TipoDocumentoInstitucional.ACTA_COMITE.name())
                        .periodoConsultado(e.getPeriodoAcademico())
                        .generadoPor(UsuarioAutenticadoHelper.nombreCompleto(ctx.getSolicitante()))
                        .fechaGeneracion(ctx.getFechaGeneracion())
                        .codigoTrazabilidad(ctx.getCodigoTrazabilidad())
                        .build())
                .secciones(List.of(
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .titulo("Datos del acta")
                                .tipo(DocumentoRenderizable.TipoSeccion.CAMPOS)
                                .campos(campos)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .titulo("Acuerdos y observaciones")
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(acuerdos)
                                .build()
                ))
                .build();
    }
}

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
public class PlantillaConstanciaCulminacion implements PlantillaDocumento<ContextoExpedienteDocumental> {

    private final ExportacionProperties properties;

    @Override
    public TipoDocumentoInstitucional getTipoDocumento() {
        return TipoDocumentoInstitucional.CONSTANCIA_CULMINACION;
    }

    @Override
    public DocumentoRenderizable construir(ContextoExpedienteDocumental ctx) {
        Expediente e = ctx.getExpediente();
        var estudiante = e.getEstudiante();
        var usuarioEst = estudiante.getUsuario();

        Map<String, String> campos = new LinkedHashMap<>();
        campos.put("Código expediente", e.getCodigoExpediente());
        campos.put("Estudiante / egresado", UsuarioAutenticadoHelper.nombreCompleto(usuarioEst));
        campos.put("Código estudiantil", estudiante.getCodigoEstudiantil());
        campos.put("Condición solicitante", e.getCondicionSolicitante());
        campos.put("Tipo de práctica", e.getTipoPractica().getNombre() + " (" + e.getTipoPractica().getCodigo() + ")");
        campos.put("Periodo académico", e.getPeriodoAcademico());
        campos.put("Empresa receptora", e.getEmpresa() != null ? e.getEmpresa().getRazonSocial() : "—");
        campos.put("Sede de práctica", e.getSedePractica() != null ? e.getSedePractica().getNombreSede() : "—");
        campos.put("Asesor académico", e.getAsesor() != null ? UsuarioAutenticadoHelper.nombreCompleto(e.getAsesor()) : "—");
        campos.put("Fecha inicio práctica", String.valueOf(e.getFechaInicioPractica()));
        campos.put("Fecha fin práctica", String.valueOf(e.getFechaFinPractica()));
        campos.put("Estado del trámite", e.getEstado());
        campos.put("Calificación final", e.getCalificacionFinal() != null ? e.getCalificacionFinal().toString() : "—");
        campos.put("Emitido por", UsuarioAutenticadoHelper.nombreCompleto(ctx.getSolicitante()));

        String cuerpo = """
                Por medio de la presente, la %s, a través de la %s, deja constancia \
                que el(la) estudiante/egresado(a) identificado(a) ha llevado y concluido \
                satisfactoriamente sus prácticas preprofesionales conforme al reglamento \
                vigente y al expediente administrativo correspondiente.

                La presente constancia se emite para los fines que el interesado estime convenientes.
                """.formatted(properties.getNombreInstitucion(), properties.getUnidadAcademica());

        return DocumentoRenderizable.builder()
                .metadatos(metaBase(ctx, "CONSTANCIA DE CULMINACIÓN DE PRÁCTICAS PREPROFESIONALES"))
                .secciones(List.of(
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .titulo("Datos del practicante y práctica")
                                .tipo(DocumentoRenderizable.TipoSeccion.CAMPOS)
                                .campos(campos)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .titulo("Texto institucional")
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(cuerpo)
                                .build()
                ))
                .build();
    }

    private DocumentoRenderizable.MetadatosDocumento metaBase(ContextoExpedienteDocumental ctx, String titulo) {
        return DocumentoRenderizable.MetadatosDocumento.builder()
                .titulo(titulo)
                .institucion(properties.getNombreInstitucion())
                .unidadAcademica(properties.getUnidadAcademica())
                .tipoDocumento(TipoDocumentoInstitucional.CONSTANCIA_CULMINACION.name())
                .periodoConsultado(ctx.getExpediente().getPeriodoAcademico())
                .generadoPor(UsuarioAutenticadoHelper.nombreCompleto(ctx.getSolicitante()))
                .fechaGeneracion(ctx.getFechaGeneracion())
                .codigoTrazabilidad(ctx.getCodigoTrazabilidad())
                .build();
    }
}

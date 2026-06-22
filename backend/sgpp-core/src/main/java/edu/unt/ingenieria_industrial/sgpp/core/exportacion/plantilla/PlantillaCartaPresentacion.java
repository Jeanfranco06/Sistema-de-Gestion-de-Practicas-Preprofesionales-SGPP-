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
public class PlantillaCartaPresentacion implements PlantillaDocumento<ContextoExpedienteDocumental> {

    private final ExportacionProperties properties;

    @Override
    public TipoDocumentoInstitucional getTipoDocumento() {
        return TipoDocumentoInstitucional.CARTA_PRESENTACION;
    }

    @Override
    public DocumentoRenderizable construir(ContextoExpedienteDocumental ctx) {
        Expediente e = ctx.getExpediente();
        var usuarioEst = e.getEstudiante().getUsuario();

        Map<String, String> campos = new LinkedHashMap<>();
        campos.put("Dirigido a", e.getEmpresa() != null ? e.getEmpresa().getRazonSocial() : "Empresa receptora");
        campos.put("Sede", e.getSedePractica() != null ? e.getSedePractica().getNombreSede() : "—");
        campos.put("Estudiante", UsuarioAutenticadoHelper.nombreCompleto(usuarioEst));
        campos.put("Código estudiantil", e.getEstudiante().getCodigoEstudiantil());
        campos.put("Tipo de práctica", e.getTipoPractica().getNombre());
        campos.put("Periodo académico", e.getPeriodoAcademico());
        campos.put("Expediente", e.getCodigoExpediente());
        campos.put("Asesor académico", e.getAsesor() != null ? UsuarioAutenticadoHelper.nombreCompleto(e.getAsesor()) : "—");
        campos.put("Emitido por", UsuarioAutenticadoHelper.nombreCompleto(ctx.getSolicitante()));

        String cuerpo = """
                Mediante la presente, la %s presenta al estudiante/egresado(a) identificado(a), \
                quien realizará prácticas preprofesionales en su institución conforme al convenio \
                o acuerdo vigente y al expediente administrativo %s.

                Se solicita la acogida y facilitación de las actividades programadas en el plan de trabajo.
                """.formatted(properties.getUnidadAcademica(), e.getCodigoExpediente());

        return DocumentoRenderizable.builder()
                .metadatos(DocumentoRenderizable.MetadatosDocumento.builder()
                        .titulo("CARTA DE PRESENTACIÓN")
                        .institucion(properties.getNombreInstitucion())
                        .unidadAcademica(properties.getUnidadAcademica())
                        .tipoDocumento(TipoDocumentoInstitucional.CARTA_PRESENTACION.name())
                        .periodoConsultado(e.getPeriodoAcademico())
                        .generadoPor(UsuarioAutenticadoHelper.nombreCompleto(ctx.getSolicitante()))
                        .fechaGeneracion(ctx.getFechaGeneracion())
                        .codigoTrazabilidad(ctx.getCodigoTrazabilidad())
                        .build())
                .secciones(List.of(
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .titulo("Datos de presentación")
                                .tipo(DocumentoRenderizable.TipoSeccion.CAMPOS)
                                .campos(campos)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(cuerpo)
                                .build()
                ))
                .build();
    }
}

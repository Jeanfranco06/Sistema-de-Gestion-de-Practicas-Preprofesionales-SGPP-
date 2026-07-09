package edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.config.ExportacionProperties;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain.DocumentoRenderizable;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla.contexto.ContextoExpedienteDocumental;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.util.UsuarioAutenticadoHelper;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class PlantillaConstanciaCulminacion implements PlantillaDocumento<ContextoExpedienteDocumental> {

    private final ExportacionProperties properties;
    private static final DateTimeFormatter FECHA_CONSTANCIA = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", new Locale("es", "PE"));

    @Override
    public TipoDocumentoInstitucional getTipoDocumento() {
        return TipoDocumentoInstitucional.CONSTANCIA_CULMINACION;
    }

    @Override
    public DocumentoRenderizable construir(ContextoExpedienteDocumental ctx) {
        Expediente e = ctx.getExpediente();
        var estudiante = e.getEstudiante();
        var usuarioEst = estudiante.getUsuario();
        var empresa = e.getEmpresa();

        String nombreEstudiante = UsuarioAutenticadoHelper.nombreCompleto(usuarioEst);
        String dniEstudiante = usuarioEst.getNumeroDocumento();
        String codigoEstudiantil = estudiante.getCodigoEstudiantil();
        String razonSocialEmpresa = empresa != null ? empresa.getRazonSocial() : "Empresa receptora";
        String rucEmpresa = empresa != null ? empresa.getRuc() : "";
        String direccionEmpresa = empresa != null ? empresa.getDireccion() : "";
        String telefonoEmpresa = empresa != null ? empresa.getTelefono() : "";
        String emailEmpresa = empresa != null ? empresa.getEmail() : "";
        String fechaInicio = e.getFechaInicioPractica() != null ? e.getFechaInicioPractica().format(FECHA_CONSTANCIA) : "—";
        String fechaFin = e.getFechaFinPractica() != null ? e.getFechaFinPractica().format(FECHA_CONSTANCIA) : "la fecha";
        String calificacion = e.getCalificacionFinal() != null ? e.getCalificacionFinal().toString() : "—";
        String escuela = properties.getUnidadAcademica();
        String facultad = properties.getFacultad();
        String ciudad = properties.getCiudad();
        String fechaActual = LocalDate.now().format(FECHA_CONSTANCIA);
        String nombreDirector = properties.getDirectorNombre() != null ? properties.getDirectorNombre() : "Director de la Escuela";
        String dniDirector = properties.getDirectorDni() != null ? properties.getDirectorDni() : "";

        String parrafoConstancia = String.format(
                "%s, con R.U.C. %s, por medio del presente documento hace constar que el Sr. (Srta.):",
                razonSocialEmpresa, rucEmpresa);

        String parrafoDetalle = String.format(
                "realiza prácticas profesionales en la Empresa desde el %s a %s, "
                + "como requisito para la obtención del Título Profesional de la Escuela Profesional de %s, "
                + "Facultad de %s – Universidad Nacional de Trujillo.",
                fechaInicio, fechaFin, escuela, facultad);

        String parrafoEmision = "Se emite el presente documento a solicitud del (de la) interesado (a) para los fines que estime convenientes.";

        return DocumentoRenderizable.builder()
                .metadatos(DocumentoRenderizable.MetadatosDocumento.builder()
                        .titulo("CONSTANCIA DE PRÁCTICAS PROFESIONALES")
                        .institucion(properties.getNombreInstitucion())
                        .unidadAcademica(facultad + " / " + escuela)
                        .tipoDocumento(TipoDocumentoInstitucional.CONSTANCIA_CULMINACION.name())
                        .periodoConsultado(e.getPeriodoAcademico())
                        .generadoPor(UsuarioAutenticadoHelper.nombreCompleto(ctx.getSolicitante()))
                        .fechaGeneracion(ctx.getFechaGeneracion())
                        .codigoTrazabilidad(ctx.getCodigoTrazabilidad())
                        .build())
                .secciones(List.of(
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(ciudad + ", " + fechaActual)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(parrafoConstancia)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(nombreEstudiante.toUpperCase(Locale.ROOT)
                                        + "\nCon DNI: " + dniEstudiante)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(parrafoDetalle)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(parrafoEmision)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(ciudad + ", " + fechaActual)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(nombreDirector
                                        + "\nDIRECTOR\nDNI. " + dniDirector)
                                .build()
                ))
                .build();
    }
}

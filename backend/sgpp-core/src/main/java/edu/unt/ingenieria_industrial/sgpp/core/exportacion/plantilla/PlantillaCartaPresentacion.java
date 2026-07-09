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
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class PlantillaCartaPresentacion implements PlantillaDocumento<ContextoExpedienteDocumental> {

    private final ExportacionProperties properties;
    private static final DateTimeFormatter FECHA_CARTA = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", new Locale("es", "PE"));

    @Override
    public TipoDocumentoInstitucional getTipoDocumento() {
        return TipoDocumentoInstitucional.CARTA_PRESENTACION;
    }

    @Override
    public DocumentoRenderizable construir(ContextoExpedienteDocumental ctx) {
        Expediente e = ctx.getExpediente();
        var usuarioEst = e.getEstudiante().getUsuario();
        var empresa = e.getEmpresa();
        var tutor = e.getTutorEmpresa();

        String nombreEstudiante = UsuarioAutenticadoHelper.nombreCompleto(usuarioEst);
        String dniEstudiante = usuarioEst.getNumeroDocumento();
        String codigoEstudiantil = e.getEstudiante().getCodigoEstudiantil();
        String condicion = e.getCondicionSolicitante() != null ? e.getCondicionSolicitante() : "ESTUDIANTE";
        String razonSocialEmpresa = empresa != null ? empresa.getRazonSocial() : "Empresa receptora";
        String rucEmpresa = empresa != null ? empresa.getRuc() : "";
        String direccionEmpresa = empresa != null ? empresa.getDireccion() : "";
        String nombreDirector = properties.getDirectorNombre() != null ? properties.getDirectorNombre() : "Director de la Escuela";
        String dniDirector = properties.getDirectorDni() != null ? properties.getDirectorDni() : "";
        String telefonoEstudiante = usuarioEst.getTelefono() != null ? usuarioEst.getTelefono() : "";
        String emailEstudiante = usuarioEst.getEmail() != null ? usuarioEst.getEmail() : "";
        String codigoExpediente = e.getCodigoExpediente();
        String numeroCarta = properties.getPrefijoCartaPresentacion() + codigoExpediente;
        String fechaCarta = LocalDate.now().format(FECHA_CARTA);
        int horasMinimas = properties.getHorasMinimasPractica();
        String escuela = properties.getUnidadAcademica();
        String facultad = properties.getFacultad();
        String ciudad = properties.getCiudad();
        String rucInstitucion = properties.getRucInstitucion();
        String razonSocialInstitucion = properties.getRazonSocialInstitucion();
        String direccionInstitucion = properties.getDireccionInstitucion();

        String parrafoSaludo = String.format(
                "Es grato dirigirme a usted, para expresarle mi cordial saludo y, a la vez, presentarle al Sr.: %s, "
                + "identificado con D.N.I. %s %s, de la Facultad de %s – Universidad Nacional de Trujillo, "
                + "de la Escuela Profesional de %s, quien desea realizar sus Prácticas Profesionales en su empresa "
                + "(con RUC: %s) bajo la supervisión de un funcionario designado; a fin de complementar la formación "
                + "recibida en nuestra Casa Superior de Estudios. Esta modalidad formativa se desarrollará según lo "
                + "dispuesto en la Ley sobre Modalidades Formativas Laborales, Ley N° 28518.",
                nombreEstudiante, dniEstudiante, condicion.toUpperCase(Locale.ROOT),
                facultad, escuela, rucEmpresa);

        String parrafoPeriodo = String.format(
                "El periodo mínimo requerido por la Escuela de %s para la realización de Prácticas Profesionales "
                + "es de %d horas. Dichas Prácticas son requisito obligatorio para la obtención del Título Profesional "
                + "de Ingeniero(a) Industrial, recomendando que, a solicitud del interesado, se establezca un periodo "
                + "de al menos TRES MESES.",
                escuela, horasMinimas);

        String textoCierre = "Sin otro particular, quedo a su disposición.";

        String textoDespedida = "Atentamente:";

        String ccInstitucion = String.format(
                "UNIVERSIDAD NACIONAL DE TRUJILLO\n"
                + "Razón Social: %s\n"
                + "R.U.C.: %s\n"
                + "Representante: %s\n"
                + "Cargo: Director\n"
                + "D.N.I. %s\n"
                + "Dirección: %s\n"
                + "DATOS DEL POSTULANTE\n"
                + "E_mail: %s\n"
                + "Celular: %s",
                razonSocialInstitucion, rucInstitucion, nombreDirector, dniDirector,
                direccionInstitucion, emailEstudiante, telefonoEstudiante);

        String numRef = "N°" + numeroCarta;

        return DocumentoRenderizable.builder()
                .metadatos(DocumentoRenderizable.MetadatosDocumento.builder()
                        .titulo("CARTA DE PRESENTACIÓN")
                        .subtitulo(numRef + " – " + escuela)
                        .institucion(properties.getNombreInstitucion())
                        .unidadAcademica(facultad + " / " + escuela)
                        .tipoDocumento(TipoDocumentoInstitucional.CARTA_PRESENTACION.name())
                        .periodoConsultado(e.getPeriodoAcademico())
                        .generadoPor(UsuarioAutenticadoHelper.nombreCompleto(ctx.getSolicitante()))
                        .fechaGeneracion(ctx.getFechaGeneracion())
                        .codigoTrazabilidad(ctx.getCodigoTrazabilidad())
                        .logoIzquierdaPath(properties.getLogoIzquierdaPath())
                        .logoDerechaPath(properties.getLogoDerechaPath())
                        .marcaDeAguaPath(properties.getMarcaDeAguaPath())
                        .build())
                .secciones(List.of(
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(ciudad + ", " + fechaCarta)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto("Señor:\n" + razonSocialEmpresa + "\nPresente -")
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(parrafoSaludo)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(parrafoPeriodo)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(textoCierre)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(textoDespedida)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(nombreDirector + "\nDIRECTOR\nDNI. " + dniDirector)
                                .build(),
                        DocumentoRenderizable.SeccionDocumento.builder()
                                .titulo("Cc.")
                                .tipo(DocumentoRenderizable.TipoSeccion.TEXTO)
                                .contenidoTexto(ccInstitucion)
                                .build()
                ))
                .build();
    }
}

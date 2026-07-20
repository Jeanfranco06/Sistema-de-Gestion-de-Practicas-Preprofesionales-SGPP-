package edu.unt.ingenieria_industrial.sgpp.core.exportacion.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.plan.dto.PlanGeneralResponse;
import edu.unt.ingenieria_industrial.sgpp.core.plan.service.PlanGeneralService;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.config.ExportacionProperties;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.domain.DocumentoRenderizable;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.ArchivoExportadoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.GenerarDocumentoInternoRequest;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.RegistroGeneracionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.model.RegistroGeneracionDocumental;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla.PlantillaDocumentoRegistry;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla.PlantillaReporteConsolidado;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla.contexto.ContextoExpedienteDocumental;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.plantilla.contexto.ContextoReporteExportacion;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.repository.RegistroGeneracionDocumentalRepository;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.render.RenderizadorDocumentoFactory;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.service.ExportacionService;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.util.UsuarioAutenticadoHelper;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.RegistrarEventoAuditoriaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.service.AuditoriaTransaccionalService;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.Expediente;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteComite;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteDocumento;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteComiteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteDocumentoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteFiltroDTO;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteResultadoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.service.ReporteService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoExportacion;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.AccionAuditoria;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoEntidadAuditable;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoReporte;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import java.awt.Color;
import java.util.HexFormat;
import java.util.UUID;
import java.util.stream.Collectors;

import java.awt.Color;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportacionServiceImpl implements ExportacionService {

    private static final DateTimeFormatter SUFIJO_ARCHIVO = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final ReporteService reporteService;
    private final PlantillaReporteConsolidado plantillaReporte;
    private final PlantillaDocumentoRegistry plantillaRegistry;
    private final RenderizadorDocumentoFactory renderizadorFactory;
    private final RegistroGeneracionDocumentalRepository registroRepository;
    private final ExpedienteRepository expedienteRepository;
    private final ExpedienteComiteRepository comiteRepository;
    private final ExpedienteDocumentoRepository expedienteDocumentoRepository;
    private final ExportacionProperties properties;
    private final UsuarioAutenticadoHelper usuarioHelper;
    private final AuditoriaTransaccionalService auditoriaService;
    private final ObjectMapper objectMapper;
    private final PlanGeneralService planGeneralService;

    @Override
    @Transactional
    public ArchivoExportadoDTO exportarReporte(TipoReporte tipoReporte, FormatoExportacion formato, ReporteFiltroDTO filtros) {
        validarFormatoReporte(formato);

        ReporteResultadoDTO<?> reporte = reporteService.generarReporte(tipoReporte, filtros);
        Usuario solicitante = usuarioHelper.obtenerUsuarioActual();
        LocalDateTime ahora = LocalDateTime.now();
        String codigoTrazabilidad = generarCodigoTrazabilidad("RPT");

        ContextoReporteExportacion contexto = ContextoReporteExportacion.builder()
                .reporte(reporte)
                .filtros(filtros)
                .nombreSolicitante(UsuarioAutenticadoHelper.nombreCompleto(solicitante))
                .periodoConsultado(extraerPeriodo(filtros))
                .filtrosDescripcion(describirFiltros(filtros))
                .codigoTrazabilidad(codigoTrazabilidad)
                .fechaGeneracion(ahora)
                .build();

        DocumentoRenderizable documento = plantillaReporte.construir(contexto);
        return procesarGeneracion(
                documento,
                formato,
                TipoDocumentoInstitucional.REPORTE_EXPORTADO,
                tipoReporte,
                null,
                solicitante,
                filtros,
                codigoTrazabilidad,
                ahora,
                construirNombreArchivo("reporte_" + tipoReporte.name().toLowerCase(), formato));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ArchivoExportadoDTO generarDocumentoInterno(GenerarDocumentoInternoRequest request) {
        if (request.getTipoDocumento() == TipoDocumentoInstitucional.REPORTE_EXPORTADO) {
            throw new BusinessException("Use el endpoint de exportación de reportes para este tipo documental");
        }

        Expediente expediente = expedienteRepository.findByIdWithRelations(request.getIdExpediente())
                .orElseThrow(() -> new BusinessException("Expediente no encontrado"));

        validarDocumentoExpediente(request.getTipoDocumento(), expediente);

        Usuario solicitante = usuarioHelper.obtenerUsuarioActual();
        LocalDateTime ahora = LocalDateTime.now();
        String codigoTrazabilidad = generarCodigoTrazabilidad("DOC");

        List<String> miembrosComite = comiteRepository.findByExpedienteIdAndActivoTrue(expediente.getId()).stream()
                .map(ExpedienteComite::getUsuario)
                .map(UsuarioAutenticadoHelper::nombreCompleto)
                .toList();

        ContextoExpedienteDocumental contexto = ContextoExpedienteDocumental.builder()
                .expediente(expediente)
                .solicitante(solicitante)
                .miembrosComite(miembrosComite)
                .codigoTrazabilidad(codigoTrazabilidad)
                .fechaGeneracion(ahora)
                .observacionesAdicionales(request.getObservacionesAdicionales())
                .build();

        var plantilla = plantillaRegistry.obtener(request.getTipoDocumento());
        DocumentoRenderizable documento = plantilla.construir(contexto);

        ArchivoExportadoDTO archivo = procesarGeneracion(
                documento,
                FormatoExportacion.PDF,
                request.getTipoDocumento(),
                null,
                expediente,
                solicitante,
                null,
                codigoTrazabilidad,
                ahora,
                construirNombreArchivo(request.getTipoDocumento().name().toLowerCase()
                        + "_" + expediente.getCodigoExpediente(), FormatoExportacion.PDF));

        vincularExpedienteDocumento(expediente, request.getTipoDocumento(), archivo, solicitante);
        return archivo;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistroGeneracionDTO> consultarHistorial(Long idExpediente, Long idUsuario) {
        List<RegistroGeneracionDocumental> registros;
        if (idExpediente != null) {
            registros = registroRepository.findByExpedienteIdOrderByFechaGeneracionDesc(idExpediente);
        } else if (idUsuario != null) {
            registros = registroRepository.findByUsuarioSolicitanteIdOrderByFechaGeneracionDesc(idUsuario);
        } else {
            registros = registroRepository.findAll();
        }
        return registros.stream().map(this::toDto).toList();
    }

    private ArchivoExportadoDTO procesarGeneracion(
            DocumentoRenderizable documento,
            FormatoExportacion formato,
            TipoDocumentoInstitucional tipoDocumento,
            TipoReporte tipoReporte,
            Expediente expediente,
            Usuario solicitante,
            ReporteFiltroDTO filtros,
            String codigoTrazabilidad,
            LocalDateTime fechaGeneracion,
            String nombreArchivo) {

        byte[] contenido = renderizadorFactory.obtener(formato).renderizar(documento);
        String hash = calcularHash(contenido);
        Path ruta = persistirArchivo(nombreArchivo, contenido);

        RegistroGeneracionDocumental registro = RegistroGeneracionDocumental.builder()
                .tipoDocumento(tipoDocumento.name())
                .formatoSalida(formato.name())
                .nombreArchivo(nombreArchivo)
                .rutaArchivo(ruta.toString())
                .usuarioSolicitante(solicitante)
                .expediente(expediente)
                .tipoReporte(tipoReporte != null ? tipoReporte.name() : null)
                .filtrosAplicados(serializarFiltros(filtros))
                .hashContenido(hash)
                .tamanoBytes((long) contenido.length)
                .fechaGeneracion(fechaGeneracion)
                .observaciones("Generación documental SGPP - " + codigoTrazabilidad)
                .build();
        registro = registroRepository.save(registro);

        auditoriaService.registrar(RegistrarEventoAuditoriaDTO.builder()
                .tipoEntidad(tipoDocumento == TipoDocumentoInstitucional.REPORTE_EXPORTADO
                        ? TipoEntidadAuditable.REPORTE : TipoEntidadAuditable.DOCUMENTO)
                .entidadId(registro.getId())
                .idExpediente(expediente != null ? expediente.getId() : null)
                .accion(AccionAuditoria.GENERAR_DOCUMENTO)
                .idUsuario(solicitante.getId())
                .valorNuevo(Map.of(
                        "nombreArchivo", nombreArchivo,
                        "formato", formato.name(),
                        "tipoDocumento", tipoDocumento.name(),
                        "hash", hash))
                .motivo("Generación documental institucional")
                .detalleAdicional(codigoTrazabilidad)
                .build());

        return ArchivoExportadoDTO.builder()
                .idRegistro(registro.getId())
                .nombreArchivo(nombreArchivo)
                .contentType(formato == FormatoExportacion.PDF ? "application/pdf" : "text/csv; charset=UTF-8")
                .formato(formato)
                .tipoDocumento(tipoDocumento)
                .tipoReporte(tipoReporte)
                .idExpediente(expediente != null ? expediente.getId() : null)
                .codigoTrazabilidad(codigoTrazabilidad)
                .tamanoBytes((long) contenido.length)
                .fechaGeneracion(fechaGeneracion)
                .contenido(contenido)
                .build();
    }

    private void vincularExpedienteDocumento(
            Expediente expediente, TipoDocumentoInstitucional tipo,
            ArchivoExportadoDTO archivo, Usuario usuario) {

        ExpedienteDocumento doc = ExpedienteDocumento.builder()
                .expediente(expediente)
                .tipoDocumento(tipo.name())
                .nombreArchivo(archivo.getNombreArchivo())
                .rutaArchivo(archivo.getIdRegistro() != null ? "registro:" + archivo.getIdRegistro() : null)
                .usuario(usuario)
                .observaciones("Generado por módulo de exportación documental - " + archivo.getCodigoTrazabilidad())
                .build();
        expedienteDocumentoRepository.save(doc);
    }

    private void validarFormatoReporte(FormatoExportacion formato) {
        if (formato == null) {
            throw new BusinessException("Debe especificar el formato de exportación (PDF o CSV)");
        }
    }

    private void validarDocumentoExpediente(TipoDocumentoInstitucional tipo, Expediente expediente) {
        if (tipo == TipoDocumentoInstitucional.CONSTANCIA_CULMINACION
                && !"CERRADO".equals(expediente.getEstado())
                && !"EVALUADO".equals(expediente.getEstado())) {
            throw new BusinessException(
                    "La constancia de culminación requiere un expediente evaluado o cerrado. Estado actual: "
                            + expediente.getEstado());
        }
    }

    private Path persistirArchivo(String nombreArchivo, byte[] contenido) {
        try {
            Path dir = properties.resolverDirectorio();
            Files.createDirectories(dir);
            Path archivo = dir.resolve(nombreArchivo);
            Files.write(archivo, contenido);
            return archivo;
        } catch (IOException e) {
            throw new BusinessException("No se pudo persistir el archivo generado: " + e.getMessage());
        }
    }

    private String construirNombreArchivo(String prefijo, FormatoExportacion formato) {
        String extension = formato == FormatoExportacion.PDF ? "pdf" : "csv";
        return prefijo + "_" + LocalDateTime.now().format(SUFIJO_ARCHIVO) + "." + extension;
    }

    private String generarCodigoTrazabilidad(String prefijo) {
        return prefijo + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String calcularHash(byte[] contenido) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(contenido));
        } catch (NoSuchAlgorithmException e) {
            return null;
        }
    }

    private String serializarFiltros(ReporteFiltroDTO filtros) {
        if (filtros == null) return null;
        try {
            return objectMapper.writeValueAsString(filtros);
        } catch (JsonProcessingException e) {
            return filtros.toString();
        }
    }

    private String extraerPeriodo(ReporteFiltroDTO filtros) {
        return filtros != null && filtros.getPeriodoAcademico() != null
                ? filtros.getPeriodoAcademico() : "Todos los periodos";
    }

    private String describirFiltros(ReporteFiltroDTO filtros) {
        if (filtros == null) return "Sin filtros adicionales";
        StringBuilder sb = new StringBuilder();
        agregarFiltro(sb, "Periodo", filtros.getPeriodoAcademico());
        agregarFiltro(sb, "Tipo práctica", filtros.getCodigoTipoPractica());
        agregarFiltro(sb, "Estado", filtros.getEstadoExpediente());
        agregarFiltro(sb, "Empresa ID", filtros.getIdEmpresa());
        agregarFiltro(sb, "Sede ID", filtros.getIdSede());
        agregarFiltro(sb, "Asesor ID", filtros.getIdAsesor());
        agregarFiltro(sb, "Comité usuario ID", filtros.getIdComiteUsuario());
        agregarFiltro(sb, "Convenio vigente", filtros.getConvenioVigente());
        agregarFiltro(sb, "Condición subsanación", filtros.getCondicionSubsanacion());
        agregarFiltro(sb, "Desde", filtros.getFechaDesde());
        agregarFiltro(sb, "Hasta", filtros.getFechaHasta());
        return sb.isEmpty() ? "Sin filtros adicionales" : sb.toString().trim();
    }

    private void agregarFiltro(StringBuilder sb, String nombre, Object valor) {
        if (valor != null) {
            sb.append(nombre).append(": ").append(valor).append("; ");
        }
    }

    private RegistroGeneracionDTO toDto(RegistroGeneracionDocumental r) {
        return RegistroGeneracionDTO.builder()
                .id(r.getId())
                .tipoDocumento(r.getTipoDocumento())
                .formatoSalida(r.getFormatoSalida())
                .nombreArchivo(r.getNombreArchivo())
                .rutaArchivo(r.getRutaArchivo())
                .idUsuarioSolicitante(r.getUsuarioSolicitante().getId())
                .nombreSolicitante(UsuarioAutenticadoHelper.nombreCompleto(r.getUsuarioSolicitante()))
                .idExpediente(r.getExpediente() != null ? r.getExpediente().getId() : null)
                .tipoReporte(r.getTipoReporte())
                .filtrosAplicados(r.getFiltrosAplicados())
                .hashContenido(r.getHashContenido())
                .tamanoBytes(r.getTamanoBytes())
                .fechaGeneracion(r.getFechaGeneracion())
                .observaciones(r.getObservaciones())
                .build();
    }

    @Override
    public byte[] generarPlanGeneralPdf(Long planId) {
        PlanGeneralResponse plan = planGeneralService.findById(planId);
        if (plan == null) {
            throw new BusinessException("Plan General no encontrado: " + planId);
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            com.lowagie.text.Font font = FontFactory.getFont(FontFactory.HELVETICA, 10);
            com.lowagie.text.Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            com.lowagie.text.Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            com.lowagie.text.Font fontSubTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            // Título
            document.add(new com.lowagie.text.Paragraph("UNIVERSIDAD NACIONAL DE TRUJILLO", fontTitle));
            document.add(new com.lowagie.text.Paragraph("FACULTAD DE INGENIERÍA INDUSTRIAL Y DE SISTEMAS", fontSubTitle));
            document.add(new com.lowagie.text.Paragraph("PLAN DE PRÁCTICAS PREPROFESIONALES (ANEXO 1)", fontSubTitle));
            document.add(new com.lowagie.text.Paragraph(" "));

            // Carátula
            if (plan.getCaratula() != null) {
                PdfPTable table = new PdfPTable(2);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{30, 70});
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Institución", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getCaratula().getInstitucion(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Nombre del Plan", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getCaratula().getNombrePlan(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Autor", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getCaratula().getAutor(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Asesor", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getCaratula().getAsesor(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Fecha", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getCaratula().getFecha() != null ? plan.getCaratula().getFecha().toString() : "", font)));
                document.add(table);
                document.add(new com.lowagie.text.Paragraph(" "));
            }

            // Datos de la empresa
            if (plan.getDatosEmpresa() != null) {
                document.add(new com.lowagie.text.Paragraph("2. DATOS DE LA EMPRESA O INSTITUCIÓN RECEPTORA", fontSubTitle));
                PdfPTable table = new PdfPTable(2);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{30, 70});
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Razón Social", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getDatosEmpresa().getRazonSocial(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Dirección", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getDatosEmpresa().getDireccion(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Representante Legal", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getDatosEmpresa().getRepresentanteLegal(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Teléfono", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getDatosEmpresa().getTelefono(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Correo", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getDatosEmpresa().getCorreo(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Celular", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getDatosEmpresa().getCelular(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Descripción General", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getDatosEmpresa().getDescripcionGeneral(), font)));
                document.add(table);
                document.add(new com.lowagie.text.Paragraph(" "));
            }

            // Área/Departamento
            if (plan.getAreaDepartamento() != null) {
                document.add(new com.lowagie.text.Paragraph("3. ÁREA, DEPARTAMENTO O SECCIÓN", fontSubTitle));
                PdfPTable table = new PdfPTable(2);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{30, 70});
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Área/Departamento", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getAreaDepartamento().getAreaDepartamento(), font)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Funcionario a Cargo", fontBold)));
                table.addCell(new PdfPCell(new com.lowagie.text.Phrase(plan.getAreaDepartamento().getFuncionarioACargo(), font)));
                document.add(table);
                document.add(new com.lowagie.text.Paragraph(" "));
            }

            // Situación Problemática
            if (plan.getSituacionProblematica() != null) {
                document.add(new com.lowagie.text.Paragraph("4. SITUACIÓN PROBLEMÁTICA", fontSubTitle));
                document.add(new com.lowagie.text.Paragraph(plan.getSituacionProblematica(), font));
                document.add(new com.lowagie.text.Paragraph(" "));
            }

            // Objetivos
            if (plan.getObjetivos() != null && !plan.getObjetivos().isEmpty()) {
                document.add(new com.lowagie.text.Paragraph("5. OBJETIVOS O LOGROS PREVISTOS", fontSubTitle));
                for (PlanGeneralResponse.ObjetivoResponse obj : plan.getObjetivos()) {
                    document.add(new com.lowagie.text.Paragraph(obj.getTipo() + ": " + obj.getDescripcion(), font));
                }
                document.add(new com.lowagie.text.Paragraph(" "));
            }

            // Técnicas y Procedimientos
            if (plan.getTecnicasProcedimientos() != null) {
                document.add(new com.lowagie.text.Paragraph("6. TÉCNICAS Y PROCEDIMIENTOS DE INGENIERÍA INDUSTRIAL", fontSubTitle));
                document.add(new com.lowagie.text.Paragraph(plan.getTecnicasProcedimientos(), font));
                document.add(new com.lowagie.text.Paragraph(" "));
            }

            // Teorías y Técnicas
            if (plan.getTeoriasTecnicas() != null && !plan.getTeoriasTecnicas().isEmpty()) {
                document.add(new com.lowagie.text.Paragraph("7. TEORÍAS Y TÉCNICAS APLICABLES", fontSubTitle));
                for (PlanGeneralResponse.TeoriaTecnicaResponse t : plan.getTeoriasTecnicas()) {
                    document.add(new com.lowagie.text.Paragraph("• " + t.getNombre() + ": " + t.getDescripcion(), font));
                }
                document.add(new com.lowagie.text.Paragraph(" "));
            }

            // Cronograma
            if (plan.getCronograma() != null && !plan.getCronograma().isEmpty()) {
                document.add(new com.lowagie.text.Paragraph("8. CRONOGRAMA DE ACTIVIDADES", fontSubTitle));
                PdfPTable table = new PdfPTable(7);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{5, 20, 15, 15, 15, 15, 15});
                String[] headers = {"#", "Actividad", "Inicio", "Fin", "Dur. (sem)", "Objetivo Esp.", "Orden"};
                for (String h : headers) {
                    PdfPCell cell = new PdfPCell(new com.lowagie.text.Phrase(h, fontBold));
                    cell.setBackgroundColor(new Color(211, 211, 211)); // Light gray
                    table.addCell(cell);
                }
                for (PlanGeneralResponse.ActividadResponse act : plan.getCronograma()) {
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(String.valueOf(act.getOrden()), font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(act.getActividad(), font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(act.getFechaInicioPrevista() != null ? act.getFechaInicioPrevista().toString() : "", font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(act.getFechaFinPrevista() != null ? act.getFechaFinPrevista().toString() : "", font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(act.getDuracionSemanas() != null ? String.valueOf(act.getDuracionSemanas()) : "", font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(act.getIdObjetivoEspecifico() != null ? String.valueOf(act.getIdObjetivoEspecifico()) : "", font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(String.valueOf(act.getOrden()), font)));
                }
                document.add(table);
                document.add(new com.lowagie.text.Paragraph(" "));
            }

            // Observaciones
            if (plan.getObservaciones() != null && !plan.getObservaciones().isEmpty()) {
                document.add(new com.lowagie.text.Paragraph("9. OBSERVACIONES", fontSubTitle));
                for (PlanGeneralResponse.ObservacionResponse obs : plan.getObservaciones()) {
                    document.add(new com.lowagie.text.Paragraph("[" + obs.getTipo() + "] " + obs.getDescripcion(), font));
                }
                document.add(new com.lowagie.text.Paragraph(" "));
            }

            // Historial
            if (plan.getHistorialEstados() != null && !plan.getHistorialEstados().isEmpty()) {
                document.add(new com.lowagie.text.Paragraph("10. HISTORIAL DE ESTADOS", fontSubTitle));
                PdfPTable table = new PdfPTable(5);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{15, 15, 25, 20, 25});
                String[] headers = {"Estado Ant.", "Estado Nuevo", "Usuario", "Fecha", "Observación"};
                for (String h : headers) {
                    PdfPCell cell = new PdfPCell(new com.lowagie.text.Phrase(h, fontBold));
                    cell.setBackgroundColor(new Color(211, 211, 211)); // Light gray
                    table.addCell(cell);
                }
                for (PlanGeneralResponse.HistorialEstadoResponse hist : plan.getHistorialEstados()) {
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(hist.getEstadoAnterior(), font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(hist.getEstadoNuevo(), font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(hist.getNombreUsuario(), font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(hist.getFechaCambio().toString(), font)));
                    table.addCell(new PdfPCell(new com.lowagie.text.Phrase(hist.getObservacion() != null ? hist.getObservacion() : "", font)));
                }
                document.add(table);
            }

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generando PDF del Plan General {}", planId, e);
            throw new BusinessException("Error generando PDF: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ArchivoExportadoDTO generarPlantillaInformeFinal(Long idExpediente) {
        Expediente expediente = null;
        if (idExpediente != null) {
            expediente = expedienteRepository.findByIdWithRelations(idExpediente)
                    .orElseThrow(() -> new BusinessException("Expediente no encontrado"));
        }

        Usuario solicitante = usuarioHelper.obtenerUsuarioActual();
        LocalDateTime ahora = LocalDateTime.now();
        String codigoTrazabilidad = generarCodigoTrazabilidad("PLT");
        byte[] contenido = construirPdfPlantillaInformeFinal(expediente);
        String hash = calcularHash(contenido);
        String nombreArchivo = "plantilla_informe_final"
                + (expediente != null ? "_" + expediente.getCodigoExpediente() : "")
                + "_" + ahora.format(SUFIJO_ARCHIVO) + ".pdf";
        Path ruta = persistirArchivo(nombreArchivo, contenido);

        RegistroGeneracionDocumental registro = RegistroGeneracionDocumental.builder()
                .tipoDocumento(TipoDocumentoInstitucional.PLANTILLA_INFORME_FINAL.name())
                .formatoSalida(FormatoExportacion.PDF.name())
                .nombreArchivo(nombreArchivo)
                .rutaArchivo(ruta.toString())
                .usuarioSolicitante(solicitante)
                .expediente(expediente)
                .hashContenido(hash)
                .tamanoBytes((long) contenido.length)
                .fechaGeneracion(ahora)
                .observaciones("Plantilla de informe final SGPP - " + codigoTrazabilidad)
                .build();
        registro = registroRepository.save(registro);

        auditoriaService.registrar(RegistrarEventoAuditoriaDTO.builder()
                .tipoEntidad(TipoEntidadAuditable.DOCUMENTO)
                .entidadId(registro.getId())
                .idExpediente(expediente != null ? expediente.getId() : null)
                .accion(AccionAuditoria.GENERAR_DOCUMENTO)
                .idUsuario(solicitante.getId())
                .valorNuevo(Map.of(
                        "nombreArchivo", nombreArchivo,
                        "formato", FormatoExportacion.PDF.name(),
                        "tipoDocumento", TipoDocumentoInstitucional.PLANTILLA_INFORME_FINAL.name(),
                        "hash", hash))
                .motivo("Generación de plantilla de informe final")
                .detalleAdicional(codigoTrazabilidad)
                .build());

        return ArchivoExportadoDTO.builder()
                .idRegistro(registro.getId())
                .nombreArchivo(nombreArchivo)
                .contentType("application/pdf")
                .formato(FormatoExportacion.PDF)
                .tipoDocumento(TipoDocumentoInstitucional.PLANTILLA_INFORME_FINAL)
                .idExpediente(expediente != null ? expediente.getId() : null)
                .codigoTrazabilidad(codigoTrazabilidad)
                .tamanoBytes((long) contenido.length)
                .fechaGeneracion(ahora)
                .contenido(contenido)
                .build();
    }

    private byte[] construirPdfPlantillaInformeFinal(Expediente expediente) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font font = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font fontSubTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            document.add(new Paragraph("UNIVERSIDAD NACIONAL DE TRUJILLO", fontTitle));
            document.add(new Paragraph("FACULTAD DE INGENIERÍA INDUSTRIAL Y DE SISTEMAS", fontSubTitle));
            document.add(new Paragraph("PLANTILLA DE INFORME FINAL DE PRÁCTICAS PREPROFESIONALES", fontSubTitle));
            document.add(new Paragraph(" "));

            if (expediente != null) {
                PdfPTable table = new PdfPTable(2);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{30, 70});
                table.addCell(new PdfPCell(new Phrase("Expediente", fontBold)));
                table.addCell(new PdfPCell(new Phrase(expediente.getCodigoExpediente(), font)));
                table.addCell(new PdfPCell(new Phrase("Estudiante", fontBold)));
                table.addCell(new PdfPCell(new Phrase(
                        (expediente.getEstudiante() != null && expediente.getEstudiante().getUsuario() != null
                                ? expediente.getEstudiante().getUsuario().getNombres() + " " + expediente.getEstudiante().getUsuario().getApellidoPaterno()
                                : ""), font)));
                table.addCell(new PdfPCell(new Phrase("Código", fontBold)));
                table.addCell(new PdfPCell(new Phrase(
                        (expediente.getEstudiante() != null ? expediente.getEstudiante().getCodigoEstudiantil() : ""), font)));
                table.addCell(new PdfPCell(new Phrase("Empresa", fontBold)));
                table.addCell(new PdfPCell(new Phrase(
                        (expediente.getEmpresa() != null ? expediente.getEmpresa().getRazonSocial() : ""), font)));
                table.addCell(new PdfPCell(new Phrase("Tipo de práctica", fontBold)));
                table.addCell(new PdfPCell(new Phrase(expediente.getTipoPractica() != null ? expediente.getTipoPractica().getNombre() : "", font)));
                document.add(table);
                document.add(new Paragraph(" "));
            }

            String[] secciones = {
                "1. PORTADA",
                "2. ÍNDICE",
                "3. RESUMEN EJECUTIVO",
                "4. INTRODUCCIÓN",
                "5. OBJETIVOS DE LA PRÁCTICA",
                "6. MARCO TEÓRICO",
                "7. DESCRIPCIÓN DE LA EMPRESA O INSTITUCIÓN",
                "8. ACTIVIDADES DESARROLLADAS",
                "9. RESULTADOS Y LOGROS OBTENIDOS",
                "10. ANÁLISIS DE DATOS (si aplica)",
                "11. CONCLUSIONES",
                "12. RECOMENDACIONES",
                "13. ANEXOS (evidencias, constancias, etc.)",
                "14. REFERENCIAS BIBLIOGRÁFICAS"
            };

            for (String seccion : secciones) {
                document.add(new Paragraph(seccion, fontSubTitle));
                document.add(new Paragraph("[Desarrolle esta sección de manera clara y concisa, siguiendo las indicaciones del asesor y el reglamento de prácticas de la Escuela.]", font));
                document.add(new Paragraph(" "));
            }

            document.add(new Paragraph("NOTA: Esta plantilla es un modelo orientativo. El estudiante debe completar cada sección con la información real de su práctica preprofesional y ajustarse a las directrices del asesor o comité evaluador.", font));

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            log.error("Error generando plantilla de informe final", e);
            throw new BusinessException("Error generando plantilla de informe final: " + e.getMessage());
        }
    }
}

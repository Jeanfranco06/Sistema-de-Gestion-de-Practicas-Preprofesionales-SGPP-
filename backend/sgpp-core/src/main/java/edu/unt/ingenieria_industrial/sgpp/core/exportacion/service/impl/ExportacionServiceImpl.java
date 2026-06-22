package edu.unt.ingenieria_industrial.sgpp.core.exportacion.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    @Transactional
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
}

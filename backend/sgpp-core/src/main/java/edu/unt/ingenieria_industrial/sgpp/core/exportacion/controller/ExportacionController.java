package edu.unt.ingenieria_industrial.sgpp.core.exportacion.controller;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.config.ExportacionProperties;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.ArchivoExportadoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.GenerarDocumentoInternoRequest;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.RegistroGeneracionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.model.RegistroGeneracionDocumental;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.repository.RegistroGeneracionDocumentalRepository;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.service.ExportacionService;
import edu.unt.ingenieria_industrial.sgpp.core.reporte.dto.ReporteFiltroDTO;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.FormatoExportacion;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoReporte;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/exportacion")
@RequiredArgsConstructor
@Tag(name = "Exportación Documental", description = "Renderización y exportación institucional a PDF/CSV y documentos internos")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class ExportacionController {

    private final ExportacionService exportacionService;
    private final RegistroGeneracionDocumentalRepository registroRepository;
    private final ExportacionProperties exportacionProperties;

    @GetMapping("/reportes/{tipoReporte}")
    @Operation(summary = "Exportar reporte consolidado a PDF o CSV")
    public ResponseEntity<byte[]> exportarReporte(
            @PathVariable TipoReporte tipoReporte,
            @RequestParam FormatoExportacion formato,
            @ModelAttribute ReporteFiltroDTO filtros) {

        ArchivoExportadoDTO archivo = exportacionService.exportarReporte(tipoReporte, formato, filtros);
        return respuestaArchivo(archivo);
    }

    @PostMapping("/documentos-internos")
    @Operation(summary = "Generar documento interno institucional (constancia, acta, carta)")
    public ResponseEntity<byte[]> generarDocumentoInterno(
            @Valid @RequestBody GenerarDocumentoInternoRequest request) {

        ArchivoExportadoDTO archivo = exportacionService.generarDocumentoInterno(request);
        return respuestaArchivo(archivo);
    }

    @GetMapping("/historial")
    @Operation(summary = "Consultar trazabilidad de documentos generados")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<List<RegistroGeneracionDTO>>> historial(
            @RequestParam(required = false) Long idExpediente,
            @RequestParam(required = false) Long idUsuario) {

        List<RegistroGeneracionDTO> historial = exportacionService.consultarHistorial(idExpediente, idUsuario);
        return ResponseEntity.ok(ApiResponse.<List<RegistroGeneracionDTO>>builder()
                .success(true)
                .message("Historial de generación documental")
                .data(historial)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/descargar/{id}")
    @Operation(summary = "Descargar documento generado por ID de registro")
    public ResponseEntity<Resource> descargarPorId(@PathVariable Long id) throws IOException {
        RegistroGeneracionDocumental registro = registroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de documento no encontrado"));

        Path directorioBase = exportacionProperties.resolverDirectorio().toAbsolutePath().normalize();
        if (registro.getRutaArchivo() == null || registro.getNombreArchivo() == null) {
            throw new BusinessException("El registro no contiene un archivo descargable");
        }
        Path rutaRegistrada = Paths.get(registro.getRutaArchivo());
        Path archivoPath = rutaRegistrada.isAbsolute()
                ? rutaRegistrada.toAbsolutePath().normalize()
                : directorioBase.resolve(registro.getNombreArchivo()).normalize();
        if (!archivoPath.startsWith(directorioBase)) {
            throw new BusinessException("Ruta de documento inválida");
        }

        Resource resource = new UrlResource(archivoPath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new BusinessException("Archivo no encontrado o no accesible");
        }

        String contentType = "PDF".equals(registro.getFormatoSalida()) ? "application/pdf" : "text/csv";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + registro.getNombreArchivo() + "\"")
                .body(resource);
    }

    private ResponseEntity<byte[]> respuestaArchivo(ArchivoExportadoDTO archivo) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + archivo.getNombreArchivo() + "\"")
                .header("X-SGPP-Trazabilidad", archivo.getCodigoTrazabilidad())
                .header("X-SGPP-Registro-Id", String.valueOf(archivo.getIdRegistro()))
                .contentType(MediaType.parseMediaType(archivo.getContentType()))
                .body(archivo.getContenido());
    }
}

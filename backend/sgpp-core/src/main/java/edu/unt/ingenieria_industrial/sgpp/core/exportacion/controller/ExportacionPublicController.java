package edu.unt.ingenieria_industrial.sgpp.core.exportacion.controller;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.config.ExportacionProperties;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.model.RegistroGeneracionDocumental;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.repository.RegistroGeneracionDocumentalRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteAccesoService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/api/v1/exportacion")
@RequiredArgsConstructor
@Tag(name = "Exportación Documental", description = "Descarga de documentos generados con autorización por expediente")
public class ExportacionPublicController {

    private final RegistroGeneracionDocumentalRepository registroRepository;
    private final ExportacionProperties exportacionProperties;
    private final ExpedienteAccesoService expedienteAccesoService;
    private final CurrentUserService currentUserService;

    @GetMapping("/descargar/{id}")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    @Operation(summary = "Descargar documento generado por ID de registro")
    public ResponseEntity<Resource> descargarPorId(@PathVariable Long id) throws IOException {
        RegistroGeneracionDocumental registro = registroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de documento no encontrado"));

        if (registro.getExpediente() == null) {
            throw new RuntimeException("El documento no está asociado a un expediente");
        }
        expedienteAccesoService.verificarLectura(
                registro.getExpediente(),
                currentUserService.getCurrentUserId(),
                currentUserService.getCurrentRoles());

        log.info("Intentando descargar registro ID: {}, nombre archivo: {}, ruta: {}",
                id, registro.getNombreArchivo(), registro.getRutaArchivo());

        Path archivoPath = Paths.get(registro.getRutaArchivo());

        // Si la ruta es relativa, resolverla contra el directorio base de exportaciones
        if (!archivoPath.isAbsolute()) {
            Path directorioBase = exportacionProperties.resolverDirectorio();
            archivoPath = directorioBase.resolve(registro.getNombreArchivo());
            log.info("Ruta relativa detectada, usando directorio base: {}, ruta final: {}",
                    directorioBase, archivoPath);
        }

        Resource resource = new UrlResource(archivoPath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            log.error("Archivo no encontrado o no accesible: {}", archivoPath);
            // Intentar buscar el archivo por nombre en el directorio de exportaciones
            Path directorioBase = exportacionProperties.resolverDirectorio();
            if (Files.exists(directorioBase)) {
                Path archivoEncontrado = Files.walk(directorioBase)
                        .filter(p -> p.getFileName().toString().equals(registro.getNombreArchivo()))
                        .findFirst()
                        .orElse(null);

                if (archivoEncontrado != null) {
                    log.info("Archivo encontrado por búsqueda: {}", archivoEncontrado);
                    resource = new UrlResource(archivoEncontrado.toUri());
                } else {
                    throw new RuntimeException("Archivo no encontrado: " + registro.getNombreArchivo());
                }
            } else {
                throw new RuntimeException("Directorio de exportaciones no existe: " + directorioBase);
            }
        }

        String contentType = registro.getFormatoSalida().equals("PDF") ? "application/pdf" : "text/csv";

        log.info("Archivo encontrado y listo para descargar: {}", archivoPath);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + registro.getNombreArchivo() + "\"")
                .body(resource);
    }
}

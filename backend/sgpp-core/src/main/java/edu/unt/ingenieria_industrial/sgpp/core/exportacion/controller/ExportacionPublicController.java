package edu.unt.ingenieria_industrial.sgpp.core.exportacion.controller;

import edu.unt.ingenieria_industrial.sgpp.core.exportacion.config.ExportacionProperties;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.model.RegistroGeneracionDocumental;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.repository.RegistroGeneracionDocumentalRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteAccesoService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.CurrentUserService;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
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
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/exportacion")
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
    public ResponseEntity<Resource> descargarPorId(@PathVariable Long id) {
        RegistroGeneracionDocumental registro = registroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de documento no encontrado"));

        if (registro.getExpediente() == null) {
            throw new BusinessException("El documento no está asociado a un expediente");
        }

        Long currentUserId = currentUserService.getCurrentUserId();
        if (currentUserId == null) {
            throw new BusinessException("No se pudo identificar al usuario autenticado");
        }
        expedienteAccesoService.verificarLectura(
                registro.getExpediente(),
                currentUserId,
                currentUserService.getCurrentRoles());

        log.info("Intentando descargar registro ID: {}, nombre archivo: {}, ruta: {}",
                id, registro.getNombreArchivo(), registro.getRutaArchivo());

        Path directorioBase = exportacionProperties.resolverDirectorio().toAbsolutePath().normalize();
        if (registro.getRutaArchivo() == null || registro.getNombreArchivo() == null) {
            throw new ResourceNotFoundException("El registro no contiene un archivo descargable");
        }
        Path rutaRegistrada = Paths.get(registro.getRutaArchivo());
        // Los registros históricos guardaban rutas relativas al directorio de trabajo.
        // La descarga usa siempre el nombre persistido dentro de la raíz segura.
        Path archivoPath = rutaRegistrada.isAbsolute()
                ? rutaRegistrada.toAbsolutePath().normalize()
                : directorioBase.resolve(registro.getNombreArchivo()).normalize();
        if (!archivoPath.startsWith(directorioBase)) {
            throw new BusinessException("Ruta de documento institucional inválida");
        }

        try {
            Resource resource = new UrlResource(archivoPath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.error("Archivo no encontrado o no accesible: {}", archivoPath);
                throw new ResourceNotFoundException("Archivo institucional no encontrado: " + registro.getNombreArchivo());
            }

            String contentType = "PDF".equals(registro.getFormatoSalida()) ? "application/pdf" : "text/csv";

            log.info("Archivo encontrado y listo para descargar: {}", archivoPath);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + registro.getNombreArchivo() + "\"")
                    .body(resource);
        } catch (IOException e) {
            log.error("Error al leer el archivo institucional {}: {}", archivoPath, e.getMessage());
            throw new ResourceNotFoundException("No se pudo leer el archivo institucional: " + registro.getNombreArchivo());
        }
    }
}

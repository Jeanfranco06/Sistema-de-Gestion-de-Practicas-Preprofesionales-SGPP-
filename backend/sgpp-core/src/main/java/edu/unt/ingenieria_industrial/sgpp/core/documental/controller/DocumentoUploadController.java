package edu.unt.ingenieria_industrial.sgpp.core.documental.controller;

import edu.unt.ingenieria_industrial.sgpp.core.documental.service.FileStorageService;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.model.ExpedienteDocumento;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.repository.ExpedienteDocumentoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteAccesoService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.CurrentUserService;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/documentos")
@RequiredArgsConstructor
public class DocumentoUploadController {

    private final FileStorageService fileStorageService;
    private final ExpedienteDocumentoRepository expedienteDocumentoRepository;
    private final ExpedienteAccesoService expedienteAccesoService;
    private final CurrentUserService currentUserService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'SECRETARIA', 'COORDINADOR', 'DIRECTOR', 'ADMIN_SISTEMA')")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        validarArchivoPdf(file);
        String fileName = fileStorageService.storeFile(file);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/documentos/download/")
                .path(fileName)
                .toUriString();

        Map<String, String> response = new HashMap<>();
        response.put("fileName", fileName);
        response.put("fileDownloadUri", fileDownloadUri);
        response.put("fileType", file.getContentType());
        response.put("size", String.valueOf(file.getSize()));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/expediente/{idDocumento}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadExpedienteDocument(
            @PathVariable Long idDocumento, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long currentUserId = currentUserService.getCurrentUserId();
        if (currentUserId == null) {
            throw new BusinessException("No se pudo identificar al usuario autenticado");
        }

        ExpedienteDocumento documento = expedienteDocumentoRepository.findById(idDocumento)
                .orElseThrow(() -> new ResourceNotFoundException("Documento de expediente no encontrado"));
        expedienteAccesoService.verificarLectura(
                documento.getExpediente(),
                currentUserId,
                currentUserService.getCurrentRoles());

        if (documento.getRutaArchivo() == null || documento.getRutaArchivo().startsWith("registro:")) {
            throw new BusinessException("El documento debe descargarse desde su registro institucional");
        }

        Resource resource = fileStorageService.loadFileAsResource(documento.getRutaArchivo());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + documento.getNombreArchivo() + "\"")
                .body(resource);
    }

    private void validarArchivoPdf(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("El archivo PDF debe tener un tamaño entre 1 byte y 10 MB");
        }
        String nombre = file.getOriginalFilename();
        if (nombre == null || !nombre.toLowerCase().endsWith(".pdf")) {
            throw new BusinessException("Solo se permiten archivos PDF");
        }
        try {
            byte[] encabezado = file.getInputStream().readNBytes(4);
            if (encabezado.length != 4 || encabezado[0] != '%' || encabezado[1] != 'P'
                    || encabezado[2] != 'D' || encabezado[3] != 'F') {
                throw new BusinessException("El contenido del archivo no corresponde a un PDF válido");
            }
        } catch (java.io.IOException e) {
            throw new BusinessException("No se pudo validar el archivo PDF", e);
        }
    }
}

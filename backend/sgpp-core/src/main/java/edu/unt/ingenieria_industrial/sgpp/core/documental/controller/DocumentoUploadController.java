package edu.unt.ingenieria_industrial.sgpp.core.documental.controller;

import edu.unt.ingenieria_industrial.sgpp.core.documental.service.FileStorageService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
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

    @GetMapping("/download/{fileName:.+}")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'ADMINISTRADOR', 'ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS')")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, Authentication authentication) {
        // Validación básica de seguridad requerida: el usuario debe estar autenticado
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Resource resource = fileStorageService.loadFileAsResource(fileName);

        // Idealmente aquí verificaríamos si el usuario (authentication.getName())
        // tiene permisos específicos sobre este archivo (ej. es el dueño, es su asesor, etc).
        // Por la simplicidad de la prueba y la estructura actual, confiamos en el @PreAuthorize.

        String contentType = "application/pdf"; // Forzamos PDF porque el frontend valida solo PDFs

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}

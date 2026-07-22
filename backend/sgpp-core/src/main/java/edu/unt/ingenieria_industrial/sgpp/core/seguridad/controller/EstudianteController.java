package edu.unt.ingenieria_industrial.sgpp.core.seguridad.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.EstudianteDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.EstudianteUpdateDTO;
import edu.unt.ingenieria_industrial.sgpp.core.documental.service.FileStorageService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.UsuarioService;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Locale;

@RestController
@RequestMapping("/estudiante")
@RequiredArgsConstructor
@Tag(name = "Gestión de Estudiantes", description = "Endpoints específicos para estudiantes")
public class EstudianteController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final FileStorageService fileStorageService;

    @PutMapping("/perfil-academico")
    @Operation(summary = "Actualizar información académica del estudiante")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<ApiResponse<EstudianteDTO>> actualizarPerfilAcademico(
            @Valid @RequestBody EstudianteUpdateDTO dto,
            Authentication authentication) {
        EstudianteDTO updated = usuarioService.actualizarPerfilAcademico(authentication.getName(), dto);
        return ResponseEntity.ok(
                ApiResponse.<EstudianteDTO>builder()
                        .success(true)
                        .message("Información académica actualizada exitosamente")
                        .data(updated)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/perfil-academico")
    @Operation(summary = "Obtener información académica del estudiante actual")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<ApiResponse<EstudianteDTO>> obtenerPerfilAcademico(
            Authentication authentication) {
        EstudianteDTO estudiante = usuarioService.obtenerPerfilAcademico(authentication.getName());
        return ResponseEntity.ok(
                ApiResponse.<EstudianteDTO>builder()
                        .success(true)
                        .data(estudiante)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping(value = "/foto-perfil", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Actualizar foto de perfil del estudiante")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> actualizarFotoPerfil(
            @RequestParam("foto") MultipartFile foto,
            Authentication authentication) {
        validarFotoPerfil(foto);
        Usuario usuario = usuarioRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        usuario.setFotoPerfil(fileStorageService.storeFile(foto));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                .success(true)
                .message("Foto de perfil actualizada exitosamente")
                .data(Map.of("fotoPerfil", usuario.getFotoPerfil()))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/foto-perfil")
    @Operation(summary = "Descargar foto de perfil del estudiante")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> obtenerFotoPerfil(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        if (usuario.getFotoPerfil() == null || usuario.getFotoPerfil().isBlank()) {
            throw new ResourceNotFoundException("El usuario no tiene una foto de perfil");
        }

        Resource resource = fileStorageService.loadFileAsResource(usuario.getFotoPerfil());
        return ResponseEntity.ok()
                .contentType(tipoContenidoFoto(usuario.getFotoPerfil()))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=300")
                .body(resource);
    }

    private void validarFotoPerfil(MultipartFile foto) {
        if (foto == null || foto.isEmpty() || foto.getSize() > 5 * 1024 * 1024) {
            throw new BusinessException("La foto debe tener un tamaño entre 1 byte y 5 MB");
        }
        String contentType = foto.getContentType();
        if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType) && !"image/webp".equals(contentType)) {
            throw new BusinessException("Solo se permiten imágenes JPG, PNG o WEBP");
        }
    }

    private MediaType tipoContenidoFoto(String nombreArchivo) {
        String nombre = nombreArchivo.toLowerCase(Locale.ROOT);
        if (nombre.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (nombre.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }
}

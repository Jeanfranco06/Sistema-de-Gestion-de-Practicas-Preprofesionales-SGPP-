package edu.unt.ingenieria_industrial.sgpp.core.seguridad.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.EstudianteDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.EstudianteUpdateDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/estudiante")
@RequiredArgsConstructor
@Tag(name = "Gestión de Estudiantes", description = "Endpoints específicos para estudiantes")
public class EstudianteController {

    private final UsuarioService usuarioService;

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
}

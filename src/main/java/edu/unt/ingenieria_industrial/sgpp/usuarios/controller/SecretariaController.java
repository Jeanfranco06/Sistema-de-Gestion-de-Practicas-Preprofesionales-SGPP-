package edu.unt.ingenieria_industrial.sgpp.usuarios.controller;

import edu.unt.ingenieria_industrial.sgpp.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.EstudianteDTO;
import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.ValidacionRequisitosDTO;
import edu.unt.ingenieria_industrial.sgpp.usuarios.service.SecretariaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/secretaria")
@RequiredArgsConstructor
@Tag(name = "Módulo de Secretaría", description = "Endpoints para la validación de requisitos y gestión de expedientes")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SECRETARIA')")
public class SecretariaController {

    private final SecretariaService secretariaService;

    @GetMapping("/estudiantes")
    @Operation(summary = "Listar todos los estudiantes para validación")
    public ResponseEntity<ApiResponse<List<EstudianteDTO>>> findAllEstudiantes() {
        List<EstudianteDTO> estudiantes = secretariaService.findAllEstudiantes();
        return ResponseEntity.ok(
                ApiResponse.<List<EstudianteDTO>>builder()
                        .success(true)
                        .data(estudiantes)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/estudiantes/{id}/validar")
    @Operation(summary = "Validar requisitos académicos de un estudiante")
    public ResponseEntity<ApiResponse<ValidacionRequisitosDTO>> validarRequisitos(@PathVariable Long id) {
        ValidacionRequisitosDTO validacion = secretariaService.validarRequisitos(id);
        return ResponseEntity.ok(
                ApiResponse.<ValidacionRequisitosDTO>builder()
                        .success(true)
                        .data(validacion)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/estudiantes/{id}/datos-academicos")
    @Operation(summary = "Actualizar datos académicos de un estudiante")
    public ResponseEntity<ApiResponse<EstudianteDTO>> updateDatosAcademicos(@PathVariable Long id, @Valid @RequestBody EstudianteDTO dto) {
        EstudianteDTO updated = secretariaService.updateDatosAcademicos(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<EstudianteDTO>builder()
                        .success(true)
                        .message("Datos académicos actualizados")
                        .data(updated)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}

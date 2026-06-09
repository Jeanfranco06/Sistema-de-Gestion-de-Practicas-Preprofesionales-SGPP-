package edu.unt.ingenieria_industrial.sgpp.core.seguridad.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.EstudianteDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ValidacionRequisitosDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.SecretariaService;
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
@Tag(name = "MÃ³dulo de SecretarÃ­a", description = "Endpoints para la validaciÃ³n de requisitos y gestiÃ³n de expedientes")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA')")
public class SecretariaController {

    private final SecretariaService secretariaService;

    @GetMapping("/estudiantes")
    @Operation(summary = "Listar todos los estudiantes para validaciÃ³n")
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
    @Operation(summary = "Validar requisitos acadÃ©micos de un estudiante")
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
    @Operation(summary = "Actualizar datos acadÃ©micos de un estudiante")
    public ResponseEntity<ApiResponse<EstudianteDTO>> updateDatosAcademicos(@PathVariable Long id, @Valid @RequestBody EstudianteDTO dto) {
        EstudianteDTO updated = secretariaService.updateDatosAcademicos(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<EstudianteDTO>builder()
                        .success(true)
                        .message("Datos acadÃ©micos actualizados")
                        .data(updated)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}


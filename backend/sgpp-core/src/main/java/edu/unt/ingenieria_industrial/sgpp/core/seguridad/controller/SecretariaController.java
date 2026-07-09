package edu.unt.ingenieria_industrial.sgpp.core.seguridad.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.EstudianteDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ValidacionRequisitosDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.SecretariaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA')")
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
    public ResponseEntity<ApiResponse<ValidacionRequisitosDTO>> validarRequisitos(
            @Parameter(description = "ID del estudiante a validar") @PathVariable Long id) {
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
    public ResponseEntity<ApiResponse<EstudianteDTO>> updateDatosAcademicos(
            @Parameter(description = "ID del estudiante") @PathVariable Long id,
            @Valid @RequestBody EstudianteDTO dto) {
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

    @PostMapping("/expediente/{expedienteId}/emitir-carta-presentacion")
    @Operation(summary = "Emitir carta de presentación")
    public ResponseEntity<ApiResponse<Void>> emitirCartaPresentacion(
            @Parameter(description = "ID del expediente") @PathVariable Long expedienteId,
            @Parameter(description = "ID del usuario que emite (extraído del token)") @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        secretariaService.emitirCartaPresentacion(expedienteId, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Carta de presentación emitida").timestamp(LocalDateTime.now()).build());
    }

    @PostMapping("/expediente/{expedienteId}/emitir-constancia")
    @Operation(summary = "Emitir constancia de culminación")
    public ResponseEntity<ApiResponse<Void>> emitirConstancia(
            @Parameter(description = "ID del expediente") @PathVariable Long expedienteId,
            @Parameter(description = "ID del usuario que emite (extraído del token)") @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        secretariaService.emitirConstancia(expedienteId, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Constancia de culminación emitida").timestamp(LocalDateTime.now()).build());
    }

    @PostMapping("/expediente/{expedienteId}/registrar-incidencia")
    @Operation(summary = "Registrar incidencia en el expediente")
    public ResponseEntity<ApiResponse<Void>> registrarIncidencia(
            @Parameter(description = "ID del expediente") @PathVariable Long expedienteId,
            @Parameter(description = "Descripción de la incidencia") @RequestParam String incidencia,
            @Parameter(description = "ID del usuario (extraído del token)") @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        secretariaService.registrarIncidencia(expedienteId, incidencia, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Incidencia registrada").timestamp(LocalDateTime.now()).build());
    }
}

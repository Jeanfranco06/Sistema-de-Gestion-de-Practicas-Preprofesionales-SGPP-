package edu.unt.ingenieria_industrial.sgpp.core.academico.controller;

import edu.unt.ingenieria_industrial.sgpp.core.academico.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.academico.service.ValidacionAcademicaService;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/validacion-academica")
@RequiredArgsConstructor
@Tag(name = "Validación Académica", description = "Verificación de elegibilidad académica del estudiante según tipo de práctica y normativa vigente")
public class ValidacionAcademicaController {

    private final ValidacionAcademicaService validacionAcademicaService;

    @PostMapping("/validar")
    @Operation(summary = "Ejecutar validación académica para un estudiante")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'COMITE_PRACTICAS', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ValidacionAcademicaResponse>> validarEstudiante(
            @Valid @RequestBody ValidacionAcademicaRequest request) {
        ValidacionAcademicaResponse response = validacionAcademicaService.validarEstudiante(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ValidacionAcademicaResponse>builder()
                        .success(true)
                        .data(response)
                        .message("Validación académica ejecutada exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/resultados/{id}")
    @Operation(summary = "Obtener un resultado de validación por ID")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'COMITE_PRACTICAS', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<ApiResponse<ValidacionAcademicaResponse>> obtenerResultado(
            @PathVariable Long id) {
        ValidacionAcademicaResponse response = validacionAcademicaService.obtenerResultadoPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<ValidacionAcademicaResponse>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/estudiantes/{estudianteId}/resultados")
    @Operation(summary = "Listar resultados de validación de un estudiante")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'COMITE_PRACTICAS', 'SECRETARIA') or "
            + "(hasRole('ESTUDIANTE') and #estudianteId == authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<ValidacionAcademicaResponse>>> listarResultadosPorEstudiante(
            @PathVariable Long estudianteId,
            Pageable pageable) {
        List<ValidacionAcademicaResponse> resultados = validacionAcademicaService
                .listarResultadosPorEstudiante(estudianteId);

        Page<ValidacionAcademicaResponse> page = new PageImpl<>(
                resultados.stream()
                        .skip(pageable.getOffset())
                        .limit(pageable.getPageSize())
                        .toList(),
                pageable, resultados.size());

        return ResponseEntity.ok(
                ApiResponse.<List<ValidacionAcademicaResponse>>builder()
                        .success(true)
                        .data(page.getContent())
                        .message("Página " + pageable.getPageNumber()
                                + " de " + page.getTotalPages()
                                + " | Total: " + page.getTotalElements())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/estudiantes/{estudianteId}/ultimo")
    @Operation(summary = "Obtener el último resultado de validación para un tipo de práctica")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'COMITE_PRACTICAS', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<ApiResponse<ValidacionAcademicaResponse>> obtenerUltimoResultado(
            @PathVariable Long estudianteId,
            @RequestParam String tipoPractica) {
        ValidacionAcademicaResponse response = validacionAcademicaService
                .obtenerUltimoResultado(estudianteId, tipoPractica);
        return ResponseEntity.ok(
                ApiResponse.<ValidacionAcademicaResponse>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/reglas")
    @Operation(summary = "Listar reglas de validación por tipo de práctica")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'COMITE_PRACTICAS')")
    public ResponseEntity<ApiResponse<List<ReglaValidacionDTO>>> listarReglas(
            @RequestParam String tipoPractica) {
        List<ReglaValidacionDTO> reglas = validacionAcademicaService
                .listarReglasPorTipoPractica(tipoPractica);
        return ResponseEntity.ok(
                ApiResponse.<List<ReglaValidacionDTO>>builder()
                        .success(true)
                        .data(reglas)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/normas")
    @Operation(summary = "Listar normas de validación activas")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'COMITE_PRACTICAS')")
    public ResponseEntity<ApiResponse<List<NormaValidacionDTO>>> listarNormas() {
        List<NormaValidacionDTO> normas = validacionAcademicaService.listarNormasActivas();
        return ResponseEntity.ok(
                ApiResponse.<List<NormaValidacionDTO>>builder()
                        .success(true)
                        .data(normas)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}

package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.controller;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.NotaUnidadRequestDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.NotaUnidadResponseDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.NotaUnidadService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.CurrentUserService;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
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
@RequestMapping("/evaluaciones/notas-unidad")
@RequiredArgsConstructor
@Tag(name = "Notas por Unidad", description = "Registro de notas por unidades para prácticas iniciales")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'COORDINADOR', 'DIRECTOR')")
public class NotaUnidadController {

    private final NotaUnidadService notaUnidadService;
    private final CurrentUserService currentUserService;

    @PostMapping("/expediente/{idExpediente}")
    @Operation(summary = "Registrar o actualizar nota de una unidad")
    public ResponseEntity<ApiResponse<NotaUnidadResponseDTO>> registrar(
            @PathVariable Long idExpediente,
            @Valid @RequestBody NotaUnidadRequestDTO request) {
        Long idEvaluador = currentUserService.getCurrentUserId();
        NotaUnidadResponseDTO dto = notaUnidadService.registrar(idExpediente, request, idEvaluador);
        return ResponseEntity.ok(ApiResponse.<NotaUnidadResponseDTO>builder()
                .success(true)
                .message("Nota de unidad registrada")
                .data(dto)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/expediente/{idExpediente}")
    @Operation(summary = "Listar notas por unidad de un expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<ApiResponse<List<NotaUnidadResponseDTO>>> listar(@PathVariable Long idExpediente) {
        List<NotaUnidadResponseDTO> notas = notaUnidadService.listarPorExpediente(idExpediente);
        return ResponseEntity.ok(ApiResponse.<List<NotaUnidadResponseDTO>>builder()
                .success(true).data(notas).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/expediente/{idExpediente}/unidad/{numeroUnidad}")
    @Operation(summary = "Obtener nota de una unidad específica")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<ApiResponse<NotaUnidadResponseDTO>> obtener(
            @PathVariable Long idExpediente,
            @PathVariable Integer numeroUnidad) {
        NotaUnidadResponseDTO dto = notaUnidadService.obtenerPorExpedienteYUnidad(idExpediente, numeroUnidad);
        return ResponseEntity.ok(ApiResponse.<NotaUnidadResponseDTO>builder()
                .success(true).data(dto).timestamp(LocalDateTime.now()).build());
    }
}

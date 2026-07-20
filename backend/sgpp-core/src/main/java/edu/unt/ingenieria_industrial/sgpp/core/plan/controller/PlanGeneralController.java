package edu.unt.ingenieria_industrial.sgpp.core.plan.controller;

import edu.unt.ingenieria_industrial.sgpp.core.plan.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.plan.service.PlanGeneralService;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/planes")
@RequiredArgsConstructor
@Tag(name = "Plan General de Práctica", description = "Gestión del Plan General de Prácticas Pre-Profesionales")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'ESTUDIANTE')")
public class PlanGeneralController {

    private final PlanGeneralService planService;

    @PostMapping
    @Operation(summary = "Registrar un nuevo Plan General (borrador)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<ApiResponse<PlanGeneralResponse>> registrar(
            @Valid @RequestBody RegistrarPlanRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        PlanGeneralResponse response = planService.registrar(request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<PlanGeneralResponse>builder()
                        .success(true).message("Plan General registrado en borrador")
                        .data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un Plan General en borrador")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<ApiResponse<PlanGeneralResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPlanRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        PlanGeneralResponse response = planService.actualizar(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<PlanGeneralResponse>builder()
                .success(true).message("Plan General actualizado").data(response)
                .timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/presentar")
    @Operation(summary = "Presentar el Plan General para revisión")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<ApiResponse<PlanGeneralResponse>> presentar(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        PlanGeneralResponse response = planService.presentar(id, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<PlanGeneralResponse>builder()
                .success(true).message("Plan General presentado").data(response)
                .timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/observar")
    @Operation(summary = "Observar el Plan General (requiere subsanación)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<PlanGeneralResponse>> observar(
            @PathVariable Long id,
            @Valid @RequestBody ObservarPlanRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        PlanGeneralResponse response = planService.observar(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<PlanGeneralResponse>builder()
                .success(true).message("Plan General observado").data(response)
                .timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/subsanar")
    @Operation(summary = "Subsanar observaciones del Plan General")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<ApiResponse<PlanGeneralResponse>> subsanar(
            @PathVariable Long id,
            @Valid @RequestBody SubsanarPlanRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        PlanGeneralResponse response = planService.subsanar(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<PlanGeneralResponse>builder()
                .success(true).message("Plan General subsanado y presentado").data(response)
                .timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/aprobar")
    @Operation(summary = "Aprobar el Plan General")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<PlanGeneralResponse>> aprobar(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        PlanGeneralResponse response = planService.aprobar(id, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<PlanGeneralResponse>builder()
                .success(true).message("Plan General aprobado").data(response)
                .timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/rechazar")
    @Operation(summary = "Rechazar el Plan General")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<PlanGeneralResponse>> rechazar(
            @PathVariable Long id,
            @RequestParam String observacion,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        PlanGeneralResponse response = planService.rechazar(id, observacion, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<PlanGeneralResponse>builder()
                .success(true).message("Plan General rechazado").data(response)
                .timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener Plan General por ID")
    public ResponseEntity<ApiResponse<PlanGeneralResponse>> findById(@PathVariable Long id) {
        PlanGeneralResponse response = planService.findById(id);
        return ResponseEntity.ok(ApiResponse.<PlanGeneralResponse>builder()
                .success(true).data(response).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/expediente/{expedienteId}/activo")
    @Operation(summary = "Obtener el Plan General activo de un expediente")
    public ResponseEntity<ApiResponse<PlanGeneralResponse>> findActivoByExpediente(
            @PathVariable Long expedienteId) {
        PlanGeneralResponse response = planService.findActivoByExpedienteId(expedienteId);
        if (response == null) {
            return ResponseEntity.ok(ApiResponse.<PlanGeneralResponse>builder()
                    .success(true).message("No hay plan activo para este expediente")
                    .data(null).timestamp(LocalDateTime.now()).build());
        }
        return ResponseEntity.ok(ApiResponse.<PlanGeneralResponse>builder()
                .success(true).data(response).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/expediente/{expedienteId}")
    @Operation(summary = "Listar todas las versiones del plan de un expediente")
    public ResponseEntity<ApiResponse<List<PlanGeneralResponse>>> listarPorExpediente(
            @PathVariable Long expedienteId) {
        List<PlanGeneralResponse> responses = planService.listarPorExpediente(expedienteId);
        return ResponseEntity.ok(ApiResponse.<List<PlanGeneralResponse>>builder()
                .success(true).data(responses).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/{id}/validar-estructura")
    @Operation(summary = "Validar la estructura mínima del Plan General")
    public ResponseEntity<ApiResponse<PlanGeneralService.ValidacionEstructuraResponse>> validarEstructura(
            @PathVariable Long id) {
        PlanGeneralService.ValidacionEstructuraResponse validacion = planService.validarEstructura(id);
        return ResponseEntity.ok(ApiResponse.<PlanGeneralService.ValidacionEstructuraResponse>builder()
                .success(true).data(validacion).timestamp(LocalDateTime.now()).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar Plan General")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        planService.delete(id, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Plan General desactivado").timestamp(LocalDateTime.now()).build());
    }
}

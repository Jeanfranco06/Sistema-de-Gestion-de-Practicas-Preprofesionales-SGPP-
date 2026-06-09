package edu.unt.ingenieria_industrial.sgpp.core.responsables.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.responsables.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.responsables.service.ResponsableAcademicoService;
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
@RequestMapping("/responsables-academicos")
@RequiredArgsConstructor
@Tag(name = "Responsables Académicos", description = "Gestión de asesorías, coordinación y comité de prácticas pre-profesionales")
public class ResponsableAcademicoController {

    private final ResponsableAcademicoService responsableAcademicoService;

    @PostMapping("/asesorias")
    @Operation(summary = "Asignar un asesor académico a un estudiante")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR')")
    public ResponseEntity<ApiResponse<AsignacionAsesorResponse>> asignarAsesor(
            @Valid @RequestBody AsignacionAsesorRequest request) {
        AsignacionAsesorResponse response = responsableAcademicoService.asignarAsesor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<AsignacionAsesorResponse>builder()
                        .success(true)
                        .message("Asesor académico asignado exitosamente")
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/asesorias/reasignar")
    @Operation(summary = "Reasignar un asesor académico a un estudiante")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR')")
    public ResponseEntity<ApiResponse<AsignacionAsesorResponse>> reasignarAsesor(
            @Valid @RequestBody ReasignarAsesorRequest request) {
        AsignacionAsesorResponse response = responsableAcademicoService.reasignarAsesor(request);
        return ResponseEntity.ok(
                ApiResponse.<AsignacionAsesorResponse>builder()
                        .success(true)
                        .message("Asesor académico reasignado exitosamente")
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/asesorias/{id}")
    @Operation(summary = "Obtener una asignación de asesor por ID")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR', 'DOCENTE')")
    public ResponseEntity<ApiResponse<AsignacionAsesorResponse>> findAsignacionById(@PathVariable Long id) {
        AsignacionAsesorResponse response = responsableAcademicoService.findAsignacionById(id);
        return ResponseEntity.ok(
                ApiResponse.<AsignacionAsesorResponse>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/asesorias/estudiante/{idEstudiante}")
    @Operation(summary = "Obtener la asignación activa de un estudiante")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR', 'DOCENTE')")
    public ResponseEntity<ApiResponse<AsignacionAsesorResponse>> findAsignacionActivaByEstudiante(
            @PathVariable Long idEstudiante) {
        AsignacionAsesorResponse response = responsableAcademicoService.findAsignacionActivaByEstudiante(idEstudiante);
        return ResponseEntity.ok(
                ApiResponse.<AsignacionAsesorResponse>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/asesorias/docente/{idDocente}")
    @Operation(summary = "Listar asignaciones de un docente asesor")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR', 'DOCENTE')")
    public ResponseEntity<ApiResponse<List<AsignacionAsesorResponse>>> listarAsignacionesPorDocente(
            @PathVariable Long idDocente) {
        List<AsignacionAsesorResponse> responses = responsableAcademicoService.listarAsignacionesPorDocente(idDocente);
        return ResponseEntity.ok(
                ApiResponse.<List<AsignacionAsesorResponse>>builder()
                        .success(true)
                        .data(responses)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/asesorias/{id}/finalizar")
    @Operation(summary = "Finalizar una asignación de asesor")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR')")
    public ResponseEntity<ApiResponse<Void>> finalizarAsignacionAsesor(@PathVariable Long id) {
        responsableAcademicoService.finalizarAsignacionAsesor(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Asignación de asesor finalizada exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/coordinadores")
    @Operation(summary = "Designar un coordinador de prácticas")
    @PreAuthorize("hasRole('DIRECTOR')")
    public ResponseEntity<ApiResponse<DesignacionCoordinadorResponse>> designarCoordinador(
            @Valid @RequestBody DesignacionCoordinadorRequest request) {
        DesignacionCoordinadorResponse response = responsableAcademicoService.designarCoordinador(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<DesignacionCoordinadorResponse>builder()
                        .success(true)
                        .message("Coordinador designado exitosamente")
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/coordinadores/vigente")
    @Operation(summary = "Obtener el coordinador vigente")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR', 'DOCENTE')")
    public ResponseEntity<ApiResponse<DesignacionCoordinadorResponse>> findCoordinadorVigente() {
        DesignacionCoordinadorResponse response = responsableAcademicoService.findCoordinadorVigente();
        return ResponseEntity.ok(
                ApiResponse.<DesignacionCoordinadorResponse>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/coordinadores/periodo")
    @Operation(summary = "Obtener coordinador por período académico")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR')")
    public ResponseEntity<ApiResponse<DesignacionCoordinadorResponse>> findCoordinadorByPeriodo(
            @RequestParam String periodo) {
        DesignacionCoordinadorResponse response = responsableAcademicoService.findCoordinadorByPeriodo(periodo);
        return ResponseEntity.ok(
                ApiResponse.<DesignacionCoordinadorResponse>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/coordinadores/{id}")
    @Operation(summary = "Obtener una designación de coordinador por ID")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR')")
    public ResponseEntity<ApiResponse<DesignacionCoordinadorResponse>> findDesignacionById(@PathVariable Long id) {
        DesignacionCoordinadorResponse response = responsableAcademicoService.findDesignacionById(id);
        return ResponseEntity.ok(
                ApiResponse.<DesignacionCoordinadorResponse>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/coordinadores")
    @Operation(summary = "Listar designaciones de coordinador por período")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR')")
    public ResponseEntity<ApiResponse<List<DesignacionCoordinadorResponse>>> listarDesignacionesPorPeriodo(
            @RequestParam String periodo) {
        List<DesignacionCoordinadorResponse> responses = responsableAcademicoService.listarDesignacionesPorPeriodo(periodo);
        return ResponseEntity.ok(
                ApiResponse.<List<DesignacionCoordinadorResponse>>builder()
                        .success(true)
                        .data(responses)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/coordinadores/{id}/finalizar")
    @Operation(summary = "Finalizar una designación de coordinador")
    @PreAuthorize("hasRole('DIRECTOR')")
    public ResponseEntity<ApiResponse<Void>> finalizarDesignacionCoordinador(@PathVariable Long id) {
        responsableAcademicoService.finalizarDesignacionCoordinador(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Designación de coordinador finalizada exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/vigentes")
    @Operation(summary = "Obtener todos los responsables académicos vigentes (coordinador + comité)")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR', 'DOCENTE')")
    public ResponseEntity<ApiResponse<ResponsableVigenteDTO>> obtenerResponsablesVigentes() {
        ResponsableVigenteDTO response = responsableAcademicoService.obtenerResponsablesVigentes();
        return ResponseEntity.ok(
                ApiResponse.<ResponsableVigenteDTO>builder()
                        .success(true)
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}

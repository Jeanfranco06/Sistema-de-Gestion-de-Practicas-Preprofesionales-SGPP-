package edu.unt.ingenieria_industrial.sgpp.core.hora.controller;

import edu.unt.ingenieria_industrial.sgpp.core.hora.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.hora.service.ControlHoraService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.CurrentUserService;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/horas")
@RequiredArgsConstructor
@Tag(name = "Control de Horas de Práctica", description = "Endpoints para el control y registro de horas de práctica")
public class ControlHoraController {

    private final ControlHoraService controlHoraService;
    private final CurrentUserService currentUserService;

    @PostMapping("/iniciar/{idExpediente}")
    @Operation(summary = "Iniciar control de horas", description = "Inicia el control de horas para un expediente de práctica")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ControlHoraResponse>> iniciarControlHora(
            @Parameter(description = "ID del expediente") @PathVariable Long idExpediente,
            @Parameter(description = "ID del usuario que inicia el control") @RequestParam Long idUsuario) {
        return ResponseEntity.ok(controlHoraService.iniciarControlHora(idExpediente, idUsuario));
    }

    @PostMapping("/registrar/{idExpediente}")
    @Operation(summary = "Registrar horas", description = "Registra horas de práctica para un expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA', 'ESTUDIANTE', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<RegistroHoraResponse>> registrarHora(
            @Parameter(description = "ID del expediente") @PathVariable Long idExpediente,
            @Valid @RequestBody RegistrarHoraRequest request) {
        Long idUsuario = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        return ResponseEntity.ok(controlHoraService.registrarHora(idExpediente, request, idUsuario));
    }

    @PutMapping("/validar/{idRegistro}")
    @Operation(summary = "Validar registro de horas", description = "Valida un registro de horas por parte del tutor")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<RegistroHoraResponse>> validarHora(
            @Parameter(description = "ID del registro de hora") @PathVariable Long idRegistro,
            @Valid @RequestBody ValidarHoraRequest request) {
        Long idUsuario = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        return ResponseEntity.ok(controlHoraService.validarHora(
                idRegistro, request, idUsuario, currentUserService.getCurrentRoles()));
    }

    @GetMapping("/cumplimiento/{idExpediente}")
    @Operation(summary = "Verificar cumplimiento de horas", description = "Verifica el cumplimiento de horas de un expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA', 'ESTUDIANTE', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<CumplimientoHorasResponse>> verificarCumplimiento(
            @Parameter(description = "ID del expediente") @PathVariable Long idExpediente) {
        return ResponseEntity.ok(controlHoraService.verificarCumplimiento(idExpediente));
    }

    @GetMapping("/control/{idExpediente}")
    @Operation(summary = "Obtener control de horas", description = "Obtiene el control de horas de un expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA', 'ESTUDIANTE', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<ControlHoraResponse>> obtenerControlHora(
            @Parameter(description = "ID del expediente") @PathVariable Long idExpediente) {
        return ResponseEntity.ok(controlHoraService.obtenerControlHora(idExpediente));
    }

    @GetMapping("/registros/{idExpediente}")
    @Operation(summary = "Listar registros de horas", description = "Lista todos los registros de horas de un expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'SECRETARIA', 'ESTUDIANTE', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<List<RegistroHoraResponse>>> listarRegistros(
            @Parameter(description = "ID del expediente") @PathVariable Long idExpediente) {
        return ResponseEntity.ok(controlHoraService.listarRegistros(idExpediente));
    }

    @GetMapping("/registros/{idExpediente}/periodo")
    @Operation(summary = "Listar registros por periodo", description = "Lista los registros de horas de un expediente en un periodo específico")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'SECRETARIA', 'ESTUDIANTE', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<List<RegistroHoraResponse>>> listarRegistrosPorPeriodo(
            @Parameter(description = "ID del expediente") @PathVariable Long idExpediente,
            @Parameter(description = "Fecha inicio del periodo") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @Parameter(description = "Fecha fin del periodo") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(controlHoraService.listarRegistrosPorPeriodo(idExpediente, desde, hasta));
    }

    @PostMapping("/actualizar/{idExpediente}")
    @Operation(summary = "Actualizar horas acumuladas", description = "Actualiza las horas acumuladas de un expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<Void>> actualizarHorasAcumuladas(
            @Parameter(description = "ID del expediente") @PathVariable Long idExpediente,
            @Parameter(description = "ID del usuario que actualiza") @RequestParam Long idUsuario) {
        return ResponseEntity.ok(controlHoraService.actualizarHorasAcumuladas(idExpediente, idUsuario));
    }

    @GetMapping("/puede-cerrar/{idExpediente}")
    @Operation(summary = "Verificar si se puede cerrar expediente", description = "Verifica si un expediente puede cerrarse basado en el cumplimiento de horas")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<Boolean>> puedeCerrarExpediente(
            @Parameter(description = "ID del expediente") @PathVariable Long idExpediente) {
        return ResponseEntity.ok(controlHoraService.puedeCerrarExpediente(idExpediente));
    }
}

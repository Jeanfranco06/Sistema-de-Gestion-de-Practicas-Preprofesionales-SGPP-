package edu.unt.ingenieria_industrial.sgpp.core.integridad.controller;

import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.ConsultaAuditoriaFiltroDTO;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.EventoAuditoriaResponseDTO;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.dto.TrazabilidadExpedienteDTO;
import edu.unt.ingenieria_industrial.sgpp.core.integridad.service.AuditoriaTransaccionalService;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/auditoria")
@RequiredArgsConstructor
@Tag(name = "Auditoría y Trazabilidad", description = "Control institucional de integridad, auditoría y trazabilidad transaccional")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class AuditoriaController {

    private final AuditoriaTransaccionalService auditoriaService;

    @GetMapping("/eventos")
    @Operation(summary = "Consultar eventos de auditoría con filtros")
    public ResponseEntity<ApiResponse<List<EventoAuditoriaResponseDTO>>> consultarEventos(
            @ModelAttribute ConsultaAuditoriaFiltroDTO filtros) {
        return ok("Eventos de auditoría consultados", auditoriaService.consultar(filtros));
    }

    @GetMapping("/expediente/{idExpediente}/trazabilidad")
    @Operation(summary = "Reconstruir trazabilidad integral del expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<TrazabilidadExpedienteDTO>> trazabilidadExpediente(
            @PathVariable Long idExpediente) {
        return ok("Trazabilidad del expediente reconstruida",
                auditoriaService.reconstruirTrazabilidadExpediente(idExpediente));
    }

    @GetMapping("/usuario/{idUsuario}")
    @Operation(summary = "Consultar acciones auditadas por usuario")
    public ResponseEntity<ApiResponse<List<EventoAuditoriaResponseDTO>>> eventosPorUsuario(
            @PathVariable Long idUsuario,
            @RequestParam(required = false, defaultValue = "50") Integer limite) {
        ConsultaAuditoriaFiltroDTO filtros = ConsultaAuditoriaFiltroDTO.builder()
                .idUsuario(idUsuario)
                .limite(limite)
                .build();
        return ok("Eventos de auditoría del usuario", auditoriaService.consultar(filtros));
    }

    private <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity.ok(ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build());
    }
}

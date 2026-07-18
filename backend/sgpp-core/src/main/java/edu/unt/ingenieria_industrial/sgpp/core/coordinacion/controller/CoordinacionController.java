package edu.unt.ingenieria_industrial.sgpp.core.coordinacion.controller;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.dto.ExpedienteResponse;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteService;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.dto.GenerarDocumentoInternoRequest;
import edu.unt.ingenieria_industrial.sgpp.core.exportacion.service.ExportacionService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.CurrentUserService;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.shared.enums.TipoDocumentoInstitucional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/coordinacion")
@RequiredArgsConstructor
@Tag(name = "Módulo de Coordinación/Dirección", description = "Gestión ejecutiva de expedientes, emisión de cartas y constancias")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR')")
public class CoordinacionController {

    private final ExpedienteService expedienteService;
    private final ExportacionService exportacionService;
    private final CurrentUserService currentUserService;

    @PutMapping("/expediente/{id}/emitir-carta-presentacion")
    @Operation(summary = "Emitir y firmar la Carta de Presentación (Director/Coordinador)")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> emitirCartaPresentacion(
            @PathVariable Long id) {
        Long idUsuario = getCurrentUserId();

        ExpedienteResponse response = expedienteService.emitirCartaPresentacion(id, idUsuario);

        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Carta de Presentación emitida y firmada electrónicamente")
                .data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/expediente/{id}/emitir-constancia")
    @Operation(summary = "Emitir y firmar la Constancia de Prácticas (Director/Coordinador)")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> emitirConstancia(
            @PathVariable Long id) {
        Long idUsuario = getCurrentUserId();

        ExpedienteResponse expedienteActual = expedienteService.findById(id);
        ExpedienteResponse response = "CERRADO".equals(expedienteActual.getEstado())
                ? expedienteActual
                : expedienteService.cerrar(id, idUsuario, "Cierre previo a la emisión de constancia");

        exportacionService.generarDocumentoInterno(GenerarDocumentoInternoRequest.builder()
                .tipoDocumento(TipoDocumentoInstitucional.CONSTANCIA_CULMINACION)
                .idExpediente(id)
                .build());

        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Constancia de culminación emitida y firmada electrónicamente")
                .data(response).timestamp(LocalDateTime.now()).build());
    }

    private Long getCurrentUserId() {
        Long idUsuario = currentUserService.getCurrentUserId();
        if (idUsuario == null) {
            throw new AccessDeniedException("No se pudo identificar al usuario autenticado");
        }
        return idUsuario;
    }
}

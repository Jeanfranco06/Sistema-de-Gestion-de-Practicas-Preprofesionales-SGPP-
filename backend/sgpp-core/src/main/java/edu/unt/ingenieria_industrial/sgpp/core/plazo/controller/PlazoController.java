package edu.unt.ingenieria_industrial.sgpp.core.plazo.controller;

import edu.unt.ingenieria_industrial.sgpp.core.plazo.dto.ControlPlazoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.dto.ReglaPlazoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.plazo.service.PlazoService;
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
@RequestMapping("/plazos")
@RequiredArgsConstructor
@Tag(name = "Control de Plazos Normativos", description = "Gestión centralizada de plazos del proceso de prácticas")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
public class PlazoController {

    private final PlazoService plazoService;

    @GetMapping("/expediente/{expedienteId}")
    @Operation(summary = "Listar todos los plazos de un expediente")
    public ResponseEntity<ApiResponse<List<ControlPlazoDTO>>> listarPorExpediente(
            @PathVariable Long expedienteId) {
        List<ControlPlazoDTO> plazos = plazoService.listarPlazosPorExpediente(expedienteId);
        return ResponseEntity.ok(ApiResponse.<List<ControlPlazoDTO>>builder()
                .success(true).data(plazos).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/expediente/{expedienteId}/regla/{codigoRegla}")
    @Operation(summary = "Consultar estado de un plazo específico")
    public ResponseEntity<ApiResponse<ControlPlazoDTO>> consultarEstado(
            @PathVariable Long expedienteId,
            @PathVariable String codigoRegla) {
        ControlPlazoDTO dto = plazoService.consultarEstado(expedienteId, codigoRegla);
        return ResponseEntity.ok(ApiResponse.<ControlPlazoDTO>builder()
                .success(true).data(dto).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/vigentes")
    @Operation(summary = "Listar todos los plazos vigentes del sistema")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'COMITE_PRACTICAS')")
    public ResponseEntity<ApiResponse<List<ControlPlazoDTO>>> listarVigentes() {
        List<ControlPlazoDTO> plazos = plazoService.listarPlazosVigentes();
        return ResponseEntity.ok(ApiResponse.<List<ControlPlazoDTO>>builder()
                .success(true).data(plazos).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/por-vencer")
    @Operation(summary = "Listar plazos vencidos o próximos a vencer")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'COMITE_PRACTICAS')")
    public ResponseEntity<ApiResponse<List<ControlPlazoDTO>>> listarPorVencer() {
        List<ControlPlazoDTO> plazos = plazoService.listarPlazosVencidosOPorroVencer();
        return ResponseEntity.ok(ApiResponse.<List<ControlPlazoDTO>>builder()
                .success(true).data(plazos).timestamp(LocalDateTime.now()).build());
    }

    @PostMapping("/actualizar-estados")
    @Operation(summary = "Actualizar estados de plazos vencidos y próximos a vencer")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR')")
    public ResponseEntity<ApiResponse<Integer>> actualizarEstados() {
        int actualizados = plazoService.actualizarEstadosVencidos();
        return ResponseEntity.ok(ApiResponse.<Integer>builder()
                .success(true).data(actualizados)
                .message(actualizados + " plazos actualizados")
                .timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/reglas")
    @Operation(summary = "Listar reglas de plazo configuradas")
    public ResponseEntity<ApiResponse<List<ReglaPlazoDTO>>> listarReglas() {
        List<ReglaPlazoDTO> reglas = plazoService.listarReglas();
        return ResponseEntity.ok(ApiResponse.<List<ReglaPlazoDTO>>builder()
                .success(true).data(reglas).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/reglas/tipo-practica/{codigoTipoPractica}")
    @Operation(summary = "Listar reglas por tipo de práctica")
    public ResponseEntity<ApiResponse<List<ReglaPlazoDTO>>> listarReglasPorTipoPractica(
            @PathVariable String codigoTipoPractica) {
        List<ReglaPlazoDTO> reglas = plazoService.listarReglasPorTipoPractica(codigoTipoPractica);
        return ResponseEntity.ok(ApiResponse.<List<ReglaPlazoDTO>>builder()
                .success(true).data(reglas).timestamp(LocalDateTime.now()).build());
    }
}

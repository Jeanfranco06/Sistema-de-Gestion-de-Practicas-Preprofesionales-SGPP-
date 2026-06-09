package edu.unt.ingenieria_industrial.sgpp.core.seguridad.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ComiteIntegranteRequest;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.ComiteIntegranteResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.ComiteIntegranteService;
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
@RequestMapping("/comite-practicas/integrantes")
@RequiredArgsConstructor
@Tag(name = "Gestión del Comité de Prácticas", description = "Endpoints para la administración de integrantes del comité de prácticas")
@PreAuthorize("hasAnyRole('DIRECTOR', 'COORDINADOR')")
public class ComiteIntegranteController {

    private final ComiteIntegranteService comiteIntegranteService;

    @GetMapping
    @Operation(summary = "Listar todos los integrantes del comité")
    public ResponseEntity<ApiResponse<List<ComiteIntegranteResponse>>> findAll() {
        List<ComiteIntegranteResponse> integrantes = comiteIntegranteService.findAll();
        return ResponseEntity.ok(
                ApiResponse.<List<ComiteIntegranteResponse>>builder()
                        .success(true)
                        .data(integrantes)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/activos")
    @Operation(summary = "Listar integrantes activos del comité")
    public ResponseEntity<ApiResponse<List<ComiteIntegranteResponse>>> findAllActive() {
        List<ComiteIntegranteResponse> integrantes = comiteIntegranteService.findAllActive();
        return ResponseEntity.ok(
                ApiResponse.<List<ComiteIntegranteResponse>>builder()
                        .success(true)
                        .data(integrantes)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/presidente")
    @Operation(summary = "Obtener el presidente vigente del comité")
    public ResponseEntity<ApiResponse<ComiteIntegranteResponse>> findPresidente() {
        ComiteIntegranteResponse presidente = comiteIntegranteService.findPresidente();
        return ResponseEntity.ok(
                ApiResponse.<ComiteIntegranteResponse>builder()
                        .success(true)
                        .data(presidente)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un integrante por ID")
    public ResponseEntity<ApiResponse<ComiteIntegranteResponse>> findById(@PathVariable Long id) {
        ComiteIntegranteResponse integrante = comiteIntegranteService.findById(id);
        return ResponseEntity.ok(
                ApiResponse.<ComiteIntegranteResponse>builder()
                        .success(true)
                        .data(integrante)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping
    @Operation(summary = "Agregar un nuevo integrante al comité")
    public ResponseEntity<ApiResponse<ComiteIntegranteResponse>> create(@Valid @RequestBody ComiteIntegranteRequest request) {
        ComiteIntegranteResponse created = comiteIntegranteService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ComiteIntegranteResponse>builder()
                        .success(true)
                        .message("Integrante agregado exitosamente")
                        .data(created)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos o rol de un integrante")
    public ResponseEntity<ApiResponse<ComiteIntegranteResponse>> update(@PathVariable Long id, @Valid @RequestBody ComiteIntegranteRequest request) {
        ComiteIntegranteResponse updated = comiteIntegranteService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.<ComiteIntegranteResponse>builder()
                        .success(true)
                        .message("Integrante actualizado exitosamente")
                        .data(updated)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar o inactivar un integrante")
    public ResponseEntity<ApiResponse<Void>> updateEstado(@PathVariable Long id, @RequestParam String estado) {
        comiteIntegranteService.updateEstado(id, estado);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Estado del integrante actualizado exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/periodo")
    @Operation(summary = "Listar integrantes por período académico")
    public ResponseEntity<ApiResponse<List<ComiteIntegranteResponse>>> findByPeriodo(
            @RequestParam String periodo) {
        List<ComiteIntegranteResponse> integrantes = comiteIntegranteService.findByPeriodo(periodo);
        return ResponseEntity.ok(
                ApiResponse.<List<ComiteIntegranteResponse>>builder()
                        .success(true)
                        .data(integrantes)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/vigente")
    @Operation(summary = "Obtener la composición vigente del comité")
    public ResponseEntity<ApiResponse<List<ComiteIntegranteResponse>>> getVigente() {
        List<ComiteIntegranteResponse> integrantes = comiteIntegranteService.getVigente();
        return ResponseEntity.ok(
                ApiResponse.<List<ComiteIntegranteResponse>>builder()
                        .success(true)
                        .data(integrantes)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/cerrar-periodo")
    @Operation(summary = "Cerrar la conformación de un período completo")
    public ResponseEntity<ApiResponse<Void>> cerrarPeriodo(@RequestParam String periodo) {
        comiteIntegranteService.cerrarPeriodo(periodo);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Período " + periodo + " cerrado exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}

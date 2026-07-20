package edu.unt.ingenieria_industrial.sgpp.core.practicas.controller;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.RequisitoAcademicoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.service.RequisitoAcademicoService;
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
@RequestMapping("/requisitos-academicos")
@RequiredArgsConstructor
@Tag(name = "Requisitos Académicos", description = "Gestión de requisitos académicos por tipo de práctica")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COORDINADOR', 'COMITE_PRACTICAS', 'DIRECTOR')")
public class RequisitoAcademicoController {

    private final RequisitoAcademicoService requisitoAcademicoService;

    @GetMapping
    @Operation(summary = "Listar requisitos académicos activos")
    public ResponseEntity<ApiResponse<List<RequisitoAcademicoDTO>>> listar() {
        List<RequisitoAcademicoDTO> requisitos = requisitoAcademicoService.listarTodos();
        return ResponseEntity.ok(ApiResponse.<List<RequisitoAcademicoDTO>>builder()
                .success(true).data(requisitos).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/tipo-practica/{codigoTipoPractica}")
    @Operation(summary = "Listar requisitos académicos por tipo de práctica")
    public ResponseEntity<ApiResponse<List<RequisitoAcademicoDTO>>> listarPorTipoPractica(
            @PathVariable String codigoTipoPractica) {
        List<RequisitoAcademicoDTO> requisitos = requisitoAcademicoService.listarPorTipoPractica(codigoTipoPractica);
        return ResponseEntity.ok(ApiResponse.<List<RequisitoAcademicoDTO>>builder()
                .success(true).data(requisitos).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener requisito académico por id")
    public ResponseEntity<ApiResponse<RequisitoAcademicoDTO>> obtener(@PathVariable Long id) {
        RequisitoAcademicoDTO requisito = requisitoAcademicoService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.<RequisitoAcademicoDTO>builder()
                .success(true).data(requisito).timestamp(LocalDateTime.now()).build());
    }

    @PostMapping
    @Operation(summary = "Crear requisito académico")
    @PreAuthorize("hasRole('ADMIN_SISTEMA')")
    public ResponseEntity<ApiResponse<RequisitoAcademicoDTO>> crear(@RequestBody RequisitoAcademicoDTO dto) {
        RequisitoAcademicoDTO creado = requisitoAcademicoService.crear(dto);
        return ResponseEntity.ok(ApiResponse.<RequisitoAcademicoDTO>builder()
                .success(true).data(creado).message("Requisito académico creado correctamente")
                .timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar requisito académico")
    @PreAuthorize("hasRole('ADMIN_SISTEMA')")
    public ResponseEntity<ApiResponse<RequisitoAcademicoDTO>> actualizar(
            @PathVariable Long id, @RequestBody RequisitoAcademicoDTO dto) {
        RequisitoAcademicoDTO actualizado = requisitoAcademicoService.actualizar(id, dto);
        return ResponseEntity.ok(ApiResponse.<RequisitoAcademicoDTO>builder()
                .success(true).data(actualizado).message("Requisito académico actualizado correctamente")
                .timestamp(LocalDateTime.now()).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar (desactivar) requisito académico")
    @PreAuthorize("hasRole('ADMIN_SISTEMA')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        requisitoAcademicoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Requisito académico eliminado correctamente")
                .timestamp(LocalDateTime.now()).build());
    }
}

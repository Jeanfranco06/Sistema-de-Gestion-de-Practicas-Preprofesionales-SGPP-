package edu.unt.ingenieria_industrial.sgpp.core.sistema.controller;

import edu.unt.ingenieria_industrial.sgpp.core.model.ParametroSistema;
import edu.unt.ingenieria_industrial.sgpp.core.sistema.service.ParametroSistemaService;
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
@RequestMapping("/parametros-sistema")
@RequiredArgsConstructor
@Tag(name = "Parámetros del Sistema", description = "Gestión de parámetros y configuraciones generales")
@PreAuthorize("hasRole('ADMIN_SISTEMA')")
public class ParametroSistemaController {

    private final ParametroSistemaService parametroSistemaService;

    @GetMapping
    @Operation(summary = "Listar parámetros del sistema activos")
    public ResponseEntity<ApiResponse<List<ParametroSistema>>> listar() {
        List<ParametroSistema> parametros = parametroSistemaService.findAll();
        return ResponseEntity.ok(ApiResponse.<List<ParametroSistema>>builder()
                .success(true).data(parametros).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un parámetro del sistema por id")
    public ResponseEntity<ApiResponse<ParametroSistema>> obtener(@PathVariable Long id) {
        ParametroSistema parametro = parametroSistemaService.findById(id);
        return ResponseEntity.ok(ApiResponse.<ParametroSistema>builder()
                .success(true).data(parametro).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/clave/{clave}")
    @Operation(summary = "Obtener un parámetro del sistema por clave")
    public ResponseEntity<ApiResponse<ParametroSistema>> obtenerPorClave(@PathVariable String clave) {
        ParametroSistema parametro = parametroSistemaService.findByClave(clave);
        return ResponseEntity.ok(ApiResponse.<ParametroSistema>builder()
                .success(true).data(parametro).timestamp(LocalDateTime.now()).build());
    }

    @PostMapping
    @Operation(summary = "Crear un parámetro del sistema")
    public ResponseEntity<ApiResponse<ParametroSistema>> crear(@RequestBody ParametroSistema parametro) {
        ParametroSistema creado = parametroSistemaService.create(parametro);
        return ResponseEntity.ok(ApiResponse.<ParametroSistema>builder()
                .success(true).data(creado).message("Parámetro creado correctamente")
                .timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un parámetro del sistema")
    public ResponseEntity<ApiResponse<ParametroSistema>> actualizar(
            @PathVariable Long id, @RequestBody ParametroSistema parametro) {
        ParametroSistema actualizado = parametroSistemaService.update(id, parametro);
        return ResponseEntity.ok(ApiResponse.<ParametroSistema>builder()
                .success(true).data(actualizado).message("Parámetro actualizado correctamente")
                .timestamp(LocalDateTime.now()).build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar (desactivar) un parámetro del sistema")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        parametroSistemaService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Parámetro eliminado correctamente")
                .timestamp(LocalDateTime.now()).build());
    }
}

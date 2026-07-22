package edu.unt.ingenieria_industrial.sgpp.core.empresarial.controller;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.EmpresaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.EmpresaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/empresas")
@RequiredArgsConstructor
@Tag(name = "Gestión de Empresas", description = "Endpoints para la administración de empresas aliadas")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class EmpresaController {

    private final EmpresaService empresaService;

    @PostMapping
    @Operation(summary = "Crear una nueva empresa")
    public ResponseEntity<EmpresaDTO> create(@Valid @RequestBody EmpresaDTO dto) {
        return new ResponseEntity<>(empresaService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una empresa existente")
    public ResponseEntity<EmpresaDTO> update(@PathVariable Long id, @Valid @RequestBody EmpresaDTO dto) {
        return ResponseEntity.ok(empresaService.update(id, dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una empresa por ID")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'ESTUDIANTE')")
    public ResponseEntity<EmpresaDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar todas las empresas")
    public ResponseEntity<List<EmpresaDTO>> findAll() {
        return ResponseEntity.ok(empresaService.findAll());
    }

    @GetMapping("/check-ruc")
    @Operation(summary = "Verificar disponibilidad de RUC")
    public ResponseEntity<Map<String, Object>> checkRuc(
            @Parameter(description = "RUC a verificar") @RequestParam String ruc,
            @Parameter(description = "ID de empresa a excluir (para edición)") @RequestParam(required = false) Long excludeId) {
        boolean available = empresaService.checkRucAvailable(ruc, excludeId);
        Map<String, Object> response = new HashMap<>();
        response.put("available", available);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/disable")
    @Operation(summary = "Deshabilitar una empresa")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        empresaService.disable(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/validate")
    @Operation(summary = "Validar perfil de una empresa")
    public ResponseEntity<Void> validate(@PathVariable Long id) {
        empresaService.validate(id);
        return ResponseEntity.noContent().build();
    }
}


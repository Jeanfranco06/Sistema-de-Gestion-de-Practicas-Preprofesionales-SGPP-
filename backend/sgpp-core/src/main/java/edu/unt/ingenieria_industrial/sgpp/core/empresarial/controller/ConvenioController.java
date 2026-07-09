package edu.unt.ingenieria_industrial.sgpp.core.empresarial.controller;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.ConvenioDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.ConvenioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/convenios")
@RequiredArgsConstructor
@Tag(name = "Gestión de Convenios", description = "Endpoints para la administración de convenios con empresas aliadas")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class ConvenioController {

    private final ConvenioService convenioService;

    @PostMapping
    @Operation(summary = "Registrar un nuevo convenio")
    public ResponseEntity<ConvenioDTO> create(@Valid @RequestBody ConvenioDTO dto) {
        return new ResponseEntity<>(convenioService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un convenio existente")
    public ResponseEntity<ConvenioDTO> update(@PathVariable Long id, @Valid @RequestBody ConvenioDTO dto) {
        return ResponseEntity.ok(convenioService.update(id, dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un convenio por ID")
    public ResponseEntity<ConvenioDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(convenioService.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar todos los convenios vigentes")
    public ResponseEntity<List<ConvenioDTO>> findAllActive() {
        return ResponseEntity.ok(convenioService.findAllActive());
    }

    @GetMapping("/empresa/{empresaId}")
    @Operation(summary = "Listar convenios por empresa")
    public ResponseEntity<List<ConvenioDTO>> findByEmpresaId(@PathVariable Long empresaId) {
        return ResponseEntity.ok(convenioService.findByEmpresaId(empresaId));
    }

    @DeleteMapping("/{id}/disable")
    @Operation(summary = "Anular un convenio")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        convenioService.disable(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alertas/vencer")
    @Operation(summary = "Obtener convenios próximos a vencer")
    public ResponseEntity<List<ConvenioDTO>> getExpiringConvenios(
            @Parameter(description = "Días antes del vencimiento") @RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(convenioService.findExpiringConvenios(dias));
    }

    @GetMapping("/{id}/validar-vigencia")
    @Operation(summary = "Validar vigencia de un convenio")
    public ResponseEntity<Boolean> validarVigencia(@PathVariable Long id) {
        return ResponseEntity.ok(convenioService.validarVigencia(id));
    }
}


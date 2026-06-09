package edu.unt.ingenieria_industrial.sgpp.api.sistema;

import edu.unt.ingenieria_industrial.sgpp.core.sistema.service.ParametroSistemaService;
import edu.unt.ingenieria_industrial.sgpp.core.model.ParametroSistema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parametros")
@RequiredArgsConstructor
@Tag(name = "Parámetros del Sistema", description = "Endpoints para gestión de parámetros configurables del sistema")
public class ParametroSistemaController {

    private final ParametroSistemaService parametroSistemaService;

    @GetMapping
    @Operation(summary = "Listar todos los parámetros", description = "Retorna todos los parámetros activos del sistema")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'COMITE_PRACTICAS')")
    public ResponseEntity<List<ParametroSistema>> findAll() {
        return ResponseEntity.ok(parametroSistemaService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener parámetro por ID", description = "Retorna un parámetro específico por su ID")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'COMITE_PRACTICAS')")
    public ResponseEntity<ParametroSistema> findById(@PathVariable Long id) {
        return ResponseEntity.ok(parametroSistemaService.findById(id));
    }

    @GetMapping("/clave/{clave}")
    @Operation(summary = "Obtener parámetro por clave", description = "Retorna un parámetro específico por su clave")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'COMITE_PRACTICAS', 'DOCENTE_ASESOR', 'ESTUDIANTE')")
    public ResponseEntity<ParametroSistema> findByClave(@PathVariable String clave) {
        return ResponseEntity.ok(parametroSistemaService.findByClave(clave));
    }

    @GetMapping("/valor/{clave}")
    @Operation(summary = "Obtener valor de parámetro por clave", description = "Retorna solo el valor de un parámetro por su clave")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'COMITE_PRACTICAS', 'DOCENTE_ASESOR', 'ESTUDIANTE')")
    public ResponseEntity<String> getValorByClave(@PathVariable String clave) {
        return ResponseEntity.ok(parametroSistemaService.getValorByClave(clave));
    }

    @GetMapping("/prefijo/{prefijo}")
    @Operation(summary = "Listar parámetros por prefijo", description = "Retorna parámetros que comienzan con un prefijo específico")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'COMITE_PRACTICAS')")
    public ResponseEntity<List<ParametroSistema>> findByPrefijo(@PathVariable String prefijo) {
        return ResponseEntity.ok(parametroSistemaService.findByPrefijo(prefijo));
    }

    @PostMapping
    @Operation(summary = "Crear parámetro", description = "Crea un nuevo parámetro del sistema")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR')")
    public ResponseEntity<ParametroSistema> create(@Valid @RequestBody ParametroSistema parametro) {
        return ResponseEntity.ok(parametroSistemaService.create(parametro));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar parámetro", description = "Actualiza un parámetro existente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR')")
    public ResponseEntity<ParametroSistema> update(@PathVariable Long id, @Valid @RequestBody ParametroSistema parametro) {
        return ResponseEntity.ok(parametroSistemaService.update(id, parametro));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar parámetro", description = "Desactiva un parámetro (soft delete)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        parametroSistemaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

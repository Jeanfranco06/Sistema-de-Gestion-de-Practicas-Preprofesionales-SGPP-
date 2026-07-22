package edu.unt.ingenieria_industrial.sgpp.core.empresarial.controller;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.SedeCatalogoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.SedePracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.SedePracticaService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.PracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.service.PracticaService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sedes")
@RequiredArgsConstructor
@Tag(name = "Gestión de Sedes", description = "Endpoints para la administración de sedes de práctica")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class SedePracticaController {

    private final SedePracticaService sedePracticaService;
    private final PracticaService practicaService;
    private final EstudianteRepository estudianteRepository;
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    @Operation(summary = "Crear una nueva sede")
    public ResponseEntity<SedePracticaDTO> create(@Valid @RequestBody SedePracticaDTO dto) {
        return new ResponseEntity<>(sedePracticaService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una sede existente")
    public ResponseEntity<SedePracticaDTO> update(@PathVariable Long id, @Valid @RequestBody SedePracticaDTO dto) {
        return ResponseEntity.ok(sedePracticaService.update(id, dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una sede por ID")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'ESTUDIANTE')")
    public ResponseEntity<SedePracticaDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(sedePracticaService.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar todas las sedes activas")
    public ResponseEntity<List<SedePracticaDTO>> findAllActive() {
        return ResponseEntity.ok(sedePracticaService.findAllActive());
    }

    @GetMapping("/empresa/{empresaId}")
    @Operation(summary = "Listar sedes por empresa")
    public ResponseEntity<List<SedePracticaDTO>> findByEmpresaId(@PathVariable Long empresaId) {
        return ResponseEntity.ok(sedePracticaService.findByEmpresaId(empresaId));
    }

    @GetMapping("/check-nombre")
    @Operation(summary = "Verificar disponibilidad de nombre de sede dentro de una empresa")
    public ResponseEntity<Map<String, Object>> checkNombre(
            @Parameter(description = "Nombre de sede a verificar") @RequestParam String nombre,
            @Parameter(description = "ID de la empresa") @RequestParam Long empresaId,
            @Parameter(description = "ID de sede a excluir (para edición)") @RequestParam(required = false) Long excludeId) {
        boolean available = sedePracticaService.checkNombreDisponible(nombre, empresaId, excludeId);
        Map<String, Object> response = new HashMap<>();
        response.put("available", available);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/convenios-vigentes")
    @Operation(summary = "Listar sedes con convenios vigentes")
    public ResponseEntity<List<SedePracticaDTO>> findWithValidConvenios() {
        return ResponseEntity.ok(sedePracticaService.findWithValidConvenios());
    }

    @GetMapping("/estado/{estadoSede}")
    @Operation(summary = "Listar sedes por estado")
    public ResponseEntity<List<SedePracticaDTO>> findByEstadoSede(@PathVariable String estadoSede) {
        return ResponseEntity.ok(sedePracticaService.findByEstadoSede(estadoSede));
    }

    @GetMapping("/empresa/{empresaId}/estado/{estadoSede}")
    @Operation(summary = "Listar sedes por empresa y estado")
    public ResponseEntity<List<SedePracticaDTO>> findByEmpresaIdAndEstadoSede(
            @PathVariable Long empresaId, @PathVariable String estadoSede) {
        return ResponseEntity.ok(sedePracticaService.findByEmpresaIdAndEstadoSede(empresaId, estadoSede));
    }

    @GetMapping("/distrito/{distrito}")
    @Operation(summary = "Listar sedes por distrito")
    public ResponseEntity<List<SedePracticaDTO>> findByDistrito(@PathVariable String distrito) {
        return ResponseEntity.ok(sedePracticaService.findByDistrito(distrito));
    }

    @GetMapping("/provincia/{provincia}")
    @Operation(summary = "Listar sedes por provincia")
    public ResponseEntity<List<SedePracticaDTO>> findByProvincia(@PathVariable String provincia) {
        return ResponseEntity.ok(sedePracticaService.findByProvincia(provincia));
    }

    @GetMapping("/departamento/{departamento}")
    @Operation(summary = "Listar sedes por departamento")
    public ResponseEntity<List<SedePracticaDTO>> findByDepartamento(@PathVariable String departamento) {
        return ResponseEntity.ok(sedePracticaService.findByDepartamento(departamento));
    }

    @GetMapping("/capacidad-minima/{capacidad}")
    @Operation(summary = "Listar sedes con capacidad mínima")
    public ResponseEntity<List<SedePracticaDTO>> findByCapacidadMinima(@PathVariable Integer capacidad) {
        return ResponseEntity.ok(sedePracticaService.findByCapacidadMinima(capacidad));
    }

    @GetMapping("/disponibles-estudiantes")
    @Operation(summary = "Listar sedes disponibles para estudiantes")
    public ResponseEntity<List<SedePracticaDTO>> findAvailableForStudents() {
        return ResponseEntity.ok(sedePracticaService.findAvailableForStudents());
    }

    @DeleteMapping("/{id}/disable")
    @Operation(summary = "Deshabilitar una sede")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        sedePracticaService.disable(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de una sede")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<Void> cambiarEstado(@PathVariable Long id, @RequestBody String estado) {
        sedePracticaService.cambiarEstado(id, estado);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/catalogo")
    @Operation(summary = "Obtener catálogo de sedes para estudiantes")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'ESTUDIANTE', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedeCatalogoDTO>> getCatalogoSedes() {
        return ResponseEntity.ok(sedePracticaService.getCatalogoSedes());
    }

    @GetMapping("/{id}/detalle")
    @Operation(summary = "Obtener detalle de una sede")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'ESTUDIANTE', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO')")
    public ResponseEntity<SedeCatalogoDTO> getDetalleSede(@PathVariable Long id) {
        return ResponseEntity.ok(sedePracticaService.getDetalleSede(id));
    }

    @PostMapping("/{id}/seleccionar")
    @Operation(summary = "Seleccionar sede para iniciar práctica")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> seleccionarSede(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Long estudianteId = estudianteRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Perfil de estudiante no encontrado"))
                .getId();

        PracticaDTO result = practicaService.seleccionarSede(estudianteId, id);
        return ResponseEntity.ok(result);
    }
}

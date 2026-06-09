package edu.unt.ingenieria_industrial.sgpp.core.empresarial.controller;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.SedeCatalogoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.SedePracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.SedePracticaService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.PracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.service.PracticaService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sedes")
@CrossOrigin(origins = "*")
public class SedePracticaController {

    @Autowired
    private SedePracticaService sedePracticaService;

    @Autowired
    private PracticaService practicaService;

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<SedePracticaDTO> create(@RequestBody SedePracticaDTO dto) {
        return new ResponseEntity<>(sedePracticaService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<SedePracticaDTO> update(@PathVariable Long id, @RequestBody SedePracticaDTO dto) {
        return ResponseEntity.ok(sedePracticaService.update(id, dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<SedePracticaDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(sedePracticaService.findById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findAllActive() {
        return ResponseEntity.ok(sedePracticaService.findAllActive());
    }

    @GetMapping("/empresa/{empresaId}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findByEmpresaId(@PathVariable Long empresaId) {
        return ResponseEntity.ok(sedePracticaService.findByEmpresaId(empresaId));
    }

    @GetMapping("/convenios-vigentes")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findWithValidConvenios() {
        return ResponseEntity.ok(sedePracticaService.findWithValidConvenios());
    }

    @GetMapping("/estado/{estadoSede}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findByEstadoSede(@PathVariable String estadoSede) {
        return ResponseEntity.ok(sedePracticaService.findByEstadoSede(estadoSede));
    }

    @GetMapping("/empresa/{empresaId}/estado/{estadoSede}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findByEmpresaIdAndEstadoSede(
            @PathVariable Long empresaId, @PathVariable String estadoSede) {
        return ResponseEntity.ok(sedePracticaService.findByEmpresaIdAndEstadoSede(empresaId, estadoSede));
    }

    @GetMapping("/distrito/{distrito}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findByDistrito(@PathVariable String distrito) {
        return ResponseEntity.ok(sedePracticaService.findByDistrito(distrito));
    }

    @GetMapping("/provincia/{provincia}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findByProvincia(@PathVariable String provincia) {
        return ResponseEntity.ok(sedePracticaService.findByProvincia(provincia));
    }

    @GetMapping("/departamento/{departamento}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findByDepartamento(@PathVariable String departamento) {
        return ResponseEntity.ok(sedePracticaService.findByDepartamento(departamento));
    }

    @GetMapping("/capacidad-minima/{capacidad}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findByCapacidadMinima(@PathVariable Integer capacidad) {
        return ResponseEntity.ok(sedePracticaService.findByCapacidadMinima(capacidad));
    }

    @GetMapping("/disponibles-estudiantes")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedePracticaDTO>> findAvailableForStudents() {
        return ResponseEntity.ok(sedePracticaService.findAvailableForStudents());
    }

    @DeleteMapping("/{id}/disable")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        sedePracticaService.disable(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<Void> cambiarEstado(@PathVariable Long id, @RequestBody String estado) {
        sedePracticaService.cambiarEstado(id, estado);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/catalogo")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<List<SedeCatalogoDTO>> getCatalogoSedes() {
        return ResponseEntity.ok(sedePracticaService.getCatalogoSedes());
    }

    @GetMapping("/{id}/detalle")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<SedeCatalogoDTO> getDetalleSede(@PathVariable Long id) {
        return ResponseEntity.ok(sedePracticaService.getDetalleSede(id));
    }

    @PostMapping("/{id}/seleccionar")
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

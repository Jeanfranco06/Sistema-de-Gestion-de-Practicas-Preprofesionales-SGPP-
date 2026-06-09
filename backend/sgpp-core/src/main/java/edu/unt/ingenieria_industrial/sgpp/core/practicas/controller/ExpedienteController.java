package edu.unt.ingenieria_industrial.sgpp.core.practicas.controller;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.ExpedienteDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.service.ExpedienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expedientes")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'COMITE_PRACTICAS', 'DIRECTOR')")
public class ExpedienteController {

    @Autowired
    private ExpedienteService expedienteService;

    @PostMapping
    public ResponseEntity<ExpedienteDTO> create(@RequestBody ExpedienteDTO dto) {
        return new ResponseEntity<>(expedienteService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpedienteDTO> update(@PathVariable Long id, @RequestBody ExpedienteDTO dto) {
        return ResponseEntity.ok(expedienteService.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpedienteDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(expedienteService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<ExpedienteDTO>> findAll() {
        return ResponseEntity.ok(expedienteService.findAll());
    }

    @GetMapping("/estudiante/{estudianteId}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'COORDINADOR', 'COMITE_PRACTICAS', 'DIRECTOR')")
    public ResponseEntity<List<ExpedienteDTO>> findByEstudianteId(@PathVariable Long estudianteId) {
        return ResponseEntity.ok(expedienteService.findByEstudianteId(estudianteId));
    }

    @GetMapping("/tutor-empresa/{tutorEmpresaId}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'TUTOR_EXTERNO', 'COORDINADOR', 'COMITE_PRACTICAS', 'DIRECTOR')")
    public ResponseEntity<List<ExpedienteDTO>> findByTutorEmpresaId(@PathVariable Long tutorEmpresaId) {
        return ResponseEntity.ok(expedienteService.findByTutorEmpresaId(tutorEmpresaId));
    }

    @DeleteMapping("/{id}/disable")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        expedienteService.disable(id);
        return ResponseEntity.noContent().build();
    }
}

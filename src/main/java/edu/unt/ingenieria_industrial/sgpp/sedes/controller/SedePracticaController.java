package edu.unt.ingenieria_industrial.sgpp.sedes.controller;

import edu.unt.ingenieria_industrial.sgpp.sedes.dto.SedePracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.sedes.service.SedePracticaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sedes")
@CrossOrigin(origins = "*")
public class SedePracticaController {

    @Autowired
    private SedePracticaService sedePracticaService;

    @PostMapping
    public ResponseEntity<SedePracticaDTO> create(@RequestBody SedePracticaDTO dto) {
        return new ResponseEntity<>(sedePracticaService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SedePracticaDTO> update(@PathVariable Long id, @RequestBody SedePracticaDTO dto) {
        return ResponseEntity.ok(sedePracticaService.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SedePracticaDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(sedePracticaService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<SedePracticaDTO>> findAllActive() {
        return ResponseEntity.ok(sedePracticaService.findAllActive());
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<SedePracticaDTO>> findByEmpresaId(@PathVariable Long empresaId) {
        return ResponseEntity.ok(sedePracticaService.findByEmpresaId(empresaId));
    }

    @DeleteMapping("/{id}/disable")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        sedePracticaService.disable(id);
        return ResponseEntity.noContent().build();
    }
}

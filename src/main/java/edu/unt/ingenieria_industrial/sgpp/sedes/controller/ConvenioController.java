package edu.unt.ingenieria_industrial.sgpp.sedes.controller;

import edu.unt.ingenieria_industrial.sgpp.sedes.dto.ConvenioDTO;
import edu.unt.ingenieria_industrial.sgpp.sedes.service.ConvenioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/convenios")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SECRETARIA', 'COORDINADOR', 'DIRECTOR')")
public class ConvenioController {

    @Autowired
    private ConvenioService convenioService;

    @PostMapping
    public ResponseEntity<ConvenioDTO> create(@RequestBody ConvenioDTO dto) {
        return new ResponseEntity<>(convenioService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConvenioDTO> update(@PathVariable Long id, @RequestBody ConvenioDTO dto) {
        return ResponseEntity.ok(convenioService.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConvenioDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(convenioService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<ConvenioDTO>> findAllActive() {
        return ResponseEntity.ok(convenioService.findAllActive());
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<ConvenioDTO>> findByEmpresaId(@PathVariable Long empresaId) {
        return ResponseEntity.ok(convenioService.findByEmpresaId(empresaId));
    }

    @DeleteMapping("/{id}/disable")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        convenioService.disable(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alertas/vencer")
    public ResponseEntity<List<ConvenioDTO>> getExpiringConvenios(
            @RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(convenioService.findExpiringConvenios(dias));
    }
}

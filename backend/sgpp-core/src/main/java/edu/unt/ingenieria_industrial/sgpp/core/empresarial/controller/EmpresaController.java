package edu.unt.ingenieria_industrial.sgpp.core.empresarial.controller;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.EmpresaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/empresas")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    @PostMapping
    public ResponseEntity<EmpresaDTO> create(@RequestBody EmpresaDTO dto) {
        return new ResponseEntity<>(empresaService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDTO> update(@PathVariable Long id, @RequestBody EmpresaDTO dto) {
        return ResponseEntity.ok(empresaService.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<EmpresaDTO>> findAll() {
        return ResponseEntity.ok(empresaService.findAll());
    }

    @DeleteMapping("/{id}/disable")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        empresaService.disable(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/validate")
    public ResponseEntity<Void> validate(@PathVariable Long id) {
        empresaService.validate(id);
        return ResponseEntity.noContent().build();
    }
}


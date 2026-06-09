package edu.unt.ingenieria_industrial.sgpp.core.empresarial.controller;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.dto.ValidacionSedeDTO;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.service.ValidacionSedeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/validaciones-sedes")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR')")
public class ValidacionSedeController {

    @Autowired
    private ValidacionSedeService validacionSedeService;

    @PostMapping
    public ResponseEntity<ValidacionSedeDTO> create(@RequestBody ValidacionSedeDTO dto) {
        return new ResponseEntity<>(validacionSedeService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ValidacionSedeDTO> update(@PathVariable Long id, @RequestBody ValidacionSedeDTO dto) {
        return ResponseEntity.ok(validacionSedeService.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ValidacionSedeDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(validacionSedeService.findById(id));
    }

    @GetMapping("/sede/{sedeId}")
    public ResponseEntity<List<ValidacionSedeDTO>> findBySedeId(@PathVariable Long sedeId) {
        return ResponseEntity.ok(validacionSedeService.findBySedeId(sedeId));
    }

    @GetMapping("/sede/{sedeId}/historial")
    public ResponseEntity<List<ValidacionSedeDTO>> findHistorialBySedeId(@PathVariable Long sedeId) {
        return ResponseEntity.ok(validacionSedeService.findHistorialBySedeId(sedeId));
    }

    @GetMapping("/sede/{sedeId}/vigente")
    public ResponseEntity<ValidacionSedeDTO> findValidacionVigente(@PathVariable Long sedeId) {
        ValidacionSedeDTO validacion = validacionSedeService.findValidacionVigente(sedeId);
        if (validacion != null) {
            return ResponseEntity.ok(validacion);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        validacionSedeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

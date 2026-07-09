package edu.unt.ingenieria_industrial.sgpp.core.practicas.controller;

import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.TipoPracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.service.TipoPracticaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tipo-practica")
@RequiredArgsConstructor
@Tag(name = "Tipos de Práctica", description = "Endpoints para consultar tipos de práctica preprofesional")
public class TipoPracticaController {

    private final TipoPracticaService tipoPracticaService;

    @GetMapping
    @Operation(summary = "Listar tipos de práctica activos")
    public ResponseEntity<List<TipoPracticaDTO>> findAllActive() {
        return ResponseEntity.ok(tipoPracticaService.findAllActive());
    }
}

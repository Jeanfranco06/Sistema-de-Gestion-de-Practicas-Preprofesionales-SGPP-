package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.controller;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.EvaluacionRequestDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.EvaluacionResponseDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.CriterioEvaluacionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.EvaluacionService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/evaluaciones")
@RequiredArgsConstructor
public class EvaluacionController {

    private final EvaluacionService evaluacionService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<EvaluacionResponseDTO> crearEvaluacion(
            @RequestBody EvaluacionRequestDTO request,
            Authentication authentication) {
        String username = authentication.getName();
        Long userId = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
        return ResponseEntity.ok(evaluacionService.crearEvaluacion(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluacionResponseDTO> obtenerEvaluacionPorId(@PathVariable Long id) {
        return ResponseEntity.ok(evaluacionService.obtenerEvaluacionPorId(id));
    }

    @GetMapping("/practica/{idPractica}")
    public ResponseEntity<List<EvaluacionResponseDTO>> obtenerEvaluacionesPorPractica(@PathVariable Long idPractica) {
        return ResponseEntity.ok(evaluacionService.obtenerEvaluacionesPorPractica(idPractica));
    }

    @GetMapping("/criterios/{tipoEvaluador}")
    public ResponseEntity<List<CriterioEvaluacionDTO>> obtenerCriteriosPorTipoEvaluador(@PathVariable String tipoEvaluador) {
        return ResponseEntity.ok(evaluacionService.obtenerCriteriosPorTipoEvaluador(tipoEvaluador));
    }
}


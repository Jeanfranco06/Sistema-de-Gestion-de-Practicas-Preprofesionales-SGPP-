package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.controller;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.EvaluacionRequestDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.EvaluacionResponseDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.CriterioEvaluacionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.EvaluacionService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/evaluaciones")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class EvaluacionController {

    private final EvaluacionService evaluacionService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<EvaluacionResponseDTO> crearEvaluacion(
            @Valid @RequestBody EvaluacionRequestDTO request,
            Authentication authentication) {
        String username = authentication.getName();
        Long userId = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
        request.setEvaluadorId(userId);
        List<String> roles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.toList());
        return ResponseEntity.ok(evaluacionService.crearEvaluacion(request, userId, roles));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_SISTEMA')")
    public ResponseEntity<EvaluacionResponseDTO> actualizarEvaluacion(
            @PathVariable Long id,
            @Valid @RequestBody EvaluacionRequestDTO request,
            Authentication authentication) {
        String username = authentication.getName();
        Long userId = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
        return ResponseEntity.ok(evaluacionService.actualizarEvaluacion(id, request, userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<EvaluacionResponseDTO> obtenerEvaluacionPorId(@PathVariable Long id) {
        return ResponseEntity.ok(evaluacionService.obtenerEvaluacionPorId(id));
    }

    @GetMapping("/expediente/{idExpediente}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<List<EvaluacionResponseDTO>> obtenerEvaluacionesPorPractica(@PathVariable Long idExpediente) {
        return ResponseEntity.ok(evaluacionService.obtenerEvaluacionesPorPractica(idExpediente));
    }

    @GetMapping("/criterios/{componente}")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA')")
    public ResponseEntity<List<CriterioEvaluacionDTO>> obtenerCriteriosPorTipoEvaluador(@PathVariable String componente) {
        return ResponseEntity.ok(evaluacionService.obtenerCriteriosPorTipoEvaluador(componente));
    }
}


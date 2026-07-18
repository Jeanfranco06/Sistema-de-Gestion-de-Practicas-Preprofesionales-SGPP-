package edu.unt.ingenieria_industrial.sgpp.core.evaluacion.controller;

import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.ComponenteEvaluacionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.dto.RegistrarComponenteRequest;
import edu.unt.ingenieria_industrial.sgpp.core.evaluacion.service.ComponenteEvaluacionService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.CurrentUserService;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/evaluaciones/componentes")
@RequiredArgsConstructor
@Tag(name = "Componentes de Evaluación", description = "Gestión de componentes de evaluación por expediente")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
public class ComponenteEvaluacionController {

    private final ComponenteEvaluacionService componenteEvaluacionService;
    private final CurrentUserService currentUserService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/expediente/{idExpediente}")
    @Operation(summary = "Listar componentes de evaluación de un expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<List<ComponenteEvaluacionDTO>>> listarPorExpediente(
            @PathVariable Long idExpediente) {
        List<ComponenteEvaluacionDTO> componentes = componenteEvaluacionService.obtenerComponentesPorExpediente(idExpediente);
        return ResponseEntity.ok(ApiResponse.<List<ComponenteEvaluacionDTO>>builder()
                .success(true).data(componentes).timestamp(LocalDateTime.now()).build());
    }

    @PostMapping
    @Operation(summary = "Registrar evaluación de un componente")
    public ResponseEntity<ApiResponse<ComponenteEvaluacionDTO>> registrar(
            @Valid @RequestBody RegistrarComponenteRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        String tipoEvaluador = determinarTipoEvaluador(usuario);
        ComponenteEvaluacionDTO dto = componenteEvaluacionService.registrarEvaluacion(
                request.getIdExpediente(),
                request.getTipoComponente(),
                request.getPuntaje(),
                usuario.getId(),
                tipoEvaluador,
                request.getObservaciones());
        return ResponseEntity.ok(ApiResponse.<ComponenteEvaluacionDTO>builder()
                .success(true).message("Componente evaluado registrado").data(dto).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/expediente/{idExpediente}/total")
    @Operation(summary = "Calcular puntaje total de un expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA', 'ESTUDIANTE')")
    public ResponseEntity<ApiResponse<Integer>> calcularTotal(@PathVariable Long idExpediente) {
        Integer total = componenteEvaluacionService.calcularPuntajeTotal(idExpediente);
        return ResponseEntity.ok(ApiResponse.<Integer>builder()
                .success(true).data(total).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/expediente/{idExpediente}/completado")
    @Operation(summary = "Verificar si todos los componentes están completados")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<Boolean>> estanCompletados(@PathVariable Long idExpediente) {
        Boolean completado = componenteEvaluacionService.estanTodosComponentesCompletados(idExpediente);
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .success(true).data(completado).timestamp(LocalDateTime.now()).build());
    }

    private String determinarTipoEvaluador(Usuario usuario) {
        if (usuario.getUsuarioRoles() == null) return "DESCONOCIDO";
        return usuario.getUsuarioRoles().stream()
                .map(r -> r.getRol() != null && r.getRol().getNombre() != null ? r.getRol().getNombre().name() : "")
                .filter(r -> !r.isBlank())
                .findFirst()
                .orElse("DESCONOCIDO");
    }
}

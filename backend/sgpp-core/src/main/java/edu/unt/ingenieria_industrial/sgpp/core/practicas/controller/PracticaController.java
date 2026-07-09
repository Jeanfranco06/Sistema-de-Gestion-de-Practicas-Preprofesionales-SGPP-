package edu.unt.ingenieria_industrial.sgpp.core.practicas.controller;

import edu.unt.ingenieria_industrial.sgpp.core.empresarial.model.SedePractica;
import edu.unt.ingenieria_industrial.sgpp.core.empresarial.repository.SedePracticaRepository;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.dto.AsignarEmpresaSedeRequest;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.dto.CrearExpedienteRequest;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteService;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.dto.PracticaDTO;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.service.PracticaService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/practicas")
@RequiredArgsConstructor
@Tag(name = "Prácticas", description = "Endpoints para la gestión de prácticas preprofesionales")
public class PracticaController {

    private final PracticaService practicaService;
    private final EstudianteRepository estudianteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ExpedienteService expedienteService;
    private final SedePracticaRepository sedePracticaRepository;

    @PostMapping("/solicitar")
    @Operation(summary = "Solicitar una nueva práctica")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> solicitarPractica(@RequestBody Map<String, Object> request, Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Long estudianteId = estudianteRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Perfil de estudiante no encontrado"))
                .getId();

        Long sedeId = Long.valueOf(request.get("sedeId").toString());
        Long tipoPracticaId = Long.valueOf(request.get("tipoPracticaId").toString());

        PracticaDTO result = practicaService.solicitarPractica(estudianteId, sedeId, tipoPracticaId);

        try {
            CrearExpedienteRequest crearReq = CrearExpedienteRequest.builder()
                    .idEstudiante(estudianteId)
                    .idTipoPractica(tipoPracticaId)
                    .condicionSolicitante("ESTUDIANTE")
                    .build();
            var expediente = expedienteService.crear(crearReq, usuario.getId());

            SedePractica sede = sedePracticaRepository.findById(sedeId)
                    .orElseThrow(() -> new RuntimeException("Sede no encontrada"));

            AsignarEmpresaSedeRequest asignarReq = AsignarEmpresaSedeRequest.builder()
                    .idEmpresa(sede.getEmpresa().getId())
                    .idSedePractica(sedeId)
                    .build();
            expedienteService.asignarEmpresaSede(expediente.getId(), asignarReq, usuario.getId());

            log.info("Expediente {} creado automáticamente desde solicitud de práctica {}", expediente.getCodigoExpediente(), result.getId());
        } catch (Exception e) {
            log.error("Error al crear expediente automático desde solicitud de práctica: {}", e.getMessage(), e);
        }

        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/mi-practica")
    @Operation(summary = "Obtener la práctica activa del estudiante autenticado")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> getMiPractica(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Long estudianteId = estudianteRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Perfil de estudiante no encontrado"))
                .getId();

        var practicas = practicaService.findByEstudianteId(estudianteId);
        var activa = practicas.stream().filter(PracticaDTO::getActivo).findFirst();
        return ResponseEntity.ok(activa.orElse(null));
    }
}

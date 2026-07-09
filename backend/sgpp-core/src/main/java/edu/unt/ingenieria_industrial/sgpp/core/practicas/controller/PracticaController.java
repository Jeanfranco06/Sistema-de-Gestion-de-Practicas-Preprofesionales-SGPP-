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
import edu.unt.ingenieria_industrial.sgpp.core.academico.service.ValidacionAcademicaService;
import edu.unt.ingenieria_industrial.sgpp.core.academico.dto.ValidacionAcademicaRequest;
import edu.unt.ingenieria_industrial.sgpp.core.practicas.repository.TipoPracticaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
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
    private final ValidacionAcademicaService validacionAcademicaService;
    private final TipoPracticaRepository tipoPracticaRepository;

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

        // Validar requisitos académicos antes de crear el expediente
        try {
            var tipoPractica = tipoPracticaRepository.findById(tipoPracticaId)
                    .orElseThrow(() -> new RuntimeException("Tipo de práctica no encontrado"));
            
            String periodoAcademico = Year.now().getValue() + "-II";
            
            ValidacionAcademicaRequest validacionRequest = ValidacionAcademicaRequest.builder()
                    .estudianteId(estudianteId)
                    .codigoTipoPractica(tipoPractica.getCodigo())
                    .periodoAcademico(periodoAcademico)
                    .build();
            
            var resultadoValidacion = validacionAcademicaService.validarEstudiante(validacionRequest);
            
            if (!resultadoValidacion.getApto()) {
                StringBuilder errores = new StringBuilder("No cumple con los requisitos académicos para este tipo de práctica:\n");
                resultadoValidacion.getDetalles().forEach(detalle -> {
                    if (!detalle.getCumplido()) {
                        errores.append("- ").append(detalle.getDescripcion()).append("\n");
                    }
                });
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", errores.toString(),
                    "detalles", resultadoValidacion.getDetalles()
                ));
            }
        } catch (Exception e) {
            log.error("Error al validar requisitos académicos: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error al validar requisitos académicos: " + e.getMessage()
            ));
        }

        String periodoAcademico = Year.now().getValue() + "-II";
        CrearExpedienteRequest crearReq = CrearExpedienteRequest.builder()
                .idEstudiante(estudianteId)
                .idTipoPractica(tipoPracticaId)
                .periodoAcademico(periodoAcademico)
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

        PracticaDTO result = practicaService.solicitarPractica(estudianteId, sedeId, tipoPracticaId);

        log.info("Expediente {} creado automáticamente desde solicitud de práctica {}", expediente.getCodigoExpediente(), result.getId());
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

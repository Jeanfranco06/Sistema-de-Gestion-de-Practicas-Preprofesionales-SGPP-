package edu.unt.ingenieria_industrial.sgpp.core.expediente.controller;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteService;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.CurrentUserService;
import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@RestController
@RequestMapping("/expedientes")
@RequiredArgsConstructor
@Tag(name = "Expediente de Práctica", description = "Gestión del ciclo de vida del expediente de práctica pre-profesional")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'ESTUDIANTE', 'TUTOR_EXTERNO')")
public class ExpedienteController {

    private final ExpedienteService expedienteService;
    private final CurrentUserService currentUserService;

    @PostMapping
    @Operation(summary = "Crear un nuevo expediente")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> crear(
            @Valid @RequestBody CrearExpedienteRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.crear(request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ExpedienteResponse>builder()
                        .success(true)
                        .message("Expediente creado exitosamente")
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @PutMapping("/{id}/asignar-empresa")
    @Operation(summary = "Asignar empresa y sede al expediente")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> asignarEmpresaSede(
            @PathVariable Long id,
            @Valid @RequestBody AsignarEmpresaSedeRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.asignarEmpresaSede(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Empresa y sede asignadas").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/validar")
    @Operation(summary = "Validar expediente por Secretaría y marcarlo como listo para carta")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> validarExpediente(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.validarExpediente(id, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Expediente validado y marcado como listo para carta").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/emitir-carta-presentacion")
    @Operation(summary = "Emitir Carta de Presentación (Director/Coordinador)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> emitirCartaPresentacion(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.emitirCartaPresentacion(id, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Carta de Presentación emitida y firmada").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/presentar-carta-aceptacion")
    @Operation(summary = "Presentar Carta de Aceptación de la empresa (Estudiante)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> presentarCartaAceptacion(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        expedienteService.findByIdForUser(id, usuarioActual, currentUserService.getCurrentRoles());
        ExpedienteResponse response = expedienteService.presentarCartaAceptacion(id, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Carta de Aceptación registrada").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/asignar-asesor")
    @Operation(summary = "Asignar asesor docente (solo práctica inicial)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> asignarAsesor(
            @PathVariable Long id,
            @Valid @RequestBody AsignarAsesorRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.asignarAsesor(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Asesor asignado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/asignar-comite")
    @Operation(summary = "Asignar comité de prácticas (solo práctica final/profesional)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> asignarComite(
            @PathVariable Long id,
            @Valid @RequestBody AsignarComiteRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.asignarComite(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Comité asignado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/aprobar-plan")
    @Operation(summary = "Aprobar plan de trabajo")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> aprobarPlan(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        expedienteService.findByIdForUser(id, usuarioActual, currentUserService.getCurrentRoles());
        ExpedienteResponse response = expedienteService.aprobarPlan(id, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Plan de trabajo aprobado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PostMapping("/{id}/documentos")
    @Operation(summary = "Agregar documento al expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> agregarDocumento(
            @PathVariable Long id,
            @RequestParam(required = false) String tipoDocumento,
            @RequestParam String nombreDoc,
            @RequestParam String fileName,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        expedienteService.findByIdForUser(id, usuarioActual, currentUserService.getCurrentRoles());
        ExpedienteResponse response = expedienteService.agregarDocumento(id, tipoDocumento, nombreDoc, fileName, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Documento agregado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @DeleteMapping("/{id}/documentos/{idDocumento}")
    @Operation(summary = "Eliminar documento del expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> eliminarDocumento(
            @PathVariable Long id,
            @PathVariable Long idDocumento,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        expedienteService.findByIdForUser(id, usuarioActual, currentUserService.getCurrentRoles());
        ExpedienteResponse response = expedienteService.eliminarDocumento(id, idDocumento, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Documento eliminado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/documentos/{idDocumento}/evaluar")
    @Operation(summary = "Evaluar documento del expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> evaluarDocumento(
            @PathVariable Long id,
            @PathVariable Long idDocumento,
            @RequestParam String estado,
            @RequestParam(required = false) String observaciones,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.evaluarDocumento(id, idDocumento, estado, observaciones, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Documento evaluado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PostMapping("/{id}/observaciones")
    @Operation(summary = "Agregar observación al expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> agregarObservacion(
            @PathVariable Long id,
            @Valid @RequestBody AgregarObservacionRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.agregarObservacion(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Observación registrada").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/iniciar-ejecucion")
    @Operation(summary = "Iniciar ejecución de la práctica")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COORDINADOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> iniciarEjecucion(
            @PathVariable Long id,
            @RequestParam LocalDate fechaInicio,
            @RequestParam Integer duracionSemanas,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.iniciarEjecucion(id, idUsuario != null ? idUsuario : 1L,
                fechaInicio, duracionSemanas);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Ejecución iniciada").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/informe-parcial")
    @Operation(summary = "Registrar presentación de informe parcial (práctica inicial)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> presentarInformeParcial(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        expedienteService.findByIdForUser(id, usuarioActual, currentUserService.getCurrentRoles());
        ExpedienteResponse response = expedienteService.presentarInformeParcial(id, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Informe parcial registrado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/informe-final")
    @Operation(summary = "Registrar presentación de informe final (práctica final/profesional)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> presentarInformeFinal(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        expedienteService.findByIdForUser(id, usuarioActual, currentUserService.getCurrentRoles());
        ExpedienteResponse response = expedienteService.presentarInformeFinal(id, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Informe final registrado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/aprobar-informe-final")
    @Operation(summary = "Aprobar el informe final por el comité")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> aprobarInformeFinal(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        expedienteService.findByIdForUser(id, usuarioActual, currentUserService.getCurrentRoles());
        ExpedienteResponse response = expedienteService.aprobarInformeFinal(id, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Informe final aprobado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/cerrar")
    @Operation(summary = "Cerrar expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> cerrar(
            @PathVariable Long id,
            @RequestParam(required = false) String observacion,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.cerrar(id, idUsuario != null ? idUsuario : 1L, observacion);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Expediente cerrado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/mis-expedientes")
    @Operation(summary = "Listar expedientes del usuario autenticado según su rol")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'ESTUDIANTE', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findMisExpedientes() {
        Long idUsuario = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        List<ExpedienteResponse> list = expedienteService.findMisExpedientes(idUsuario, currentUserService.getCurrentRoles());
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener expediente por ID")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'ESTUDIANTE', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> findById(@PathVariable Long id) {
        Long idUsuario = currentUserService.getCurrentUserId();
        List<String> roles = currentUserService.getCurrentRoles();
        ExpedienteResponse response = idUsuario != null
                ? expedienteService.findByIdForUser(id, idUsuario, roles)
                : expedienteService.findById(id);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).data(response).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping
    @Operation(summary = "Listar expedientes accesibles para el usuario autenticado")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findAll() {
        Long idUsuario = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        List<String> roles = currentUserService.getCurrentRoles();
        boolean tieneLecturaGlobal = roles.stream().anyMatch(
                rol -> Set.of("ADMIN_SISTEMA", "ADMINISTRADOR", "SECRETARIA", "COORDINADOR", "DIRECTOR").contains(rol));
        List<ExpedienteResponse> list = tieneLecturaGlobal
                ? expedienteService.findAll()
                : expedienteService.findMisExpedientes(idUsuario, roles);
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/estudiante/{estudianteId}")
    @Operation(summary = "Listar expedientes por estudiante")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'ESTUDIANTE', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findByEstudianteId(@PathVariable Long estudianteId) {
        Long idUsuario = currentUserService.getCurrentUserId();
        List<ExpedienteResponse> list = idUsuario != null
                ? expedienteService.findByEstudianteIdForUser(estudianteId, idUsuario, currentUserService.getCurrentRoles())
                : expedienteService.findByEstudianteId(estudianteId);
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/asesor/{asesorId}")
    @Operation(summary = "Listar expedientes asignados a un docente asesor")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findByAsesorId(@PathVariable Long asesorId) {
        Long idUsuario = currentUserService.getCurrentUserId();
        List<ExpedienteResponse> list = idUsuario != null
                ? expedienteService.findByAsesorIdForUser(asesorId, idUsuario, currentUserService.getCurrentRoles())
                : expedienteService.findByAsesorId(asesorId);
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar expedientes por estado")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findByEstado(@PathVariable String estado) {
        List<ExpedienteResponse> list = expedienteService.findByEstado(estado);
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/tutor-empresa/{tutorEmpresaId}")
    @Operation(summary = "Listar expedientes por empresa del tutor")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'TUTOR_EXTERNO', 'COORDINADOR', 'COMITE_PRACTICAS', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findByTutorEmpresaId(@PathVariable Long tutorEmpresaId) {
        List<ExpedienteResponse> list = expedienteService.findByTutorEmpresaId(tutorEmpresaId);
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/tutor-usuario/{usuarioId}")
    @Operation(summary = "Listar expedientes asignados a un tutor externo por su usuario")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'TUTOR_EXTERNO', 'COORDINADOR', 'COMITE_PRACTICAS', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findByTutorUsuarioId(@PathVariable Long usuarioId) {
        Long idUsuario = currentUserService.getCurrentUserId();
        if (currentUserService.hasAnyRole("TUTOR_EXTERNO") && idUsuario != null && !idUsuario.equals(usuarioId)) {
            throw new org.springframework.security.access.AccessDeniedException("No puede consultar expedientes de otro tutor");
        }
        List<ExpedienteResponse> list = expedienteService.findByTutorUsuarioId(usuarioId);
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @DeleteMapping("/{id}/disable")
    @Operation(summary = "Deshabilitar expediente")
    public ResponseEntity<ApiResponse<Void>> disable(@PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        expedienteService.disable(id, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{id}/emitir-dictamen")
    @Operation(summary = "Emitir dictamen final del expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<Void>> emitirDictamen(
            @PathVariable Long id,
            @RequestParam String dictamen,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        expedienteService.findByIdForUser(id, usuarioActual, currentUserService.getCurrentRoles());
        expedienteService.emitirDictamen(id, dictamen, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Dictamen final emitido").timestamp(LocalDateTime.now()).build());
    }

    @PostMapping("/{id}/habilitar-examen-aplazados")
    @Operation(summary = "Habilitar examen de aplazados para práctica inicial")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> habilitarExamenAplazados(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        ExpedienteResponse response = expedienteService.habilitarExamenAplazados(id, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Examen de aplazados habilitado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PostMapping("/{id}/registrar-examen-aplazados")
    @Operation(summary = "Registrar nota del examen de aplazados")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> registrarExamenAplazados(
            @PathVariable Long id,
            @Valid @RequestBody RegistrarExamenAplazadosRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        Long usuarioActual = Objects.requireNonNull(currentUserService.getCurrentUserId(), "Usuario no autenticado");
        ExpedienteResponse response = expedienteService.registrarExamenAplazados(id, request, usuarioActual);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Nota de examen de aplazados registrada").data(response).timestamp(LocalDateTime.now()).build());
    }
}

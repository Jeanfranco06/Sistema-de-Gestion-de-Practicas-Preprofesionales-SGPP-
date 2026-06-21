package edu.unt.ingenieria_industrial.sgpp.core.expediente.controller;

import edu.unt.ingenieria_industrial.sgpp.core.expediente.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.expediente.service.ExpedienteService;
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

@RestController
@RequestMapping("/expedientes")
@RequiredArgsConstructor
@Tag(name = "Expediente de Práctica", description = "Gestión del ciclo de vida del expediente de práctica pre-profesional")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
public class ExpedienteController {

    private final ExpedienteService expedienteService;

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

    @PutMapping("/{id}/presentar-plan")
    @Operation(summary = "Presentar plan de trabajo")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'ESTUDIANTE', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> presentarPlan(
            @PathVariable Long id,
            @Valid @RequestBody PresentarPlanRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.presentarPlan(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Plan de trabajo presentado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/aprobar-plan")
    @Operation(summary = "Aprobar plan de trabajo")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> aprobarPlan(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.aprobarPlan(id, idUsuario != null ? idUsuario : 1L);
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
        ExpedienteResponse response = expedienteService.agregarDocumento(id, tipoDocumento, nombreDoc, fileName, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Documento agregado").data(response).timestamp(LocalDateTime.now()).build());
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

    @PutMapping("/{id}/subsanar")
    @Operation(summary = "Subsanar observaciones del expediente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> subsanar(
            @PathVariable Long id,
            @Valid @RequestBody SubsanarObservacionesRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.subsanarObservaciones(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Observaciones subsanadas").data(response).timestamp(LocalDateTime.now()).build());
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
        ExpedienteResponse response = expedienteService.presentarInformeParcial(id, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Informe parcial registrado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/informe-final")
    @Operation(summary = "Registrar presentación de informe final (práctica final/profesional)")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ESTUDIANTE', 'SECRETARIA')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> presentarInformeFinal(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.presentarInformeFinal(id, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Informe final registrado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/aprobar-informe-final")
    @Operation(summary = "Aprobar el informe final por el comité")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> aprobarInformeFinal(
            @PathVariable Long id,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.aprobarInformeFinal(id, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Informe final aprobado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @PutMapping("/{id}/evaluar")
    @Operation(summary = "Evaluar expediente y registrar calificación")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> evaluar(
            @PathVariable Long id,
            @Valid @RequestBody EvaluarExpedienteRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.evaluar(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Evaluación registrada").data(response).timestamp(LocalDateTime.now()).build());
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

    @PutMapping("/{id}/cambiar-estado")
    @Operation(summary = "Cambiar estado del expediente manualmente")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambioEstadoRequest request,
            @RequestAttribute(value = "idUsuario", required = false) Long idUsuario) {
        ExpedienteResponse response = expedienteService.cambiarEstado(id, request, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).message("Estado actualizado").data(response).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener expediente por ID")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'ESTUDIANTE', 'TUTOR_EXTERNO')")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> findById(@PathVariable Long id) {
        ExpedienteResponse response = expedienteService.findById(id);
        return ResponseEntity.ok(ApiResponse.<ExpedienteResponse>builder()
                .success(true).data(response).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping
    @Operation(summary = "Listar todos los expedientes activos")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findAll() {
        List<ExpedienteResponse> list = expedienteService.findAll();
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/estudiante/{estudianteId}")
    @Operation(summary = "Listar expedientes por estudiante")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'ESTUDIANTE', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findByEstudianteId(@PathVariable Long estudianteId) {
        List<ExpedienteResponse> list = expedienteService.findByEstudianteId(estudianteId);
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/asesor/{asesorId}")
    @Operation(summary = "Listar expedientes asignados a un docente asesor")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR')")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findByAsesorId(@PathVariable Long asesorId) {
        List<ExpedienteResponse> list = expedienteService.findByAsesorId(asesorId);
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar expedientes por estado")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findByEstado(@PathVariable String estado) {
        List<ExpedienteResponse> list = expedienteService.findByEstado(estado);
        return ResponseEntity.ok(ApiResponse.<List<ExpedienteResponse>>builder()
                .success(true).data(list).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/tutor-empresa/{tutorEmpresaId}")
    @Operation(summary = "Listar expedientes por tutor empresa")
    @PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'TUTOR_EXTERNO', 'COORDINADOR', 'COMITE_PRACTICAS', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<List<ExpedienteResponse>>> findByTutorEmpresaId(@PathVariable Long tutorEmpresaId) {
        List<ExpedienteResponse> list = expedienteService.findByTutorEmpresaId(tutorEmpresaId);
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
        expedienteService.emitirDictamen(id, dictamen, idUsuario != null ? idUsuario : 1L);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Dictamen final emitido").timestamp(LocalDateTime.now()).build());
    }
}

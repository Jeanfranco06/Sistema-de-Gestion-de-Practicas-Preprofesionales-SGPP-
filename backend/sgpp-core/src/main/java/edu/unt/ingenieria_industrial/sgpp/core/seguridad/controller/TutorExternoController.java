package edu.unt.ingenieria_industrial.sgpp.core.seguridad.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.TutorExternoDTO;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.TutorExternoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/tutores-externos")
@RequiredArgsConstructor
@Tag(name = "GestiÃ³n de Tutores Externos", description = "Endpoints para la administraciÃ³n de tutores externos")
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR')")
public class TutorExternoController {

    private final TutorExternoService tutorExternoService;

    @PostMapping
    @Operation(summary = "Crear un nuevo perfil de tutor externo")
    public ResponseEntity<ApiResponse<TutorExternoDTO>> create(@Valid @RequestBody TutorExternoDTO dto) {
        TutorExternoDTO created = tutorExternoService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<TutorExternoDTO>builder()
                        .success(true)
                        .message("Tutor externo creado exitosamente")
                        .data(created)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping
    @Operation(summary = "Listar todos los tutores externos")
    public ResponseEntity<ApiResponse<List<TutorExternoDTO>>> findAll() {
        List<TutorExternoDTO> tutores = tutorExternoService.findAll();
        return ResponseEntity.ok(
                ApiResponse.<List<TutorExternoDTO>>builder()
                        .success(true)
                        .data(tutores)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un tutor externo por ID")
    public ResponseEntity<ApiResponse<TutorExternoDTO>> findById(@PathVariable Long id) {
        TutorExternoDTO tutor = tutorExternoService.findById(id);
        return ResponseEntity.ok(
                ApiResponse.<TutorExternoDTO>builder()
                        .success(true)
                        .data(tutor)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un tutor externo")
    public ResponseEntity<ApiResponse<TutorExternoDTO>> update(@PathVariable Long id, @Valid @RequestBody TutorExternoDTO dto) {
        TutorExternoDTO updated = tutorExternoService.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<TutorExternoDTO>builder()
                        .success(true)
                        .message("Tutor externo actualizado exitosamente")
                        .data(updated)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deshabilitar un tutor externo")
    public ResponseEntity<ApiResponse<Void>> disable(@PathVariable Long id) {
        tutorExternoService.disable(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Tutor externo deshabilitado exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/empresa/{empresaId}")
    @Operation(summary = "Listar tutores externos por empresa")
    public ResponseEntity<ApiResponse<List<TutorExternoDTO>>> findByEmpresaId(@PathVariable Long empresaId) {
        List<TutorExternoDTO> tutores = tutorExternoService.findByEmpresaId(empresaId);
        return ResponseEntity.ok(
                ApiResponse.<List<TutorExternoDTO>>builder()
                        .success(true)
                        .data(tutores)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/sede/{sedeId}")
    @Operation(summary = "Listar tutores externos por sede")
    public ResponseEntity<ApiResponse<List<TutorExternoDTO>>> findBySedeId(@PathVariable Long sedeId) {
        List<TutorExternoDTO> tutores = tutorExternoService.findBySedeId(sedeId);
        return ResponseEntity.ok(
                ApiResponse.<List<TutorExternoDTO>>builder()
                        .success(true)
                        .data(tutores)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/empresa/{empresaId}/estado/{estadoTutor}")
    @Operation(summary = "Listar tutores externos por empresa y estado")
    public ResponseEntity<ApiResponse<List<TutorExternoDTO>>> findByEmpresaIdAndEstadoTutor(
            @PathVariable Long empresaId, @PathVariable String estadoTutor) {
        List<TutorExternoDTO> tutores = tutorExternoService.findByEmpresaIdAndEstadoTutor(empresaId, estadoTutor);
        return ResponseEntity.ok(
                ApiResponse.<List<TutorExternoDTO>>builder()
                        .success(true)
                        .data(tutores)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/sede/{sedeId}/estado/{estadoTutor}")
    @Operation(summary = "Listar tutores externos por sede y estado")
    public ResponseEntity<ApiResponse<List<TutorExternoDTO>>> findBySedeIdAndEstadoTutor(
            @PathVariable Long sedeId, @PathVariable String estadoTutor) {
        List<TutorExternoDTO> tutores = tutorExternoService.findBySedeIdAndEstadoTutor(sedeId, estadoTutor);
        return ResponseEntity.ok(
                ApiResponse.<List<TutorExternoDTO>>builder()
                        .success(true)
                        .data(tutores)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/empresa/{empresaId}/activos")
    @Operation(summary = "Listar tutores externos activos por empresa")
    public ResponseEntity<ApiResponse<List<TutorExternoDTO>>> findActiveByEmpresaId(@PathVariable Long empresaId) {
        List<TutorExternoDTO> tutores = tutorExternoService.findActiveByEmpresaId(empresaId);
        return ResponseEntity.ok(
                ApiResponse.<List<TutorExternoDTO>>builder()
                        .success(true)
                        .data(tutores)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/sede/{sedeId}/activos")
    @Operation(summary = "Listar tutores externos activos por sede")
    public ResponseEntity<ApiResponse<List<TutorExternoDTO>>> findActiveBySedeId(@PathVariable Long sedeId) {
        List<TutorExternoDTO> tutores = tutorExternoService.findActiveBySedeId(sedeId);
        return ResponseEntity.ok(
                ApiResponse.<List<TutorExternoDTO>>builder()
                        .success(true)
                        .data(tutores)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}/activos")
    @Operation(summary = "Listar tutores externos activos por empresa o sede")
    public ResponseEntity<ApiResponse<List<TutorExternoDTO>>> findActiveByEmpresaOrSedeId(@PathVariable Long id) {
        List<TutorExternoDTO> tutores = tutorExternoService.findActiveByEmpresaOrSedeId(id);
        return ResponseEntity.ok(
                ApiResponse.<List<TutorExternoDTO>>builder()
                        .success(true)
                        .data(tutores)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de un tutor externo")
    public ResponseEntity<ApiResponse<Void>> cambiarEstado(@PathVariable Long id, @RequestBody String estadoTutor) {
        tutorExternoService.cambiarEstado(id, estadoTutor);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Estado del tutor externo actualizado exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}


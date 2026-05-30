package edu.unt.ingenieria_industrial.sgpp.usuarios.controller;

import edu.unt.ingenieria_industrial.sgpp.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.TutorExternoDTO;
import edu.unt.ingenieria_industrial.sgpp.usuarios.service.TutorExternoService;
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
@Tag(name = "Gestión de Tutores Externos", description = "Endpoints para la administración de tutores externos")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'COORDINADOR', 'DIRECTOR')")
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
}

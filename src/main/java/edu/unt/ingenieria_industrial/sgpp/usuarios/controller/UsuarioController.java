package edu.unt.ingenieria_industrial.sgpp.usuarios.controller;

import edu.unt.ingenieria_industrial.sgpp.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.UsuarioCreateDTO;
import edu.unt.ingenieria_industrial.sgpp.usuarios.dto.UsuarioDTO;
import edu.unt.ingenieria_industrial.sgpp.usuarios.service.UsuarioService;
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
import java.util.Set;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Tag(name = "Gestión de Usuarios", description = "Endpoints para la administración de usuarios y roles")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'COORDINADOR', 'DIRECTOR')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    @Operation(summary = "Crear un nuevo usuario")
    public ResponseEntity<ApiResponse<UsuarioDTO>> create(@Valid @RequestBody UsuarioCreateDTO dto) {
        UsuarioDTO created = usuarioService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<UsuarioDTO>builder()
                        .success(true)
                        .message("Usuario creado exitosamente")
                        .data(created)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping
    @Operation(summary = "Listar todos los usuarios")
    public ResponseEntity<ApiResponse<List<UsuarioDTO>>> findAll() {
        List<UsuarioDTO> usuarios = usuarioService.findAll();
        return ResponseEntity.ok(
                ApiResponse.<List<UsuarioDTO>>builder()
                        .success(true)
                        .data(usuarios)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un usuario por ID")
    public ResponseEntity<ApiResponse<UsuarioDTO>> findById(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioService.findById(id);
        return ResponseEntity.ok(
                ApiResponse.<UsuarioDTO>builder()
                        .success(true)
                        .data(usuario)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un usuario")
    public ResponseEntity<ApiResponse<UsuarioDTO>> update(@PathVariable Long id, @Valid @RequestBody UsuarioDTO dto) {
        UsuarioDTO updated = usuarioService.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<UsuarioDTO>builder()
                        .success(true)
                        .message("Usuario actualizado exitosamente")
                        .data(updated)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deshabilitar un usuario")
    public ResponseEntity<ApiResponse<Void>> disable(@PathVariable Long id) {
        usuarioService.disable(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Usuario deshabilitado exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/{id}/unlock")
    @Operation(summary = "Desbloquear una cuenta de usuario")
    public ResponseEntity<ApiResponse<Void>> unlock(@PathVariable Long id) {
        usuarioService.unlock(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Cuenta desbloqueada exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/{id}/roles")
    @Operation(summary = "Asignar roles a un usuario")
    public ResponseEntity<ApiResponse<Void>> assignRoles(@PathVariable Long id, @RequestBody Set<String> roles) {
        usuarioService.assignRoles(id, roles);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Roles asignados exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}

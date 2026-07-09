package edu.unt.ingenieria_industrial.sgpp.core.seguridad.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@PreAuthorize("hasAnyRole('ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COORDINADOR', 'DIRECTOR')")
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
    public ResponseEntity<ApiResponse<List<UsuarioDTO>>> findAll(
            @Parameter(description = "Filtro por nombre") @RequestParam(required = false) String nombre,
            @Parameter(description = "Filtro por correo") @RequestParam(required = false) String correo,
            @Parameter(description = "Filtro por estado (ACTIVO, INACTIVO, BLOQUEADO)") @RequestParam(required = false) String estado,
            @Parameter(description = "Filtro por rol") @RequestParam(required = false) String rol,
            @Parameter(description = "Filtro por tipo de usuario (INTERNO, EXTERNO)") @RequestParam(required = false) String tipoUsuario) {
        List<UsuarioDTO> usuarios = usuarioService.findAllWithFilters(nombre, correo, estado, rol, tipoUsuario);
        return ResponseEntity.ok(
                ApiResponse.<List<UsuarioDTO>>builder()
                        .success(true)
                        .data(usuarios)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/check-available")
    @Operation(summary = "Verificar si un campo está disponible (no duplicado)")
    public ResponseEntity<ApiResponse<Boolean>> checkFieldAvailable(
            @Parameter(description = "Nombre del campo: username, email, numeroDocumento, codigoMatricula, codigoDocente") @RequestParam String field,
            @Parameter(description = "Valor a verificar") @RequestParam String value,
            @Parameter(description = "ID del usuario a excluir (para edición)") @RequestParam(required = false) Long excludeId) {
        boolean available = usuarioService.checkFieldAvailable(field, value, excludeId);
        return ResponseEntity.ok(
                ApiResponse.<Boolean>builder()
                        .success(true)
                        .data(available)
                        .message(available ? "Disponible" : "El valor ya está registrado")
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

    @GetMapping("/{id}/detalle")
    @Operation(summary = "Obtener detalle completo de un usuario")
    public ResponseEntity<ApiResponse<UsuarioDetalleResponse>> findDetalleById(@PathVariable Long id) {
        UsuarioDetalleResponse usuario = usuarioService.findDetalleById(id);
        return ResponseEntity.ok(
                ApiResponse.<UsuarioDetalleResponse>builder()
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

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de un usuario (ACTIVO, INACTIVO, BLOQUEADO)")
    public ResponseEntity<ApiResponse<Void>> updateEstado(@PathVariable Long id, @Valid @RequestBody EstadoUsuarioRequest request) {
        usuarioService.updateEstado(id, request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Estado de usuario actualizado exitosamente")
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

    @GetMapping("/{id}/roles")
    @Operation(summary = "Obtener roles de un usuario")
    public ResponseEntity<ApiResponse<List<RolDTO>>> getRolesByUsuarioId(@PathVariable Long id) {
        List<RolDTO> roles = usuarioService.getRolesByUsuarioId(id);
        return ResponseEntity.ok(
                ApiResponse.<List<RolDTO>>builder()
                        .success(true)
                        .data(roles)
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

    @DeleteMapping("/{id}/roles/{rolId}")
    @Operation(summary = "Revocar un rol de un usuario")
    public ResponseEntity<ApiResponse<Void>> revokeRol(@PathVariable Long id, @PathVariable Long rolId) {
        usuarioService.revokeRol(id, rolId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Rol revocado exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}


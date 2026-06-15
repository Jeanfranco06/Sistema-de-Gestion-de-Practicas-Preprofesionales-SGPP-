package edu.unt.ingenieria_industrial.sgpp.core.controller;

import edu.unt.ingenieria_industrial.sgpp.shared.common.ApiResponse;
import edu.unt.ingenieria_industrial.sgpp.core.dto.NotificacionDTO;
import edu.unt.ingenieria_industrial.sgpp.core.service.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
@Tag(name = "Gestión de Notificaciones", description = "Endpoints para la administración de notificaciones")
@PreAuthorize("isAuthenticated()")
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    @Operation(summary = "Obtener notificaciones del usuario autenticado")
    public ResponseEntity<ApiResponse<List<NotificacionDTO>>> findByUsuario() {
        String usuario = getAuthenticatedUsername();
        List<NotificacionDTO> notificaciones = notificacionService.findByUsuarioDestino(usuario);
        return ResponseEntity.ok(
                ApiResponse.<List<NotificacionDTO>>builder()
                        .success(true)
                        .data(notificaciones)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/no-leidas")
    @Operation(summary = "Obtener notificaciones no leídas del usuario autenticado")
    public ResponseEntity<ApiResponse<List<NotificacionDTO>>> findNotRead() {
        String usuario = getAuthenticatedUsername();
        List<NotificacionDTO> notificaciones = notificacionService.findNotReadByUsuarioDestino(usuario);
        return ResponseEntity.ok(
                ApiResponse.<List<NotificacionDTO>>builder()
                        .success(true)
                        .data(notificaciones)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/contador-no-leidas")
    @Operation(summary = "Contar notificaciones no leídas del usuario autenticado")
    public ResponseEntity<ApiResponse<Long>> countNotRead() {
        String usuario = getAuthenticatedUsername();
        long count = notificacionService.countNotReadByUsuarioDestino(usuario);
        return ResponseEntity.ok(
                ApiResponse.<Long>builder()
                        .success(true)
                        .data(count)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping
    @Operation(summary = "Crear una nueva notificación")
    public ResponseEntity<ApiResponse<NotificacionDTO>> create(@RequestBody NotificacionDTO dto) {
        NotificacionDTO created = notificacionService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<NotificacionDTO>builder()
                        .success(true)
                        .message("Notificación creada exitosamente")
                        .data(created)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/{id}/leer")
    @Operation(summary = "Marcar una notificación como leída")
    public ResponseEntity<ApiResponse<NotificacionDTO>> markAsRead(@PathVariable Long id) {
        NotificacionDTO notificacion = notificacionService.markAsRead(id);
        return ResponseEntity.ok(
                ApiResponse.<NotificacionDTO>builder()
                        .success(true)
                        .message("Notificación marcada como leída")
                        .data(notificacion)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/leer-todas")
    @Operation(summary = "Marcar todas las notificaciones como leídas")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        String usuario = getAuthenticatedUsername();
        notificacionService.markAllAsRead(usuario);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Todas las notificaciones marcadas como leídas")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una notificación")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        notificacionService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Notificación eliminada exitosamente")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    private String getAuthenticatedUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "SYSTEM";
    }
}

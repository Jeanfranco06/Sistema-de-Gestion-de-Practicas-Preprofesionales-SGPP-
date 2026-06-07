package edu.unt.ingenieria_industrial.sgpp.api.security;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/authenticated")
@Tag(name = "Endpoints Autenticados", description = "Endpoints para cualquier usuario autenticado")
public class AuthenticatedValidationController {

    @GetMapping("/profile")
    @Operation(summary = "Perfil autenticado", description = "Endpoint para cualquier usuario autenticado")
    public ResponseEntity<Map<String, Object>> authenticatedProfile(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Acceso autorizado - usuario autenticado");
        response.put("user", authentication.getName());
        response.put("roles", authentication.getAuthorities());
        response.put("access", "AUTHENTICATED");
        return ResponseEntity.ok(response);
    }
}


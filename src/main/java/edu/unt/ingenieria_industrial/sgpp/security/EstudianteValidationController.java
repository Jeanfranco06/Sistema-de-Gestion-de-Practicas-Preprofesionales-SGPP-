package edu.unt.ingenieria_industrial.sgpp.security;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/estudiante")
@Tag(name = "Endpoints Estudiantes", description = "Endpoints protegidos para rol ESTUDIANTE")
public class EstudianteValidationController {

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard estudiante", description = "Endpoint protegido para rol ESTUDIANTE")
    public ResponseEntity<Map<String, Object>> estudianteDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Acceso autorizado a dashboard de estudiante");
        response.put("user", authentication.getName());
        response.put("roles", authentication.getAuthorities());
        response.put("access", "ESTUDIANTE");
        return ResponseEntity.ok(response);
    }
}

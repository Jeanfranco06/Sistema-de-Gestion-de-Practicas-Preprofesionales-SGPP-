package edu.unt.ingenieria_industrial.sgpp.api.security;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/docente")
@Tag(name = "Endpoints Docentes", description = "Endpoints protegidos para rol DOCENTE_ASESOR")
public class DocenteValidationController {

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard docente", description = "Endpoint protegido para rol DOCENTE_ASESOR")
    public ResponseEntity<Map<String, Object>> docenteDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Acceso autorizado a dashboard de docente");
        response.put("user", authentication.getName());
        response.put("roles", authentication.getAuthorities());
        response.put("access", "DOCENTE_ASESOR");
        return ResponseEntity.ok(response);
    }
}


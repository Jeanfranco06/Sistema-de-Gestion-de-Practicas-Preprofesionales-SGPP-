package edu.unt.ingenieria_industrial.sgpp.security;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@Tag(name = "Endpoints Administrativos", description = "Endpoints protegidos para roles administrativos")
public class AdminValidationController {

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard administrativo", description = "Endpoint protegido para roles administrativos")
    public ResponseEntity<Map<String, Object>> adminDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Acceso autorizado a dashboard administrativo");
        response.put("user", authentication.getName());
        response.put("roles", authentication.getAuthorities());
        response.put("access", "ADMINISTRATIVE");
        return ResponseEntity.ok(response);
    }
}

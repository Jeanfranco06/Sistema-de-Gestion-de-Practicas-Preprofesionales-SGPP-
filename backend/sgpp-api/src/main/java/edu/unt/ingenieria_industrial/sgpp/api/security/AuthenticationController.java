package edu.unt.ingenieria_industrial.sgpp.api.security;

import edu.unt.ingenieria_industrial.sgpp.api.security.dto.*;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Docente;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Estudiante;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.TutorExterno;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.DocenteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.EstudianteRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.TutorExternoRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para autenticación y gestión de sesiones")
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordResetService passwordResetService;
    private final EstudianteRepository estudianteRepository;
    private final DocenteRepository docenteRepository;
    private final TutorExternoRepository tutorExternoRepository;

    private LoginResponse.UsuarioResponse buildUsuarioResponse(Usuario usuario, UserDetails userDetails) {
        LoginResponse.UsuarioResponse.UsuarioResponseBuilder builder = LoginResponse.UsuarioResponse.builder()
                .id(usuario.getId())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .nombres(usuario.getNombres())
                .apellidoPaterno(usuario.getApellidoPaterno())
                .apellidoMaterno(usuario.getApellidoMaterno())
                .numeroDocumento(usuario.getNumeroDocumento())
                .tipoDocumento(usuario.getTipoDocumento() != null ? usuario.getTipoDocumento().name() : null)
                .telefono(usuario.getTelefono())
                .tipoUsuario(usuario.getTipoUsuario() != null ? usuario.getTipoUsuario().name() : null)
                .activo(usuario.getActivo())
                .cuentaBloqueada(usuario.getCuentaBloqueada())
                .roles(userDetails.getAuthorities().stream()
                        .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                        .collect(Collectors.toList()));

        Estudiante estudiante = estudianteRepository.findByUsuarioId(usuario.getId()).orElse(null);
        if (estudiante != null) {
            builder.codigoMatricula(estudiante.getCodigoEstudiantil())
                    .semestre(estudiante.getSemestreActual() != null ? estudiante.getSemestreActual().toString() : null);
        }

        Docente docente = docenteRepository.findByUsuarioId(usuario.getId()).orElse(null);
        if (docente != null) {
            builder.codigoDocente(docente.getCodigoDocente())
                    .categoria(docente.getCategoria())
                    .especialidad(docente.getEspecialidad())
                    .departamento(docente.getDepartamento());
        }

        TutorExterno tutor = tutorExternoRepository.findByUsuarioId(usuario.getId()).orElse(null);
        if (tutor != null) {
            builder.empresaNombre(tutor.getEmpresaNombre())
                    .cargo(tutor.getCargo())
                    .area(tutor.getArea());
        }

        return builder.build();
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario con credenciales institucionales y retorna un token JWT")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);

        Usuario usuario = usuarioRepository.findByUsernameWithRoles(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setFechaUltimoAcceso(LocalDateTime.now());
        usuario.setIntentosFallidos(0);
        usuarioRepository.save(usuario);

        LoginResponse.UsuarioResponse usuarioResponse = buildUsuarioResponse(usuario, userDetails);

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .usuario(usuarioResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil actual", description = "Retorna la información del usuario autenticado")
    public ResponseEntity<LoginResponse.UsuarioResponse> getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Usuario usuario = userDetails.getUsuario();

        LoginResponse.UsuarioResponse usuarioResponse = buildUsuarioResponse(usuario, userDetails);

        return ResponseEntity.ok(usuarioResponse);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar recuperación de contraseña",
               description = "Genera un token de recuperación y lo retorna. En producción se enviaría por correo.")
    public ResponseEntity<PasswordResetResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String token = passwordResetService.generarTokenReset(request.getEmail());
        String message = "Se ha generado un enlace de recuperación para el email proporcionado. "
                + "En producción se enviaría un correo con el enlace.";
        log.info("Token de recuperación generado para {}: {}", request.getEmail(), token);
        return ResponseEntity.ok(PasswordResetResponse.builder()
                .message(message)
                .resetToken(token)
                .build());
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña",
               description = "Restablece la contraseña utilizando un token de recuperación válido")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.restablecerPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Contraseña restablecida exitosamente"));
    }

    @GetMapping("/validate-reset-token")
    @Operation(summary = "Validar token de recuperación",
               description = "Verifica si un token de recuperación es válido y no ha expirado")
    public ResponseEntity<Map<String, Object>> validateResetToken(@RequestParam String token) {
        boolean valido = passwordResetService.validarToken(token);
        return ResponseEntity.ok(Map.of(
                "valido", valido,
                "message", valido ? "Token válido" : "Token inválido o expirado"
        ));
    }
}

package edu.unt.ingenieria_industrial.sgpp.core.integridad.util;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ContextoAuditoriaHelper {

    private final UsuarioRepository usuarioRepository;

    public Usuario resolverUsuario(Long idUsuario) {
        if (idUsuario != null) {
            return usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new BusinessException("Usuario no encontrado para auditoría"));
        }
        return obtenerUsuarioAutenticado();
    }

    public Usuario obtenerUsuarioAutenticado() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getName() != null
                && !"anonymousUser".equals(auth.getName())) {
            return usuarioRepository.findByUsername(auth.getName())
                    .orElseGet(() -> usuarioRepository.findByEmail(auth.getName())
                            .orElseThrow(() -> new BusinessException("Usuario autenticado no encontrado")));
        }
        return usuarioRepository.findByUsername("admin")
                .orElseThrow(() -> new BusinessException("No se pudo resolver usuario para auditoría"));
    }

    public String obtenerRolesUsuario(Usuario usuario) {
        if (usuario.getUsuarioRoles() == null) return null;
        return usuario.getUsuarioRoles().stream()
                .map(ur -> ur.getRol().getNombre().name())
                .collect(Collectors.joining(", "));
    }

    public String obtenerIpOrigen() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) return null;
        HttpServletRequest request = attrs.getRequest();
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    public static String nombreCompleto(Usuario u) {
        if (u == null) return null;
        String materno = u.getApellidoMaterno() != null ? " " + u.getApellidoMaterno() : "";
        return u.getNombres() + " " + u.getApellidoPaterno() + materno;
    }
}

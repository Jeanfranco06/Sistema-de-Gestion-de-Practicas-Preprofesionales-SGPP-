package edu.unt.ingenieria_industrial.sgpp.core.exportacion.util;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UsuarioAutenticadoHelper {

    private final UsuarioRepository usuarioRepository;

    public Usuario obtenerUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getName() != null
                && !"anonymousUser".equals(auth.getName())) {
            return usuarioRepository.findByUsername(auth.getName())
                    .orElseGet(() -> usuarioRepository.findByEmail(auth.getName())
                            .orElseThrow(() -> new BusinessException("Usuario autenticado no encontrado")));
        }
        return usuarioRepository.findByUsername("admin")
                .orElseThrow(() -> new BusinessException("No se pudo identificar al usuario solicitante"));
    }

    public Long obtenerIdUsuarioActual() {
        return obtenerUsuarioActual().getId();
    }

    public static String nombreCompleto(Usuario u) {
        if (u == null) return "";
        String materno = u.getApellidoMaterno() != null ? " " + u.getApellidoMaterno() : "";
        return u.getNombres() + " " + u.getApellidoPaterno() + materno;
    }
}

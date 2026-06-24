package edu.unt.ingenieria_industrial.sgpp.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Expone el id del usuario autenticado como atributo de request para los controladores.
 */
@Component
public class UsuarioContextFilter extends OncePerRequestFilter {

    public static final String ATTR_ID_USUARIO = "idUsuario";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            request.setAttribute(ATTR_ID_USUARIO, userDetails.getUsuario().getId());
        }
        filterChain.doFilter(request, response);
    }
}

package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CurrentUserServiceImpl implements CurrentUserService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public Long getCurrentUserId() {
        String username = getCurrentUsername();
        if (username == null) {
            return null;
        }
        return usuarioRepository.findByUsername(username).map(u -> u.getId()).orElse(null);
    }

    @Override
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        return auth.getName();
    }

    @Override
    public List<String> getCurrentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return Collections.emptyList();
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .collect(Collectors.toList());
    }

    @Override
    public boolean hasAnyRole(String... roles) {
        List<String> current = getCurrentRoles();
        for (String role : roles) {
            if (current.contains(role)) {
                return true;
            }
        }
        return false;
    }
}

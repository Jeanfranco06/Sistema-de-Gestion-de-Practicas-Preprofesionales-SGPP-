package edu.unt.ingenieria_industrial.sgpp.api.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    @JsonIgnore
    private Usuario usuario;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (usuario.getUsuarioRoles() == null) {
            return Collections.emptyList();
        }
        return usuario.getUsuarioRoles().stream()
                .filter(usuarioRol -> usuarioRol != null && usuarioRol.getRol() != null && usuarioRol.getRol().getNombre() != null)
                .map(usuarioRol -> new SimpleGrantedAuthority("ROLE_" + usuarioRol.getRol().getNombre().name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return usuario.getPassword();
    }

    @Override
    public String getUsername() {
        return usuario.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !usuario.getCuentaBloqueada();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return usuario.getActivo();
    }
}


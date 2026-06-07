package edu.unt.ingenieria_industrial.sgpp.api.security;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);
    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        log.info("Usuario encontrado: {}, activo: {}, cuentaBloqueada: {}, roles: {}",
                username, usuario.getActivo(), usuario.getCuentaBloqueada(),
                usuario.getUsuarioRoles() != null ? usuario.getUsuarioRoles().size() : 0);

        if (!usuario.getActivo()) {
            throw new UsernameNotFoundException("Usuario inactivo: " + username);
        }

        if (usuario.getCuentaBloqueada()) {
            throw new UsernameNotFoundException("Cuenta bloqueada: " + username);
        }

        return new UserDetailsImpl(usuario);
    }
}


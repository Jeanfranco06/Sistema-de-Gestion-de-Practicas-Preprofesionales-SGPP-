package edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.impl;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.PasswordResetToken;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.Usuario;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.PasswordResetTokenRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository.UsuarioRepository;
import edu.unt.ingenieria_industrial.sgpp.core.seguridad.service.PasswordResetService;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.BusinessException;
import edu.unt.ingenieria_industrial.sgpp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final int EXPIRACION_HORAS = 24;

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public String generarTokenReset(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró ninguna cuenta con el email: " + email));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new BusinessException("La cuenta está deshabilitada. Contacte a Secretaría Académica.");
        }

        if (Boolean.TRUE.equals(usuario.getCuentaBloqueada())) {
            throw new BusinessException("La cuenta está bloqueada. Contacte a Secretaría Académica.");
        }

        List<PasswordResetToken> tokensVigentes = tokenRepository.findTokensActivosByUsuarioId(usuario.getId());
        for (PasswordResetToken t : tokensVigentes) {
            t.setUsado(true);
            t.setFechaUso(LocalDateTime.now());
            tokenRepository.save(t);
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .usuario(usuario)
                .token(token)
                .fechaExpiracion(LocalDateTime.now().plusHours(EXPIRACION_HORAS))
                .build();
        tokenRepository.save(resetToken);

        log.info("Token de recuperación generado para usuario {} (email: {})", usuario.getUsername(), email);
        return token;
    }

    @Override
    public void restablecerPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("El token de recuperación no es válido"));

        if (Boolean.TRUE.equals(resetToken.getUsado())) {
            throw new BusinessException("El token de recuperación ya ha sido utilizado");
        }

        if (resetToken.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new BusinessException("El token de recuperación ha expirado. Solicite uno nuevo.");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);

        resetToken.setUsado(true);
        resetToken.setFechaUso(LocalDateTime.now());
        tokenRepository.save(resetToken);

        log.info("Contraseña restablecida para usuario {}", usuario.getUsername());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validarToken(String token) {
        return tokenRepository.findByToken(token)
                .filter(t -> !Boolean.TRUE.equals(t.getUsado()))
                .filter(t -> t.getFechaExpiracion().isAfter(LocalDateTime.now()))
                .isPresent();
    }
}

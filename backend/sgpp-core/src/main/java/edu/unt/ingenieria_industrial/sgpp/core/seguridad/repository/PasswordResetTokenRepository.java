package edu.unt.ingenieria_industrial.sgpp.core.seguridad.repository;

import edu.unt.ingenieria_industrial.sgpp.core.seguridad.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    @Query("SELECT t FROM PasswordResetToken t WHERE t.usuario.id = :idUsuario AND t.usado = false ORDER BY t.fechaCreacion DESC")
    java.util.List<PasswordResetToken> findTokensActivosByUsuarioId(@Param("idUsuario") Long idUsuario);
}

-- ============================================================
-- V29: Recuperación de Contraseña
-- Permite generar tokens de recuperación para restablecer
-- la contraseña de usuarios del sistema.
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_token (
    id BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    fecha_expiracion TIMESTAMP NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_uso TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_password_reset_token_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token_token
    ON password_reset_token(token);

CREATE INDEX IF NOT EXISTS idx_password_reset_token_usuario
    ON password_reset_token(id_usuario);

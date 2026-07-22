-- V60: Almacenar la referencia de la foto de perfil de cada usuario.
ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(255);

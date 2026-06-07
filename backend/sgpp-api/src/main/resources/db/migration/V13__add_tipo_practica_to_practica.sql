-- Agregar campo tipo_practica a tabla practica para RF-01 y RF-02
-- Diferencia tipos de práctica: Inicial, Final, Profesional

-- Agregar columna id_tipo_practica
ALTER TABLE practica ADD COLUMN IF NOT EXISTS id_tipo_practica BIGINT;

-- Agregar foreign key
ALTER TABLE practica 
ADD CONSTRAINT fk_practica_tipo_practica 
FOREIGN KEY (id_tipo_practica) REFERENCES tipo_practica(id) ON DELETE RESTRICT;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_practica_tipo_practica ON practica(id_tipo_practica);

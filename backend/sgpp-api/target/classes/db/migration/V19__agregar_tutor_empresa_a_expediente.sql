-- Agregar FK id_tutor_empresa a tabla expediente

ALTER TABLE expediente ADD COLUMN IF NOT EXISTS id_tutor_empresa BIGINT;

-- Crear restricción de clave foránea
ALTER TABLE expediente 
ADD CONSTRAINT fk_expediente_tutor_empresa 
FOREIGN KEY (id_tutor_empresa) REFERENCES tutor_externo(id) ON DELETE SET NULL;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_expediente_tutor_empresa ON expediente(id_tutor_empresa);

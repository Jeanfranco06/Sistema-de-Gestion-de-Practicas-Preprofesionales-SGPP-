-- Extender tabla tutor_externo para asociar a empresa/sede y agregar estado_tutor

-- Agregar FK a empresa
ALTER TABLE tutor_externo ADD COLUMN IF NOT EXISTS id_empresa BIGINT;

-- Agregar FK opcional a sede_practica
ALTER TABLE tutor_externo ADD COLUMN IF NOT EXISTS id_sede BIGINT;

-- Agregar estado_tutor (ACTIVO, INACTIVO)
ALTER TABLE tutor_externo ADD COLUMN IF NOT EXISTS estado_tutor VARCHAR(20) DEFAULT 'ACTIVO';

-- Migrar datos existentes: activo boolean a estado_tutor
UPDATE tutor_externo SET estado_tutor = CASE 
    WHEN activo = true THEN 'ACTIVO'
    ELSE 'INACTIVO'
END WHERE estado_tutor IS NULL OR estado_tutor = 'ACTIVO';

-- Crear restricciones de clave foránea
ALTER TABLE tutor_externo 
ADD CONSTRAINT fk_tutor_externo_empresa 
FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE SET NULL;

ALTER TABLE tutor_externo 
ADD CONSTRAINT fk_tutor_externo_sede 
FOREIGN KEY (id_sede) REFERENCES sede_practica(id) ON DELETE SET NULL;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_tutor_externo_empresa ON tutor_externo(id_empresa);
CREATE INDEX IF NOT EXISTS idx_tutor_externo_sede ON tutor_externo(id_sede);
CREATE INDEX IF NOT EXISTS idx_tutor_externo_estado ON tutor_externo(estado_tutor);

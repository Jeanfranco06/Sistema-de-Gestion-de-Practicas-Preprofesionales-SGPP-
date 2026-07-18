-- ============================================================
-- V48: Consolidar estados del expediente y documentos (normativa UNT 2025)
-- ============================================================

-- 1. Aumentar longitud de estados del expediente para soportar todos los códigos normativos
ALTER TABLE expediente ALTER COLUMN estado TYPE VARCHAR(50);
ALTER TABLE expediente_estado ALTER COLUMN estado_anterior TYPE VARCHAR(50);
ALTER TABLE expediente_estado ALTER COLUMN estado_nuevo TYPE VARCHAR(50);

-- 2. Restaurar columna estado en expediente_documento para trazabilidad documental
ALTER TABLE expediente_documento ADD COLUMN IF NOT EXISTS estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE';
COMMENT ON COLUMN expediente_documento.estado IS 'Estado del documento: PENDIENTE, EN_REVISION, APROBADO, OBSERVADO, RECHAZADO';

-- 3. Hacer obligatorio el tipo de práctica en el expediente (el flujo normativo siempre lo requiere)
ALTER TABLE expediente ALTER COLUMN id_tipo_practica SET NOT NULL;

-- 4. Eliminar columna huérfana id_practica de evaluacion (el modelo actual usa id_expediente)
ALTER TABLE evaluacion DROP COLUMN IF EXISTS id_practica;

-- 5. Asegurar que el estado por defecto de un nuevo expediente sea el normativo
ALTER TABLE expediente ALTER COLUMN estado SET DEFAULT 'SOLICITADO';

-- 6. Actualizar estados legacy que no existan en el enum (solo en BD limpia/semi-limpia)
UPDATE expediente SET estado = 'SOLICITADO' WHERE estado = 'BORRADOR';

-- 7. Índices adicionales para consultas frecuentes del flujo
CREATE INDEX IF NOT EXISTS idx_expediente_estado_activo ON expediente(estado, activo);
CREATE INDEX IF NOT EXISTS idx_expediente_documento_estado ON expediente_documento(id_expediente, estado);

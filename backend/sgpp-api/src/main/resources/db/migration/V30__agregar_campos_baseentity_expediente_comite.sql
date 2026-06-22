-- ============================================================
-- MIGRACIÓN CORRECTIVA - Agregar campos de BaseEntity a todas las tablas de V25
-- ============================================================

-- 1. expediente_estado
ALTER TABLE expediente_estado ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE expediente_estado ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP;
ALTER TABLE expediente_estado ADD COLUMN IF NOT EXISTS creado_por VARCHAR(50);

-- 2. expediente_documento
ALTER TABLE expediente_documento ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE expediente_documento ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP;
ALTER TABLE expediente_documento ADD COLUMN IF NOT EXISTS creado_por VARCHAR(50);

-- 3. expediente_comite
ALTER TABLE expediente_comite ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE expediente_comite ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP;
ALTER TABLE expediente_comite ADD COLUMN IF NOT EXISTS creado_por VARCHAR(50);

-- 4. expediente_observacion
ALTER TABLE expediente_observacion ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE expediente_observacion ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP;
ALTER TABLE expediente_observacion ADD COLUMN IF NOT EXISTS creado_por VARCHAR(50);

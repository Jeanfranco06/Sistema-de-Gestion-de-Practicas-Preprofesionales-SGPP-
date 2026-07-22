-- V60__add_audit_fields_to_nota_unidad.sql
-- Agregar campos de BaseEntity a la tabla nota_unidad

ALTER TABLE nota_unidad ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE nota_unidad ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP;
ALTER TABLE nota_unidad ADD COLUMN IF NOT EXISTS creado_por VARCHAR(50);

-- Agregar columnas de auditoría BaseEntity a plan_historial_estado
ALTER TABLE plan_historial_estado 
    ADD COLUMN IF NOT EXISTS creado_por VARCHAR(50),
    ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP,
    ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP;

COMMENT ON COLUMN plan_historial_estado.creado_por IS 'Usuario que creó el registro (auditoría)';
COMMENT ON COLUMN plan_historial_estado.fecha_creacion IS 'Fecha de creación del registro (auditoría)';
COMMENT ON COLUMN plan_historial_estado.fecha_actualizacion IS 'Fecha de última actualización del registro (auditoría)';
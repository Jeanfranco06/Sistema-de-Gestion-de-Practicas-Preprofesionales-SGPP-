-- V55__examen_aplazados_practicas_iniciales.sql
-- Soporte para el examen de aplazados de prácticas iniciales (semana 17),
-- según artículo 43 del reglamento de la Escuela de Ingeniería Industrial.

ALTER TABLE expediente
    ADD COLUMN IF NOT EXISTS nota_examen_aplazados NUMERIC(4, 2),
    ADD COLUMN IF NOT EXISTS fecha_examen_aplazados DATE;

COMMENT ON COLUMN expediente.nota_examen_aplazados IS 'Nota del examen de aplazados (escala 0-20). Solo aplica a prácticas iniciales.';
COMMENT ON COLUMN expediente.fecha_examen_aplazados IS 'Fcha en que se registró la nota del examen de aplazados.';

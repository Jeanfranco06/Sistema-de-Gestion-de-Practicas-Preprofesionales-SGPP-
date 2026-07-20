-- V57: Agregar tipo de calificación configurable por tipo de práctica
ALTER TABLE tipo_practica
    ADD COLUMN tipo_calificacion VARCHAR(20) NOT NULL DEFAULT 'VIGESIMAL';

-- Por defecto: prácticas curriculares usan evaluación vigesimal; extracurriculares cualitativa.
UPDATE tipo_practica
SET tipo_calificacion = 'CUALITATIVA'
WHERE codigo IN ('FINAL', 'PROFESIONAL');

UPDATE tipo_practica
SET tipo_calificacion = 'VIGESIMAL'
WHERE codigo = 'INICIAL';

COMMENT ON COLUMN tipo_practica.tipo_calificacion IS 'VIGESIMAL (0-20) o CUALITATIVA (logrado/en proceso/no logrado)';

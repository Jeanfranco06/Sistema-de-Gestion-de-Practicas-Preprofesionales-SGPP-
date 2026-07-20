-- V58: Agregar calificación cualitativa a la evaluación
ALTER TABLE evaluacion
    ADD COLUMN calificacion_cualitativa VARCHAR(50);

COMMENT ON COLUMN evaluacion.calificacion_cualitativa IS 'Valor cualitativo (Logrado/En proceso/No logrado) cuando tipo_calificacion es CUALITATIVA';

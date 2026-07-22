-- V64: Agregar calificacion_cualitativa a detalle_evaluacion para guardar calificaciones cualitativas por criterio
ALTER TABLE detalle_evaluacion
    ADD COLUMN calificacion_cualitativa VARCHAR(50);

COMMENT ON COLUMN detalle_evaluacion.calificacion_cualitativa IS 'Valor cualitativo (Logrado/En proceso/No logrado) para cada criterio cuando la evaluacion es cualitativa';

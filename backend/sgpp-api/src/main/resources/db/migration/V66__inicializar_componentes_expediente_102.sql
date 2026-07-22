-- Inicializar los componentes de evaluacion para expediente 102 (estudiante2 - Practica Final)
-- que fueron omitidos al insertar directamente en la semilla SQL (V59).
-- Esto previene fallos al registrar la evaluacion empresarial.

INSERT INTO componente_evaluacion (id_expediente, tipo_componente, puntaje_maximo, porcentaje, estado, activo, creado_por)
SELECT 102, 'PLAN', 10, 10, 'PENDIENTE', true, 'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1 FROM componente_evaluacion WHERE id_expediente = 102 AND tipo_componente = 'PLAN'
);

INSERT INTO componente_evaluacion (id_expediente, tipo_componente, puntaje_maximo, porcentaje, estado, activo, creado_por)
SELECT 102, 'EMPRESA', 50, 50, 'PENDIENTE', true, 'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1 FROM componente_evaluacion WHERE id_expediente = 102 AND tipo_componente = 'EMPRESA'
);

INSERT INTO componente_evaluacion (id_expediente, tipo_componente, puntaje_maximo, porcentaje, estado, activo, creado_por)
SELECT 102, 'INFORME', 40, 40, 'PENDIENTE', true, 'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1 FROM componente_evaluacion WHERE id_expediente = 102 AND tipo_componente = 'INFORME'
);

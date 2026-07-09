-- ============================================================
-- V45: Configurar sedes, convenios y tutores para que sean elegibles
-- ============================================================

-- 1. Asegurar que los convenios tengan fechas de vigencia válidas (actuales)
UPDATE convenio 
SET 
    fecha_inicio = CURRENT_DATE - INTERVAL '1 month',
    fecha_fin = CURRENT_DATE + INTERVAL '2 years',
    vigente = TRUE
WHERE numero_convenio IN ('CONV-2024-001', 'CONV-2024-002');

-- 2. Vincular tutores externos a empresas y sedes, y establecer estado ACTIVO
UPDATE tutor_externo te
SET 
    id_empresa = (SELECT id FROM empresa WHERE ruc = '20123456789'),
    id_sede = (SELECT id FROM sede_practica WHERE nombre_sede = 'Sede Principal Trujillo' LIMIT 1),
    empresa_nombre = (SELECT razon_social FROM empresa WHERE ruc = '20123456789'),
    estado_tutor = 'ACTIVO'
FROM usuario u
WHERE te.id_usuario = u.id AND u.username = 'tutor1';

UPDATE tutor_externo te
SET 
    id_empresa = (SELECT id FROM empresa WHERE ruc = '20987654321'),
    id_sede = (SELECT id FROM sede_practica WHERE nombre_sede = 'Planta Industrial Norte' LIMIT 1),
    empresa_nombre = (SELECT razon_social FROM empresa WHERE ruc = '20987654321'),
    estado_tutor = 'ACTIVO'
FROM usuario u
WHERE te.id_usuario = u.id AND u.username IN ('tutor2', 'tutor3');

-- 3. Crear validaciones de sede APROBADAS y VIGENTES para cada sede
-- Obtener usuario validador (usamos coordinador1 o adminsys1)
WITH validador AS (
    SELECT id FROM usuario WHERE username = 'coordinador1' LIMIT 1
),
sede_1 AS (
    SELECT id FROM sede_practica WHERE nombre_sede = 'Sede Principal Trujillo' LIMIT 1
),
sede_2 AS (
    SELECT id FROM sede_practica WHERE nombre_sede = 'Planta Industrial Norte' LIMIT 1
)
INSERT INTO validacion_sede (
    id_sede, id_usuario_validador, fecha_validacion,
    criterio_infraestructura_cumple, criterio_seguridad_salud_cumple,
    criterio_afinidad_carrera_cumple, criterio_tutor_designado_cumple,
    criterio_convenio_acuerdo_cumple, resultado_validacion,
    fecha_vigencia_desde, fecha_vigencia_hasta, observaciones_generales, creado_por
)
SELECT 
    s1.id, v.id, CURRENT_TIMESTAMP,
    TRUE, TRUE, TRUE, TRUE, TRUE, 'APROBADA',
    CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 year',
    'Validación completada para prácticas preprofesionales', 'SYSTEM'
FROM sede_1 s1, validador v
WHERE NOT EXISTS (
    SELECT 1 FROM validacion_sede WHERE id_sede = s1.id AND resultado_validacion = 'APROBADA'
);

WITH validador AS (
    SELECT id FROM usuario WHERE username = 'coordinador1' LIMIT 1
),
sede_2 AS (
    SELECT id FROM sede_practica WHERE nombre_sede = 'Planta Industrial Norte' LIMIT 1
)
INSERT INTO validacion_sede (
    id_sede, id_usuario_validador, fecha_validacion,
    criterio_infraestructura_cumple, criterio_seguridad_salud_cumple,
    criterio_afinidad_carrera_cumple, criterio_tutor_designado_cumple,
    criterio_convenio_acuerdo_cumple, resultado_validacion,
    fecha_vigencia_desde, fecha_vigencia_hasta, observaciones_generales, creado_por
)
SELECT 
    s2.id, v.id, CURRENT_TIMESTAMP,
    TRUE, TRUE, TRUE, TRUE, TRUE, 'APROBADA',
    CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 year',
    'Validación completada para prácticas preprofesionales', 'SYSTEM'
FROM sede_2 s2, validador v
WHERE NOT EXISTS (
    SELECT 1 FROM validacion_sede WHERE id_sede = s2.id AND resultado_validacion = 'APROBADA'
);

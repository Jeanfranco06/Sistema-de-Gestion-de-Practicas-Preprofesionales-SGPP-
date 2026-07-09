-- ============================================================
-- V46: Completar perfiles de estudiantes (estudiante1, 2, 3)
-- ============================================================

-- Perfil de estudiante para estudiante1
INSERT INTO estudiante (
    id_usuario, codigo_estudiantil, semestre_actual, creditos_aprobados,
    creditos_requeridos_practica, promedio_ponderado, fecha_ingreso,
    fecha_egreso_estimada, estado_academico, id_periodo_academico_actual,
    creado_por
)
SELECT
    u.id,
    '20210001',
    8,
    160,
    200,
    15.20,
    '2021-03-01',
    '2026-06-30',
    'REGULAR',
    (SELECT id FROM periodo_academico WHERE codigo = '2026-I' LIMIT 1),
    'SYSTEM'
FROM usuario u
WHERE u.username = 'estudiante1'
  AND NOT EXISTS (SELECT 1 FROM estudiante e WHERE e.id_usuario = u.id);

-- Perfil de estudiante para estudiante2
INSERT INTO estudiante (
    id_usuario, codigo_estudiantil, semestre_actual, creditos_aprobados,
    creditos_requeridos_practica, promedio_ponderado, fecha_ingreso,
    fecha_egreso_estimada, estado_academico, id_periodo_academico_actual,
    creado_por
)
SELECT
    u.id,
    '20220002',
    6,
    120,
    200,
    13.80,
    '2022-03-01',
    '2027-06-30',
    'REGULAR',
    (SELECT id FROM periodo_academico WHERE codigo = '2026-I' LIMIT 1),
    'SYSTEM'
FROM usuario u
WHERE u.username = 'estudiante2'
  AND NOT EXISTS (SELECT 1 FROM estudiante e WHERE e.id_usuario = u.id);

-- Perfil de estudiante para estudiante3
INSERT INTO estudiante (
    id_usuario, codigo_estudiantil, semestre_actual, creditos_aprobados,
    creditos_requeridos_practica, promedio_ponderado, fecha_ingreso,
    fecha_egreso_estimada, estado_academico, id_periodo_academico_actual,
    creado_por
)
SELECT
    u.id,
    '20200003',
    10,
    190,
    200,
    16.50,
    '2020-03-01',
    '2025-12-31',
    'REGULAR',
    (SELECT id FROM periodo_academico WHERE codigo = '2026-I' LIMIT 1),
    'SYSTEM'
FROM usuario u
WHERE u.username = 'estudiante3'
  AND NOT EXISTS (SELECT 1 FROM estudiante e WHERE e.id_usuario = u.id);

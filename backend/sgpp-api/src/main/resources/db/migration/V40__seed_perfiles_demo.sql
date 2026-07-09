-- ============================================================
-- V40: Recrear datos eliminados por V38
-- V38 borró estudiante, docente, tutor_externo, periodo_academico
-- pero mantuvo usuarios (adminsys1, jeanfranco, alicia, juancito)
-- ============================================================

-- 1. Periodos academicos (V38 los borró)
INSERT INTO periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, activo, creado_por)
SELECT '2024-I', '2024-I', '2024-03-01', '2024-07-31', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM periodo_academico WHERE codigo = '2024-I');

INSERT INTO periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, activo, creado_por)
SELECT '2024-II', '2024-II', '2024-08-01', '2024-12-31', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM periodo_academico WHERE codigo = '2024-II');

INSERT INTO periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, activo, creado_por)
SELECT '2025-I', '2025-I', '2025-03-01', '2025-07-31', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM periodo_academico WHERE codigo = '2025-I');

INSERT INTO periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, activo, creado_por)
SELECT '2025-II', '2025-II', '2025-08-01', '2025-12-31', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM periodo_academico WHERE codigo = '2025-II');

INSERT INTO periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, activo, creado_por)
SELECT '2026-I', '2026-I', '2026-03-01', '2026-07-31', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM periodo_academico WHERE codigo = '2026-I');

-- 2. Perfil de estudiante para jeanfranco (user id = 17)
INSERT INTO estudiante (
    id_usuario, codigo_estudiantil, semestre_actual, creditos_aprobados,
    creditos_requeridos_practica, promedio_ponderado, fecha_ingreso,
    fecha_egreso_estimada, estado_academico, id_periodo_academico_actual,
    creado_por
)
SELECT
    u.id,
    '1053300623',
    7,
    180,
    200,
    14.50,
    '2021-03-01',
    '2026-12-31',
    'REGULAR',
    (SELECT id FROM periodo_academico WHERE codigo = '2026-I' LIMIT 1),
    'SYSTEM'
FROM usuario u
WHERE u.username = 'jeanfranco'
  AND NOT EXISTS (SELECT 1 FROM estudiante e WHERE e.id_usuario = u.id);

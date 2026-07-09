-- V44__agregar_validacion_profesional.sql
-- Agregar reglas de validación académica para tipo de práctica PROFESIONAL

-- ============================================================
-- RE_II + PROFESIONAL (mismas reglas que FINAL)
-- ============================================================
INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'MATRICULA_ACTIVA', 'Matrícula activa',
       'El estudiante debe estar matriculado o tener estado ACTIVO en el semestre actual', 1, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'PRERREQUISITOS_APROBADOS', 'Créditos mínimos aprobados',
       'El estudiante debe haber aprobado el mínimo de créditos requeridos para práctica profesional', 2, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'PPI_APROBADAS', 'Práctica Inicial aprobada',
       'El estudiante debe haber completado y aprobado la Práctica Pre-Profesional Inicial', 3, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'CURSOS_HASTA_OCTAVO', 'Cursos hasta octavo ciclo',
       'El estudiante debe haber cursado hasta el octavo ciclo (semestre mínimo)', 4, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

-- ============================================================
-- L-UNT-2025 + PROFESIONAL (mismas reglas que FINAL)
-- ============================================================
INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'MATRICULA_ACTIVA', 'Matrícula activa',
       'El estudiante debe estar matriculado o tener estado ACTIVO en el semestre actual', 1, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'CREDITOS_MINIMOS', 'Créditos mínimos aprobados (Lineamientos)',
       'El estudiante debe tener el mínimo de créditos aprobados según los Lineamientos UNT 2025', 2, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'PPI_APROBADAS', 'Práctica Inicial aprobada',
       'El estudiante debe haber completado y aprobado la Práctica Pre-Profesional Inicial', 3, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'CURSOS_HASTA_NOVENO', 'Cursos hasta noveno ciclo',
       'El estudiante debe haber cursado hasta el noveno ciclo (semestre mínimo)', 4, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Parámetros para PROFESIONAL (RE_II)
-- ============================================================
INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'CREDITOS_MINIMOS', '150', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'RE_II' AND r.codigo = 'PRERREQUISITOS_APROBADOS'
ON CONFLICT DO NOTHING;

INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'SEMESTRE_MINIMO', '8', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'RE_II' AND r.codigo = 'CURSOS_HASTA_OCTAVO'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Parámetros para PROFESIONAL (L-UNT-2025)
-- ============================================================
INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'CREDITOS_MINIMOS', '180', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'L-UNT-2025' AND r.codigo = 'CREDITOS_MINIMOS'
ON CONFLICT DO NOTHING;

INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'SEMESTRE_MINIMO', '9', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'PROFESIONAL' AND n.codigo = 'L-UNT-2025' AND r.codigo = 'CURSOS_HASTA_NOVENO'
ON CONFLICT DO NOTHING;

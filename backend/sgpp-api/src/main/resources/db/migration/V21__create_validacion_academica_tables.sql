-- Tablas del módulo de validación académica data-driven

-- 1. norma_validacion: normas aplicables (Reglamento Específico II, Lineamientos UNT 2025)
CREATE TABLE IF NOT EXISTS norma_validacion (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_vigencia_inicio DATE NOT NULL,
    fecha_vigencia_fin DATE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- 2. regla_validacion: reglas por tipo de práctica y norma
CREATE TABLE IF NOT EXISTS regla_validacion (
    id BIGSERIAL PRIMARY KEY,
    id_tipo_practica BIGINT NOT NULL,
    id_norma BIGINT NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL,
    obligatorio BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_regla_tipo_practica FOREIGN KEY (id_tipo_practica)
        REFERENCES tipo_practica(id) ON DELETE CASCADE,
    CONSTRAINT fk_regla_norma FOREIGN KEY (id_norma)
        REFERENCES norma_validacion(id) ON DELETE CASCADE
);

-- 3. parametro_regla: parámetros configurables por regla
CREATE TABLE IF NOT EXISTS parametro_regla (
    id BIGSERIAL PRIMARY KEY,
    id_regla_validacion BIGINT NOT NULL,
    clave VARCHAR(100) NOT NULL,
    valor VARCHAR(500) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_parametro_regla FOREIGN KEY (id_regla_validacion)
        REFERENCES regla_validacion(id) ON DELETE CASCADE
);

-- 4. resultado_validacion: resultado de una validación académica
CREATE TABLE IF NOT EXISTS resultado_validacion (
    id BIGSERIAL PRIMARY KEY,
    id_estudiante BIGINT NOT NULL,
    id_tipo_practica BIGINT NOT NULL,
    id_norma BIGINT NOT NULL,
    habilitado BOOLEAN NOT NULL,
    periodo_academico VARCHAR(20),
    fecha_validacion TIMESTAMP NOT NULL,
    observaciones_generales TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_resultado_estudiante FOREIGN KEY (id_estudiante)
        REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_resultado_tipo_practica FOREIGN KEY (id_tipo_practica)
        REFERENCES tipo_practica(id) ON DELETE CASCADE,
    CONSTRAINT fk_resultado_norma FOREIGN KEY (id_norma)
        REFERENCES norma_validacion(id) ON DELETE CASCADE
);

-- 5. detalle_validacion: detalle de cada regla evaluada en una validación
CREATE TABLE IF NOT EXISTS detalle_validacion (
    id BIGSERIAL PRIMARY KEY,
    id_resultado BIGINT NOT NULL,
    id_regla BIGINT NOT NULL,
    cumplido BOOLEAN NOT NULL,
    observaciones TEXT,
    orden INTEGER NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_detalle_resultado FOREIGN KEY (id_resultado)
        REFERENCES resultado_validacion(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_regla FOREIGN KEY (id_regla)
        REFERENCES regla_validacion(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_regla_tipo_practica ON regla_validacion(id_tipo_practica);
CREATE INDEX IF NOT EXISTS idx_regla_norma ON regla_validacion(id_norma);
CREATE INDEX IF NOT EXISTS idx_regla_codigo ON regla_validacion(codigo);
CREATE INDEX IF NOT EXISTS idx_parametro_regla_validacion ON parametro_regla(id_regla_validacion);
CREATE INDEX IF NOT EXISTS idx_parametro_clave ON parametro_regla(clave);
CREATE INDEX IF NOT EXISTS idx_resultado_estudiante ON resultado_validacion(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_resultado_fecha ON resultado_validacion(fecha_validacion);
CREATE INDEX IF NOT EXISTS idx_detalle_resultado ON detalle_validacion(id_resultado);
CREATE INDEX IF NOT EXISTS idx_detalle_regla ON detalle_validacion(id_regla);

-- ============================================================
-- SEED DATA: Normas de validación académica
-- ============================================================

INSERT INTO norma_validacion (codigo, nombre, descripcion, fecha_vigencia_inicio, activo, creado_por) VALUES
('RE_II', 'Reglamento Específico (versión II)',
 'Reglamento interno de prácticas pre-profesionales de la Escuela de Ingeniería Industrial – UNT. Versión actualizada.',
 '2024-01-01', TRUE, 'SYSTEM'),
('L-UNT-2025', 'Lineamientos UNT 2025',
 'Lineamientos institucionales UNT 2025 para prácticas pre-profesionales.',
 '2025-01-01', TRUE, 'SYSTEM')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- SEED DATA: Reglas de validación por norma y tipo de práctica
-- ============================================================

-- RE_II + INICIAL
INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'MATRICULA_ACTIVA', 'Matrícula activa',
       'El estudiante debe estar matriculado o tener estado ACTIVO en el semestre actual', 1, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'INICIAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'PRERREQUISITOS_APROBADOS', 'Créditos mínimos aprobados',
       'El estudiante debe haber aprobado el mínimo de créditos requeridos para iniciar práctica inicial', 2, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'INICIAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

-- RE_II + FINAL
INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'MATRICULA_ACTIVA', 'Matrícula activa',
       'El estudiante debe estar matriculado o tener estado ACTIVO en el semestre actual', 1, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'FINAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'PRERREQUISITOS_APROBADOS', 'Créditos mínimos aprobados',
       'El estudiante debe haber aprobado el mínimo de créditos requeridos para práctica final', 2, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'FINAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'PPI_APROBADAS', 'Práctica Inicial aprobada',
       'El estudiante debe haber completado y aprobado la Práctica Pre-Profesional Inicial', 3, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'FINAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'CURSOS_HASTA_OCTAVO', 'Cursos hasta octavo ciclo',
       'El estudiante debe haber cursado hasta el octavo ciclo (semestre mínimo)', 4, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'FINAL' AND n.codigo = 'RE_II'
ON CONFLICT DO NOTHING;

-- L-UNT-2025 + INICIAL
INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'MATRICULA_ACTIVA', 'Matrícula activa',
       'El estudiante debe estar matriculado o tener estado ACTIVO en el semestre actual', 1, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'INICIAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'CREDITOS_MINIMOS', 'Créditos mínimos aprobados (Lineamientos)',
       'El estudiante debe tener el mínimo de créditos aprobados según los Lineamientos UNT 2025', 2, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'INICIAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'CURSOS_HASTA_OCTAVO', 'Ciclo mínimo para inicial',
       'El estudiante debe haber cursado hasta un ciclo mínimo según lineamientos', 3, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'INICIAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

-- L-UNT-2025 + FINAL
INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'MATRICULA_ACTIVA', 'Matrícula activa',
       'El estudiante debe estar matriculado o tener estado ACTIVO en el semestre actual', 1, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'FINAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'CREDITOS_MINIMOS', 'Créditos mínimos aprobados (Lineamientos)',
       'El estudiante debe tener el mínimo de créditos aprobados según los Lineamientos UNT 2025', 2, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'FINAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'PPI_APROBADAS', 'Práctica Inicial aprobada',
       'El estudiante debe haber completado y aprobado la Práctica Pre-Profesional Inicial', 3, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'FINAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

INSERT INTO regla_validacion (id_tipo_practica, id_norma, codigo, nombre, descripcion, orden, obligatorio, activo, creado_por)
SELECT tp.id, n.id, 'CURSOS_HASTA_NOVENO', 'Cursos hasta noveno ciclo',
       'El estudiante debe haber cursado hasta el noveno ciclo (semestre mínimo)', 4, TRUE, TRUE, 'SYSTEM'
FROM tipo_practica tp, norma_validacion n
WHERE tp.codigo = 'FINAL' AND n.codigo = 'L-UNT-2025'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Parámetros configurables por regla
-- ============================================================

-- RE_II + INICIAL: PRERREQUISITOS_APROBADOS -> 80 créditos
INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'CREDITOS_MINIMOS', '80', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'INICIAL' AND n.codigo = 'RE_II' AND r.codigo = 'PRERREQUISITOS_APROBADOS'
ON CONFLICT DO NOTHING;

-- RE_II + FINAL: PRERREQUISITOS_APROBADOS -> 150 créditos
INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'CREDITOS_MINIMOS', '150', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'FINAL' AND n.codigo = 'RE_II' AND r.codigo = 'PRERREQUISITOS_APROBADOS'
ON CONFLICT DO NOTHING;

-- RE_II + FINAL: CURSOS_HASTA_OCTAVO -> semestre mínimo 8
INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'SEMESTRE_MINIMO', '8', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'FINAL' AND n.codigo = 'RE_II' AND r.codigo = 'CURSOS_HASTA_OCTAVO'
ON CONFLICT DO NOTHING;

-- L-UNT-2025 + INICIAL: CREDITOS_MINIMOS -> 100 créditos
INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'CREDITOS_MINIMOS', '100', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'INICIAL' AND n.codigo = 'L-UNT-2025' AND r.codigo = 'CREDITOS_MINIMOS'
ON CONFLICT DO NOTHING;

-- L-UNT-2025 + INICIAL: CURSOS_HASTA_OCTAVO -> semestre mínimo 6
INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'SEMESTRE_MINIMO', '6', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'INICIAL' AND n.codigo = 'L-UNT-2025' AND r.codigo = 'CURSOS_HASTA_OCTAVO'
ON CONFLICT DO NOTHING;

-- L-UNT-2025 + FINAL: CREDITOS_MINIMOS -> 180 créditos
INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'CREDITOS_MINIMOS', '180', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'FINAL' AND n.codigo = 'L-UNT-2025' AND r.codigo = 'CREDITOS_MINIMOS'
ON CONFLICT DO NOTHING;

-- L-UNT-2025 + FINAL: CURSOS_HASTA_NOVENO -> semestre mínimo 9
INSERT INTO parametro_regla (id_regla_validacion, clave, valor, activo, creado_por)
SELECT r.id, 'SEMESTRE_MINIMO', '9', TRUE, 'SYSTEM'
FROM regla_validacion r
JOIN tipo_practica tp ON r.id_tipo_practica = tp.id
JOIN norma_validacion n ON r.id_norma = n.id
WHERE tp.codigo = 'FINAL' AND n.codigo = 'L-UNT-2025' AND r.codigo = 'CURSOS_HASTA_NOVENO'
ON CONFLICT DO NOTHING;

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

-- L-UNT-2025 + PROFESIONAL (mismas reglas que FINAL)
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

-- Parámetros para PROFESIONAL (RE_II)
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

-- Parámetros para PROFESIONAL (L-UNT-2025)
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

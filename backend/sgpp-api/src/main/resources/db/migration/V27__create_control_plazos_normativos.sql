-- ============================================================
-- V27: Control Centralizado de Plazos Normativos
-- Módulo reusable para calcular, registrar y supervisar
-- vencimientos del proceso de prácticas.
-- ============================================================

-- 1. regla_plazo: definición parametrizable de cada regla de plazo
CREATE TABLE IF NOT EXISTS regla_plazo (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    id_tipo_practica BIGINT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    etapa_expediente VARCHAR(30),
    dias_plazo INTEGER NOT NULL,
    tipo_computo VARCHAR(20) NOT NULL DEFAULT 'CALENDARIO',
    orden INTEGER,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    dias_proximo_vencer INTEGER NOT NULL DEFAULT 3,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- 2. control_plazo: instancia de seguimiento de un plazo para un expediente
CREATE TABLE IF NOT EXISTS control_plazo (
    id BIGSERIAL PRIMARY KEY,
    id_expediente BIGINT NOT NULL,
    id_regla_plazo BIGINT NOT NULL,
    id_plan BIGINT,
    id_documento BIGINT,
    fecha_base DATE NOT NULL,
    fecha_limite DATE NOT NULL,
    fecha_cumplimiento TIMESTAMP,
    estado VARCHAR(30) NOT NULL DEFAULT 'VIGENTE',
    cumplido_en_plazo BOOLEAN,
    observacion TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

ALTER TABLE regla_plazo
    ADD CONSTRAINT fk_regla_plazo_tipo_practica
    FOREIGN KEY (id_tipo_practica) REFERENCES tipo_practica(id);

ALTER TABLE control_plazo
    ADD CONSTRAINT fk_control_plazo_expediente
    FOREIGN KEY (id_expediente) REFERENCES expediente(id);

ALTER TABLE control_plazo
    ADD CONSTRAINT fk_control_plazo_regla
    FOREIGN KEY (id_regla_plazo) REFERENCES regla_plazo(id);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_control_plazo_expediente ON control_plazo(id_expediente);
CREATE INDEX IF NOT EXISTS idx_control_plazo_estado ON control_plazo(estado);
CREATE INDEX IF NOT EXISTS idx_control_plazo_regla ON control_plazo(id_regla_plazo);
CREATE INDEX IF NOT EXISTS idx_control_plazo_fecha_limite ON control_plazo(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_control_plazo_exp_regla ON control_plazo(id_expediente, id_regla_plazo);

-- ============================================================
-- SEED: Reglas de Plazo Normativas
-- ============================================================

INSERT INTO regla_plazo (codigo, id_tipo_practica, nombre, descripcion, etapa_expediente, dias_plazo, tipo_computo, orden, dias_proximo_vencer)
SELECT 'PRESENTACION_PLAN_INICIAL', tp.id, 'Presentación del Plan General - Práctica Inicial',
       'El Plan General de Prácticas debe presentarse dentro de los primeros 15 días calendario de iniciado el ciclo académico.',
       'ASESOR_ASIGNADO', 15, 'CALENDARIO', 1, 3
FROM tipo_practica tp WHERE tp.codigo = 'INICIAL' AND NOT EXISTS (
    SELECT 1 FROM regla_plazo WHERE codigo = 'PRESENTACION_PLAN_INICIAL');

INSERT INTO regla_plazo (codigo, id_tipo_practica, nombre, descripcion, etapa_expediente, dias_plazo, tipo_computo, orden, dias_proximo_vencer)
SELECT 'PRESENTACION_PLAN_FINAL', tp.id, 'Presentación del Plan General - Práctica Final/Profesional',
       'El Plan General debe presentarse a Dirección de Escuela dentro del plazo máximo de 15 días calendario desde la recepción de la carta de presentación.',
       'COMITE_ASIGNADO', 15, 'CALENDARIO', 2, 3
FROM tipo_practica tp WHERE tp.codigo IN ('FINAL', 'PROFESIONAL') AND NOT EXISTS (
    SELECT 1 FROM regla_plazo WHERE codigo = 'PRESENTACION_PLAN_FINAL')
LIMIT 1;

INSERT INTO regla_plazo (codigo, id_tipo_practica, nombre, descripcion, etapa_expediente, dias_plazo, tipo_computo, orden, dias_proximo_vencer)
SELECT 'SUBSANACION_PLAN', NULL, 'Subsanación de Observaciones - Plan General',
       'El estudiante dispone de 7 días calendario para levantar las observaciones realizadas al Plan General de Prácticas, contados desde la fecha de notificación de las observaciones.',
       'OBSERVADO', 7, 'CALENDARIO', 3, 2
WHERE NOT EXISTS (SELECT 1 FROM regla_plazo WHERE codigo = 'SUBSANACION_PLAN');

INSERT INTO regla_plazo (codigo, id_tipo_practica, nombre, descripcion, etapa_expediente, dias_plazo, tipo_computo, orden, dias_proximo_vencer)
SELECT 'SUBSANACION_DOCUMENTO', NULL, 'Subsanación de Observaciones - Documentos',
       'El estudiante dispone de 10 días calendario para subsanar observaciones sobre documentos presentados, contados desde la fecha de notificación.',
       'OBSERVADO', 10, 'CALENDARIO', 4, 2
WHERE NOT EXISTS (SELECT 1 FROM regla_plazo WHERE codigo = 'SUBSANACION_DOCUMENTO');

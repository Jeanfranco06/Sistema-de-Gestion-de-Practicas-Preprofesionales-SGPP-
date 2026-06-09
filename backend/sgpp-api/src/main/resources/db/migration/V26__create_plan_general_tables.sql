-- ============================================================
-- V26: Plan General de Prácticas
-- Módulo formal de gestión del Plan General, con secciones
-- estructuradas, objetivos, cronograma, observaciones y
-- trazabilidad de cambios de estado.
-- ============================================================

-- 1. plan_general: entidad raíz del plan
CREATE TABLE IF NOT EXISTS plan_general (
    id BIGSERIAL PRIMARY KEY,
    id_expediente BIGINT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
    fecha_presentacion TIMESTAMP,
    fecha_ultima_revision TIMESTAMP,
    observacion_general TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- 2. plan_seccion: secciones estructuradas (carátula, empresa, situación, técnicas)
CREATE TABLE IF NOT EXISTS plan_seccion (
    id BIGSERIAL PRIMARY KEY,
    id_plan BIGINT NOT NULL,
    tipo_seccion VARCHAR(40) NOT NULL,
    contenido TEXT,
    orden INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- 3. plan_objetivo: objetivos general y específicos
CREATE TABLE IF NOT EXISTS plan_objetivo (
    id BIGSERIAL PRIMARY KEY,
    id_plan BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    descripcion TEXT NOT NULL,
    orden INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- 4. plan_cronograma_actividad: actividades del cronograma vinculadas a objetivos
CREATE TABLE IF NOT EXISTS plan_cronograma_actividad (
    id BIGSERIAL PRIMARY KEY,
    id_plan BIGINT NOT NULL,
    id_objetivo_especifico BIGINT,
    actividad TEXT NOT NULL,
    fecha_inicio_prevista DATE,
    fecha_fin_prevista DATE,
    orden INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- 5. plan_observacion: observaciones al plan (con subsanación)
CREATE TABLE IF NOT EXISTS plan_observacion (
    id BIGSERIAL PRIMARY KEY,
    id_plan BIGINT NOT NULL,
    id_usuario_origen BIGINT NOT NULL,
    descripcion TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'OBSERVACION',
    subsanado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_subsanacion TIMESTAMP,
    respuesta_subsanacion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- 6. plan_historial_estado: trazabilidad de cambios de estado del plan
CREATE TABLE IF NOT EXISTS plan_historial_estado (
    id BIGSERIAL PRIMARY KEY,
    id_plan BIGINT NOT NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    id_usuario BIGINT NOT NULL,
    observacion TEXT,
    fecha_cambio TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo_cambio VARCHAR(40)
);

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

ALTER TABLE plan_general
    ADD CONSTRAINT fk_plan_expediente
    FOREIGN KEY (id_expediente) REFERENCES expediente(id);

ALTER TABLE plan_seccion
    ADD CONSTRAINT fk_plan_seccion_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id);

ALTER TABLE plan_objetivo
    ADD CONSTRAINT fk_plan_objetivo_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id);

ALTER TABLE plan_cronograma_actividad
    ADD CONSTRAINT fk_plan_cronograma_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id);

ALTER TABLE plan_cronograma_actividad
    ADD CONSTRAINT fk_plan_cronograma_objetivo
    FOREIGN KEY (id_objetivo_especifico) REFERENCES plan_objetivo(id);

ALTER TABLE plan_observacion
    ADD CONSTRAINT fk_plan_observacion_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id);

ALTER TABLE plan_observacion
    ADD CONSTRAINT fk_plan_observacion_usuario
    FOREIGN KEY (id_usuario_origen) REFERENCES usuario(id);

ALTER TABLE plan_historial_estado
    ADD CONSTRAINT fk_plan_historial_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id);

ALTER TABLE plan_historial_estado
    ADD CONSTRAINT fk_plan_historial_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_plan_expediente ON plan_general(id_expediente);
CREATE INDEX IF NOT EXISTS idx_plan_estado ON plan_general(estado);
CREATE INDEX IF NOT EXISTS idx_plan_seccion_plan ON plan_seccion(id_plan);
CREATE INDEX IF NOT EXISTS idx_plan_objetivo_plan ON plan_objetivo(id_plan);
CREATE INDEX IF NOT EXISTS idx_plan_cronograma_plan ON plan_cronograma_actividad(id_plan);
CREATE INDEX IF NOT EXISTS idx_plan_observacion_plan ON plan_observacion(id_plan);
CREATE INDEX IF NOT EXISTS idx_plan_historial_plan ON plan_historial_estado(id_plan);

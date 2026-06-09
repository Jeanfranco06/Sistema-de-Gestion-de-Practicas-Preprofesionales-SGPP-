-- ============================================================
-- MÓDULO EXPEDIENTE - Ampliación del expediente de práctica
-- Agrega columnas a la tabla expediente existente + nuevas tablas
-- ============================================================

-- ============================================================
-- 1. Ampliar tabla expediente con nuevos campos
-- ============================================================
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS codigo_expediente VARCHAR(30);
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS id_tipo_practica BIGINT;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS periodo_academico VARCHAR(20);
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS condicion_solicitante VARCHAR(20) NOT NULL DEFAULT 'ESTUDIANTE';
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS id_empresa BIGINT;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS id_sede_practica BIGINT;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS id_asesor BIGINT;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS resolucion_asesor VARCHAR(100);
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS id_convenio BIGINT;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS carta_aceptacion_presentada BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS plan_trabajo_aprobado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS fecha_presentacion_plan TIMESTAMP;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS fecha_inicio_practica DATE;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS fecha_fin_practica DATE;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS duracion_semanas INTEGER;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS numero_informes_parciales INTEGER NOT NULL DEFAULT 0;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS informe_final_presentado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE expediente ADD COLUMN IF NOT EXISTS calificacion_final NUMERIC(4,2);

-- Poblar codigo_expediente desde numero_expediente si está vacío
UPDATE expediente SET codigo_expediente = numero_expediente WHERE codigo_expediente IS NULL;

-- Hacer codigo_expediente NOT NULL y UNIQUE
ALTER TABLE expediente ALTER COLUMN codigo_expediente SET NOT NULL;
ALTER TABLE expediente DROP CONSTRAINT IF EXISTS uk_expediente_codigo;
ALTER TABLE expediente ADD CONSTRAINT uk_expediente_codigo UNIQUE (codigo_expediente);

-- ============================================================
-- 2. Crear nuevas tablas relacionadas
-- ============================================================

-- Audit trail de estados del expediente
CREATE TABLE IF NOT EXISTS expediente_estado (
    id BIGSERIAL PRIMARY KEY,
    id_expediente BIGINT NOT NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    id_usuario BIGINT NOT NULL,
    fecha_cambio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT,
    tipo_cambio VARCHAR(50)
);

-- Documentos asociados al expediente
CREATE TABLE IF NOT EXISTS expediente_documento (
    id BIGSERIAL PRIMARY KEY,
    id_expediente BIGINT NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    nombre_archivo VARCHAR(255),
    ruta_archivo VARCHAR(500),
    id_usuario BIGINT,
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

-- Miembros del comité asignados al expediente (para práctica final/profesional)
CREATE TABLE IF NOT EXISTS expediente_comite (
    id BIGSERIAL PRIMARY KEY,
    id_expediente BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    rol_comite VARCHAR(20) NOT NULL DEFAULT 'MIEMBRO',
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Observaciones y subsanaciones del expediente
CREATE TABLE IF NOT EXISTS expediente_observacion (
    id BIGSERIAL PRIMARY KEY,
    id_expediente BIGINT NOT NULL,
    id_usuario_origen BIGINT NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'OBSERVACION',
    descripcion TEXT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subsanado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_subsanacion TIMESTAMP,
    id_usuario_subsana BIGINT,
    respuesta_subsanacion TEXT
);

-- ============================================================
-- 3. Constraints (FK) - solo para nuevas columnas
-- ============================================================

ALTER TABLE expediente DROP CONSTRAINT IF EXISTS fk_expediente_tipo_practica;
ALTER TABLE expediente ADD CONSTRAINT fk_expediente_tipo_practica
    FOREIGN KEY (id_tipo_practica) REFERENCES tipo_practica(id) ON DELETE RESTRICT;

ALTER TABLE expediente DROP CONSTRAINT IF EXISTS fk_expediente_empresa;
ALTER TABLE expediente ADD CONSTRAINT fk_expediente_empresa
    FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE SET NULL;

ALTER TABLE expediente DROP CONSTRAINT IF EXISTS fk_expediente_sede;
ALTER TABLE expediente ADD CONSTRAINT fk_expediente_sede
    FOREIGN KEY (id_sede_practica) REFERENCES sede_practica(id) ON DELETE SET NULL;

ALTER TABLE expediente DROP CONSTRAINT IF EXISTS fk_expediente_asesor;
ALTER TABLE expediente ADD CONSTRAINT fk_expediente_asesor
    FOREIGN KEY (id_asesor) REFERENCES usuario(id) ON DELETE SET NULL;

ALTER TABLE expediente DROP CONSTRAINT IF EXISTS fk_expediente_convenio;
ALTER TABLE expediente ADD CONSTRAINT fk_expediente_convenio
    FOREIGN KEY (id_convenio) REFERENCES convenio(id) ON DELETE SET NULL;

ALTER TABLE expediente_estado DROP CONSTRAINT IF EXISTS fk_exp_estado_expediente;
ALTER TABLE expediente_estado ADD CONSTRAINT fk_exp_estado_expediente
    FOREIGN KEY (id_expediente) REFERENCES expediente(id) ON DELETE CASCADE;

ALTER TABLE expediente_estado DROP CONSTRAINT IF EXISTS fk_exp_estado_usuario;
ALTER TABLE expediente_estado ADD CONSTRAINT fk_exp_estado_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE RESTRICT;

ALTER TABLE expediente_documento DROP CONSTRAINT IF EXISTS fk_exp_doc_expediente;
ALTER TABLE expediente_documento ADD CONSTRAINT fk_exp_doc_expediente
    FOREIGN KEY (id_expediente) REFERENCES expediente(id) ON DELETE CASCADE;

ALTER TABLE expediente_documento DROP CONSTRAINT IF EXISTS fk_exp_doc_usuario;
ALTER TABLE expediente_documento ADD CONSTRAINT fk_exp_doc_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE SET NULL;

ALTER TABLE expediente_comite DROP CONSTRAINT IF EXISTS fk_exp_comite_expediente;
ALTER TABLE expediente_comite ADD CONSTRAINT fk_exp_comite_expediente
    FOREIGN KEY (id_expediente) REFERENCES expediente(id) ON DELETE CASCADE;

ALTER TABLE expediente_comite DROP CONSTRAINT IF EXISTS fk_exp_comite_usuario;
ALTER TABLE expediente_comite ADD CONSTRAINT fk_exp_comite_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE RESTRICT;

ALTER TABLE expediente_observacion DROP CONSTRAINT IF EXISTS fk_exp_obs_expediente;
ALTER TABLE expediente_observacion ADD CONSTRAINT fk_exp_obs_expediente
    FOREIGN KEY (id_expediente) REFERENCES expediente(id) ON DELETE CASCADE;

ALTER TABLE expediente_observacion DROP CONSTRAINT IF EXISTS fk_exp_obs_usuario_origen;
ALTER TABLE expediente_observacion ADD CONSTRAINT fk_exp_obs_usuario_origen
    FOREIGN KEY (id_usuario_origen) REFERENCES usuario(id) ON DELETE RESTRICT;

ALTER TABLE expediente_observacion DROP CONSTRAINT IF EXISTS fk_exp_obs_usuario_subsana;
ALTER TABLE expediente_observacion ADD CONSTRAINT fk_exp_obs_usuario_subsana
    FOREIGN KEY (id_usuario_subsana) REFERENCES usuario(id) ON DELETE SET NULL;

-- ============================================================
-- 4. Índices
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_expediente_tipo_practica     ON expediente(id_tipo_practica);
CREATE INDEX IF NOT EXISTS idx_expediente_empresa           ON expediente(id_empresa);
CREATE INDEX IF NOT EXISTS idx_expediente_asesor            ON expediente(id_asesor);
CREATE INDEX IF NOT EXISTS idx_expediente_estado            ON expediente(estado);
CREATE INDEX IF NOT EXISTS idx_exp_estado_expediente        ON expediente_estado(id_expediente);
CREATE INDEX IF NOT EXISTS idx_exp_doc_expediente           ON expediente_documento(id_expediente);
CREATE INDEX IF NOT EXISTS idx_exp_comite_expediente        ON expediente_comite(id_expediente);
CREATE INDEX IF NOT EXISTS idx_exp_obs_expediente           ON expediente_observacion(id_expediente);

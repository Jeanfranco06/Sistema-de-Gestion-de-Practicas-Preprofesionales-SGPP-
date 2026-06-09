-- Tablas del módulo de responsables académicos

-- 1. asignacion_asesor: asignación de asesores académicos a estudiantes
CREATE TABLE IF NOT EXISTS asignacion_asesor (
    id BIGSERIAL PRIMARY KEY,
    id_docente BIGINT NOT NULL,
    id_estudiante BIGINT NOT NULL,
    id_tipo_practica BIGINT NOT NULL,
    periodo_academico VARCHAR(20) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    resolucion_designacion VARCHAR(255),
    motivo_reasignacion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_asesor_docente FOREIGN KEY (id_docente)
        REFERENCES docente(id) ON DELETE CASCADE,
    CONSTRAINT fk_asesor_estudiante FOREIGN KEY (id_estudiante)
        REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_asesor_tipo_practica FOREIGN KEY (id_tipo_practica)
        REFERENCES tipo_practica(id) ON DELETE CASCADE
);

-- 2. designacion_coordinador: designación del coordinador de prácticas
CREATE TABLE IF NOT EXISTS designacion_coordinador (
    id BIGSERIAL PRIMARY KEY,
    id_docente BIGINT NOT NULL,
    periodo_academico VARCHAR(20) NOT NULL,
    fecha_designacion DATE NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    resolucion_designacion VARCHAR(255),
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_coordinador_docente FOREIGN KEY (id_docente)
        REFERENCES docente(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_asesor_docente ON asignacion_asesor(id_docente);
CREATE INDEX IF NOT EXISTS idx_asesor_estudiante ON asignacion_asesor(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_asesor_activo ON asignacion_asesor(activo);
CREATE INDEX IF NOT EXISTS idx_asesor_estado ON asignacion_asesor(estado);
CREATE INDEX IF NOT EXISTS idx_asesor_periodo ON asignacion_asesor(periodo_academico);
CREATE INDEX IF NOT EXISTS idx_coordinador_docente ON designacion_coordinador(id_docente);
CREATE INDEX IF NOT EXISTS idx_coordinador_periodo ON designacion_coordinador(periodo_academico);
CREATE INDEX IF NOT EXISTS idx_coordinador_activo ON designacion_coordinador(activo);
CREATE INDEX IF NOT EXISTS idx_coordinador_estado ON designacion_coordinador(estado);

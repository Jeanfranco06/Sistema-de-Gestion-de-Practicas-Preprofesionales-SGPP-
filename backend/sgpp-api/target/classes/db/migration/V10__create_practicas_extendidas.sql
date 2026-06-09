-- Creación de tablas extendidas del módulo de prácticas

-- Tabla tipo_practica
CREATE TABLE IF NOT EXISTS tipo_practica (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    horas_requeridas INTEGER,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla expediente
CREATE TABLE IF NOT EXISTS expediente (
    id BIGSERIAL PRIMARY KEY,
    id_estudiante BIGINT NOT NULL,
    numero_expediente VARCHAR(50) NOT NULL UNIQUE,
    fecha_apertura DATE NOT NULL,
    fecha_cierre DATE,
    estado VARCHAR(50) NOT NULL,
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_expediente_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiante(id) ON DELETE CASCADE
);

-- Tabla registro_horas
CREATE TABLE IF NOT EXISTS registro_horas (
    id BIGSERIAL PRIMARY KEY,
    id_practica BIGINT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    horas_registradas INTEGER NOT NULL,
    actividades_realizadas TEXT,
    aprobado_por_tutor BOOLEAN,
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_registro_horas_practica FOREIGN KEY (id_practica) REFERENCES practica(id) ON DELETE CASCADE
);

-- Tabla monitoreo
CREATE TABLE IF NOT EXISTS monitoreo (
    id BIGSERIAL PRIMARY KEY,
    id_practica BIGINT NOT NULL,
    fecha_visita DATE NOT NULL,
    tipo_visitante VARCHAR(50) NOT NULL,
    visitante_id BIGINT,
    objetivo_visita TEXT,
    hallazgos TEXT,
    recomendaciones TEXT,
    calificacion_global INTEGER,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_monitoreo_practica FOREIGN KEY (id_practica) REFERENCES practica(id) ON DELETE CASCADE
);

-- Tabla incidencia
CREATE TABLE IF NOT EXISTS incidencia (
    id BIGSERIAL PRIMARY KEY,
    id_practica BIGINT NOT NULL,
    tipo_incidencia VARCHAR(50) NOT NULL,
    fecha_reporte DATE NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fecha_resolucion DATE,
    resolucion TEXT,
    reportado_por VARCHAR(100),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_incidencia_practica FOREIGN KEY (id_practica) REFERENCES practica(id) ON DELETE CASCADE
);

-- Tabla requisito_academico
CREATE TABLE IF NOT EXISTS requisito_academico (
    id BIGSERIAL PRIMARY KEY,
    id_tipo_practica BIGINT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    obligatorio BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_requisito_tipo_practica FOREIGN KEY (id_tipo_practica) REFERENCES tipo_practica(id) ON DELETE CASCADE
);

-- Tabla requisito_estudiante
CREATE TABLE IF NOT EXISTS requisito_estudiante (
    id BIGSERIAL PRIMARY KEY,
    id_estudiante BIGINT NOT NULL,
    id_requisito_academico BIGINT NOT NULL,
    cumplido BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_cumplimiento DATE,
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_requisito_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_requisito_academico FOREIGN KEY (id_requisito_academico) REFERENCES requisito_academico(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tipo_practica_codigo ON tipo_practica(codigo);
CREATE INDEX IF NOT EXISTS idx_expediente_estudiante ON expediente(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_registro_horas_practica ON registro_horas(id_practica);
CREATE INDEX IF NOT EXISTS idx_registro_horas_fecha ON registro_horas(fecha);
CREATE INDEX IF NOT EXISTS idx_monitoreo_practica ON monitoreo(id_practica);
CREATE INDEX IF NOT EXISTS idx_monitoreo_fecha ON monitoreo(fecha_visita);
CREATE INDEX IF NOT EXISTS idx_incidencia_practica ON incidencia(id_practica);
CREATE INDEX IF NOT EXISTS idx_incidencia_estado ON incidencia(estado);
CREATE INDEX IF NOT EXISTS idx_requisito_tipo_practica ON requisito_academico(id_tipo_practica);
CREATE INDEX IF NOT EXISTS idx_requisito_estudiante ON requisito_estudiante(id_estudiante);

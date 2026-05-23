-- Creación de tablas extendidas del módulo de evaluación

-- Tabla criterio_evaluacion
CREATE TABLE IF NOT EXISTS criterio_evaluacion (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    puntaje_maximo INTEGER NOT NULL,
    tipo_evaluador VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla rubrica
CREATE TABLE IF NOT EXISTS rubrica (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_evaluador VARCHAR(50) NOT NULL,
    puntaje_total INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla detalle_evaluacion
CREATE TABLE IF NOT EXISTS detalle_evaluacion (
    id BIGSERIAL PRIMARY KEY,
    id_evaluacion BIGINT NOT NULL,
    id_criterio BIGINT NOT NULL,
    puntaje_obtenido INTEGER,
    comentarios TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_detalle_evaluacion FOREIGN KEY (id_evaluacion) REFERENCES evaluacion(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_criterio FOREIGN KEY (id_criterio) REFERENCES criterio_evaluacion(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_criterio_evaluacion_codigo ON criterio_evaluacion(codigo);
CREATE INDEX IF NOT EXISTS idx_criterio_tipo ON criterio_evaluacion(tipo_evaluador);
CREATE INDEX IF NOT EXISTS idx_rubrica_tipo ON rubrica(tipo_evaluador);
CREATE INDEX IF NOT EXISTS idx_detalle_evaluacion ON detalle_evaluacion(id_evaluacion);
CREATE INDEX IF NOT EXISTS idx_detalle_criterio ON detalle_evaluacion(id_criterio);

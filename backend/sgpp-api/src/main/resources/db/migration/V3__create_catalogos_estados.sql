-- V3__create_catalogos_estados
-- Creación de tablas de catálogos de estados

-- Tabla estado_practica
CREATE TABLE IF NOT EXISTS estado_practica (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla estado_documento
CREATE TABLE IF NOT EXISTS estado_documento (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_estado_practica_codigo ON estado_practica(codigo);
CREATE INDEX IF NOT EXISTS estado_practica_activo ON estado_practica(activo);
CREATE INDEX IF NOT EXISTS idx_estado_documento_codigo ON estado_documento(codigo);
CREATE INDEX IF NOT EXISTS idx_estado_documento_activo ON estado_documento(activo);

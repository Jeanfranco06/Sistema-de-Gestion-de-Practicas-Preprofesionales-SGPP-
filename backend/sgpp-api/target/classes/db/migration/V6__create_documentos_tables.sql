-- Creación de tablas del módulo de documentos

-- Tabla tipo_documento
CREATE TABLE IF NOT EXISTS tipo_documento (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    obligatorio BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla documento
CREATE TABLE IF NOT EXISTS documento (
    id BIGSERIAL PRIMARY KEY,
    id_practica BIGINT NOT NULL,
    id_tipo_documento BIGINT NOT NULL,
    id_estado BIGINT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tamano_bytes BIGINT,
    tipo_mime VARCHAR(100),
    fecha_carga TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP,
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_documento_practica FOREIGN KEY (id_practica) REFERENCES practica(id) ON DELETE CASCADE,
    CONSTRAINT fk_documento_tipo FOREIGN KEY (id_tipo_documento) REFERENCES tipo_documento(id) ON DELETE CASCADE,
    CONSTRAINT fk_documento_estado FOREIGN KEY (id_estado) REFERENCES estado_documento(id) ON DELETE RESTRICT
);

-- Tabla historial_documento
CREATE TABLE IF NOT EXISTS historial_documento (
    id BIGSERIAL PRIMARY KEY,
    id_documento BIGINT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    observacion TEXT,
    fecha_cambio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_cambio VARCHAR(50),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_historial_documento FOREIGN KEY (id_documento) REFERENCES documento(id) ON DELETE CASCADE
);

-- Tabla observacion_documento
CREATE TABLE IF NOT EXISTS observacion_documento (
    id BIGSERIAL PRIMARY KEY,
    id_documento BIGINT NOT NULL,
    observacion TEXT NOT NULL,
    fecha_observacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_observacion VARCHAR(50),
    resuelta BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_resolucion TIMESTAMP,
    usuario_resolucion VARCHAR(50),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_observacion_documento FOREIGN KEY (id_documento) REFERENCES documento(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tipo_documento_nombre ON tipo_documento(nombre);
CREATE INDEX IF NOT EXISTS idx_documento_practica ON documento(id_practica);
CREATE INDEX IF NOT EXISTS idx_documento_tipo ON documento(id_tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documento_estado ON documento(id_estado);
CREATE INDEX IF NOT EXISTS idx_historial_documento ON historial_documento(id_documento);
CREATE INDEX IF NOT EXISTS idx_observacion_documento ON observacion_documento(id_documento);

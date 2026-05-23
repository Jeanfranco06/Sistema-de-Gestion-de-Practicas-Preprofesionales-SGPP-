-- Creación de tablas del módulo de sistema

-- Tabla parametro_sistema
CREATE TABLE IF NOT EXISTS parametro_sistema (
    id BIGSERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion VARCHAR(255),
    tipo_dato VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla tipo_incidencia
CREATE TABLE IF NOT EXISTS tipo_incidencia (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    gravedad VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla tipo_notificacion
CREATE TABLE IF NOT EXISTS tipo_notificacion (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla periodo_academico
CREATE TABLE IF NOT EXISTS periodo_academico (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla notificacion
CREATE TABLE IF NOT EXISTS notificacion (
    id BIGSERIAL PRIMARY KEY,
    usuario_destino VARCHAR(100) NOT NULL,
    tipo_notificacion VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_lectura TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla auditoria
CREATE TABLE IF NOT EXISTS auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(100) NOT NULL,
    entidad_id BIGINT,
    descripcion TEXT,
    ip_origen VARCHAR(50),
    fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_parametro_sistema_clave ON parametro_sistema(clave);
CREATE INDEX IF NOT EXISTS idx_tipo_incidencia_codigo ON tipo_incidencia(codigo);
CREATE INDEX IF NOT EXISTS idx_tipo_notificacion_codigo ON tipo_notificacion(codigo);
CREATE INDEX IF NOT EXISTS idx_periodo_academico_codigo ON periodo_academico(codigo);
CREATE INDEX IF NOT EXISTS idx_notificacion_usuario ON notificacion(usuario_destino);
CREATE INDEX IF NOT EXISTS idx_notificacion_leida ON notificacion(leida);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON auditoria(entidad);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_accion);

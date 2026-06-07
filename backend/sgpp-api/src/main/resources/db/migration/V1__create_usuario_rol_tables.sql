-- Creación de tabla rol
CREATE TABLE IF NOT EXISTS rol (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Creación de tabla usuario
CREATE TABLE IF NOT EXISTS usuario (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    cuenta_bloqueada BOOLEAN DEFAULT FALSE,
    fecha_ultimo_acceso TIMESTAMP,
    intentos_fallidos INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Creación de tabla usuario_rol
CREATE TABLE IF NOT EXISTS usuario_rol (
    id BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_rol BIGINT NOT NULL,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    asignado_por VARCHAR(50),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (id_rol) REFERENCES rol(id) ON DELETE CASCADE,
    UNIQUE (id_usuario, id_rol)
);

-- Creación de tabla estudiante
CREATE TABLE IF NOT EXISTS estudiante (
    id BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT UNIQUE NOT NULL,
    codigo_estudiantil VARCHAR(20) UNIQUE NOT NULL,
    semestre_actual INTEGER NOT NULL,
    creditos_aprobados INTEGER DEFAULT 0,
    creditos_requeridos_practica INTEGER DEFAULT 0,
    promedio_ponderado DECIMAL(5,2),
    fecha_ingreso DATE NOT NULL,
    fecha_egreso_estimada DATE,
    estado_academico VARCHAR(20) NOT NULL,
    id_periodo_academico_actual BIGINT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Creación de tabla docente
CREATE TABLE IF NOT EXISTS docente (
    id BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT UNIQUE NOT NULL,
    codigo_docente VARCHAR(20) UNIQUE NOT NULL,
    categoria VARCHAR(50),
    especialidad VARCHAR(100),
    departamento VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    max_practicantes INTEGER DEFAULT 10,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Creación de tabla tutor_externo
CREATE TABLE IF NOT EXISTS tutor_externo (
    id BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT UNIQUE NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    empresa_nombre VARCHAR(200),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuario_username ON usuario(username);
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_numero_documento ON usuario(numero_documento);
CREATE INDEX IF NOT EXISTS idx_usuario_activo ON usuario(activo);
CREATE INDEX IF NOT EXISTS idx_estudiante_codigo_estudiantil ON estudiante(codigo_estudiantil);
CREATE INDEX IF NOT EXISTS idx_estudiante_estado_academico ON estudiante(estado_academico);
CREATE INDEX IF NOT EXISTS idx_docente_codigo_docente ON docente(codigo_docente);
CREATE INDEX IF NOT EXISTS idx_docente_activo ON docente(activo);

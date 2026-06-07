-- Creación de tablas del módulo de sedes

-- Tabla empresa
CREATE TABLE IF NOT EXISTS empresa (
    id BIGSERIAL PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(200) NOT NULL,
    nombre_comercial VARCHAR(200),
    direccion VARCHAR(300),
    distrito VARCHAR(100),
    provincia VARCHAR(100),
    departamento VARCHAR(100),
    pais VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    pagina_web VARCHAR(200),
    sector_economico VARCHAR(100),
    tamano_empresa VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    validado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla sede_practica
CREATE TABLE IF NOT EXISTS sede_practica (
    id BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL,
    nombre_sede VARCHAR(200) NOT NULL,
    direccion VARCHAR(300) NOT NULL,
    distrito VARCHAR(100),
    provincia VARCHAR(100),
    departamento VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    nombre_contacto VARCHAR(200),
    cargo_contacto VARCHAR(100),
    telefono_contacto VARCHAR(20),
    email_contacto VARCHAR(100),
    capacidad_maxima INTEGER,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_sede_empresa FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE
);

-- Tabla convenio
CREATE TABLE IF NOT EXISTS convenio (
    id BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL,
    numero_convenio VARCHAR(50) NOT NULL UNIQUE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    objetivo TEXT,
    vigente BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_convenio_empresa FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_empresa_ruc ON empresa(ruc);
CREATE INDEX IF NOT EXISTS idx_empresa_activo ON empresa(activo);
CREATE INDEX IF NOT EXISTS idx_sede_empresa ON sede_practica(id_empresa);
CREATE INDEX IF NOT EXISTS idx_sede_activo ON sede_practica(activo);
CREATE INDEX IF NOT EXISTS idx_convenio_empresa ON convenio(id_empresa);
CREATE INDEX IF NOT EXISTS idx_convenio_vigente ON convenio(vigente);

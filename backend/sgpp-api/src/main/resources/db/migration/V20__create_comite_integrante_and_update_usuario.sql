-- Create comite_integrante table
CREATE TABLE IF NOT EXISTS comite_integrante (
    id BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_docente BIGINT,
    rol_comite VARCHAR(20) NOT NULL CHECK (rol_comite IN ('PRESIDENTE', 'MIEMBRO')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    resolucion_designacion VARCHAR(255),
    periodo_academico VARCHAR(50),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Add foreign key constraints
ALTER TABLE comite_integrante 
ADD CONSTRAINT fk_comite_integrante_usuario 
FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE;

ALTER TABLE comite_integrante 
ADD CONSTRAINT fk_comite_integrante_docente 
FOREIGN KEY (id_docente) REFERENCES docente(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_comite_integrante_usuario ON comite_integrante(id_usuario);
CREATE INDEX IF NOT EXISTS idx_comite_integrante_docente ON comite_integrante(id_docente);
CREATE INDEX IF NOT EXISTS idx_comite_integrante_estado ON comite_integrante(estado);
CREATE INDEX IF NOT EXISTS idx_comite_integrante_rol ON comite_integrante(rol_comite);

-- Add new columns to usuario table
ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS codigo_institucional VARCHAR(50);

ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('INTERNO', 'EXTERNO'));

ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP;

ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP;

-- Add index on tipo_usuario
CREATE INDEX IF NOT EXISTS idx_usuario_tipo_usuario ON usuario(tipo_usuario);

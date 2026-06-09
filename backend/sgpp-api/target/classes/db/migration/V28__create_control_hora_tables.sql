-- Create control_hora table
CREATE TABLE IF NOT EXISTS control_hora (
    id BIGSERIAL PRIMARY KEY,
    id_expediente BIGINT NOT NULL,
    horas_requeridas INTEGER NOT NULL,
    horas_acumuladas INTEGER NOT NULL DEFAULT 0,
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    fecha_fin_real DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'EN_PROCESO',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Create registro_hora table
CREATE TABLE IF NOT EXISTS registro_hora (
    id BIGSERIAL PRIMARY KEY,
    id_control_hora BIGINT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    horas INTEGER NOT NULL,
    descripcion_actividad TEXT,
    tipo_registro VARCHAR(30) NOT NULL,
    id_usuario_registra BIGINT NOT NULL,
    validado_por_tutor BOOLEAN NOT NULL DEFAULT FALSE,
    id_tutor_valida BIGINT,
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Add foreign key constraints
ALTER TABLE control_hora 
ADD CONSTRAINT fk_control_hora_expediente 
FOREIGN KEY (id_expediente) REFERENCES expediente(id) ON DELETE CASCADE;

ALTER TABLE registro_hora 
ADD CONSTRAINT fk_registro_hora_control 
FOREIGN KEY (id_control_hora) REFERENCES control_hora(id) ON DELETE CASCADE;

ALTER TABLE registro_hora 
ADD CONSTRAINT fk_registro_hora_usuario_registra 
FOREIGN KEY (id_usuario_registra) REFERENCES usuario(id) ON DELETE CASCADE;

ALTER TABLE registro_hora 
ADD CONSTRAINT fk_registro_hora_tutor_valida 
FOREIGN KEY (id_tutor_valida) REFERENCES usuario(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX idx_control_hora_expediente ON control_hora(id_expediente);
CREATE INDEX idx_control_hora_estado ON control_hora(estado);
CREATE INDEX idx_control_hora_activo ON control_hora(activo);

CREATE INDEX idx_registro_hora_control ON registro_hora(id_control_hora);
CREATE INDEX idx_registro_hora_fecha ON registro_hora(fecha);
CREATE INDEX idx_registro_hora_validado ON registro_hora(validado_por_tutor);
CREATE INDEX idx_registro_hora_usuario_registra ON registro_hora(id_usuario_registra);

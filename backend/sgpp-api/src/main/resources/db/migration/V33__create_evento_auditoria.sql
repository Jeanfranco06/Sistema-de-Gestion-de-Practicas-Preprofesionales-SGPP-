-- Capa institucional de auditoría y trazabilidad transaccional
CREATE TABLE IF NOT EXISTS evento_auditoria (
    id BIGSERIAL PRIMARY KEY,
    tipo_entidad VARCHAR(50) NOT NULL,
    entidad_id BIGINT,
    id_expediente BIGINT,
    accion VARCHAR(50) NOT NULL,
    id_usuario BIGINT,
    username_usuario VARCHAR(100),
    rol_usuario VARCHAR(100),
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    motivo TEXT,
    origen VARCHAR(30) NOT NULL DEFAULT 'API',
    resultado VARCHAR(30) NOT NULL DEFAULT 'EXITOSO',
    ip_origen VARCHAR(50),
    detalle_adicional TEXT,
    cumplimiento_plazo BOOLEAN,
    id_control_plazo BIGINT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(100),
    CONSTRAINT fk_ea_expediente FOREIGN KEY (id_expediente) REFERENCES expediente(id),
    CONSTRAINT fk_ea_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

CREATE INDEX IF NOT EXISTS idx_ea_expediente ON evento_auditoria(id_expediente);
CREATE INDEX IF NOT EXISTS idx_ea_usuario ON evento_auditoria(id_usuario);
CREATE INDEX IF NOT EXISTS idx_ea_entidad ON evento_auditoria(tipo_entidad, entidad_id);
CREATE INDEX IF NOT EXISTS idx_ea_accion ON evento_auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_ea_fecha ON evento_auditoria(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_ea_expediente_fecha ON evento_auditoria(id_expediente, fecha_hora);

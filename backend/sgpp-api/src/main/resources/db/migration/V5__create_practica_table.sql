-- Creación de tabla practica

CREATE TABLE IF NOT EXISTS practica (
    id BIGSERIAL PRIMARY KEY,
    id_estudiante BIGINT NOT NULL,
    id_sede BIGINT NOT NULL,
    id_tutor_externo BIGINT,
    id_estado BIGINT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    horas_totales INTEGER,
    horas_restantes INTEGER,
    area_practica VARCHAR(100),
    descripcion_puesto TEXT,
    remunerado BOOLEAN NOT NULL DEFAULT FALSE,
    monto_remuneracion NUMERIC(10,2),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_practica_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_practica_sede FOREIGN KEY (id_sede) REFERENCES sede_practica(id) ON DELETE CASCADE,
    CONSTRAINT fk_practica_tutor_externo FOREIGN KEY (id_tutor_externo) REFERENCES tutor_externo(id) ON DELETE SET NULL,
    CONSTRAINT fk_practica_estado FOREIGN KEY (id_estado) REFERENCES estado_practica(id) ON DELETE RESTRICT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_practica_estudiante ON practica(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_practica_sede ON practica(id_sede);
CREATE INDEX IF NOT EXISTS idx_practica_estado ON practica(id_estado);
CREATE INDEX IF NOT EXISTS idx_practica_activo ON practica(activo);

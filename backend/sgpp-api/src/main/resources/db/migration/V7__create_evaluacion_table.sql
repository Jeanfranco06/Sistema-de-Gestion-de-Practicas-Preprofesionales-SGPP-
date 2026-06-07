-- Creación de tabla evaluacion

CREATE TABLE IF NOT EXISTS evaluacion (
    id BIGSERIAL PRIMARY KEY,
    id_practica BIGINT NOT NULL,
    tipo_evaluador VARCHAR(50) NOT NULL,
    evaluador_id BIGINT,
    puntaje_asistencia INTEGER,
    puntaje_responsabilidad INTEGER,
    puntaje_conocimiento INTEGER,
    puntaje_actitud INTEGER,
    puntaje_total INTEGER,
    comentarios TEXT,
    fecha_evaluacion DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    CONSTRAINT fk_evaluacion_practica FOREIGN KEY (id_practica) REFERENCES practica(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_evaluacion_practica ON evaluacion(id_practica);
CREATE INDEX IF NOT EXISTS idx_evaluacion_tipo ON evaluacion(tipo_evaluador);
CREATE INDEX IF NOT EXISTS idx_evaluacion_activo ON evaluacion(activo);

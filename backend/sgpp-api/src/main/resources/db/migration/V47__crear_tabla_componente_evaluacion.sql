-- ============================================================
-- V47: Crear tabla de componentes de evaluación (normativa UNT 2025)
-- ============================================================
CREATE TABLE IF NOT EXISTS componente_evaluacion (
    id                          BIGSERIAL                   PRIMARY KEY,
    id_expediente               BIGINT                      NOT NULL,
    tipo_componente             VARCHAR(20)                 NOT NULL,
    puntaje_maximo              INTEGER                     NOT NULL DEFAULT 100,
    puntaje_obtenido            INTEGER,
    porcentaje                  INTEGER                     NOT NULL DEFAULT 100,
    evaluador_id                BIGINT,
    tipo_evaluador              VARCHAR(50),
    fecha_evaluacion            DATE,
    observaciones               TEXT,
    estado                      VARCHAR(20)                 NOT NULL DEFAULT 'PENDIENTE',
    activo                      BOOLEAN                     NOT NULL DEFAULT TRUE,
    fecha_creacion              TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion         TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creado_por                  VARCHAR(50),
    CONSTRAINT fk_componente_evaluacion_expediente
        FOREIGN KEY (id_expediente) REFERENCES expediente(id)
);

CREATE INDEX IF NOT EXISTS idx_componente_evaluacion_expediente
    ON componente_evaluacion(id_expediente);
CREATE INDEX IF NOT EXISTS idx_componente_evaluacion_activo
    ON componente_evaluacion(activo);
CREATE INDEX IF NOT EXISTS idx_componente_evaluacion_tipo
    ON componente_evaluacion(id_expediente, tipo_componente, activo);

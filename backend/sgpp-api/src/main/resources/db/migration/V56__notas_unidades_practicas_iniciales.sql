-- V56__notas_unidades_practicas_iniciales.sql
-- Registro de notas por unidades para prácticas iniciales (curriculares),
-- según artículos 41-43 del reglamento de la Escuela de Ingeniería Industrial.
-- Unidad 1: Plan (20%) + Informe Parcial (80%)
-- Unidad 2: Informe Parcial
-- Unidad 3: Informe Final

CREATE TABLE IF NOT EXISTS nota_unidad (
    id BIGSERIAL PRIMARY KEY,
    id_expediente BIGINT NOT NULL REFERENCES expediente(id),
    numero_unidad INTEGER NOT NULL CHECK (numero_unidad BETWEEN 1 AND 3),
    nota_plan NUMERIC(4,2),
    nota_informe NUMERIC(4,2),
    nota_final_unidad NUMERIC(4,2) NOT NULL,
    porcentaje_plan INTEGER DEFAULT 0,
    porcentaje_informe INTEGER DEFAULT 0,
    comentarios TEXT,
    fecha_evaluacion DATE NOT NULL DEFAULT CURRENT_DATE,
    id_evaluador BIGINT NOT NULL REFERENCES usuario(id),
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE (id_expediente, numero_unidad)
);

CREATE INDEX IF NOT EXISTS idx_nota_unidad_expediente ON nota_unidad(id_expediente);

COMMENT ON TABLE nota_unidad IS 'Notas por unidades para prácticas iniciales (curriculares)';
COMMENT ON COLUMN nota_unidad.numero_unidad IS 'Número de unidad: 1, 2 o 3';
COMMENT ON COLUMN nota_unidad.nota_plan IS 'Nota del plan de prácticas (solo aplica unidad 1 con 20%)';
COMMENT ON COLUMN nota_unidad.nota_informe IS 'Nota del informe parcial o final';
COMMENT ON COLUMN nota_unidad.nota_final_unidad IS 'Nota ponderada de la unidad';

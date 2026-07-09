-- V42__configurar_plazos_normativos_unt2025.sql
-- Configuración de plazos normativos según normativa UNT 2025 y reglamento de Ingeniería Industrial

-- Paso 1: Crear tabla de parámetros de plazos si no existe
CREATE TABLE IF NOT EXISTS plazo_parametro (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    valor_dias INTEGER NOT NULL,
    tipo_practica VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    creado_por VARCHAR(50) DEFAULT 'SYSTEM',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paso 2: Insertar plazos normativos según normativa
-- Plan de prácticas: 15 primeros días del ciclo
INSERT INTO plazo_parametro (codigo, nombre, descripcion, valor_dias, tipo_practica, activo)
VALUES 
('PLAN_PRESENTACION_INICIAL', 'Presentación Plan Inicial', 'Plazo para presentación del plan de prácticas (15 días desde inicio)', 15, 'INICIAL', TRUE),
('PLAN_PRESENTACION_FINAL', 'Presentación Plan Final', 'Plazo para presentación del plan de prácticas (15 días desde inicio)', 15, 'FINAL', TRUE),
('PLAN_PRESENTACION_PROFESIONAL', 'Presentación Plan Profesional', 'Plazo para presentación del plan de prácticas (15 días desde inicio)', 15, 'PROFESIONAL', TRUE)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    valor_dias = EXCLUDED.valor_dias,
    tipo_practica = EXCLUDED.tipo_practica,
    activo = EXCLUDED.activo;

-- Observaciones al plan: 7 días calendario para levantar
INSERT INTO plazo_parametro (codigo, nombre, descripcion, valor_dias, tipo_practica, activo)
VALUES 
('PLAN_OBSERVACION_SUBSANACION', 'Subsanación Observaciones Plan', 'Plazo para subsanar observaciones del plan (7 días calendario)', 7, NULL, TRUE)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    valor_dias = EXCLUDED.valor_dias,
    tipo_practica = EXCLUDED.tipo_practica,
    activo = EXCLUDED.activo;

-- Observaciones a documentos: 10 días calendario
INSERT INTO plazo_parametro (codigo, nombre, descripcion, valor_dias, tipo_practica, activo)
VALUES 
('DOCUMENTO_OBSERVACION_SUBSANACION', 'Subsanación Observaciones Documento', 'Plazo para subsanar observaciones de documentos (10 días calendario)', 10, NULL, TRUE)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    valor_dias = EXCLUDED.valor_dias,
    tipo_practica = EXCLUDED.tipo_practica,
    activo = EXCLUDED.activo;

-- Informes parciales: semanas específicas (5, 10, 15)
INSERT INTO plazo_parametro (codigo, nombre, descripcion, valor_dias, tipo_practica, activo)
VALUES 
('INFORME_PARCIAL_1_SEMANA', 'Informe Parcial 1', 'Semana para presentación del informe parcial 1 (semana 5)', 5, 'INICIAL', TRUE),
('INFORME_PARCIAL_2_SEMANA', 'Informe Parcial 2', 'Semana para presentación del informe parcial 2 (semana 10)', 10, 'INICIAL', TRUE),
('INFORME_FINAL_SEMANA', 'Informe Final', 'Semana para presentación del informe final (semana 15)', 15, 'INICIAL', TRUE)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    valor_dias = EXCLUDED.valor_dias,
    tipo_practica = EXCLUDED.tipo_practica,
    activo = EXCLUDED.activo;

-- Duración mínima prácticas finales: 360 horas / 90 días
INSERT INTO plazo_parametro (codigo, nombre, descripcion, valor_dias, tipo_practica, activo)
VALUES 
('PRACTICA_DURACION_MINIMA_FINAL', 'Duración Mínima Final', 'Duración mínima en días para prácticas finales (90 días)', 90, 'FINAL', TRUE),
('PRACTICA_DURACION_MINIMA_PROFESIONAL', 'Duración Mínima Profesional', 'Duración mínima en días para prácticas profesionales (90 días)', 90, 'PROFESIONAL', TRUE)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    valor_dias = EXCLUDED.valor_dias,
    tipo_practica = EXCLUDED.tipo_practica,
    activo = EXCLUDED.activo;

-- Paso 3: Crear índices
CREATE INDEX IF NOT EXISTS idx_plazo_parametro_codigo ON plazo_parametro(codigo);
CREATE INDEX IF NOT EXISTS idx_plazo_parametro_tipo ON plazo_parametro(tipo_practica);
CREATE INDEX IF NOT EXISTS idx_plazo_parametro_activo ON plazo_parametro(activo);

-- Paso 4: Agregar comentarios
COMMENT ON TABLE plazo_parametro IS 'Parámetros de plazos normativos para prácticas preprofesionales';
COMMENT ON COLUMN plazo_parametro.codigo IS 'Código único del parámetro de plazo';
COMMENT ON COLUMN plazo_parametro.valor_dias IS 'Valor en días del plazo';
COMMENT ON COLUMN plazo_parametro.tipo_practica IS 'Tipo de práctica al que aplica (NULL = aplica a todos)';

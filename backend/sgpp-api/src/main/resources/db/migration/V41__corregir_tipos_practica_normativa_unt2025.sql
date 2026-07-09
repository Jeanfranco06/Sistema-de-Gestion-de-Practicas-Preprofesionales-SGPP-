-- V41__corregir_tipos_practica_normativa_unt2025.sql
-- Corrección de tipos de práctica según normativa UNT 2025 y reglamento de Ingeniería Industrial
-- Referencia: Contexto_SGPP.md y reglamento PP-RG-01.09

-- Paso 1: Agregar nuevos campos a la tabla tipo_practica
ALTER TABLE tipo_practica ADD COLUMN IF NOT EXISTS curricular BOOLEAN DEFAULT TRUE;
ALTER TABLE tipo_practica ADD COLUMN IF NOT EXISTS duracion_minima_dias INTEGER;
ALTER TABLE tipo_practica ADD COLUMN IF NOT EXISTS ciclo_minimo INTEGER;
ALTER TABLE tipo_practica ADD COLUMN IF NOT EXISTS creditos INTEGER;
ALTER TABLE tipo_practica ADD COLUMN IF NOT EXISTS condicion_acceso VARCHAR(50);

-- Paso 2: Actualizar tipos de práctica existentes con valores correctos según normativa
-- Práctica Inicial: 64 horas, VIII ciclo, 2 créditos, curricular
UPDATE tipo_practica 
SET 
    horas_requeridas = 64,
    curricular = TRUE,
    duracion_minima_dias = 30,
    ciclo_minimo = 8,
    creditos = 2,
    condicion_acceso = 'MATRICULADO',
    descripcion = 'Práctica inicial de observación y familiarización con el entorno laboral. Requiere VIII ciclo y matrícula activa.',
    activo = TRUE
WHERE codigo = 'INICIAL';

-- Práctica Final: 360 horas, IX o X ciclo, sin créditos, curricular
UPDATE tipo_practica 
SET 
    horas_requeridas = 360,
    curricular = TRUE,
    duracion_minima_dias = 90,
    ciclo_minimo = 9,
    creditos = NULL,
    condicion_acceso = 'APROBACION_INICIAL',
    descripcion = 'Práctica final para consolidación de conocimientos y habilidades profesionales. Requiere aprobación de prácticas iniciales y IX ciclo.',
    activo = TRUE
WHERE codigo = 'FINAL';

-- Práctica Profesional: 360 horas, egresado (máx. 1 año), sin créditos, extracurricular
UPDATE tipo_practica 
SET 
    horas_requeridas = 360,
    curricular = FALSE,
    duracion_minima_dias = 90,
    ciclo_minimo = NULL,
    creditos = NULL,
    condicion_acceso = 'EGRESADO',
    descripcion = 'Práctica profesional completa para egresados con titulación. Máximo 1 año después de egresar.',
    activo = TRUE
WHERE codigo = 'PROFESIONAL';

-- Paso 3: Eliminar tipo INTERMEDIA si existe (no está normado)
DELETE FROM tipo_practica WHERE codigo = 'INTERMEDIA';

-- Paso 4: Insertar tipos de práctica si no existen (para asegurar consistencia)
INSERT INTO tipo_practica (codigo, nombre, descripcion, horas_requeridas, curricular, duracion_minima_dias, ciclo_minimo, creditos, condicion_acceso, activo, creado_por)
VALUES 
('INICIAL', 'Práctica Inicial', 'Práctica inicial de observación y familiarización con el entorno laboral. Requiere VIII ciclo y matrícula activa.', 64, TRUE, 30, 8, 2, 'MATRICULADO', TRUE, 'SYSTEM'),
('FINAL', 'Práctica Final', 'Práctica final para consolidación de conocimientos y habilidades profesionales. Requiere aprobación de prácticas iniciales y IX ciclo.', 360, TRUE, 90, 9, NULL, 'APROBACION_INICIAL', TRUE, 'SYSTEM'),
('PROFESIONAL', 'Práctica Profesional', 'Práctica profesional completa para egresados con titulación. Máximo 1 año después de egresar.', 360, FALSE, 90, NULL, NULL, 'EGRESADO', TRUE, 'SYSTEM')
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    horas_requeridas = EXCLUDED.horas_requeridas,
    curricular = EXCLUDED.curricular,
    duracion_minima_dias = EXCLUDED.duracion_minima_dias,
    ciclo_minimo = EXCLUDED.ciclo_minimo,
    creditos = EXCLUDED.creditos,
    condicion_acceso = EXCLUDED.condicion_acceso,
    activo = EXCLUDED.activo;

-- Paso 5: Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_tipo_practica_curricular ON tipo_practica(curricular);
CREATE INDEX IF NOT EXISTS idx_tipo_practica_condicion_acceso ON tipo_practica(condicion_acceso);

-- Paso 6: Agregar comentarios descriptivos
COMMENT ON COLUMN tipo_practica.curricular IS 'Indica si la práctica es curricular (otorga créditos) o extracurricular';
COMMENT ON COLUMN tipo_practica.duracion_minima_dias IS 'Duración mínima en días según normativa';
COMMENT ON COLUMN tipo_practica.ciclo_minimo IS 'Ciclo mínimo requerido para acceder al tipo de práctica';
COMMENT ON COLUMN tipo_practica.creditos IS 'Número de créditos académicos (solo para prácticas curriculares)';
COMMENT ON COLUMN tipo_practica.condicion_acceso IS 'Condición de acceso: MATRICULADO, APROBACION_INICIAL, EGRESADO';

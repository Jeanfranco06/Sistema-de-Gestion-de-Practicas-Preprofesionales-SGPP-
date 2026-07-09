-- V43__actualizar_tipos_documento_normativa_unt2025.sql
-- Actualización de tipos de documentos según normativa UNT 2025 y reglamento de Ingeniería Industrial

-- Paso 0: Asegurar que la tabla tipo_documento tiene las columnas necesarias
ALTER TABLE tipo_documento ADD COLUMN IF NOT EXISTS codigo VARCHAR(50);
ALTER TABLE tipo_documento ADD COLUMN IF NOT EXISTS formato VARCHAR(20);
ALTER TABLE tipo_documento ADD COLUMN IF NOT EXISTS max_tamano_mb INTEGER;
ALTER TABLE tipo_documento ADD COLUMN IF NOT EXISTS tipo_practica VARCHAR(20);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tipo_documento_codigo ON tipo_documento(codigo);

-- Paso 1: Actualizar o insertar tipos de documentos según normativa
-- Documento de solicitud generado automáticamente
INSERT INTO tipo_documento (codigo, nombre, descripcion, formato, max_tamano_mb, activo)
VALUES 
('SOLICITUD_PRACTICA', 'Solicitud de Práctica', 'Documento de solicitud de práctica generado automáticamente', 'PDF', 5, TRUE)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    formato = EXCLUDED.formato,
    max_tamano_mb = EXCLUDED.max_tamano_mb,
    activo = EXCLUDED.activo;

-- Documentos generales para todos los tipos de práctica
INSERT INTO tipo_documento (codigo, nombre, descripcion, formato, max_tamano_mb, activo)
VALUES 
('CARTA_PRESENTACION', 'Carta de Presentación', 'Carta de presentación emitida por la Escuela/Dirección', 'PDF', 5, TRUE),
('CARTA_ACEPTACION', 'Carta de Aceptación', 'Carta de aceptación de la empresa', 'PDF', 5, TRUE),
('PLAN_PRACTICA', 'Plan de Prácticas (Anexo 1)', 'Plan de prácticas según formato normativo', 'PDF', 5, TRUE),
('FICHA_EVALUACION', 'Ficha de Evaluación (Anexo 2)', 'Ficha de evaluación empresarial', 'PDF', 5, TRUE),
('CONSTANCIA_EMPRESA', 'Constancia de Prácticas (Empresa)', 'Constancia emitida por la empresa', 'PDF', 5, TRUE)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    formato = EXCLUDED.formato,
    max_tamano_mb = EXCLUDED.max_tamano_mb,
    activo = EXCLUDED.activo;

-- Documentos específicos para prácticas iniciales
INSERT INTO tipo_documento (codigo, nombre, descripcion, formato, max_tamano_mb, activo, tipo_practica)
VALUES 
('INFORME_PARCIAL_1', 'Informe Parcial Semana 5', 'Informe parcial correspondiente a la semana 5', 'PDF', 5, TRUE, 'INICIAL'),
('INFORME_PARCIAL_2', 'Informe Parcial Semana 10', 'Informe parcial correspondiente a la semana 10', 'PDF', 5, TRUE, 'INICIAL'),
('INFORME_FINAL_INICIAL', 'Informe Final Semana 15', 'Informe final de prácticas iniciales', 'PDF', 10, TRUE, 'INICIAL')
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    formato = EXCLUDED.formato,
    max_tamano_mb = EXCLUDED.max_tamano_mb,
    activo = EXCLUDED.activo,
    tipo_practica = EXCLUDED.tipo_practica;

-- Documentos específicos para prácticas finales/profesionales
INSERT INTO tipo_documento (codigo, nombre, descripcion, formato, max_tamano_mb, activo, tipo_practica)
VALUES 
('INFORME_FINAL', 'Informe Final', 'Informe final de prácticas', 'PDF', 10, TRUE, 'FINAL'),
('INFORME_FINAL_PROFESIONAL', 'Informe Final Profesional', 'Informe final de prácticas profesionales', 'PDF', 10, TRUE, 'PROFESIONAL')
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    formato = EXCLUDED.formato,
    max_tamano_mb = EXCLUDED.max_tamano_mb,
    activo = EXCLUDED.activo,
    tipo_practica = EXCLUDED.tipo_practica;

-- Documentos finales emitidos por la institución
INSERT INTO tipo_documento (codigo, nombre, descripcion, formato, max_tamano_mb, activo)
VALUES 
('DICTAMEN_FINAL', 'Dictamen Final', 'Dictamen final emitido por el comité', 'PDF', 5, TRUE),
('CONSTANCIA_CULMINACION', 'Constancia de Culminación', 'Constancia de culminación emitida por Dirección', 'PDF', 5, TRUE)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    formato = EXCLUDED.formato,
    max_tamano_mb = EXCLUDED.max_tamano_mb,
    activo = EXCLUDED.activo;

-- Paso 2: Agregar columna tipo_practica a tipo_documento si no existe
ALTER TABLE tipo_documento ADD COLUMN IF NOT EXISTS tipo_practica VARCHAR(20);

-- Paso 3: Crear índice para tipo_practica
CREATE INDEX IF NOT EXISTS idx_tipo_documento_tipo_practica ON tipo_documento(tipo_practica);

-- Paso 4: Desactivar tipos de documentos obsoletos si existen
UPDATE tipo_documento SET activo = FALSE 
WHERE codigo IN ('VISTO_BUENO', 'CONSTANCIA_TERMINACION') 
AND codigo IN (SELECT codigo FROM tipo_documento);

-- Paso 5: Agregar comentarios
COMMENT ON COLUMN tipo_documento.tipo_practica IS 'Tipo de práctica al que aplica el documento (NULL aplica a todos)';

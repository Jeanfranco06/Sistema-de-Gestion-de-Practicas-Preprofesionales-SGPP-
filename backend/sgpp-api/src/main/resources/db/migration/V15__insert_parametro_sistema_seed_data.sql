-- Inserción de parámetros del sistema para reglas maestras parametrizables
-- Horas mínimas, duración, plazos de presentación del plan, plazos de subsanación, requisitos por tipo de práctica y modalidad de evaluación

-- Parámetros de horas mínimas por tipo de práctica
INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato, activo, creado_por) VALUES
('PRACTICA_INICIAL_HORAS_MINIMAS', '120', 'Horas mínimas requeridas para práctica inicial', 'INTEGER', TRUE, 'SYSTEM'),
('PRACTICA_FINAL_HORAS_MINIMAS', '240', 'Horas mínimas requeridas para práctica final', 'INTEGER', TRUE, 'SYSTEM'),
('PRACTICA_PROFESIONAL_HORAS_MINIMAS', '480', 'Horas mínimas requeridas para práctica profesional', 'INTEGER', TRUE, 'SYSTEM')
ON CONFLICT (clave) DO NOTHING;

-- Parámetros de duración máxima por tipo de práctica (en días)
INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato, activo, creado_por) VALUES
('PRACTICA_INICIAL_DURACION_MAXIMA', '90', 'Duración máxima en días para práctica inicial', 'INTEGER', TRUE, 'SYSTEM'),
('PRACTICA_FINAL_DURACION_MAXIMA', '180', 'Duración máxima en días para práctica final', 'INTEGER', TRUE, 'SYSTEM'),
('PRACTICA_PROFESIONAL_DURACION_MAXIMA', '360', 'Duración máxima en días para práctica profesional', 'INTEGER', TRUE, 'SYSTEM')
ON CONFLICT (clave) DO NOTHING;

-- Plazos de presentación del plan de prácticas (en días desde inicio)
INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato, activo, creado_por) VALUES
('PLAZO_PRESENTACION_PLAN_INICIAL', '15', 'Plazo en días para presentar plan de práctica inicial desde inicio', 'INTEGER', TRUE, 'SYSTEM'),
('PLAZO_PRESENTACION_PLAN_FINAL', '30', 'Plazo en días para presentar plan de práctica final desde inicio', 'INTEGER', TRUE, 'SYSTEM'),
('PLAZO_PRESENTACION_PLAN_PROFESIONAL', '45', 'Plazo en días para presentar plan de práctica profesional desde inicio', 'INTEGER', TRUE, 'SYSTEM')
ON CONFLICT (clave) DO NOTHING;

-- Plazos de subsanación de documentos (en días)
INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato, activo, creado_por) VALUES
('PLAZO_SUBSANACION_DOCUMENTOS', '7', 'Plazo en días para subsanar documentos observados', 'INTEGER', TRUE, 'SYSTEM'),
('PLAZO_SUBSANACION_PLAN', '5', 'Plazo en días para subsanar plan de prácticas observado', 'INTEGER', TRUE, 'SYSTEM')
ON CONFLICT (clave) DO NOTHING;

-- Requisitos por tipo de práctica (créditos mínimos)
INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato, activo, creado_por) VALUES
('PRACTICA_INICIAL_CREDITOS_MINIMOS', '80', 'Créditos mínimos aprobados para práctica inicial', 'INTEGER', TRUE, 'SYSTEM'),
('PRACTICA_FINAL_CREDITOS_MINIMOS', '150', 'Créditos mínimos aprobados para práctica final', 'INTEGER', TRUE, 'SYSTEM'),
('PRACTICA_PROFESIONAL_CREDITOS_MINIMOS', '200', 'Créditos mínimos aprobados para práctica profesional', 'INTEGER', TRUE, 'SYSTEM')
ON CONFLICT (clave) DO NOTHING;

-- Modalidad de evaluación
INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato, activo, creado_por) VALUES
('MODALIDAD_EVALUACION_INICIAL', 'INFORME', 'Modalidad de evaluación para práctica inicial: INFORME, PRESENTACION, AMBAS', 'STRING', TRUE, 'SYSTEM'),
('MODALIDAD_EVALUACION_FINAL', 'PRESENTACION', 'Modalidad de evaluación para práctica final: INFORME, PRESENTACION, AMBAS', 'STRING', TRUE, 'SYSTEM'),
('MODALIDAD_EVALUACION_PROFESIONAL', 'AMBAS', 'Modalidad de evaluación para práctica profesional: INFORME, PRESENTACION, AMBAS', 'STRING', TRUE, 'SYSTEM')
ON CONFLICT (clave) DO NOTHING;

-- Parámetros generales del sistema
INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato, activo, creado_por) VALUES
('MAX_PRACTICANTES_POR_DOCENTE', '10', 'Máximo número de practicantes por docente asesor', 'INTEGER', TRUE, 'SYSTEM'),
('PORCENTAJE_ASISTENCIA_MINIMO', '80', 'Porcentaje mínimo de asistencia requerido', 'INTEGER', TRUE, 'SYSTEM'),
('NOTA_MINIMA_APROBACION', '13', 'Nota mínima para aprobar práctica (escala 0-20)', 'INTEGER', TRUE, 'SYSTEM'),
('DIAS_ANTICIPACION_REPORTE', '7', 'Días de anticipación para presentación de reportes', 'INTEGER', TRUE, 'SYSTEM')
ON CONFLICT (clave) DO NOTHING;

-- Parámetros de validación de requisitos académicos
INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato, activo, creado_por) VALUES
('CREDITOS_REQUERIDOS_PRACTICA', '140', 'Créditos mínimos aprobados requeridos por defecto para práctica inicial (Art. 25 Reglamento PP-RG-01.09)', 'INTEGER', TRUE, 'SYSTEM'),
('REQUISITO_SEMESTRE_MINIMO', '8', 'Semestre mínimo requerido para iniciar prácticas preprofesionales (octavo ciclo)', 'INTEGER', TRUE, 'SYSTEM')
ON CONFLICT (clave) DO NOTHING;

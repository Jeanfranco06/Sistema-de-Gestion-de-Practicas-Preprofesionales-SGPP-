-- Migración para actualizar criterios de evaluación al formato Anexo 2
-- Escala 1-5, 3 categorías, total 50 puntos
-- NOTA: V32 renombró tipo_evaluador -> componente en criterio_evaluacion y rubrica

-- 1. Desactivar criterios anteriores de EMPRESA (columna ya es 'componente' tras V32)
UPDATE criterio_evaluacion SET activo = FALSE WHERE componente = 'EMPRESA' AND activo = TRUE;

-- 2. Insertar criterios Anexo 2 - ASPECTOS ACTITUDINALES (4 items, 5 pts c/u = 20 pts)
INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'ASISTENCIA', 'Asistencia y puntualidad', 'Se evalúa la asistencia regular y puntualidad del practicante', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'ASISTENCIA');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'RESPONSABILIDAD', 'Responsabilidad para el cumplimiento de sus obligaciones', 'Se evalúa el cumplimiento oportuno de las tareas y obligaciones asignadas', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'RESPONSABILIDAD');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'ESFUERZO', 'Esfuerzo y empeño en la ejecución de sus tareas', 'Se evalúa la dedicación y empeño demostrado en las actividades encomendadas', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'ESFUERZO');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'RESPETO_COLABORACION', 'Respeto y colaboración con sus superiores jerárquicos', 'Se evalúa el trato respetuoso y la disposición para colaborar con el equipo de trabajo', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'RESPETO_COLABORACION');

-- 3. Insertar criterios Anexo 2 - ASPECTOS COGNITIVOS (2 items, 4 pts c/u = 8 pts)
INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'CULTURA_GENERAL', 'Demostración de cultura y conocimientos generales propios de un estudiante o egresado universitario', 'Se evalúa la demostración de conocimientos generales y formación académica', 4, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'CULTURA_GENERAL');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'CONOCIMIENTOS_TECNICOS', 'Demostración de conocimientos técnicos propios de la carrera de Ingeniería Industrial', 'Se evalúa la aplicación de conocimientos técnicos de la carrera en el entorno laboral', 4, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'CONOCIMIENTOS_TECNICOS');

-- 4. Insertar criterios Anexo 2 - ASPECTOS DE PROYECCIÓN Y DESARROLLO PROFESIONAL (4 items, 4 pts c/u = 16 pts)
INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'CREATIVIDAD', 'Creatividad e ingenio en la solución de problemas', 'Se evalúa la capacidad para proponer soluciones innovadoras ante situaciones problemáticas', 4, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'CREATIVIDAD');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'INTERACCION_PERSONAS', 'Interacción con personas, superiores y subordinados', 'Se evalúa la capacidad de relacionarse y comunicarse de manera efectiva con diferentes niveles jerárquicos', 4, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'INTERACCION_PERSONAS');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'COMUNICACION', 'Fluidez en la comunicación verbal y escrita', 'Se evalúa la claridad y efectividad en la comunicación oral y por escrito', 4, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'COMUNICACION');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por)
SELECT 'APRENDIZAJE', 'Grado de aprendizaje y asimilación de experiencias nuevas', 'Se evalúa la capacidad de absorber conocimientos y adaptarse a nuevas situaciones de aprendizaje', 4, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'APRENDIZAJE');

-- 5. Actualizar rubrica (columna ya es 'componente' tras V32)
UPDATE rubrica SET puntaje_total = 50, descripcion = 'Rúbrica Anexo 2 - Evaluación de Prácticas Pre-Profesionales por la Empresa (50 puntos)'
WHERE componente = 'EMPRESA';

-- 6. Agregar columna duracion_semanas a plan_cronograma_actividad si no existe
ALTER TABLE plan_cronograma_actividad ADD COLUMN IF NOT EXISTS duracion_semanas INTEGER;

-- Insertar criterios de evaluación para Tutor Externo
INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'TE-CALIDAD', 'Aplicación de principios de calidad', 'Capacidad para aplicar métodos y herramientas de calidad en los procesos', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'TE-CALIDAD');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'TE-PRODUCTIVIDAD', 'Mejora de productividad', 'Contribución a la mejora de la productividad en la organización', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'TE-PRODUCTIVIDAD');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'TE-ETICA', 'Ética profesional', 'Cumplimiento de normas éticas y responsabilidad social en el desempeño', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'TE-ETICA');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'TE-TRABAJO-EQUIPO', 'Trabajo en equipo', 'Colaboración efectiva con los miembros de la organización', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'TE-TRABAJO-EQUIPO');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'TE-COMUNICACION', 'Comunicación efectiva', 'Capacidad para expresar ideas de manera clara y efectiva', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'TE-COMUNICACION');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'TE-RESPONSABILIDAD', 'Responsabilidad y compromiso', 'Cumplimiento de tareas y responsabilidades asignadas', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'TE-RESPONSABILIDAD');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'TE-INICIATIVA', 'Iniciativa y proactividad', 'Capacidad para proponer mejoras y actuar de manera proactiva', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'TE-INICIATIVA');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'TE-ADAPTABILIDAD', 'Adaptabilidad al cambio', 'Capacidad para adaptarse a nuevas situaciones y cambios en el entorno', 5, 'EMPRESA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'TE-ADAPTABILIDAD');

-- Insertar criterios de evaluación para Docente Asesor
INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'DA-PLAN', 'Calidad del plan de prácticas', 'Nivel de profundidad y aplicabilidad del plan de prácticas', 5, 'DOCENTE', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'DA-PLAN');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'DA-INFORME-PARCIAL', 'Informe parcial', 'Calidad y cumplimiento de los informes parciales', 5, 'DOCENTE', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'DA-INFORME-PARCIAL');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'DA-INFORME-FINAL', 'Informe final', 'Calidad y profundidad del informe final de prácticas', 10, 'DOCENTE', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'DA-INFORME-FINAL');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'DA-CUMPLIMIENTO-HORAS', 'Cumplimiento de horas', 'Nivel de cumplimiento de las horas de prácticas requeridas', 5, 'DOCENTE', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'DA-CUMPLIMIENTO-HORAS');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'DA-APRENDIZAJE', 'Aprendizaje y desarrollo', 'Nivel de aprendizaje y desarrollo profesional demostrado', 10, 'DOCENTE', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'DA-APRENDIZAJE');

INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, tipo_evaluador, activo, creado_por)
SELECT 'DA-COMPORTAMIENTO', 'Comportamiento y actitud', 'Actitud hacia la práctica y relación con la empresa', 5, 'DOCENTE', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM criterio_evaluacion WHERE codigo = 'DA-COMPORTAMIENTO');

-- Insertar rúbricas
INSERT INTO rubrica (nombre, descripcion, tipo_evaluador, puntaje_total, activo, creado_por)
SELECT 'Rúbrica Tutor Externo', 'Rúbrica para la evaluación del tutor externo', 'EMPRESA', 40, TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rubrica WHERE nombre = 'Rúbrica Tutor Externo');

INSERT INTO rubrica (nombre, descripcion, tipo_evaluador, puntaje_total, activo, creado_por)
SELECT 'Rúbrica Docente Asesor', 'Rúbrica para la evaluación del docente asesor', 'DOCENTE', 40, TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM rubrica WHERE nombre = 'Rúbrica Docente Asesor');

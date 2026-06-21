-- V30__nuevo_reglamento_evaluacion_unt.sql

-- 1. Modificar tabla evaluacion
ALTER TABLE evaluacion ADD COLUMN id_expediente BIGINT;

ALTER TABLE evaluacion 
  ADD CONSTRAINT fk_evaluacion_expediente 
  FOREIGN KEY (id_expediente) REFERENCES expediente(id);

ALTER TABLE evaluacion ALTER COLUMN id_practica DROP NOT NULL;

-- Cambiar unidad por componente
ALTER TABLE evaluacion RENAME COLUMN unidad TO componente;

-- 2. Modificar tabla criterio_evaluacion y rubrica para usar componente en lugar de tipo_evaluador
ALTER TABLE criterio_evaluacion RENAME COLUMN tipo_evaluador TO componente;
ALTER TABLE rubrica RENAME COLUMN tipo_evaluador TO componente;

-- Limpiar datos antiguos
DELETE FROM detalle_evaluacion;
DELETE FROM evaluacion;
DELETE FROM criterio_evaluacion;
DELETE FROM rubrica;

-- 3. Crear las nuevas rúbricas (Reglamento UNT)
INSERT INTO rubrica (nombre, descripcion, componente, puntaje_total, activo, creado_por) VALUES
('Desempeño en la Empresa', 'Evaluación por parte del Tutor Externo en la Empresa (30%)', 'EMPRESA', 30, TRUE, 'SYSTEM'),
('Seguimiento Docente', 'Evaluación continua del docente (30%)', 'DOCENTE', 30, TRUE, 'SYSTEM'),
('Informe Final', 'Evaluación del informe académico (30%)', 'INFORME', 30, TRUE, 'SYSTEM'),
('Sustentación', 'Evaluación de la sustentación oral (10%)', 'SUSTENTACION', 10, TRUE, 'SYSTEM');

-- 4. Crear los nuevos criterios de evaluación

-- EMPRESA (Tutor Externo) - Total 30% -> Peso en base 20 = 5+5+5+10+5
-- El puntaje_maximo es 20. El peso se maneja en el servicio o UI.
INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por) VALUES
('EMP-RESP', 'Responsabilidad y puntualidad', 'Cumple totalmente, proactivo', 20, 'EMPRESA', TRUE, 'SYSTEM'),
('EMP-ADAPT', 'Adaptación al entorno laboral', 'Se integra rápidamente, lidera', 20, 'EMPRESA', TRUE, 'SYSTEM'),
('EMP-EQUIPO', 'Trabajo en equipo', 'Lidera y colabora activamente', 20, 'EMPRESA', TRUE, 'SYSTEM'),
('EMP-TECNICA', 'Capacidad técnica', 'Aplica herramientas avanzadas', 20, 'EMPRESA', TRUE, 'SYSTEM'),
('EMP-ETICA', 'Ética profesional', 'Conducta ejemplar', 20, 'EMPRESA', TRUE, 'SYSTEM');

-- DOCENTE (Seguimiento) - Total 30% -> Peso 10+10+5+5
INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por) VALUES
('DOC-PLAN', 'Cumplimiento del plan', 'Cumple y supera objetivos', 20, 'DOCENTE', TRUE, 'SYSTEM'),
('DOC-APLICACION', 'Aplicación de conocimientos', 'Integra teoría y práctica', 20, 'DOCENTE', TRUE, 'SYSTEM'),
('DOC-ANALISIS', 'Análisis y solución de problemas', 'Propone mejoras innovadoras', 20, 'DOCENTE', TRUE, 'SYSTEM'),
('DOC-COMUNIC', 'Comunicación con docente', 'Fluida y constante', 20, 'DOCENTE', TRUE, 'SYSTEM');

-- INFORME FINAL - Total 30% -> Peso 5+5+5+10+5
INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por) VALUES
('INF-ESTRUCT', 'Estructura y presentación', 'Completa, clara, profesional', 20, 'INFORME', TRUE, 'SYSTEM'),
('INF-DIAGNOST', 'Diagnóstico situacional', 'Profundo y analítico', 20, 'INFORME', TRUE, 'SYSTEM'),
('INF-TEORIA', 'Aplicación teórica', 'Sustento sólido (APA)', 20, 'INFORME', TRUE, 'SYSTEM'),
('INF-PROPUESTA', 'Propuesta de mejora', 'Innovadora y viable', 20, 'INFORME', TRUE, 'SYSTEM'),
('INF-RESULT', 'Resultados e indicadores', 'Medibles y claros (KPI)', 20, 'INFORME', TRUE, 'SYSTEM');

-- SUSTENTACION - Total 10% -> Peso 3+2+2+3
INSERT INTO criterio_evaluacion (codigo, nombre, descripcion, puntaje_maximo, componente, activo, creado_por) VALUES
('SUS-DOMINIO', 'Dominio del tema', 'Total seguridad', 20, 'SUSTENTACION', TRUE, 'SYSTEM'),
('SUS-CLARIDAD', 'Claridad expositiva', 'Muy clara y ordenada', 20, 'SUSTENTACION', TRUE, 'SYSTEM'),
('SUS-RECURSOS', 'Uso de recursos visuales', 'Excelente uso (gráficos, KPIs)', 20, 'SUSTENTACION', TRUE, 'SYSTEM'),
('SUS-DEFENSA', 'Defensa técnica', 'Argumentación sólida', 20, 'SUSTENTACION', TRUE, 'SYSTEM');

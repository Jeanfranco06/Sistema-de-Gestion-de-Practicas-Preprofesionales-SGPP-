-- V54__corregir_modalidad_practicas_finales_profesionales.sql
-- Alinea la modalidad curricular/extracurricular con la normativa UNT y el reglamento
-- de la Escuela de Ingeniería Industrial (PP-RG-01.09).
--
-- Según el contexto normativo:
--   - Práctica Inicial: curricular (2 créditos, 64 h, VIII ciclo).
--   - Práctica Final: extracurricular (360 h, IX/X ciclo).
--   - Práctica Profesional: extracurricular (360 h, egresado).

UPDATE tipo_practica
SET curricular = TRUE
WHERE codigo = 'INICIAL';

UPDATE tipo_practica
SET curricular = FALSE
WHERE codigo IN ('FINAL', 'PROFESIONAL');

-- Asegurar que la descripción refleje la modalidad correcta.
UPDATE tipo_practica
SET descripcion = 'Práctica final para consolidación de conocimientos y habilidades profesionales. Es extracurricular, requiere aprobación de prácticas iniciales y estar en IX o X ciclo.'
WHERE codigo = 'FINAL';

UPDATE tipo_practica
SET descripcion = 'Práctica profesional completa para egresados. Es extracurricular, requiere condición de egresado y acreditar 360 horas efectivas.'
WHERE codigo = 'PROFESIONAL';

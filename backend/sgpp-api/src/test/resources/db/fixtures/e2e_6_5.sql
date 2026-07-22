-- Fixtures opcionales para pruebas E2E del punto 6.5.
-- Ejecutar únicamente sobre una base aislada de pruebas.

-- Limpiar datos operativos de estudiante1 y estudiante2 para evitar conflictos.
-- También se usan los códigos, porque instalaciones existentes pueden tener IDs distintos.
ALTER TABLE expediente_estado DISABLE TRIGGER trg_expediente_estado_inmutable;

DELETE FROM registro_generacion_documental WHERE id_expediente IN (SELECT id FROM expediente WHERE id IN (101, 102) OR codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001'));
DELETE FROM componente_evaluacion WHERE id_expediente IN (SELECT id FROM expediente WHERE id IN (101, 102) OR codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001'));
DELETE FROM control_plazo WHERE id_expediente IN (SELECT id FROM expediente WHERE id IN (101, 102) OR codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001'));
DELETE FROM evaluacion WHERE id_expediente IN (SELECT id FROM expediente WHERE id IN (101, 102) OR codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001'));
DELETE FROM plan_cronograma_actividad WHERE id_plan IN (SELECT id FROM plan_general WHERE id IN (101, 102) OR id_expediente IN (SELECT id FROM expediente WHERE codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001')));
DELETE FROM plan_objetivo WHERE id_plan IN (SELECT id FROM plan_general WHERE id IN (101, 102) OR id_expediente IN (SELECT id FROM expediente WHERE codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001')));
DELETE FROM plan_seccion WHERE id_plan IN (SELECT id FROM plan_general WHERE id IN (101, 102) OR id_expediente IN (SELECT id FROM expediente WHERE codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001')));
DELETE FROM plan_historial_estado WHERE id_plan IN (SELECT id FROM plan_general WHERE id IN (101, 102) OR id_expediente IN (SELECT id FROM expediente WHERE codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001')));
DELETE FROM plan_general WHERE id IN (101, 102) OR id_expediente IN (SELECT id FROM expediente WHERE codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001'));
DELETE FROM registro_hora WHERE id_control_hora IN (SELECT id FROM control_hora WHERE id IN (101, 102) OR id_expediente IN (SELECT id FROM expediente WHERE codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001')));
DELETE FROM control_hora WHERE id IN (101, 102) OR id_expediente IN (SELECT id FROM expediente WHERE codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001'));
DELETE FROM expediente_documento WHERE id_expediente IN (SELECT id FROM expediente WHERE id IN (101, 102) OR codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001'));
DELETE FROM expediente_comite WHERE id_expediente IN (SELECT id FROM expediente WHERE id IN (101, 102) OR codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001'));
DELETE FROM expediente_estado WHERE id_expediente IN (SELECT id FROM expediente WHERE id IN (101, 102) OR codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001'));
DELETE FROM practica WHERE id IN (101, 102);
DELETE FROM expediente WHERE id IN (101, 102) OR codigo_expediente IN ('EXP-2026-INICIAL-0001', 'EXP-2026-FINAL-0001');

ALTER TABLE expediente_estado ENABLE TRIGGER trg_expediente_estado_inmutable;

-- ==========================================
-- CASO 1: estudiante1 (Práctica Inicial)
-- ==========================================

-- 1. Expediente
INSERT INTO expediente (
    id, id_estudiante, numero_expediente, codigo_expediente, fecha_apertura, 
    estado, id_tipo_practica, id_empresa, id_sede_practica, id_asesor, 
    id_tutor_empresa, plan_trabajo_aprobado, carta_aceptacion_presentada, 
    fecha_inicio_practica, fecha_fin_practica, duracion_semanas, 
    numero_informes_parciales, informe_final_presentado, activo, creado_por, condicion_solicitante
) VALUES (
    101, 1, 'EXP-2026-INICIAL-0001', 'EXP-2026-INICIAL-0001', '2026-04-01', 
    'EN_EJECUCION', 1, 1, 1, 2, 
    1, true, true, 
    '2026-04-01', '2026-07-15', 15, 
    2, true, true, 'SYSTEM', 'ESTUDIANTE'
);

-- 2. Práctica
INSERT INTO practica (
    id, id_estudiante, id_sede, id_tutor_externo, id_estado, 
    fecha_inicio, fecha_fin, horas_totales, horas_restantes, remunerado, activo, creado_por, id_tipo_practica
) VALUES (
    101, 1, 1, 1, 2, 
    '2026-04-01', '2026-07-15', 64, 0, false, true, 'SYSTEM', 1
);

-- 3. Plan General
INSERT INTO plan_general (
    id, id_expediente, version, estado, fecha_presentacion, fecha_creacion, activo, creado_por
) VALUES (
    101, 101, 1, 'APROBADO', '2026-04-05 10:00:00', '2026-04-05 10:00:00', true, 'SYSTEM'
);

-- 4. Control de Horas
INSERT INTO control_hora (
    id, id_expediente, horas_requeridas, horas_acumuladas, fecha_inicio, 
    fecha_fin_estimada, fecha_fin_real, estado, activo, creado_por
) VALUES (
    101, 101, 64, 64, '2026-04-01', 
    '2026-07-15', '2026-07-15', 'CUMPLIDO', true, 'SYSTEM'
);

-- 5. Registros de Horas para completar las 64h (8 días de 8 horas)
INSERT INTO registro_hora (id, id_control_hora, fecha, horas, descripcion_actividad, tipo_registro, id_usuario_registra, validado_por_tutor, id_tutor_valida, creado_por) VALUES
(1001, 101, '2026-04-10', 8, 'Inducción y planeación de actividades', 'ASISTENCIA', 1, true, 3, 'SYSTEM'),
(1002, 101, '2026-04-20', 8, 'Análisis de procesos en planta', 'ASISTENCIA', 1, true, 3, 'SYSTEM'),
(1003, 101, '2026-05-10', 8, 'Mapeo de flujo de valor', 'ASISTENCIA', 1, true, 3, 'SYSTEM'),
(1004, 101, '2026-05-20', 8, 'Toma de tiempos de ensamble', 'ASISTENCIA', 1, true, 3, 'SYSTEM'),
(1005, 101, '2026-06-10', 8, 'Identificación de cuellos de botella', 'ASISTENCIA', 1, true, 3, 'SYSTEM'),
(1006, 101, '2026-06-20', 8, 'Propuesta preliminar de balance de línea', 'ASISTENCIA', 1, true, 3, 'SYSTEM'),
(1007, 101, '2026-07-05', 8, 'Evaluación económica del proyecto', 'ASISTENCIA', 1, true, 3, 'SYSTEM'),
(1008, 101, '2026-07-15', 8, 'Redacción de informe final', 'ASISTENCIA', 1, true, 3, 'SYSTEM');

-- 6. Documentos cargados (PLAN_PRACTICA, INFORME_PARCIAL_1, INFORME_PARCIAL_2, INFORME_FINAL_INICIAL, CONSTANCIA_EMPRESA)
INSERT INTO expediente_documento (id, id_expediente, tipo_documento, nombre_archivo, ruta_archivo, id_usuario, estado, creado_por) VALUES
(1001, 101, 'PLAN_PRACTICA', 'plan_inicial.pdf', 'plan_inicial.pdf', 1, 'APROBADO', 'SYSTEM'),
(1002, 101, 'INFORME_PARCIAL_1', 'parcial1.pdf', 'parcial1.pdf', 1, 'APROBADO', 'SYSTEM'),
(1003, 101, 'INFORME_PARCIAL_2', 'parcial2.pdf', 'parcial2.pdf', 1, 'APROBADO', 'SYSTEM'),
(1004, 101, 'INFORME_FINAL_INICIAL', 'informe_final_inicial.pdf', 'informe_final_inicial.pdf', 1, 'APROBADO', 'SYSTEM'),
(1005, 101, 'CONSTANCIA_EMPRESA', 'constancia_empresa.pdf', 'constancia_empresa.pdf', 1, 'APROBADO', 'SYSTEM');

-- 7. Historial de Estado
INSERT INTO expediente_estado (id_expediente, estado_anterior, estado_nuevo, id_usuario, tipo_cambio, creado_por) VALUES
(101, 'PLAN_APROBADO', 'EN_EJECUCION', 4, 'AUTOMATICO', 'SYSTEM');


-- ==========================================
-- CASO 2: estudiante2 (Práctica Final)
-- ==========================================

-- 1. Expediente
INSERT INTO expediente (
    id, id_estudiante, numero_expediente, codigo_expediente, fecha_apertura, 
    estado, id_tipo_practica, id_empresa, id_sede_practica, 
    id_tutor_empresa, plan_trabajo_aprobado, carta_aceptacion_presentada, 
    fecha_inicio_practica, fecha_fin_practica, duracion_semanas, 
    numero_informes_parciales, informe_final_presentado, activo, creado_por, condicion_solicitante
) VALUES (
    102, 2, 'EXP-2026-FINAL-0001', 'EXP-2026-FINAL-0001', '2026-03-01', 
    'EN_EJECUCION', 2, 1, 1, 
    1, true, true, 
    '2026-03-01', '2026-06-15', 15, 
    0, true, true, 'SYSTEM', 'ESTUDIANTE'
);

-- 2. Práctica
INSERT INTO practica (
    id, id_estudiante, id_sede, id_tutor_externo, id_estado, 
    fecha_inicio, fecha_fin, horas_totales, horas_restantes, remunerado, activo, creado_por, id_tipo_practica
) VALUES (
    102, 2, 1, 1, 2, 
    '2026-03-01', '2026-06-15', 360, 0, false, true, 'SYSTEM', 2
);

-- 3. Plan General
INSERT INTO plan_general (
    id, id_expediente, version, estado, fecha_presentacion, fecha_creacion, activo, creado_por
) VALUES (
    102, 102, 1, 'APROBADO', '2026-03-05 10:00:00', '2026-03-05 10:00:00', true, 'SYSTEM'
);

-- 4. Control de Horas
INSERT INTO control_hora (
    id, id_expediente, horas_requeridas, horas_acumuladas, fecha_inicio, 
    fecha_fin_estimada, fecha_fin_real, estado, activo, creado_por
) VALUES (
    102, 102, 360, 370, '2026-03-01', 
    '2026-06-15', '2026-06-25', 'CUMPLIDO', true, 'SYSTEM'
);

-- 5. Registros de Horas: 37 días de 10 horas distribuidos en 4 meses (marzo, abril, mayo, junio) para pasar coherencia temporal
INSERT INTO registro_hora (id, id_control_hora, fecha, horas, descripcion_actividad, tipo_registro, id_usuario_registra, validado_por_tutor, id_tutor_valida, creado_por) VALUES
-- Marzo (100 horas)
(2001, 102, '2026-03-02', 10, 'Actividad A', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2002, 102, '2026-03-05', 10, 'Actividad B', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2003, 102, '2026-03-09', 10, 'Actividad C', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2004, 102, '2026-03-12', 10, 'Actividad D', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2005, 102, '2026-03-16', 10, 'Actividad E', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2006, 102, '2026-03-19', 10, 'Actividad F', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2007, 102, '2026-03-23', 10, 'Actividad G', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2008, 102, '2026-03-26', 10, 'Actividad H', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2009, 102, '2026-03-30', 10, 'Actividad I', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2010, 102, '2026-03-31', 10, 'Actividad J', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
-- Abril (100 horas)
(2011, 102, '2026-04-02', 10, 'Actividad A', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2012, 102, '2026-04-06', 10, 'Actividad B', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2013, 102, '2026-04-09', 10, 'Actividad C', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2014, 102, '2026-04-13', 10, 'Actividad D', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2015, 102, '2026-04-16', 10, 'Actividad E', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2016, 102, '2026-04-20', 10, 'Actividad F', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2017, 102, '2026-04-23', 10, 'Actividad G', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2018, 102, '2026-04-27', 10, 'Actividad H', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2019, 102, '2026-04-29', 10, 'Actividad I', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2020, 102, '2026-04-30', 10, 'Actividad J', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
-- Mayo (100 horas)
(2021, 102, '2026-05-04', 10, 'Actividad A', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2022, 102, '2026-05-07', 10, 'Actividad B', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2023, 102, '2026-05-11', 10, 'Actividad C', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2024, 102, '2026-05-14', 10, 'Actividad D', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2025, 102, '2026-05-18', 10, 'Actividad E', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2026, 102, '2026-05-21', 10, 'Actividad F', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2027, 102, '2026-05-25', 10, 'Actividad G', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2028, 102, '2026-05-28', 10, 'Actividad H', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2029, 102, '2026-05-29', 10, 'Actividad I', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2030, 102, '2026-05-31', 10, 'Actividad J', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
-- Junio (70 horas)
(2031, 102, '2026-06-02', 10, 'Actividad A', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2032, 102, '2026-06-05', 10, 'Actividad B', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2033, 102, '2026-06-09', 10, 'Actividad C', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2034, 102, '2026-06-12', 10, 'Actividad D', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2035, 102, '2026-06-16', 10, 'Actividad E', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2036, 102, '2026-06-19', 10, 'Actividad F', 'ASISTENCIA', 9, true, 3, 'SYSTEM'),
(2037, 102, '2026-06-25', 10, 'Actividad G', 'ASISTENCIA', 9, true, 3, 'SYSTEM');

-- 6. Documentos cargados (CARTA_ACEPTACION, PLAN_PRACTICA, INFORME_FINAL, CONSTANCIA_EMPRESA)
INSERT INTO expediente_documento (id, id_expediente, tipo_documento, nombre_archivo, ruta_archivo, id_usuario, estado, creado_por) VALUES
(2001, 102, 'CARTA_ACEPTACION', 'carta_aceptacion.pdf', 'carta_aceptacion.pdf', 9, 'APROBADO', 'SYSTEM'),
(2002, 102, 'PLAN_PRACTICA', 'plan_final.pdf', 'plan_final.pdf', 9, 'APROBADO', 'SYSTEM'),
(2003, 102, 'INFORME_FINAL', 'informe_final.pdf', 'informe_final.pdf', 9, 'APROBADO', 'SYSTEM'),
(2004, 102, 'CONSTANCIA_EMPRESA', 'constancia_empresa.pdf', 'constancia_empresa.pdf', 9, 'APROBADO', 'SYSTEM');

-- 7. Asignar Comité (comite1 como presidente)
INSERT INTO expediente_comite (id, id_expediente, id_usuario, rol_comite, fecha_asignacion, activo, creado_por) VALUES
(1001, 102, 5, 'PRESIDENTE', '2026-03-05 10:00:00', true, 'SYSTEM'),
(1002, 102, 2, 'MIEMBRO', '2026-03-05 10:00:00', true, 'SYSTEM'),
(1003, 102, 16, 'MIEMBRO', '2026-03-05 10:00:00', true, 'SYSTEM');

-- 8. Historial de Estado
INSERT INTO expediente_estado (id_expediente, estado_anterior, estado_nuevo, id_usuario, tipo_cambio, creado_por) VALUES
(102, 'PLAN_APROBADO', 'EN_EJECUCION', 4, 'AUTOMATICO', 'SYSTEM');


-- ==========================================
-- ALINEAR SECUENCIAS
-- ==========================================
SELECT setval('expediente_id_seq', COALESCE((SELECT MAX(id) FROM expediente), 1), true);
SELECT setval('practica_id_seq', COALESCE((SELECT MAX(id) FROM practica), 1), true);
SELECT setval('plan_general_id_seq', COALESCE((SELECT MAX(id) FROM plan_general), 1), true);
SELECT setval('control_hora_id_seq', COALESCE((SELECT MAX(id) FROM control_hora), 1), true);
SELECT setval('registro_hora_id_seq', COALESCE((SELECT MAX(id) FROM registro_hora), 1), true);
SELECT setval('expediente_documento_id_seq', COALESCE((SELECT MAX(id) FROM expediente_documento), 1), true);
SELECT setval('expediente_comite_id_seq', COALESCE((SELECT MAX(id) FROM expediente_comite), 1), true);

-- ============================================================
-- Seed integral de datos demo interconectados para pruebas SGPP
-- Usuarios: password123 | Ver USUARIOS_PRUEBA.md
-- ============================================================

-- 1. Periodos académicos
INSERT INTO periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, activo, creado_por)
SELECT '2024-I', '2024-I', '2024-03-01', '2024-07-31', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM periodo_academico WHERE codigo = '2024-I');

INSERT INTO periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, activo, creado_por)
SELECT '2024-II', '2024-II', '2024-08-01', '2024-12-31', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM periodo_academico WHERE codigo = '2024-II');

INSERT INTO periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, activo, creado_por)
SELECT '2025-I', '2025-I', '2025-03-01', '2025-07-31', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM periodo_academico WHERE codigo = '2025-I');

-- 2. Vincular tutores externos a empresas/sedes reales del catálogo (V8)
UPDATE tutor_externo te
SET id_empresa = e.id,
    id_sede = sp.id,
    empresa_nombre = e.razon_social,
    estado_tutor = 'ACTIVO'
FROM usuario u
JOIN empresa e ON e.ruc = '20123456789'
JOIN sede_practica sp ON sp.nombre_sede = 'Sede Principal Trujillo' AND sp.id_empresa = e.id
WHERE te.id_usuario = u.id AND u.username = 'tutor1';

UPDATE tutor_externo te
SET id_empresa = e.id,
    id_sede = sp.id,
    empresa_nombre = e.razon_social,
    estado_tutor = 'ACTIVO'
FROM usuario u
JOIN empresa e ON e.ruc = '20987654321'
JOIN sede_practica sp ON sp.nombre_sede = 'Planta Industrial Norte' AND sp.id_empresa = e.id
WHERE te.id_usuario = u.id AND u.username IN ('tutor2', 'tutor3');

-- 3. Corregir rol erróneo: docente1 no debe tener COMITE_PRACTICAS
DELETE FROM usuario_rol ur
USING usuario u, rol r
WHERE ur.id_usuario = u.id AND ur.id_rol = r.id
  AND u.username = 'docente1' AND r.nombre = 'COMITE_PRACTICAS';

-- 4. Expedientes demo (estados válidos del motor de negocio)

-- EXP-2024-0001: estudiante1, práctica INICIAL, EN_EJECUCION
INSERT INTO expediente (
    id_estudiante, numero_expediente, periodo_academico, codigo_expediente,
    id_tipo_practica, fecha_apertura, estado,
    id_empresa, id_sede_practica, id_convenio, id_asesor, id_tutor_empresa,
    plan_trabajo_aprobado, carta_aceptacion_presentada,
    fecha_inicio_practica, fecha_fin_practica, duracion_semanas,
    observaciones, creado_por
)
SELECT
    est.id, 'EXP-2024-0001', '2024-I', 'EXP-2024-0001',
    tp.id, '2024-03-15'::date, 'EN_EJECUCION',
    emp.id, sp.id, c.id, doc.id_usuario, te.id,
    TRUE, TRUE,
    '2024-04-15', '2024-10-15', 24,
    'Práctica preprofesional en área de logística', 'SYSTEM'
FROM estudiante est
JOIN usuario u ON u.id = est.id_usuario AND u.username = 'estudiante1'
JOIN tipo_practica tp ON tp.codigo = 'INICIAL'
JOIN empresa emp ON emp.ruc = '20123456789'
JOIN sede_practica sp ON sp.nombre_sede = 'Sede Principal Trujillo' AND sp.id_empresa = emp.id
JOIN convenio c ON c.numero_convenio = 'CONV-2024-001'
JOIN docente doc ON doc.codigo_docente = 'DOC001'
JOIN tutor_externo te ON te.id_usuario = (SELECT id FROM usuario WHERE username = 'tutor1')
WHERE NOT EXISTS (SELECT 1 FROM expediente WHERE codigo_expediente = 'EXP-2024-0001');

-- EXP-2024-0002: estudiante2, práctica INICIAL, PLAN_PRESENTADO
INSERT INTO expediente (
    id_estudiante, numero_expediente, periodo_academico, codigo_expediente,
    id_tipo_practica, fecha_apertura, estado,
    id_empresa, id_sede_practica, id_convenio, id_asesor,
    fecha_inicio_practica, fecha_fin_practica, duracion_semanas,
    fecha_presentacion_plan,
    observaciones, creado_por
)
SELECT
    est.id, 'EXP-2024-0002', '2024-I', 'EXP-2024-0002',
    tp.id, '2024-04-01'::date, 'PLAN_PRESENTADO',
    emp.id, sp.id, c.id, doc.id_usuario,
    '2024-05-01', '2024-11-01', 24,
    '2024-05-10 10:00:00'::timestamp,
    'Práctica preprofesional en calidad', 'SYSTEM'
FROM estudiante est
JOIN usuario u ON u.id = est.id_usuario AND u.username = 'estudiante2'
JOIN tipo_practica tp ON tp.codigo = 'INICIAL'
JOIN empresa emp ON emp.ruc = '20123456789'
JOIN sede_practica sp ON sp.nombre_sede = 'Sede Principal Trujillo' AND sp.id_empresa = emp.id
JOIN convenio c ON c.numero_convenio = 'CONV-2024-001'
JOIN docente doc ON doc.codigo_docente = 'DOC002'
WHERE NOT EXISTS (SELECT 1 FROM expediente WHERE codigo_expediente = 'EXP-2024-0002');

-- EXP-2024-0003: estudiante3, práctica PROFESIONAL, EMPRESA_SEDE_ASIGNADA
INSERT INTO expediente (
    id_estudiante, numero_expediente, periodo_academico, codigo_expediente,
    id_tipo_practica, fecha_apertura, estado,
    id_empresa, id_sede_practica, id_convenio, id_tutor_empresa,
    fecha_inicio_practica, fecha_fin_practica, duracion_semanas,
    observaciones, creado_por
)
SELECT
    est.id, 'EXP-2024-0003', '2024-I', 'EXP-2024-0003',
    tp.id, '2024-05-01'::date, 'EMPRESA_SEDE_ASIGNADA',
    emp.id, sp.id, c.id, te.id,
    '2024-06-01', '2024-12-01', 24,
    'Práctica profesional en gestión de operaciones', 'SYSTEM'
FROM estudiante est
JOIN usuario u ON u.id = est.id_usuario AND u.username = 'estudiante3'
JOIN tipo_practica tp ON tp.codigo = 'PROFESIONAL'
JOIN empresa emp ON emp.ruc = '20987654321'
JOIN sede_practica sp ON sp.nombre_sede = 'Planta Industrial Norte' AND sp.id_empresa = emp.id
JOIN convenio c ON c.numero_convenio = 'CONV-2024-002'
JOIN tutor_externo te ON te.id_usuario = (SELECT id FROM usuario WHERE username = 'tutor3')
WHERE NOT EXISTS (SELECT 1 FROM expediente WHERE codigo_expediente = 'EXP-2024-0003');

-- 5. Sincronizar expedientes existentes (re-ejecución segura)
UPDATE expediente ex SET
    id_tipo_practica = (SELECT id FROM tipo_practica WHERE codigo = 'INICIAL'),
    estado = 'EN_EJECUCION',
    id_empresa = (SELECT id FROM empresa WHERE ruc = '20123456789'),
    id_sede_practica = (SELECT id FROM sede_practica WHERE nombre_sede = 'Sede Principal Trujillo'),
    id_convenio = (SELECT id FROM convenio WHERE numero_convenio = 'CONV-2024-001'),
    id_asesor = (SELECT d.id_usuario FROM docente d WHERE d.codigo_docente = 'DOC001'),
    id_tutor_empresa = (SELECT te.id FROM tutor_externo te JOIN usuario u ON u.id = te.id_usuario WHERE u.username = 'tutor1'),
    plan_trabajo_aprobado = TRUE,
    carta_aceptacion_presentada = TRUE,
    fecha_inicio_practica = '2024-04-15',
    fecha_fin_practica = '2024-10-15',
    duracion_semanas = 24
WHERE ex.codigo_expediente = 'EXP-2024-0001';

UPDATE expediente ex SET
    id_tipo_practica = (SELECT id FROM tipo_practica WHERE codigo = 'INICIAL'),
    estado = 'PLAN_PRESENTADO',
    id_empresa = (SELECT id FROM empresa WHERE ruc = '20123456789'),
    id_sede_practica = (SELECT id FROM sede_practica WHERE nombre_sede = 'Sede Principal Trujillo'),
    id_convenio = (SELECT id FROM convenio WHERE numero_convenio = 'CONV-2024-001'),
    id_asesor = (SELECT d.id_usuario FROM docente d WHERE d.codigo_docente = 'DOC002'),
    fecha_presentacion_plan = COALESCE(ex.fecha_presentacion_plan, '2024-05-10 10:00:00'::timestamp)
WHERE ex.codigo_expediente = 'EXP-2024-0002';

UPDATE expediente ex SET
    id_tipo_practica = (SELECT id FROM tipo_practica WHERE codigo = 'PROFESIONAL'),
    estado = 'EMPRESA_SEDE_ASIGNADA',
    id_empresa = (SELECT id FROM empresa WHERE ruc = '20987654321'),
    id_sede_practica = (SELECT id FROM sede_practica WHERE nombre_sede = 'Planta Industrial Norte'),
    id_convenio = (SELECT id FROM convenio WHERE numero_convenio = 'CONV-2024-002'),
    id_tutor_empresa = (SELECT te.id FROM tutor_externo te JOIN usuario u ON u.id = te.id_usuario WHERE u.username = 'tutor3')
WHERE ex.codigo_expediente = 'EXP-2024-0003';

-- 6. Historial de estados (trazabilidad)
INSERT INTO expediente_estado (id_expediente, estado_anterior, estado_nuevo, id_usuario, observacion, tipo_cambio)
SELECT ex.id, NULL, 'SOLICITADO', u.id, 'Expediente creado', 'CREACION'
FROM expediente ex
JOIN estudiante est ON est.id = ex.id_estudiante
JOIN usuario u ON u.id = est.id_usuario
WHERE ex.codigo_expediente = 'EXP-2024-0001'
AND NOT EXISTS (SELECT 1 FROM expediente_estado ee WHERE ee.id_expediente = ex.id AND ee.tipo_cambio = 'CREACION');

INSERT INTO expediente_estado (id_expediente, estado_anterior, estado_nuevo, id_usuario, observacion, tipo_cambio)
SELECT ex.id, 'SOLICITADO', 'EMPRESA_SEDE_ASIGNADA', sec.id, 'Empresa y sede asignadas', 'ASIGNACION_EMPRESA'
FROM expediente ex, usuario sec
WHERE ex.codigo_expediente = 'EXP-2024-0001' AND sec.username = 'secretaria1'
AND NOT EXISTS (SELECT 1 FROM expediente_estado ee WHERE ee.id_expediente = ex.id AND ee.tipo_cambio = 'ASIGNACION_EMPRESA');

INSERT INTO expediente_estado (id_expediente, estado_anterior, estado_nuevo, id_usuario, observacion, tipo_cambio)
SELECT ex.id, 'EMPRESA_SEDE_ASIGNADA', 'ASESOR_ASIGNADO', sec.id, 'Asesor docente1 asignado', 'ASIGNACION_ASESOR'
FROM expediente ex, usuario sec
WHERE ex.codigo_expediente = 'EXP-2024-0001' AND sec.username = 'coordinador1'
AND NOT EXISTS (SELECT 1 FROM expediente_estado ee WHERE ee.id_expediente = ex.id AND ee.tipo_cambio = 'ASIGNACION_ASESOR');

INSERT INTO expediente_estado (id_expediente, estado_anterior, estado_nuevo, id_usuario, observacion, tipo_cambio)
SELECT ex.id, 'ASESOR_ASIGNADO', 'APROBADO', doc.id, 'Plan de trabajo aprobado', 'APROBACION'
FROM expediente ex
JOIN docente d ON d.codigo_docente = 'DOC001'
JOIN usuario doc ON doc.id = d.id_usuario
WHERE ex.codigo_expediente = 'EXP-2024-0001'
AND NOT EXISTS (SELECT 1 FROM expediente_estado ee WHERE ee.id_expediente = ex.id AND ee.tipo_cambio = 'APROBACION');

INSERT INTO expediente_estado (id_expediente, estado_anterior, estado_nuevo, id_usuario, observacion, tipo_cambio)
SELECT ex.id, 'APROBADO', 'EN_EJECUCION', sec.id, 'Ejecución iniciada', 'INICIO_EJECUCION'
FROM expediente ex, usuario sec
WHERE ex.codigo_expediente = 'EXP-2024-0001' AND sec.username = 'secretaria1'
AND NOT EXISTS (SELECT 1 FROM expediente_estado ee WHERE ee.id_expediente = ex.id AND ee.tipo_cambio = 'INICIO_EJECUCION');

-- 7. Documentos del expediente 1
ALTER TABLE expediente_documento ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'PENDIENTE';

INSERT INTO expediente_documento (id_expediente, tipo_documento, nombre_archivo, ruta_archivo, id_usuario, estado, creado_por)
SELECT ex.id, 'PLAN_PRACTICA', 'Plan_Practicas_EXP-2024-0001.pdf', 'plan_exp_0001.pdf', est_u.id, 'APROBADO', 'SYSTEM'
FROM expediente ex
JOIN estudiante est ON est.id = ex.id_estudiante
JOIN usuario est_u ON est_u.id = est.id_usuario
WHERE ex.codigo_expediente = 'EXP-2024-0001'
AND NOT EXISTS (SELECT 1 FROM expediente_documento ed WHERE ed.id_expediente = ex.id AND ed.tipo_documento = 'PLAN_PRACTICA');

INSERT INTO expediente_documento (id_expediente, tipo_documento, nombre_archivo, ruta_archivo, id_usuario, estado, creado_por)
SELECT ex.id, 'CARTA_ACEPTACION', 'Carta_Aceptacion_EXP-2024-0001.pdf', 'carta_exp_0001.pdf', est_u.id, 'APROBADO', 'SYSTEM'
FROM expediente ex
JOIN estudiante est ON est.id = ex.id_estudiante
JOIN usuario est_u ON est_u.id = est.id_usuario
WHERE ex.codigo_expediente = 'EXP-2024-0001'
AND NOT EXISTS (SELECT 1 FROM expediente_documento ed WHERE ed.id_expediente = ex.id AND ed.tipo_documento = 'CARTA_ACEPTACION');

INSERT INTO expediente_documento (id_expediente, tipo_documento, nombre_archivo, ruta_archivo, id_usuario, estado, creado_por)
SELECT ex.id, 'PLAN_PRACTICA', 'Plan_Practicas_EXP-2024-0002.pdf', 'plan_exp_0002.pdf', est_u.id, 'REVISION', 'SYSTEM'
FROM expediente ex
JOIN estudiante est ON est.id = ex.id_estudiante
JOIN usuario est_u ON est_u.id = est.id_usuario
WHERE ex.codigo_expediente = 'EXP-2024-0002'
AND NOT EXISTS (SELECT 1 FROM expediente_documento ed WHERE ed.id_expediente = ex.id AND ed.tipo_documento = 'PLAN_PRACTICA');

-- 8. Comité asignado al expediente profesional (comite1)
INSERT INTO expediente_comite (id_expediente, id_usuario, rol_comite, activo)
SELECT ex.id, u.id, 'PRESIDENTE', TRUE
FROM expediente ex, usuario u
WHERE ex.codigo_expediente = 'EXP-2024-0003' AND u.username = 'comite1'
AND NOT EXISTS (
    SELECT 1 FROM expediente_comite ec WHERE ec.id_expediente = ex.id AND ec.id_usuario = u.id
);

-- 9. Tipos de notificación adicionales
INSERT INTO tipo_notificacion (codigo, nombre, descripcion, activo, creado_por)
SELECT 'ASIGNACION_ASESOR', 'Asesor Asignado', 'Cuando se asigna un docente asesor', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM tipo_notificacion WHERE codigo = 'ASIGNACION_ASESOR');

INSERT INTO tipo_notificacion (codigo, nombre, descripcion, activo, creado_por)
SELECT 'PLAN_APROBADO', 'Plan Aprobado', 'Cuando el plan de prácticas es aprobado', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM tipo_notificacion WHERE codigo = 'PLAN_APROBADO');

INSERT INTO tipo_notificacion (codigo, nombre, descripcion, activo, creado_por)
SELECT 'DOCUMENTO_EVALUADO', 'Documento Evaluado', 'Cuando un documento es evaluado', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM tipo_notificacion WHERE codigo = 'DOCUMENTO_EVALUADO');

-- 10. Notificaciones demo coherentes con el flujo
INSERT INTO notificacion (usuario_destino, tipo_notificacion, titulo, mensaje, leida, creado_por)
SELECT 'estudiante1', 'INFO', 'Bienvenido al SGPP', 'Su cuenta de estudiante está activa.', FALSE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM notificacion WHERE usuario_destino = 'estudiante1' AND titulo = 'Bienvenido al SGPP');

INSERT INTO notificacion (usuario_destino, tipo_notificacion, titulo, mensaje, leida, creado_por)
SELECT 'docente1', 'REVISION', 'Nuevo practicante asignado', 'Se le asignó el expediente EXP-2024-0001 del estudiante Juan Carlos Pérez.', FALSE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM notificacion WHERE usuario_destino = 'docente1' AND titulo = 'Nuevo practicante asignado');

INSERT INTO notificacion (usuario_destino, tipo_notificacion, titulo, mensaje, leida, creado_por)
SELECT 'estudiante1', 'EXITO', 'Plan de prácticas aprobado', 'El plan de trabajo del expediente EXP-2024-0001 fue aprobado.', FALSE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM notificacion WHERE usuario_destino = 'estudiante1' AND titulo = 'Plan de prácticas aprobado');

INSERT INTO notificacion (usuario_destino, tipo_notificacion, titulo, mensaje, leida, creado_por)
SELECT 'docente2', 'REVISION', 'Plan pendiente de revisión', 'El estudiante Ana Lucía Mendoza presentó su plan en EXP-2024-0002.', FALSE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM notificacion WHERE usuario_destino = 'docente2' AND titulo = 'Plan pendiente de revisión');

INSERT INTO notificacion (usuario_destino, tipo_notificacion, titulo, mensaje, leida, creado_por)
SELECT 'tutor1', 'EXPEDIENTE', 'Practicante en su empresa', 'El estudiante Juan Carlos Pérez realiza prácticas en su sede asignada.', FALSE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM notificacion WHERE usuario_destino = 'tutor1' AND titulo = 'Practicante en su empresa');

-- 11. Tipos de incidencia
INSERT INTO tipo_incidencia (codigo, nombre, descripcion, gravedad, activo, creado_por)
SELECT 'RETARDO', 'Retardo en entrega', 'Retardo en la entrega de documentos o informes', 'MEDIA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM tipo_incidencia WHERE codigo = 'RETARDO');

INSERT INTO tipo_incidencia (codigo, nombre, descripcion, gravedad, activo, creado_por)
SELECT 'AUSENCIA', 'Ausencia sin justificar', 'Ausencia en la empresa sin justificación', 'ALTA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM tipo_incidencia WHERE codigo = 'AUSENCIA');

INSERT INTO tipo_incidencia (codigo, nombre, descripcion, gravedad, activo, creado_por)
SELECT 'INCUMPLIMIENTO', 'Incumplimiento de actividades', 'No se cumplen actividades del plan', 'ALTA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM tipo_incidencia WHERE codigo = 'INCUMPLIMIENTO');

INSERT INTO tipo_incidencia (codigo, nombre, descripcion, gravedad, activo, creado_por)
SELECT 'PROBLEMA_TECNICO', 'Problema técnico', 'Problemas de acceso a sistemas o equipos', 'BAJA', TRUE, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM tipo_incidencia WHERE codigo = 'PROBLEMA_TECNICO');

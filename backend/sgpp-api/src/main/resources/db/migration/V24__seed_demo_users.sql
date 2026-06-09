-- Seed usuarios demo con perfiles completos (docente, estudiante, tutor externo)
-- Actualiza usuarios existentes con tipo_usuario y agrega nuevos usuarios demo

-- 1. Actualizar usuarios existentes con tipo_usuario
UPDATE usuario SET tipo_usuario = 'INTERNO', fecha_registro = '2024-01-01'::timestamp
WHERE username IN ('estudiante1', 'docente1', 'secretaria1', 'comite1', 'coordinador1', 'director1', 'adminsys1')
  AND tipo_usuario IS NULL;

UPDATE usuario SET tipo_usuario = 'EXTERNO', fecha_registro = '2024-01-01'::timestamp
WHERE username = 'tutor1' AND tipo_usuario IS NULL;

-- 2. Nuevos usuarios demo (password: password123 = $2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG)
INSERT INTO usuario (username, password, email, nombres, apellido_paterno, apellido_materno, numero_documento, tipo_documento, telefono, tipo_usuario, activo, creado_por)
VALUES
('estudiante2', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'estudiante2@unt.edu.pe', 'Ana Lucia', 'Mendoza', 'Vega', '23456789', 'DNI', '987654331', 'INTERNO', TRUE, 'SYSTEM'),
('estudiante3', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'estudiante3@unt.edu.pe', 'Pedro Antonio', 'Castillo', 'Rios', '34567890', 'DNI', '987654332', 'INTERNO', TRUE, 'SYSTEM'),
('docente2', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'docente2@unt.edu.pe', 'Carmen Rosa', 'Vargas', 'Silva', '45678901', 'DNI', '987654333', 'INTERNO', TRUE, 'SYSTEM'),
('docente3', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'docente3@unt.edu.pe', 'Miguel Angel', 'Ramos', 'Paredes', '56789012', 'DNI', '987654334', 'INTERNO', TRUE, 'SYSTEM'),
('tutor2', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'tutor2@corp.com.pe', 'Rosa Maria', 'Gutierrez', 'Lopez', '67890123', 'DNI', '987654335', 'EXTERNO', TRUE, 'SYSTEM'),
('tutor3', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'tutor3@industria.pe', 'Jose Luis', 'Hernandez', 'Cruz', '78901234', 'DNI', '987654336', 'EXTERNO', TRUE, 'SYSTEM'),
('secretaria2', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'secretaria2@unt.edu.pe', 'Diana Elizabeth', 'Campos', 'Flores', '89012345', 'DNI', '987654337', 'INTERNO', TRUE, 'SYSTEM'),
('comite2', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'comite2@unt.edu.pe', 'Fernando Javier', 'Salinas', 'Moya', '90123456', 'DNI', '987654338', 'INTERNO', TRUE, 'SYSTEM')
ON CONFLICT (username) DO NOTHING;

-- 3. Asignación de roles a nuevos usuarios
INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'estudiante2' AND r.nombre = 'ESTUDIANTE'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'estudiante3' AND r.nombre = 'ESTUDIANTE'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'docente2' AND r.nombre = 'DOCENTE_ASESOR'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'docente3' AND r.nombre = 'DOCENTE_ASESOR'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'tutor2' AND r.nombre = 'TUTOR_EXTERNO'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'tutor3' AND r.nombre = 'TUTOR_EXTERNO'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'secretaria2' AND r.nombre = 'SECRETARIA'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'comite2' AND r.nombre = 'COMITE_PRACTICAS'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

-- 4. Perfiles de estudiante
INSERT INTO estudiante (id_usuario, codigo_estudiantil, semestre_actual, creditos_aprobados, creditos_requeridos_practica, promedio_ponderado, fecha_ingreso, estado_academico, creado_por)
SELECT u.id, '20240002', 6, 120, 150, 13.80, '2021-03-01', 'ACTIVO', 'SYSTEM'
FROM usuario u
WHERE u.username = 'estudiante2'
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO estudiante (id_usuario, codigo_estudiantil, semestre_actual, creditos_aprobados, creditos_requeridos_practica, promedio_ponderado, fecha_ingreso, estado_academico, creado_por)
SELECT u.id, '20240003', 10, 180, 150, 16.20, '2019-03-01', 'ACTIVO', 'SYSTEM'
FROM usuario u
WHERE u.username = 'estudiante3'
ON CONFLICT (id_usuario) DO NOTHING;

-- 5. Perfiles de docente
INSERT INTO docente (id_usuario, codigo_docente, categoria, especialidad, departamento, activo, max_practicantes, creado_por)
SELECT u.id, 'DOC002', 'PRINCIPAL', 'Logística y Cadena de Suministro', 'Ingeniería Industrial', TRUE, 8, 'SYSTEM'
FROM usuario u
WHERE u.username = 'docente2'
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO docente (id_usuario, codigo_docente, categoria, especialidad, departamento, activo, max_practicantes, creado_por)
SELECT u.id, 'DOC003', 'TITULAR', 'Gestión de Calidad', 'Ingeniería Industrial', TRUE, 12, 'SYSTEM'
FROM usuario u
WHERE u.username = 'docente3'
ON CONFLICT (id_usuario) DO NOTHING;

-- 6. Perfiles de tutor externo
INSERT INTO tutor_externo (id_usuario, cargo, area, empresa_nombre, activo, creado_por)
SELECT u.id, 'Supervisor de Planta', 'Producción', 'Corporación Industrial S.A.C.', TRUE, 'SYSTEM'
FROM usuario u
WHERE u.username = 'tutor2'
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO tutor_externo (id_usuario, cargo, area, empresa_nombre, activo, creado_por)
SELECT u.id, 'Jefe de Recursos Humanos', 'RRHH', 'Industrias del Norte S.A.', TRUE, 'SYSTEM'
FROM usuario u
WHERE u.username = 'tutor3'
ON CONFLICT (id_usuario) DO NOTHING;

-- 7. Agregar rol COMITE_PRACTICAS a usuario comite1 para que tenga múltiples roles
INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'docente1' AND r.nombre = 'COMITE_PRACTICAS'
AND NOT EXISTS (
    SELECT 1 FROM usuario_rol ur WHERE ur.id_usuario = u.id AND ur.id_rol = r.id
);

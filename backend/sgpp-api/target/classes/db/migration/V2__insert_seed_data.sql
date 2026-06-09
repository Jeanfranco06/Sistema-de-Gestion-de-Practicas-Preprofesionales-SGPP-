-- Inserción de roles
INSERT INTO rol (nombre, descripcion, activo, creado_por) VALUES
('ESTUDIANTE', 'Rol para estudiantes de la escuela', TRUE, 'SYSTEM'),
('DOCENTE_ASESOR', 'Rol para docentes asesores de prácticas', TRUE, 'SYSTEM'),
('TUTOR_EXTERNO', 'Rol para tutores externos de empresas', TRUE, 'SYSTEM'),
('SECRETARIA', 'Rol para personal de secretaría', TRUE, 'SYSTEM'),
('COMITE_PRACTICAS', 'Rol para miembros del comité de prácticas', TRUE, 'SYSTEM'),
('COORDINADOR', 'Coordinador de Prácticas: docente responsable de coordinar prácticas, gestionar convenios, asignar asesores y ver reportes globales', TRUE, 'SYSTEM'),
('DIRECTOR', 'Rol para director de la escuela', TRUE, 'SYSTEM'),
('ADMIN_SISTEMA', 'Administrador del Sistema: usuario interno de TI para gestionar parámetros generales del SGPP (catálogos, parámetros de horas, plazos, etc.)', TRUE, 'SYSTEM')
ON CONFLICT (nombre) DO NOTHING;

-- Inserción de usuarios de prueba (password: password123 encriptado con bcrypt)
-- password123 = $2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG
INSERT INTO usuario (username, password, email, nombres, apellido_paterno, apellido_materno, numero_documento, tipo_documento, telefono, activo, creado_por) VALUES
('estudiante1', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'estudiante1@unt.edu.pe', 'Juan Carlos', 'Pérez', 'López', '12345678', 'DNI', '987654321', TRUE, 'SYSTEM'),
('docente1', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'docente1@unt.edu.pe', 'María Elena', 'Rodríguez', 'García', '87654321', 'DNI', '987654322', TRUE, 'SYSTEM'),
('tutor1', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'tutor1@empresa.com', 'Carlos Alberto', 'Fernández', 'Martínez', '11223344', 'DNI', '987654323', TRUE, 'SYSTEM'),
('secretaria1', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'secretaria1@unt.edu.pe', 'Ana María', 'González', 'Sánchez', '33445566', 'DNI', '987654324', TRUE, 'SYSTEM'),
('comite1', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'comite1@unt.edu.pe', 'Luis Fernando', 'Torres', 'Ramírez', '44556677', 'DNI', '987654325', TRUE, 'SYSTEM'),
('coordinador1', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'coordinador1@unt.edu.pe', 'Roberto Carlos', 'Díaz', 'Morales', '55667788', 'DNI', '987654326', TRUE, 'SYSTEM'),
('director1', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'director1@unt.edu.pe', 'Jorge Luis', 'Ruiz', 'Herrera', '66778899', 'DNI', '987654327', TRUE, 'SYSTEM'),
('adminsys1', '$2a$10$fRo6lB0DnWyxSLZjhqfPIuzF9oS2Lq031lfzSeIPCaptSm8X/A3dG', 'adminsys1@unt.edu.pe', 'Sistema', 'TI', 'Admin', '77889900', 'DNI', '987654328', TRUE, 'SYSTEM')
ON CONFLICT (username) DO NOTHING;

-- Asignación de roles a usuarios
INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por) 
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'estudiante1' AND r.nombre = 'ESTUDIANTE'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por) 
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'docente1' AND r.nombre = 'DOCENTE_ASESOR'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por) 
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'tutor1' AND r.nombre = 'TUTOR_EXTERNO'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por) 
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'secretaria1' AND r.nombre = 'SECRETARIA'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por) 
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'comite1' AND r.nombre = 'COMITE_PRACTICAS'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por) 
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'coordinador1' AND r.nombre = 'COORDINADOR'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por) 
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'director1' AND r.nombre = 'DIRECTOR'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por) 
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u, rol r
WHERE u.username = 'adminsys1' AND r.nombre = 'ADMIN_SISTEMA'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

-- Inserción de perfil de estudiante
INSERT INTO estudiante (id_usuario, codigo_estudiantil, semestre_actual, creditos_aprobados, creditos_requeridos_practica, promedio_ponderado, fecha_ingreso, estado_academico, creado_por)
SELECT u.id, '20240001', 8, 160, 150, 15.50, '2020-03-01', 'ACTIVO', 'SYSTEM'
FROM usuario u
WHERE u.username = 'estudiante1'
ON CONFLICT (id_usuario) DO NOTHING;

-- Inserción de perfil de docente
INSERT INTO docente (id_usuario, codigo_docente, categoria, especialidad, departamento, activo, max_practicantes, creado_por)
SELECT u.id, 'DOC001', 'ASOCIADO', 'Gestión de Operaciones', 'Ingeniería Industrial', TRUE, 10, 'SYSTEM'
FROM usuario u
WHERE u.username = 'docente1'
ON CONFLICT (id_usuario) DO NOTHING;

-- Inserción de perfil de tutor externo
INSERT INTO tutor_externo (id_usuario, cargo, area, empresa_nombre, activo, creado_por)
SELECT u.id, 'Jefe de Producción', 'Operaciones', 'Empresa Ejemplo S.A.C.', TRUE, 'SYSTEM'
FROM usuario u
WHERE u.username = 'tutor1'
ON CONFLICT (id_usuario) DO NOTHING;

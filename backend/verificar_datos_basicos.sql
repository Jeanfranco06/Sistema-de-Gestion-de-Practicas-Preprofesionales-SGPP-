-- Consultas básicas para verificar qué datos existen en el sistema

-- Paso 1: Verificar si hay expedientes en el sistema
SELECT COUNT(*) as total_expedientes FROM expediente;

-- Paso 2: Verificar los expedientes existentes
SELECT 
    id,
    codigo_expediente,
    id_estudiante,
    estado,
    fecha_apertura,
    activo
FROM expediente
ORDER BY id DESC
LIMIT 5;

-- Paso 3: Verificar todos los usuarios
SELECT 
    id,
    username,
    nombres,
    apellido_paterno,
    activo
FROM usuario
ORDER BY id DESC
LIMIT 10;

-- Paso 4: Verificar todos los estudiantes
SELECT 
    e.id,
    e.id_usuario,
    e.codigo_estudiantil,
    u.username,
    u.nombres
FROM estudiante e
LEFT JOIN usuario u ON e.id_usuario = u.id
ORDER BY e.id DESC
LIMIT 10;

-- Paso 5: Verificar si hay prácticas activas
SELECT 
    p.id,
    p.id_estudiante,
    p.activo,
    p.fecha_inicio
FROM practica p
WHERE p.activo = true
ORDER BY p.id DESC
LIMIT 5;

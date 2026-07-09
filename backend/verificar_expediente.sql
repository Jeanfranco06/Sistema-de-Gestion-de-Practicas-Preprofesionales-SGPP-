-- Script para verificar si el expediente se creó correctamente
-- Reemplaza 'TU_USERNAME' con tu nombre de usuario del sistema

-- Paso 1: Verificar si tienes expedientes creados
SELECT 
    e.id,
    e.codigo_expediente,
    e.id_estudiante,
    u.username,
    u.nombres,
    u.apellido_paterno,
    e.estado,
    e.fecha_apertura,
    e.activo
FROM expediente e
JOIN estudiante est ON e.id_estudiante = est.id
JOIN usuario u ON est.id_usuario = u.id
WHERE u.username = 'TU_USERNAME'  -- Reemplaza con tu username
ORDER BY e.fecha_creacion DESC
LIMIT 5;

-- Paso 2: Verificar si tienes práctica activa
SELECT 
    p.id,
    p.id_estudiante,
    u.username,
    p.activo,
    p.fecha_inicio,
    p.fecha_fin
FROM practica p
JOIN estudiante e ON p.id_estudiante = e.id
JOIN usuario u ON e.id_usuario = u.id
WHERE u.username = 'TU_USERNAME'  -- Reemplaza con tu username
AND p.activo = true;

-- Paso 3: Verificar la relación entre práctica y expediente (si existen)
SELECT 
    p.id as practica_id,
    e.id as expediente_id,
    e.codigo_expediente,
    e.estado as estado_expediente,
    p.activo as practica_activa
FROM practica p
LEFT JOIN expediente e ON p.id_estudiante = e.id_estudiante
JOIN estudiante est ON p.id_estudiante = est.id
JOIN usuario u ON est.id_usuario = u.id
WHERE u.username = 'TU_USERNAME'  -- Reemplaza con tu username
ORDER BY p.fecha_creacion DESC
LIMIT 5;

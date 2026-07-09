-- Script para desactivar la práctica activa de un estudiante
-- Reemplaza 'TU_USERNAME' con tu nombre de usuario del sistema

-- Paso 1: Verificar tu práctica activa actual
SELECT 
    p.id,
    p.id_estudiante,
    e.id_usuario,
    u.username,
    u.nombres,
    u.apellido_paterno,
    p.activo,
    p.fecha_inicio,
    p.fecha_fin
FROM practica p
JOIN estudiante e ON p.id_estudiante = e.id
JOIN usuario u ON e.id_usuario = u.id
WHERE u.username = 'TU_USERNAME'  -- Reemplaza con tu username
AND p.activo = true;

-- Paso 2: Desactivar la práctica activa (ejecutar solo después de verificar)
UPDATE practica
SET activo = false,
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE id_estudiante = (
    SELECT e.id 
    FROM estudiante e 
    JOIN usuario u ON e.id_usuario = u.id 
    WHERE u.username = 'TU_USERNAME'  -- Reemplaza con tu username
)
AND activo = true;

-- Paso 3: Verificar que se desactivó correctamente
SELECT 
    p.id,
    p.id_estudiante,
    u.username,
    p.activo,
    p.fecha_actualizacion
FROM practica p
JOIN estudiante e ON p.id_estudiante = e.id
JOIN usuario u ON e.id_usuario = u.id
WHERE u.username = 'TU_USERNAME'  -- Reemplaza con tu username
ORDER BY p.fecha_actualizacion DESC
LIMIT 5;

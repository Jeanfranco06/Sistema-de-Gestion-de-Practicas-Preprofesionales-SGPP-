-- Consulta simple para diagnosticar el problema

-- Paso 1: Verificar todos los expedientes sin filtros
SELECT 
    e.id,
    e.codigo_expediente,
    e.id_estudiante,
    e.estado,
    e.fecha_apertura,
    e.activo
FROM expediente e
ORDER BY e.id DESC
LIMIT 10;

-- Paso 2: Verificar tu usuario
SELECT 
    u.id,
    u.username,
    u.nombres,
    u.apellido_paterno
FROM usuario u
WHERE u.username = 'jeanfranco';  -- Reemplaza con tu username real

-- Paso 3: Verificar tu estudiante
SELECT 
    e.id,
    e.id_usuario,
    e.codigo_estudiantil
FROM estudiante e
WHERE e.id_usuario = (SELECT u.id FROM usuario u WHERE u.username = 'jeanfranco');  -- Reemplaza con tu username real

-- Paso 4: Verificar expedientes de tu estudiante directamente
SELECT 
    exp.id,
    exp.codigo_expediente,
    exp.id_estudiante,
    exp.estado,
    exp.fecha_apertura,
    exp.activo
FROM expediente exp
WHERE exp.id_estudiante = (SELECT e.id FROM estudiante e WHERE e.id_usuario = (SELECT u.id FROM usuario u WHERE u.username = 'jeanfranco'));  -- Reemplaza con tu username real

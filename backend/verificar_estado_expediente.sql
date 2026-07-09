-- Verificar el estado del expediente más reciente

-- Paso 1: Verificar detalles del expediente más reciente (id=4)
SELECT 
    e.id,
    e.codigo_expediente,
    e.id_estudiante,
    e.estado,
    e.fecha_apertura,
    e.fecha_cierre,
    e.activo,
    e.observaciones
FROM expediente e
WHERE e.id = 4;

-- Paso 2: Verificar a qué estudiante pertenece este expediente
SELECT 
    e.id as expediente_id,
    e.id_estudiante,
    est.id_usuario,
    u.username,
    u.nombres,
    u.apellido_paterno
FROM expediente e
JOIN estudiante est ON e.id_estudiante = est.id
JOIN usuario u ON est.id_usuario = u.id
WHERE e.id = 4;

-- Paso 3: Verificar si este expediente tiene empresa y sede asignadas
SELECT 
    e.id as expediente_id,
    e.codigo_expediente,
    e.id_empresa,
    e.id_sede_practica,
    emp.razon_social as nombre_empresa,
    sede.nombre_sede
FROM expediente e
LEFT JOIN empresa emp ON e.id_empresa = emp.id
LEFT JOIN sede_practica sede ON e.id_sede_practica = sede.id
WHERE e.id = 4;

-- Paso 4: Verificar el tipo de práctica asociado
SELECT 
    e.id as expediente_id,
    e.id_tipo_practica,
    tp.codigo,
    tp.nombre
FROM expediente e
LEFT JOIN tipo_practica tp ON e.id_tipo_practica = tp.id
WHERE e.id = 4;

-- Script para crear manualmente el expediente faltante
-- Reemplaza los valores según corresponda

-- Paso 1: Obtener tu ID de estudiante
SELECT e.id, e.id_usuario, u.username, u.nombres
FROM estudiante e
JOIN usuario u ON e.id_usuario = u.id
WHERE u.username = 'jeanfranco';  -- Reemplaza con tu username real

-- Paso 2: Obtener el ID de tu práctica activa
SELECT p.id, p.id_estudiante, p.id_sede, p.id_tipo_practica
FROM practica p
JOIN estudiante e ON p.id_estudiante = e.id
JOIN usuario u ON e.id_usuario = u.id
WHERE u.username = 'jeanfranco'  -- Reemplaza con tu username real
AND p.activo = true;

-- Paso 3: Crear el expediente manualmente con los valores obtenidos
INSERT INTO expediente (
    id_estudiante,
    numero_expediente,
    fecha_apertura,
    estado,
    activo,
    fecha_creacion,
    codigo_expediente,
    id_tipo_practica,
    periodo_academico,
    condicion_solicitante,
    id_empresa,
    id_sede_practica
) VALUES (
    4,  -- id_estudiante (del paso 1)
    'EXP-2025-001',  -- numero_expediente
    CURRENT_DATE,  -- fecha_apertura
    'EMPRESA_SEDE_ASIGNADA',  -- estado
    true,  -- activo
    CURRENT_TIMESTAMP,  -- fecha_creacion
    'EXP-2025-001',  -- codigo_expediente
    1,  -- id_tipo_practica (del paso 2)
    '2025-II',  -- periodo_academico
    'ESTUDIANTE',  -- condicion_solicitante
    3,  -- id_empresa (del paso 3)
    3   -- id_sede_practica (del paso 2)
);

-- Paso 4: Verificar que se creó correctamente
SELECT * FROM expediente ORDER BY id DESC LIMIT 1;

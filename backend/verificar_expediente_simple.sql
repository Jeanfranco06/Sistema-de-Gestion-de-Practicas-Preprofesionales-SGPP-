-- Consulta simple para verificar si el expediente existe

-- Paso 1: Verificar si el expediente id=4 existe
SELECT * FROM expediente WHERE id = 4;

-- Paso 2: Verificar todos los expedientes con sus IDs
SELECT id, codigo_expediente, estado FROM expediente ORDER BY id;

-- Paso 3: Verificar la estructura de la tabla expediente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expediente' 
ORDER BY ordinal_position;

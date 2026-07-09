-- Verificar la estructura de la tabla expediente_documento
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'expediente_documento' 
ORDER BY ordinal_position;

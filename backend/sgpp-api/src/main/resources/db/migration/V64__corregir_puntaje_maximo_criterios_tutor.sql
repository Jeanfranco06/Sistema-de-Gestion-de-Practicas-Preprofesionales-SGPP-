-- Actualizar el puntaje máximo a 5 para todos los criterios activos de evaluación del Tutor Externo (EMPRESA)
-- de modo que todos se puedan calificar del 1 al 5 y la rúbrica sume exactamente 50 puntos (10 criterios * 5 puntos)
UPDATE criterio_evaluacion
SET puntaje_maximo = 5
WHERE componente = 'EMPRESA' AND activo = TRUE;

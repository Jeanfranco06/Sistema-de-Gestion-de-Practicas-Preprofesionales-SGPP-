-- Conserva una sola regla activa cuando fue insertada más de una vez para el mismo tipo y norma.
WITH reglas_duplicadas AS (
    SELECT r.id,
           ROW_NUMBER() OVER (
               PARTITION BY r.id_tipo_practica, r.id_norma, r.codigo
               ORDER BY r.id
           ) AS posicion
    FROM regla_validacion r
    WHERE r.activo = TRUE
)
UPDATE regla_validacion r
SET activo = FALSE,
    fecha_actualizacion = CURRENT_TIMESTAMP
FROM reglas_duplicadas d
WHERE r.id = d.id
  AND d.posicion > 1;

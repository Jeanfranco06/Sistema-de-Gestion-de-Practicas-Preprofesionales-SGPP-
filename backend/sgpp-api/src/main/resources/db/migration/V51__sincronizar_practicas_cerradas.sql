-- Sincroniza el registro legado de práctica con expedientes ya cerrados.
UPDATE practica p
SET id_estado = ep.id,
    activo = FALSE,
    horas_restantes = 0,
    fecha_actualizacion = CURRENT_TIMESTAMP
FROM estado_practica ep
WHERE ep.codigo = 'COMPLETADA'
  AND p.activo = TRUE
  AND EXISTS (
      SELECT 1
      FROM expediente e
      WHERE e.id_estudiante = p.id_estudiante
        AND e.id_tipo_practica = p.id_tipo_practica
        AND e.estado = 'CERRADO'
        AND (e.id_sede_practica IS NULL OR e.id_sede_practica = p.id_sede)
  );

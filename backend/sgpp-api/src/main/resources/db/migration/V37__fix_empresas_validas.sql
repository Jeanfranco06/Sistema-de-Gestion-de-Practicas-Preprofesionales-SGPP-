-- Update all sedes to be ACTIVA
UPDATE sede_practica SET estado_sede = 'ACTIVA', activo = true;

-- Ensure every empresa has a valid convenio
INSERT INTO convenio (id_empresa, numero_convenio, fecha_inicio, fecha_fin, objetivo, vigente, activo)
SELECT id, 'CONV-000' || id, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 year', 'Convenio autogenerado', true, true
FROM empresa
WHERE id NOT IN (SELECT id_empresa FROM convenio);

UPDATE convenio SET vigente = true, activo = true, fecha_inicio = CURRENT_DATE - INTERVAL '1 month', fecha_fin = CURRENT_DATE + INTERVAL '1 year';

INSERT INTO validacion_sede (
    id_sede, id_usuario_validador, fecha_validacion, 
    criterio_infraestructura_cumple, criterio_seguridad_salud_cumple, criterio_afinidad_carrera_cumple,
    criterio_tutor_designado_cumple, criterio_convenio_acuerdo_cumple,
    resultado_validacion, observaciones_generales, fecha_vigencia_desde, fecha_vigencia_hasta
)
SELECT id, 1, CURRENT_DATE, true, true, true, true, true, 'APROBADA', 'Validación automática por script', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 year'
FROM sede_practica
WHERE id NOT IN (SELECT id_sede FROM validacion_sede);

UPDATE validacion_sede 
SET resultado_validacion = 'APROBADA', 
    fecha_validacion = CURRENT_DATE - INTERVAL '1 month', 
    fecha_vigencia_desde = CURRENT_DATE - INTERVAL '1 month',
    fecha_vigencia_hasta = CURRENT_DATE + INTERVAL '1 year';

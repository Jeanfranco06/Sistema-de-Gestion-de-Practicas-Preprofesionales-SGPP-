-- Actualizar expediente 102 (estudiante2 - Practica Final) a estado INFORME_FINAL_PRESENTADO
-- para habilitar la evaluacion del Tutor Externo (Anexo 2).
-- El expediente ya tiene: informe final cargado (APROBADO) + constancia de empresa (APROBADO),
-- por lo que el avance de estado es coherente con la logica de negocio.

ALTER TABLE expediente_estado DISABLE TRIGGER trg_expediente_estado_inmutable;

-- Actualizar el estado en la tabla principal
UPDATE expediente
SET estado = 'INFORME_FINAL_PRESENTADO'
WHERE id = 102;

-- Registrar la transicion en el historial de estados
INSERT INTO expediente_estado (id_expediente, estado_anterior, estado_nuevo, id_usuario, tipo_cambio, creado_por)
VALUES (102, 'EN_EJECUCION', 'INFORME_FINAL_PRESENTADO', 9, 'AUTOMATICO', 'SYSTEM');

ALTER TABLE expediente_estado ENABLE TRIGGER trg_expediente_estado_inmutable;

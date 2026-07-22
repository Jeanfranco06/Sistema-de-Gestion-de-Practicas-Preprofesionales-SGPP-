-- V59: Agregar ON DELETE CASCADE a FKs de plan y crear índices de rendimiento
-- Nota: V38 fue eliminado del repositorio pero ya fue aplicado en BBDD existentes.
--       En instalaciones nuevas, ejecutar flyway:repair antes del primer migrate.

-- ============================================================
-- 1. ON DELETE CASCADE en tablas hijas de plan_general
-- ============================================================

-- plan_seccion
ALTER TABLE plan_seccion DROP CONSTRAINT IF EXISTS fk_plan_seccion_plan;
ALTER TABLE plan_seccion
    ADD CONSTRAINT fk_plan_seccion_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id) ON DELETE CASCADE;

-- plan_objetivo
ALTER TABLE plan_objetivo DROP CONSTRAINT IF EXISTS fk_plan_objetivo_plan;
ALTER TABLE plan_objetivo
    ADD CONSTRAINT fk_plan_objetivo_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id) ON DELETE CASCADE;

-- plan_cronograma_actividad (FK a plan_general)
ALTER TABLE plan_cronograma_actividad DROP CONSTRAINT IF EXISTS fk_plan_cronograma_plan;
ALTER TABLE plan_cronograma_actividad
    ADD CONSTRAINT fk_plan_cronograma_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id) ON DELETE CASCADE;

-- plan_cronograma_actividad (FK a plan_objetivo)
ALTER TABLE plan_cronograma_actividad DROP CONSTRAINT IF EXISTS fk_plan_cronograma_objetivo;
ALTER TABLE plan_cronograma_actividad
    ADD CONSTRAINT fk_plan_cronograma_objetivo
    FOREIGN KEY (id_objetivo_especifico) REFERENCES plan_objetivo(id) ON DELETE SET NULL;

-- plan_observacion
ALTER TABLE plan_observacion DROP CONSTRAINT IF EXISTS fk_plan_observacion_plan;
ALTER TABLE plan_observacion
    ADD CONSTRAINT fk_plan_observacion_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id) ON DELETE CASCADE;

-- plan_historial_estado
ALTER TABLE plan_historial_estado DROP CONSTRAINT IF EXISTS fk_plan_historial_plan;
ALTER TABLE plan_historial_estado
    ADD CONSTRAINT fk_plan_historial_plan
    FOREIGN KEY (id_plan) REFERENCES plan_general(id) ON DELETE CASCADE;

-- ============================================================
-- 2. Índices de rendimiento para consultas frecuentes
-- ============================================================

-- Documentos por expediente (búsquedas de GestionDocumental)
CREATE INDEX IF NOT EXISTS idx_expediente_documento_expediente
    ON expediente_documento(id_expediente);

-- Registros de hora por control de horas (acumulación de horas)
CREATE INDEX IF NOT EXISTS idx_registro_hora_control_hora
    ON registro_hora(id_control_hora);

-- Expediente por estudiante y estado (dashboard, filtros)
CREATE INDEX IF NOT EXISTS idx_expediente_estudiante_estado
    ON expediente(id_estudiante, estado);

-- Plan general por expediente (búsqueda de plan activo)
CREATE INDEX IF NOT EXISTS idx_plan_general_expediente
    ON plan_general(id_expediente);

-- Notificación por destinatario y leída (dashboard de notificaciones)
CREATE INDEX IF NOT EXISTS idx_notificacion_destinatario_leida
    ON notificacion(usuario_destino, leida);

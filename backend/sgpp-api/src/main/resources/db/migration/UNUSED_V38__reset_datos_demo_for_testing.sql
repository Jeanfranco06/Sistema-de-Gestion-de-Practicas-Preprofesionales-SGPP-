-- ============================================================
-- MIGRACIÓN V38: Reset de datos demo para pruebas desde cero
-- ============================================================

-- 0. Deshabilitar restricciones de inmutabilidad para la limpieza
DROP TRIGGER IF EXISTS trg_expediente_estado_inmutable ON expediente_estado;
DROP TRIGGER IF EXISTS trg_evento_auditoria_inmutable ON evento_auditoria;
DROP FUNCTION IF EXISTS fn_proteger_expediente_estado();
DROP FUNCTION IF EXISTS fn_proteger_evento_auditoria();

-- 1. Eliminar datos transaccionales de Expediente
DELETE FROM expediente_documento;
DELETE FROM expediente_estado;
DELETE FROM expediente_observacion;
DELETE FROM expediente_comite;
DELETE FROM expediente;

-- 2. Eliminar datos de Práctica (si existieran)
DELETE FROM incidencia;
DELETE FROM monitoreo;
DELETE FROM registro_horas;
DELETE FROM practica;

-- 3. Eliminar datos Empresariales (Convenios, Sedes, Empresas)
DELETE FROM convenio;
DELETE FROM validacion_sede;
DELETE FROM sede_practica;
DELETE FROM empresa;

-- 4. Eliminar Perfiles de Usuario
DELETE FROM estudiante;
DELETE FROM docente;
DELETE FROM tutor_externo;

-- 5. Eliminar Usuarios Demo (manteniendo adminsys1)
-- Primero eliminamos los roles asociados para no romper constraints si no hay CASCADE
DELETE FROM usuario_rol WHERE id_usuario IN (SELECT id FROM usuario WHERE username != 'adminsys1');
-- Luego eliminamos los usuarios
DELETE FROM usuario WHERE username != 'adminsys1';

-- 6. Eliminar Notificaciones y Auditoría
DELETE FROM notificacion;
DELETE FROM evento_auditoria;
DELETE FROM auditoria;

-- 7. Eliminar Periodos Académicos Demo
DELETE FROM periodo_academico;

-- 8. Restaurar restricciones de inmutabilidad
CREATE OR REPLACE FUNCTION fn_proteger_evento_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Los registros de evento_auditoria son inmutables';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_proteger_expediente_estado()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'El historial de estados del expediente es inmutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_evento_auditoria_inmutable ON evento_auditoria;
CREATE TRIGGER trg_evento_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON evento_auditoria
    FOR EACH ROW EXECUTE FUNCTION fn_proteger_evento_auditoria();

DROP TRIGGER IF EXISTS trg_expediente_estado_inmutable ON expediente_estado;
CREATE TRIGGER trg_expediente_estado_inmutable
    BEFORE UPDATE OR DELETE ON expediente_estado
    FOR EACH ROW EXECUTE FUNCTION fn_proteger_expediente_estado();

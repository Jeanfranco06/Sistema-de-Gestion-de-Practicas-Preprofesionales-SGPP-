-- Restricciones de inmutabilidad para registros de auditoría y trazabilidad

CREATE OR REPLACE FUNCTION fn_proteger_evento_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Los registros de evento_auditoria son inmutables';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_evento_auditoria_inmutable ON evento_auditoria;
CREATE TRIGGER trg_evento_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON evento_auditoria
    FOR EACH ROW EXECUTE FUNCTION fn_proteger_evento_auditoria();

CREATE OR REPLACE FUNCTION fn_proteger_expediente_estado()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'El historial de estados del expediente es inmutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_expediente_estado_inmutable ON expediente_estado;
CREATE TRIGGER trg_expediente_estado_inmutable
    BEFORE UPDATE OR DELETE ON expediente_estado
    FOR EACH ROW EXECUTE FUNCTION fn_proteger_expediente_estado();

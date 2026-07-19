-- Reinicia solo los datos operativos del estudiante demo para ejecutar el E2E desde Solicitar Práctica.
-- Conserva usuario, perfil académico, empresas, sedes, convenios y catálogos.

ALTER TABLE expediente_estado DISABLE TRIGGER trg_expediente_estado_inmutable;
ALTER TABLE evento_auditoria DISABLE TRIGGER trg_evento_auditoria_inmutable;

-- La auditoría es inmutable; se conserva, pero se desvincula del expediente de pruebas eliminado.
UPDATE evento_auditoria
SET id_expediente = NULL
WHERE id_expediente IN (
    SELECT e.id
    FROM expediente e
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM registro_generacion_documental
WHERE id_expediente IN (
    SELECT e.id
    FROM expediente e
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM componente_evaluacion
WHERE id_expediente IN (
    SELECT e.id
    FROM expediente e
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM control_plazo
WHERE id_expediente IN (
    SELECT e.id
    FROM expediente e
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM evaluacion
WHERE id_expediente IN (
    SELECT e.id
    FROM expediente e
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM plan_observacion
WHERE id_plan IN (
    SELECT pg.id
    FROM plan_general pg
    JOIN expediente e ON e.id = pg.id_expediente
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM plan_historial_estado
WHERE id_plan IN (
    SELECT pg.id
    FROM plan_general pg
    JOIN expediente e ON e.id = pg.id_expediente
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM plan_cronograma_actividad
WHERE id_plan IN (
    SELECT pg.id
    FROM plan_general pg
    JOIN expediente e ON e.id = pg.id_expediente
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM plan_objetivo
WHERE id_plan IN (
    SELECT pg.id
    FROM plan_general pg
    JOIN expediente e ON e.id = pg.id_expediente
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM plan_seccion
WHERE id_plan IN (
    SELECT pg.id
    FROM plan_general pg
    JOIN expediente e ON e.id = pg.id_expediente
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM plan_general
WHERE id_expediente IN (
    SELECT e.id
    FROM expediente e
    JOIN estudiante est ON est.id = e.id_estudiante
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM practica
WHERE id_estudiante = (
    SELECT est.id
    FROM estudiante est
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

DELETE FROM expediente
WHERE id_estudiante = (
    SELECT est.id
    FROM estudiante est
    JOIN usuario u ON u.id = est.id_usuario
    WHERE u.username = 'estudiante1'
);

-- Deja un comité vigente para poder completar los escenarios FINAL y PROFESIONAL desde Coordinación.
INSERT INTO comite_integrante (
    id_usuario, id_docente, rol_comite, fecha_inicio, estado,
    resolucion_designacion, periodo_academico, creado_por
)
SELECT
    u.id,
    d.id,
    CASE WHEN EXISTS (
        SELECT 1 FROM comite_integrante ci
        WHERE ci.estado = 'ACTIVO' AND ci.rol_comite = 'PRESIDENTE'
    ) THEN 'MIEMBRO' ELSE 'PRESIDENTE' END,
    CURRENT_DATE,
    'ACTIVO',
    'RES-TEST-COMITE-2026',
    '2026-I',
    'SYSTEM'
FROM usuario u
LEFT JOIN docente d ON d.id_usuario = u.id
WHERE u.username = 'comite1'
  AND NOT EXISTS (
      SELECT 1 FROM comite_integrante ci
      WHERE ci.id_usuario = u.id AND ci.estado = 'ACTIVO'
  );

INSERT INTO comite_integrante (
    id_usuario, id_docente, rol_comite, fecha_inicio, estado,
    resolucion_designacion, periodo_academico, creado_por
)
SELECT u.id, d.id, 'MIEMBRO', CURRENT_DATE, 'ACTIVO',
       'RES-TEST-COMITE-2026', '2026-I', 'SYSTEM'
FROM usuario u
LEFT JOIN docente d ON d.id_usuario = u.id
WHERE u.username IN ('docente1', 'comite2')
  AND NOT EXISTS (
      SELECT 1 FROM comite_integrante ci
      WHERE ci.id_usuario = u.id AND ci.estado = 'ACTIVO'
  );

ALTER TABLE evento_auditoria ENABLE TRIGGER trg_evento_auditoria_inmutable;
ALTER TABLE expediente_estado ENABLE TRIGGER trg_expediente_estado_inmutable;

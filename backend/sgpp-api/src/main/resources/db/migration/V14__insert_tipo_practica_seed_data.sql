-- Inserción de tipos de práctica para RF-01 y RF-02
-- Tipos de práctica según reglamento: Inicial, Final, Profesional

INSERT INTO tipo_practica (codigo, nombre, descripcion, horas_requeridas, activo, creado_por) VALUES
('INICIAL', 'Práctica Inicial', 'Práctica inicial de observación y familiarización con el entorno laboral', 120, TRUE, 'SYSTEM'),
('FINAL', 'Práctica Final', 'Práctica final para consolidación de conocimientos y habilidades profesionales', 240, TRUE, 'SYSTEM'),
('PROFESIONAL', 'Práctica Profesional', 'Práctica profesional completa para egresados con titulación', 480, TRUE, 'SYSTEM')
ON CONFLICT (codigo) DO NOTHING;

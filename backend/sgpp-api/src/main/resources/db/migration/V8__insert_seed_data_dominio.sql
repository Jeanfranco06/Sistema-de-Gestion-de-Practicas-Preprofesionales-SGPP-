-- Inserción de datos de prueba para el dominio base

-- Estados de práctica (necesario antes de crear practicas)
INSERT INTO estado_practica (codigo, nombre, descripcion, activo, creado_por) VALUES
('REGISTRADA', 'Registrada', 'Práctica registrada en el sistema', TRUE, 'SYSTEM'),
('EN_PROCESO', 'En Proceso', 'Práctica en curso', TRUE, 'SYSTEM'),
('COMPLETADA', 'Completada', 'Práctica completada exitosamente', TRUE, 'SYSTEM'),
('CANCELADA', 'Cancelada', 'Práctica cancelada', TRUE, 'SYSTEM'),
('SUSPENDIDA', 'Suspendida', 'Práctica suspendida temporalmente', TRUE, 'SYSTEM')
ON CONFLICT (codigo) DO NOTHING;

-- Estados de documento (necesario antes de crear documentos)
INSERT INTO estado_documento (codigo, nombre, descripcion, activo, creado_por) VALUES
('PENDIENTE', 'Pendiente', 'Documento pendiente de carga', TRUE, 'SYSTEM'),
('CARGADO', 'Cargado', 'Documento cargado', TRUE, 'SYSTEM'),
('REVISION', 'En Revisión', 'Documento en revisión', TRUE, 'SYSTEM'),
('APROBADO', 'Aprobado', 'Documento aprobado', TRUE, 'SYSTEM'),
('RECHAZADO', 'Rechazado', 'Documento rechazado', TRUE, 'SYSTEM'),
('OBSERVADO', 'Observado', 'Documento con observaciones', TRUE, 'SYSTEM')
ON CONFLICT (codigo) DO NOTHING;

-- Tipos de documento
INSERT INTO tipo_documento (nombre, descripcion, obligatorio, activo, creado_por) VALUES
('CONVENIO', 'Convenio marco entre la universidad y la empresa', TRUE, TRUE, 'SYSTEM'),
('CARTA_COMPROMISO', 'Carta de compromiso del estudiante', TRUE, TRUE, 'SYSTEM'),
('PLAN_ACTIVIDADES', 'Plan de actividades de prácticas', TRUE, TRUE, 'SYSTEM'),
('INFORME_PARCIAL', 'Informe parcial de avance', FALSE, TRUE, 'SYSTEM'),
('INFORME_FINAL', 'Informe final de prácticas', TRUE, TRUE, 'SYSTEM'),
('CERTIFICADO', 'Certificado de culminación de prácticas', TRUE, TRUE, 'SYSTEM'),
('EVALUACION_EMPRESA', 'Evaluación realizada por el tutor externo', TRUE, TRUE, 'SYSTEM'),
('EVALUACION_DOCENTE', 'Evaluación realizada por el docente asesor', TRUE, TRUE, 'SYSTEM'),
('CONSTANCIA', 'Constancia de realización de prácticas', FALSE, TRUE, 'SYSTEM'),
('OTRO', 'Otros documentos adicionales', FALSE, TRUE, 'SYSTEM')
ON CONFLICT (nombre) DO NOTHING;

-- Empresas de prueba
INSERT INTO empresa (ruc, razon_social, nombre_comercial, direccion, distrito, provincia, departamento, pais, telefono, email, sector_economico, tamano_empresa, activo, validado, creado_por) VALUES
('20123456789', 'Empresa Tecnológica S.A.C.', 'TechSolutions', 'Av. Industrial 123', 'Trujillo', 'Trujillo', 'La Libertad', 'Perú', '+5144123456', 'contacto@techsolutions.com', 'Tecnología', 'MEDIANA', TRUE, TRUE, 'SYSTEM'),
('20987654321', 'Industria Manufacturera E.I.R.L.', 'ManufacPerú', 'Jr. Comercio 456', 'Trujillo', 'Trujillo', 'La Libertad', 'Perú', '+5144198765', 'info@manufacperu.com', 'Manufactura', 'GRANDE', TRUE, TRUE, 'SYSTEM')
ON CONFLICT (ruc) DO NOTHING;

-- Sedes de práctica
INSERT INTO sede_practica (id_empresa, nombre_sede, direccion, distrito, provincia, departamento, telefono, email, nombre_contacto, cargo_contacto, telefono_contacto, email_contacto, capacidad_maxima, activo, creado_por)
SELECT e.id, 'Sede Principal Trujillo', 'Av. Industrial 123', 'Trujillo', 'Trujillo', 'La Libertad', '+5144123456', 'contacto@techsolutions.com', 'Juan Pérez', 'Gerente de RRHH', '+5144123456', 'juan.perez@techsolutions.com', 20, TRUE, 'SYSTEM'
FROM empresa e WHERE e.ruc = '20123456789'
ON CONFLICT DO NOTHING;

INSERT INTO sede_practica (id_empresa, nombre_sede, direccion, distrito, provincia, departamento, telefono, email, nombre_contacto, cargo_contacto, telefono_contacto, email_contacto, capacidad_maxima, activo, creado_por)
SELECT e.id, 'Planta Industrial Norte', 'Jr. Comercio 456', 'Trujillo', 'Trujillo', 'La Libertad', '+5144198765', 'info@manufacperu.com', 'María García', 'Coordinadora de Prácticas', '+5144198765', 'maria.garcia@manufacperu.com', 15, TRUE, 'SYSTEM'
FROM empresa e WHERE e.ruc = '20987654321'
ON CONFLICT DO NOTHING;

-- Convenios
INSERT INTO convenio (id_empresa, numero_convenio, fecha_inicio, fecha_fin, objetivo, vigente, activo, creado_por)
SELECT e.id, 'CONV-2024-001', '2024-01-01', '2025-12-31', 'Convenio marco para prácticas preprofesionales de ingeniería industrial', TRUE, TRUE, 'SYSTEM'
FROM empresa e WHERE e.ruc = '20123456789'
ON CONFLICT (numero_convenio) DO NOTHING;

INSERT INTO convenio (id_empresa, numero_convenio, fecha_inicio, fecha_fin, objetivo, vigente, activo, creado_por)
SELECT e.id, 'CONV-2024-002', '2024-03-01', '2025-12-31', 'Convenio para prácticas en área de manufactura', TRUE, TRUE, 'SYSTEM'
FROM empresa e WHERE e.ruc = '20987654321'
ON CONFLICT (numero_convenio) DO NOTHING;

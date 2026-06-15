-- ============================================================
-- MIGRACIÓN: Crear tablas de notificaciones y tipo_notificacion
-- ============================================================

-- Tabla tipo_notificacion
CREATE TABLE IF NOT EXISTS tipo_notificacion (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Tabla notificacion
CREATE TABLE IF NOT EXISTS notificacion (
    id BIGSERIAL PRIMARY KEY,
    usuario_destino VARCHAR(100) NOT NULL,
    tipo_notificacion VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_lectura TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(50)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_notificacion_usuario_destino ON notificacion(usuario_destino);
CREATE INDEX IF NOT EXISTS idx_notificacion_leida ON notificacion(leida);
CREATE INDEX IF NOT EXISTS idx_notificacion_tipo_notificacion ON notificacion(tipo_notificacion);
CREATE INDEX IF NOT EXISTS idx_tipo_notificacion_codigo ON tipo_notificacion(codigo);

-- ============================================================
-- INSERCIÓN DE DATOS DE TIPO_NOTIFICACION
-- ============================================================
INSERT INTO tipo_notificacion (codigo, nombre, descripcion, creado_por) VALUES 
('INFO', 'Información', 'Notificaciones informativas generales', 'SYSTEM'),
('ALERTA', 'Alerta', 'Notificaciones de advertencia importante', 'SYSTEM'),
('RECORDATORIO', 'Recordatorio', 'Recordatorios de fechas y eventos', 'SYSTEM'),
('EXITO', 'Éxito', 'Notificaciones de operaciones exitosas', 'SYSTEM'),
('ERROR', 'Error', 'Notificaciones de errores o fallos', 'SYSTEM'),
('DOCUMENTO', 'Documento', 'Notificaciones relacionadas con documentos', 'SYSTEM'),
('EXPEDIENTE', 'Expediente', 'Notificaciones de actualizaciones en expediente', 'SYSTEM'),
('REVISION', 'Revisión', 'Notificaciones de solicitudes de revisión', 'SYSTEM'),
('COMITE', 'Comité', 'Notificaciones del comité de prácticas', 'SYSTEM')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- INSERCIÓN DE NOTIFICACIONES DE PRUEBA
-- ============================================================
INSERT INTO notificacion (usuario_destino, tipo_notificacion, titulo, mensaje, leida, creado_por) VALUES 
('estudiante1', 'INFO', 'Bienvenido al sistema', '¡Bienvenido estudiante! Tu cuenta ha sido activada exitosamente.', false, 'SYSTEM'),
('estudiante1', 'DOCUMENTO', 'Solicitud de Plan de Prácticas', 'Tu Plan de Prácticas ha sido enviado para revisión.', false, 'SYSTEM'),
('docente1', 'REVISION', 'Nueva solicitud de revisión', 'El estudiante estudiante1 ha enviado su Plan de Prácticas para tu revisión.', false, 'SYSTEM'),
('estudiante1', 'RECORDATORIO', 'Recordatorio de entrega', 'Recuerda que la fecha límite para entregar tu Informe Parcial es en 3 días.', false, 'SYSTEM'),
('estudiante1', 'EXITO', 'Documento aprobado', 'Tu Plan de Prácticas ha sido aprobado exitosamente.', false, 'SYSTEM')
ON CONFLICT DO NOTHING;

-- Crear tabla validacion_sede para registro de validaciones de sedes de prácticas
CREATE TABLE IF NOT EXISTS validacion_sede (
    id BIGSERIAL PRIMARY KEY,
    id_sede BIGINT NOT NULL,
    id_usuario_validador BIGINT NOT NULL,
    fecha_validacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Criterios de validación (cada uno tiene campo boolean y texto opcional)
    criterio_infraestructura_cumple BOOLEAN NOT NULL,
    criterio_infraestructura_observaciones TEXT,
    
    criterio_seguridad_salud_cumple BOOLEAN NOT NULL,
    criterio_seguridad_salud_observaciones TEXT,
    
    criterio_afinidad_carrera_cumple BOOLEAN NOT NULL,
    criterio_afinidad_carrera_observaciones TEXT,
    
    criterio_tutor_designado_cumple BOOLEAN NOT NULL,
    criterio_tutor_designado_observaciones TEXT,
    
    criterio_convenio_acuerdo_cumple BOOLEAN NOT NULL,
    criterio_convenio_acuerdo_observaciones TEXT,
    
    -- Criterios adicionales opcionales
    otro_criterio_1_nombre VARCHAR(100),
    otro_criterio_1_cumple BOOLEAN,
    otro_criterio_1_observaciones TEXT,
    
    otro_criterio_2_nombre VARCHAR(100),
    otro_criterio_2_cumple BOOLEAN,
    otro_criterio_2_observaciones TEXT,
    
    -- Resultado de la validación
    resultado_validacion VARCHAR(20) NOT NULL CHECK (resultado_validacion IN ('APROBADA', 'OBSERVADA', 'RECHAZADA')),
    observaciones_generales TEXT,
    
    -- Vigencia de la validación
    fecha_vigencia_desde DATE NOT NULL,
    fecha_vigencia_hasta DATE NOT NULL,
    
    -- Metadatos
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    creado_por VARCHAR(50),
    
    CONSTRAINT fk_validacion_sede FOREIGN KEY (id_sede) REFERENCES sede_practica(id) ON DELETE CASCADE,
    CONSTRAINT fk_validacion_usuario FOREIGN KEY (id_usuario_validador) REFERENCES usuario(id) ON DELETE RESTRICT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_validacion_sede ON validacion_sede(id_sede);
CREATE INDEX IF NOT EXISTS idx_validacion_usuario ON validacion_sede(id_usuario_validador);
CREATE INDEX IF NOT EXISTS idx_validacion_resultado ON validacion_sede(resultado_validacion);
CREATE INDEX IF NOT EXISTS idx_validacion_vigencia ON validacion_sede(fecha_vigencia_desde, fecha_vigencia_hasta);
CREATE INDEX IF NOT EXISTS idx_validacion_fecha ON validacion_sede(fecha_validacion);

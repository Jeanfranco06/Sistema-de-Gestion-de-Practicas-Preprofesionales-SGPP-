-- Trazabilidad de generación documental institucional
CREATE TABLE IF NOT EXISTS registro_generacion_documental (
    id BIGSERIAL PRIMARY KEY,
    tipo_documento VARCHAR(50) NOT NULL,
    formato_salida VARCHAR(10) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500),
    id_usuario_solicitante BIGINT NOT NULL,
    id_expediente BIGINT,
    tipo_reporte VARCHAR(50),
    filtros_aplicados TEXT,
    hash_contenido VARCHAR(64),
    tamano_bytes BIGINT,
    fecha_generacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    creado_por VARCHAR(100),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rgd_usuario FOREIGN KEY (id_usuario_solicitante) REFERENCES usuario(id),
    CONSTRAINT fk_rgd_expediente FOREIGN KEY (id_expediente) REFERENCES expediente(id)
);

CREATE INDEX IF NOT EXISTS idx_rgd_usuario ON registro_generacion_documental(id_usuario_solicitante);
CREATE INDEX IF NOT EXISTS idx_rgd_expediente ON registro_generacion_documental(id_expediente);
CREATE INDEX IF NOT EXISTS idx_rgd_fecha ON registro_generacion_documental(fecha_generacion);

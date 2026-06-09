-- Ampliar tabla sede_practica para perfil completo de sede
-- Agregar campos faltantes para el perfil de sede de prácticas

-- Agregar tipo de entidad
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS tipo_entidad VARCHAR(20);

-- Agregar área o unidad
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS area_unidad VARCHAR(200);

-- Agregar descripción general
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS descripcion_general TEXT;

-- Agregar actividades principales
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS actividades_principales TEXT;

-- Agregar riesgos relevantes
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS riesgos_relevantes TEXT;

-- Agregar información del tutor de empresa
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS nombre_tutor_empresa VARCHAR(200);
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS cargo_tutor_empresa VARCHAR(100);
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS correo_tutor_empresa VARCHAR(100);
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS telefono_tutor_empresa VARCHAR(20);

-- Agregar estado de sede (reemplaza activo)
ALTER TABLE sede_practica ADD COLUMN IF NOT EXISTS estado_sede VARCHAR(20) DEFAULT 'ACTIVA';

-- Actualizar datos existentes: migrar activo a estado_sede
UPDATE sede_practica SET estado_sede = CASE 
    WHEN activo = true THEN 'ACTIVA'
    ELSE 'INACTIVA'
END WHERE estado_sede IS NULL OR estado_sede = 'ACTIVA';

-- Crear índice para estado_sede
CREATE INDEX IF NOT EXISTS idx_sede_estado ON sede_practica(estado_sede);

-- Agregar campo rechazado_por_tutor a tabla registro_hora
ALTER TABLE registro_hora 
ADD COLUMN rechazado_por_tutor BOOLEAN DEFAULT FALSE NOT NULL;

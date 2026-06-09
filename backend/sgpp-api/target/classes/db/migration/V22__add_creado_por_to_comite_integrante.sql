-- Add creado_por column to comite_integrante table
ALTER TABLE comite_integrante 
ADD COLUMN IF NOT EXISTS creado_por VARCHAR(50);

import { Chip } from '@mui/material';

const STATUS_STYLES = {
  EN_EJECUCION: { label: 'En ejecución', sx: { bgcolor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' } },
  EVALUADO: { label: 'Evaluado', sx: { bgcolor: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' } },
  CERRADO: { label: 'Cerrado', sx: { bgcolor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' } },
  OBSERVADO: { label: 'Observado', sx: { bgcolor: '#fffbeb', color: '#d97706', borderColor: '#fde68a' } },
  APROBADO: { label: 'Aprobado', sx: { bgcolor: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' } },
  PENDIENTE: { label: 'Pendiente', sx: { bgcolor: '#fff1f2', color: '#e11d48', borderColor: '#fecdd3' } },
};

export default function StatusChip({ status, label }) {
  const config = STATUS_STYLES[status];
  const displayLabel = label || config?.label || status?.replace(/_/g, ' ') || '—';

  if (config) {
    return <Chip size="small" label={displayLabel} variant="outlined" sx={config.sx} />;
  }

  return <Chip size="small" label={displayLabel} variant="outlined" />;
}

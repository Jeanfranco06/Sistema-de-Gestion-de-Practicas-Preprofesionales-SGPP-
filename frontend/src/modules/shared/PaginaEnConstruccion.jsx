import { Box, Typography, Chip } from '@mui/material';
import { Construction } from '@mui/icons-material';

export default function PaginaEnConstruccion({ titulo = 'Módulo en construcción' }) {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Construction sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography sx={{ mb: 1 }} variant="h6" color="text.secondary">{titulo}</Typography>
      <Chip label="Próximamente" size="small" />
    </Box>
  );
}

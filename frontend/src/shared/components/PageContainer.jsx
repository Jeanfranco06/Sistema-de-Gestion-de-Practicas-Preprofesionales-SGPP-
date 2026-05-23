import { Box } from '@mui/material';

/**
 * Contenedor estándar para páginas internas.
 * Garantiza el mismo encuadre en todos los módulos del sistema.
 */
export default function PageContainer({ children, maxWidth = 1440 }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth,
        mx: 'auto',
      }}
    >
      {children}
    </Box>
  );
}

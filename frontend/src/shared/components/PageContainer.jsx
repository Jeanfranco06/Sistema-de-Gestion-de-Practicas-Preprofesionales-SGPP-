import { Box } from '@mui/material';

/**
 * Contenedor estándar para páginas internas.
 * Garantiza el mismo encuadre en todos los módulos del sistema.
 */
export default function PageContainer({ children, maxWidth = null }) {
  return (
    <Box
      sx={{
        width: '100%',
        ...(maxWidth && {
          maxWidth,
          mx: 'auto',
        }),
      }}
    >
      {children}
    </Box>
  );
}

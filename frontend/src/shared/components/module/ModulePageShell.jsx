import { Box, Container, Paper, TableContainer, Typography } from '@mui/material';

export function ModulePageShell({ children, maxWidth = 'xl', sx }) {
  return (
    <Container maxWidth={maxWidth} sx={{ mt: 4, mb: 6, ...sx }}>
      {children}
    </Container>
  );
}

export function ModulePageHeader({ icon, title, subtitle, action }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon && (
          <Box sx={{ color: 'primary.main', display: 'flex', '& .MuiSvgIcon-root': { fontSize: 40 } }}>
            {icon}
          </Box>
        )}
        <Box>
          <Typography sx={{ fontWeight: 'bold' }} variant="h4" color="primary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {action}
    </Box>
  );
}

export function ModuleToolbar({ children }) {
  return (
    <Paper
      elevation={1}
      sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}
    >
      {children}
    </Paper>
  );
}

export function ModuleTableContainer({ children }) {
  return (
    <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {children}
    </TableContainer>
  );
}

export const moduleHeadCellSx = { color: '#fff', fontWeight: 'bold' };

export const moduleSortLabelSx = {
  color: '#fff !important',
  '& .MuiTableSortLabel-icon': { color: '#fff !important' },
};

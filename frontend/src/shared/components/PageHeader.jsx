import { Box, Typography } from '@mui/material';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        mb: 3,
        pb: 2,
        borderBottom: '2px solid',
        borderColor: 'primary.light',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ pl: 1.5, borderLeft: '4px solid', borderColor: 'primary.main' }}>
        <Typography variant="h5" component="h1" color="primary.dark">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}

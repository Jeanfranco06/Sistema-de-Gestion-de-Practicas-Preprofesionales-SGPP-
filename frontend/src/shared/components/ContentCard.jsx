import { Paper } from '@mui/material';

export default function ContentCard({ children, sx, noPadding = false, accent = false, ...props }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: noPadding ? 0 : 3,
        mb: 3,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        ...(accent && {
          borderTop: '3px solid',
          borderTopColor: 'primary.main',
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

import { Paper } from '@mui/material';

export default function ContentCard({ children, sx, noPadding = false, ...props }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: noPadding ? 0 : 3,
        mb: 3,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

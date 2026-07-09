import { Box, Paper, Typography } from '@mui/material';
import { accents, statAccentKeys } from '../theme/designTokens';

export default function StatStrip({ items = [], sx }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 3,
        borderRadius: 2,
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {items.map((item, i) => {
        const key = item.accent || statAccentKeys[i % statAccentKeys.length];
        const accent = accents[key] || accents.blue;

        return (
          <Box
            key={item.label}
            sx={{
              flex: '1 1 140px',
              px: 2.5,
              py: 2,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              borderRight: i < items.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            {item.icon && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: accent.bg,
                  color: accent.main,
                  border: '1px solid',
                  borderColor: accent.border,
                }}
              >
                {item.icon}
              </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.4, display: 'block' }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ mt: 0.25, textTransform: 'capitalize', color: accent.main }}
              >
                {item.value}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
}

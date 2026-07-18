import { createTheme, alpha } from '@mui/material/styles';

export const palette = {
  yellow: { main: '#F5C518', light: '#FCE87A', dark: '#C79A00', contrast: '#1E293B' },
  blue: { main: '#1A3A6E', light: '#4A6FA5', dark: '#0E2142', contrast: '#FFFFFF' },
  red: { main: '#C62828', light: '#EF5350', dark: '#8E0000', contrast: '#FFFFFF' },
  green: { main: '#2E7D32', light: '#66BB6A', dark: '#1B5E20', contrast: '#FFFFFF' },
  amber: { main: '#F57C00', light: '#FFB74D', dark: '#E65100', contrast: '#1E293B' },
  slate: { main: '#1E293B', light: '#475569', dark: '#0F172A', contrast: '#FFFFFF' },
  gray: { main: '#94A3B8', light: '#CBD5E1', dark: '#64748B', contrast: '#1E293B' },
  background: '#F8FAFC',
  paper: '#FFFFFF',
  divider: '#E2E8F0',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palette.yellow.main,
      light: palette.yellow.light,
      dark: palette.yellow.dark,
      contrastText: palette.yellow.contrast,
    },
    secondary: {
      main: palette.blue.main,
      light: palette.blue.light,
      dark: palette.blue.dark,
      contrastText: palette.blue.contrast,
    },
    background: {
      default: palette.background,
      paper: palette.paper,
    },
    text: {
      primary: palette.slate.main,
      secondary: palette.gray.dark,
    },
    divider: palette.divider,
    success: {
      main: palette.green.main,
      light: palette.green.light,
      dark: palette.green.dark,
      contrastText: palette.green.contrast,
    },
    warning: {
      main: palette.amber.main,
      light: palette.amber.light,
      dark: palette.amber.dark,
      contrastText: palette.amber.contrast,
    },
    error: {
      main: palette.red.main,
      light: palette.red.light,
      dark: palette.red.dark,
      contrastText: palette.red.contrast,
    },
    info: {
      main: palette.blue.main,
      light: palette.blue.light,
      dark: palette.blue.dark,
      contrastText: palette.blue.contrast,
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.5rem', color: palette.slate.main },
    h5: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.25rem', color: palette.slate.main },
    h6: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1rem', color: palette.slate.main },
    subtitle1: { fontWeight: 500 },
    body2: { fontSize: '0.875rem' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: { color: palette.yellow.contrast, '&:hover': { backgroundColor: palette.yellow.dark } },
        },
        {
          props: { variant: 'contained', color: 'secondary' },
          style: { color: palette.blue.contrast, '&:hover': { backgroundColor: palette.blue.dark } },
        },
        {
          props: { variant: 'outlined' },
          style: { borderColor: palette.divider, '&:hover': { backgroundColor: alpha(palette.yellow.main, 0.06) } },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
          border: `1px solid ${palette.divider}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: palette.divider,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 6 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${palette.divider}`,
          backgroundColor: palette.paper,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
          backgroundColor: palette.yellow.main,
          color: palette.yellow.contrast,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: { minHeight: '56px' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: palette.gray.dark,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          bgcolor: palette.background,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { bgcolor: alpha(palette.blue.main, 0.03) },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            bgcolor: alpha(palette.yellow.main, 0.16),
            color: palette.slate.main,
            '& .MuiListItemIcon-root': { color: palette.blue.main },
            '&:hover': { bgcolor: alpha(palette.yellow.main, 0.24) },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { color: palette.gray.dark },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': { color: palette.blue.main, fontWeight: 600 },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: palette.yellow.main },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: alpha(palette.yellow.main, 0.2),
          '& .MuiLinearProgress-bar': { backgroundColor: palette.yellow.main },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: { color: 'inherit' },
      },
    },
  },
});

export default theme;

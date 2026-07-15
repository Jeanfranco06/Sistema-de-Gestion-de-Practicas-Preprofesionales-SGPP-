import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0d9488',
      light: '#2dd4bf',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
    success: { main: '#059669', light: '#ecfdf5' },
    warning: { main: '#d97706', light: '#fffbeb' },
    error: { main: '#e11d48', light: '#fff1f2' },
    info: { main: '#2563eb', light: '#eff6ff' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.5rem' },
    h5: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.25rem', color: '#0f172a' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1rem' },
    subtitle1: { fontWeight: 500 },
    body2: { fontSize: '0.875rem' },
    button: { fontWeight: 500, textTransform: 'none' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': { boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' },
        },
        outlined: {
          borderColor: '#cbd5e1',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: '#e2e8f0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid #e2e8f0' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#64748b',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          bgcolor: '#f8fafc',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { bgcolor: alpha('#2563eb', 0.03) },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            bgcolor: alpha('#2563eb', 0.1),
            color: '#1d4ed8',
            '& .MuiListItemIcon-root': { color: '#2563eb' },
            '&:hover': { bgcolor: alpha('#2563eb', 0.14) },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': { color: '#2563eb' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: '3px 3px 0 0' },
      },
    },
  },
});

export default theme;

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#18181b',
      light: '#3f3f46',
      dark: '#09090b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#52525b',
      light: '#71717a',
      dark: '#3f3f46',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#18181b',
      secondary: '#71717a',
    },
    divider: '#e4e4e7',
    success: { main: '#166534' },
    warning: { main: '#a16207' },
    error: { main: '#b91c1c' },
    info: { main: '#52525b' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.5rem' },
    h5: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.25rem' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1rem' },
    subtitle1: { fontWeight: 500 },
    body2: { fontSize: '0.875rem' },
    button: { fontWeight: 500, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          border: '1px solid #e4e4e7',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: '#e4e4e7',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
        filled: { backgroundColor: '#f4f4f5', color: '#18181b' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid #e4e4e7', boxShadow: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: '#71717a', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
      },
    },
  },
});

export default theme;

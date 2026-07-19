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

export const darkPalette = {
  yellow: { main: '#F5C518', light: '#FCE87A', dark: '#C79A00', contrast: '#1E293B' },
  blue: { main: '#4A6FA5', light: '#7A9FD5', dark: '#1A3A6E', contrast: '#FFFFFF' },
  red: { main: '#EF5350', light: '#FF8A80', dark: '#C62828', contrast: '#FFFFFF' },
  green: { main: '#66BB6A', light: '#A5D6A7', dark: '#2E7D32', contrast: '#FFFFFF' },
  amber: { main: '#FFB74D', light: '#FFE082', dark: '#F57C00', contrast: '#1E293B' },
  slate: { main: '#F1F5F9', light: '#F8FAFC', dark: '#CBD5E1', contrast: '#1E293B' },
  gray: { main: '#94A3B8', light: '#CBD5E1', dark: '#64748B', contrast: '#1E293B' },
  background: '#0F172A',
  paper: '#1E293B',
  divider: '#334155',
};

const getDesignTokens = (mode) => {
  const p = mode === 'dark' ? darkPalette : palette;

  return {
    palette: {
      mode,
      primary: {
        main: p.yellow.main,
        light: p.yellow.light,
        dark: p.yellow.dark,
        contrastText: p.yellow.contrast,
      },
      secondary: {
        main: p.blue.main,
        light: p.blue.light,
        dark: p.blue.dark,
        contrastText: p.blue.contrast,
      },
      background: {
        default: p.background,
        paper: p.paper,
      },
      text: {
        primary: p.slate.main,
        secondary: p.gray.main,
      },
      divider: p.divider,
      success: {
        main: p.green.main,
        light: p.green.light,
        dark: p.green.dark,
        contrastText: p.green.contrast,
      },
      warning: {
        main: p.amber.main,
        light: p.amber.light,
        dark: p.amber.dark,
        contrastText: p.amber.contrast,
      },
      error: {
        main: p.red.main,
        light: p.red.light,
        dark: p.red.dark,
        contrastText: p.red.contrast,
      },
      info: {
        main: p.blue.main,
        light: p.blue.light,
        dark: p.blue.dark,
        contrastText: p.blue.contrast,
      },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.5rem', color: p.slate.main },
      h5: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.25rem', color: p.slate.main },
      h6: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1rem', color: p.slate.main },
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
            style: { color: p.yellow.contrast, '&:hover': { backgroundColor: p.yellow.dark } },
          },
          {
            props: { variant: 'contained', color: 'secondary' },
            style: { color: p.blue.contrast, '&:hover': { backgroundColor: p.blue.dark } },
          },
          {
            props: { variant: 'outlined' },
            style: { borderColor: p.divider, '&:hover': { backgroundColor: alpha(p.yellow.main, 0.06) } },
          },
        ],
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
            border: `1px solid ${p.divider}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          outlined: {
            borderColor: p.divider,
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
            borderRight: `1px solid ${p.divider}`,
            backgroundColor: p.paper,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
            backgroundColor: mode === 'dark' ? p.paper : p.yellow.main,
            color: mode === 'dark' ? p.slate.main : p.yellow.contrast,
            borderBottom: `2px solid ${p.yellow.main}`,
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
            color: p.gray.dark,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            bgcolor: p.background,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': { bgcolor: alpha(p.blue.main, 0.03) },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              bgcolor: alpha(p.yellow.main, 0.16),
              color: p.slate.main,
              '& .MuiListItemIcon-root': { color: p.blue.main },
              '&:hover': { bgcolor: alpha(p.yellow.main, 0.24) },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: { color: p.gray.dark },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': { color: p.blue.main, fontWeight: 600 },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: p.yellow.main },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: alpha(p.yellow.main, 0.2),
            '& .MuiLinearProgress-bar': { backgroundColor: p.yellow.main },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: { color: 'inherit' },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: p.background,
            color: p.slate.main,
          },
        },
      },
    },
  };
};

export const getTheme = (mode) => createTheme(getDesignTokens(mode));

export default getTheme('light');
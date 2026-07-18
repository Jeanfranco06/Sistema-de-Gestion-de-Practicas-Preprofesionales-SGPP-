import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Link,
  ThemeProvider, createTheme, CssBaseline, Paper
} from '@mui/material';
import {
  Visibility, VisibilityOff, LockOutlined, AlternateEmailOutlined, ArrowForwardRounded, School
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import { getHomeRoute } from '../../shared/utils/roleRoutes';

// Tema formal e institucional
const formalTheme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#F5C518', // Amarillo institucional UNT
      dark: '#C79A00',
      light: '#FCE87A',
      contrastText: '#1E293B',
    },
    secondary: {
      main: '#1A3A6E', // Azul institucional
      dark: '#0E2142',
      light: '#4A6FA5',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#8E0000',
    },
    success: {
      main: '#2E7D32',
      light: '#66BB6A',
      dark: '#1B5E20',
    }
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: '#cbd5e1',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#94a3b8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1a365d',
              borderWidth: '2px',
            },
            '&.Mui-error fieldset': {
              borderColor: '#ef4444',
            }
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(26, 54, 93, 0.2)',
          }
        }
      }
    },
  }
});

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      navigate(getHomeRoute(user.roles), { replace: true });
    }
  }, [user, navigate]);

  const validateField = (name, value) => {
    let errMsg = '';
    if (name === 'username') {
      if (!value.trim()) {
        errMsg = 'El usuario es requerido';
      } else if (
        value.includes('@') &&
        !value.endsWith('@unitru.edu.pe') &&
        !value.endsWith('@unt.edu.pe')
      ) {
        errMsg = 'Solo se permiten correos institucionales (@unitru.edu.pe o @unt.edu.pe)';
      }
    }
    if (name === 'password') {
      if (!value) errMsg = 'La contraseña es requerida';
    }
    return errMsg;
  };

  const handleBlur = (field) => (e) => {
    const errMsg = validateField(field, e.target.value);
    setFieldErrors(prev => ({ ...prev, [field]: errMsg }));
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, [field]: value }));
    if (fieldErrors[field]) {
      const errMsg = validateField(field, value);
      setFieldErrors(p => ({ ...p, [field]: errMsg }));
    }
    if (error) setError('');
  };

  const validateAll = () => {
    const errors = {
      username: validateField('username', form.username),
      password: validateField('password', form.password)
    };
    if (!errors.username) delete errors.username;
    if (!errors.password) delete errors.password;
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateAll();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const usuario = await login(form.username, form.password);
      const destination = getHomeRoute(usuario.roles);
      navigate(destination, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
      else if (status === 403) setError('Tu cuenta está deshabilitada o bloqueada. Contacta a Secretaría.');
      else if (!err.response) setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      else setError(`El servicio respondió con un error inesperado (${status}). Intenta de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={formalTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex' }}>
        <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>

          {/* Lado Izquierdo: Branding Institucional (Oculto en móviles pequeños) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: { md: 5, lg: 6 },
              flexDirection: 'column',
              bgcolor: 'secondary.main',
              position: 'relative',
              overflow: 'hidden',
              color: 'secondary.contrastText',
              p: 6,
              justifyContent: 'space-between',
            }}
          >
            {/* Patrón de fondo sutil */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.05,
                background: 'radial-gradient(circle at 100% 100%, #ffffff 0%, transparent 50%), radial-gradient(circle at 0% 0%, #ffffff 0%, transparent 50%)',
                zIndex: 1,
              }}
            />

            <MotionBox
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              sx={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: 2, display: 'flex' }}>
                <School sx={{ color: 'primary.contrastText', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="700" letterSpacing={1}>UNT</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Universidad Nacional de Trujillo</Typography>
              </Box>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              sx={{ zIndex: 2, maxWidth: 500 }}
            >
              <Typography variant="h3" fontWeight="800" sx={{ mb: 3, lineHeight: 1.2 }}>
                Sistema de Gestión de Prácticas Preprofesionales
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, lineHeight: 1.5 }}>
                Plataforma institucional para el control, seguimiento y evaluación de las prácticas de la Escuela de Ingeniería Industrial.
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              sx={{ zIndex: 2 }}
            >
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                © {new Date().getFullYear()} Facultad de Ingeniería. Todos los derechos reservados.
              </Typography>
            </MotionBox>
          </Box>

          {/* Lado Derecho: Formulario de Login */}
          <Box
            sx={{
              display: 'flex',
              flex: { xs: 12, md: 7, lg: 6 },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
              p: { xs: 3, sm: 6, lg: 8 },
            }}
          >
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              elevation={0}
              sx={{
                width: '100%',
                maxWidth: 480,
                p: { xs: 4, sm: 6 },
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
              }}
            >
              <Box sx={{ mb: 5, textAlign: 'center' }}>
                <motion.img
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src="/logo.png"
                  alt="Escudo UNT"
                  style={{ height: 90, marginBottom: 24, objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                <Typography variant="h4" fontWeight="800" color="secondary.main" gutterBottom>
                  Iniciar Sesión
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Ingresa con tus credenciales institucionales
                </Typography>
              </Box>

              <AnimatePresence>
                {error && (
                  <MotionBox
                    initial={{ opacity: 0, height: 0, mb: 0 }}
                    animate={{ opacity: 1, height: 'auto', mb: 24 }}
                    exit={{ opacity: 0, height: 0, mb: 0 }}
                  >
                    <Alert
                      severity="error"
                      variant="outlined"
                      sx={{ borderRadius: 2, bgcolor: 'error.50', '& .MuiAlert-icon': { mt: 0.5 } }}
                    >
                      {error}
                    </Alert>
                  </MotionBox>
                )}
              </AnimatePresence>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <MotionBox initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <TextField
                    fullWidth
                    label="Usuario o correo"
                    placeholder="usuario@unitru.edu.pe"
                    value={form.username}
                    onChange={handleChange('username')}
                    onBlur={handleBlur('username')}
                    error={!!fieldErrors.username}
                    helperText={fieldErrors.username}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AlternateEmailOutlined sx={{ color: fieldErrors.username ? 'error.main' : 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ mb: 3 }}
                    autoComplete="username"
                  />
                </MotionBox>

                <MotionBox initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: fieldErrors.password ? 'error.main' : 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" sx={{ color: 'text.secondary' }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ mb: 2 }}
                    autoComplete="current-password"
                  />
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}
                >
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    underline="hover"
                    sx={{ color: 'secondary.main', fontWeight: 600 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </MotionBox>

                <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    endIcon={!loading && <ArrowForwardRounded />}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Acceder al Sistema'}
                  </Button>
                </MotionBox>
              </Box>

              <Box sx={{ mt: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Problemas para ingresar?{' '}
                  <Link href="#" underline="hover" color="secondary.main" fontWeight="600">
                    Contacta a Soporte
                  </Link>
                </Typography>
              </Box>
            </MotionPaper>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}



import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Divider,
} from '@mui/material';
import {
  Visibility, VisibilityOff, School, LockOutlined, AccountCircleOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { getHomeRoute, hasAnyRole } from '../../shared/utils/roleRoutes';

function canAccessRoute(pathname, roles = []) {
  if (!pathname || pathname === '/login' || pathname === '/no-autorizado') {
    return false;
  }

  const hasRole = (role) => hasAnyRole(roles, [role]);

  if (pathname.startsWith('/estudiante/')) return hasRole('ESTUDIANTE');
  if (pathname.startsWith('/docente/')) return hasRole('DOCENTE_ASESOR');
  if (pathname.startsWith('/tutor/')) return hasRole('TUTOR_EXTERNO');
  if (pathname.startsWith('/admin/usuarios')) return hasRole('ADMIN_SISTEMA');
  if (pathname.startsWith('/coordinacion/')) {
    return ['COORDINADOR', 'DIRECTOR', 'ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS']
      .some(hasRole);
  }
  if (pathname.startsWith('/comite/')) {
    return ['COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR'].some(hasRole);
  }
  if (pathname.startsWith('/secretaria/')) {
    return ['SECRETARIA', 'ADMINISTRADOR', 'ADMIN_SISTEMA'].some(hasRole);
  }
  if (pathname.startsWith('/admin/')) {
    return ['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']
      .some(hasRole);
  }
  if (pathname === '/perfil') return true;

  return false;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) {
      errors.username = 'El usuario es requerido';
    } else if (
      form.username.includes('@') &&
      !form.username.endsWith('@unitru.edu.pe') &&
      !form.username.endsWith('@unt.edu.pe')
    ) {
      errors.username = 'Solo se permiten correos institucionales (@unitru.edu.pe o @unt.edu.pe)';
    }
    if (!form.password) errors.password = 'La contraseña es requerida';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setError('');
    setLoading(true);
    try {
      const usuario = await login(form.username, form.password);
      const from = location.state?.from?.pathname;
      const destination = canAccessRoute(from, usuario.roles) ? from : getHomeRoute(usuario.roles);
      navigate(destination, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError('Usuario o contraseña incorrectos.');
      else if (status === 403) setError('Tu cuenta está deshabilitada o bloqueada. Contacta a Secretaría.');
      else setError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: '' }));
    if (error) setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2238 0%, #1a3a5c 50%, #2e5f8a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Logo / Cabecera institucional */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box
          sx={{
            width: 70, height: 70, borderRadius: '50%', bgcolor: 'secondary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5,
          }}
        >
          <School sx={{ fontSize: 38, color: '#fff' }} />
        </Box>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
          SGPP – UNT
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
          Sistema de Gestión de Prácticas Preprofesionales
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
          Escuela de Ingeniería Industrial
        </Typography>
      </Box>

      {/* Card de login */}
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: 'primary.main' }}>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tus credenciales institucionales
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Usuario o correo institucional"
              placeholder="usuario o correo@unitru.edu.pe"
              value={form.username}
              onChange={handleChange('username')}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username || 'Solo cuentas @unitru.edu.pe o @unt.edu.pe'}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleOutlined color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
              autoComplete="username"
              autoFocus
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange('password')}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 3 }}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar al sistema'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            ¿Problemas para ingresar? Contacta a{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Secretaría Académica
            </Box>
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 3 }}>
        © 2025 Universidad Nacional de Trujillo · Ingeniería Industrial
      </Typography>
    </Box>
  );
}

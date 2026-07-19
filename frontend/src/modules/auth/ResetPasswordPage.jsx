import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Link,
} from '@mui/material';
import { School, LockOutlined, Visibility, VisibilityOff, DarkMode, LightMode } from '@mui/icons-material';
import { resetPassword, validateResetToken } from '../../api/authService';
import { useThemeContext } from '../../shared/theme/ThemeContext';

export default function ResetPasswordPage() {
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError('No se encontró el token de recuperación. Verifica el enlace.');
      setValidating(false);
      return;
    }
    validateResetToken(token)
      .then(({ data }) => {
        if (data.valido) {
          setTokenValido(true);
        } else {
          setTokenError(data.message || 'El token es inválido o ha expirado.');
        }
      })
      .catch(() => {
        setTokenError('Error al validar el token. Intenta de nuevo.');
      })
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError('La nueva contraseña es requerida'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess('Contraseña restablecida exitosamente. Serás redirigido al inicio de sesión.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      if (!err.response) {
        setError('No se pudo conectar con el servidor.');
      } else {
        setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (validating) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Validando token...</Typography>
        </Box>
      );
    }

    if (tokenError) {
      return (
        <>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{tokenError}</Alert>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/forgot-password" underline="hover" color="primary.main" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              Solicitar nuevo enlace de recuperación
            </Link>
          </Box>
        </>
      );
    }

    return (
      <>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

        {!success && (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Nueva contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><LockOutlined color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
              autoComplete="new-password"
              autoFocus
            />
            <TextField
              fullWidth
              label="Confirmar contraseña"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><LockOutlined color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((p) => !p)} edge="end">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 3 }}
              autoComplete="new-password"
            />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5, fontSize: '1rem' }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Restablecer contraseña'}
            </Button>
          </Box>
        )}
      </>
    );
  };

  const bgGradient = mode === 'dark'
    ? 'linear-gradient(160deg, #0f172a 0%, #1e293b 45%, #0f172a 100%)'
    : 'linear-gradient(160deg, #eff6ff 0%, #f8fafc 45%, #f0fdfa 100%)';

  return (
    <Box sx={{ minHeight: '100vh', background: bgGradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <IconButton
        onClick={toggleTheme}
        aria-label={mode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          color: 'secondary.main',
          zIndex: 10,
        }}
      >
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}>
          <School sx={{ fontSize: 32, color: '#fff' }} />
        </Box>
        <Typography sx={{ fontWeight: 600 }} variant="h5" color="primary.dark">SGPP – UNT</Typography>
        <Typography variant="body2" color="text.secondary">Sistema de Gestión de Prácticas Preprofesionales</Typography>
      </Box>

      <Card variant="outlined" sx={{ width: '100%', maxWidth: 420, borderRadius: 2, borderTop: '4px solid', borderTopColor: 'primary.main' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
            {tokenValido ? 'Restablecer contraseña' : 'Token inválido'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {tokenValido
              ? 'Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.'
              : 'El enlace de recuperación no es válido o ha expirado.'}
          </Typography>

          {renderContent()}
        </CardContent>
      </Card>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
        © 2025 Universidad Nacional de Trujillo · Ingeniería Industrial
      </Typography>
    </Box>
  );
}
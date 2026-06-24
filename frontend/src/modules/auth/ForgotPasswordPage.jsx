import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, Alert, CircularProgress, Link,
} from '@mui/material';
import { School, EmailOutlined, ArrowBack } from '@mui/icons-material';
import { forgotPassword } from '../../api/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('El correo electrónico es requerido'); return; }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await forgotPassword(email);
      if (data.resetToken) {
        setSuccess(`Se ha generado un token de recuperación. En producción se enviaría un correo.\n\nToken: ${data.resetToken}\n\nGuárdalo para usarlo en el siguiente paso.`);
      } else {
        setSuccess(data.message || 'Revisa tu correo electrónico para continuar con el proceso.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No se encontró ninguna cuenta con ese correo electrónico.');
      } else if (!err.response) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté en marcha.');
      } else {
        setError(err.response?.data?.message || 'Error al procesar la solicitud. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(160deg, #eff6ff 0%, #f8fafc 45%, #f0fdfa 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}>
          <School sx={{ fontSize: 32, color: '#fff' }} />
        </Box>
        <Typography variant="h5" fontWeight={600} color="primary.dark">SGPP – UNT</Typography>
        <Typography variant="body2" color="text.secondary">Sistema de Gestión de Prácticas Preprofesionales</Typography>
      </Box>

      <Card variant="outlined" sx={{ width: '100%', maxWidth: 420, borderRadius: 2, borderTop: '4px solid', borderTopColor: 'primary.main' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>Recuperar contraseña</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2, whiteSpace: 'pre-line' }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Correo electrónico institucional"
              placeholder="correo@unitru.edu.pe"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); if (success) setSuccess(''); }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><EmailOutlined color="action" /></InputAdornment>,
                },
              }}
              sx={{ mb: 3 }}
              autoComplete="email"
              autoFocus
            />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5, fontSize: '1rem' }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar enlace de recuperación'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link component={RouterLink} to="/login" underline="hover" color="primary.main" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <ArrowBack fontSize="small" /> Volver al inicio de sesión
            </Link>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
        © 2025 Universidad Nacional de Trujillo · Ingeniería Industrial
      </Typography>
    </Box>
  );
}

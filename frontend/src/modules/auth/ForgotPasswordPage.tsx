import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, Mail, ArrowLeft, Sun, Moon } from 'lucide-react';
import { forgotPassword } from '../../api/authService';
import { useThemeContext } from '../../shared/theme/ThemeContext';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../lib/validations/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function ForgotPasswordPage() {
  const { mode, toggleTheme } = useThemeContext();
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setApiError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await forgotPassword(data.email);
      const responseData = res.data;
      if (responseData.resetToken) {
        setSuccess(`Se ha generado un token de recuperación. En producción se enviaría un correo.\n\nToken: ${responseData.resetToken}\n\nGuárdalo para usarlo en el siguiente paso.`);
      } else {
        setSuccess(responseData.message || 'Revisa tu correo electrónico para continuar con el proceso.');
      }
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      if (response?.status === 404) {
        setApiError('No se encontró ninguna cuenta con ese correo electrónico.');
      } else if (!response) {
        setApiError('No se pudo conectar con el servidor. Verifica que el backend esté en marcha.');
      } else {
        setApiError(response?.data?.message || 'Error al procesar la solicitud. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const bgGradient = mode === 'dark'
    ? 'linear-gradient(160deg, #0f172a 0%, #1e293b 45%, #0f172a 100%)'
    : 'linear-gradient(160deg, #eff6ff 0%, #f8fafc 45%, #f0fdfa 100%)';

  return (
    <div style={{ minHeight: '100vh', background: bgGradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <button
        onClick={toggleTheme}
        aria-label={mode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card)',
          color: 'var(--color-foreground)',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: '1.5rem' }}
      >
        <div style={{ width: 64, height: 64, borderRadius: '0.75rem', backgroundColor: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}>
          <School style={{ width: 32, height: 32, color: 'white' }} />
        </div>
        <h2 style={{ fontWeight: 600, margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-800)' }}>SGPP &ndash; UNT</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>Sistema de Gestión de Prácticas Preprofesionales</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 'var(--radius-2xl)',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderTop: '4px solid var(--color-primary-500)',
          boxShadow: 'var(--shadow-card)',
          padding: '2rem',
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-foreground)' }}>Recuperar contraseña</h3>
        <p style={{ margin: '0.25rem 0 1.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
          Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {apiError && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', fontSize: '0.875rem' }}>
            {apiError}
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#16a34a', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-foreground)', marginBottom: '0.375rem' }}>
              Correo electrónico institucional
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: errors.email ? '#dc2626' : 'var(--color-muted-foreground)', pointerEvents: 'none' }} />
              <input
                {...register('email')}
                placeholder="correo@unitru.edu.pe"
                autoComplete="email"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  borderRadius: 'var(--radius-xl)',
                  border: `1px solid ${errors.email ? 'var(--color-red-500)' : 'var(--color-input)'}`,
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-foreground)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 150ms ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? 'var(--color-red-500)' : 'var(--color-input)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            {errors.email && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-red-600)' }}>{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              backgroundColor: 'var(--color-primary-600)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary-700)'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'; }}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <RouterLink
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-600)', textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Volver al inicio de sesión
          </RouterLink>
        </div>
      </motion.div>

      <p style={{ margin: '1.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
        &copy; 2025 Universidad Nacional de Trujillo &middot; Ingeniería Industrial
      </p>
    </div>
  );
}

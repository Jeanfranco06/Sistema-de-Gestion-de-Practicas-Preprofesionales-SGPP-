import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, Lock, Eye, EyeOff, ArrowLeft, Sun, Moon } from 'lucide-react';
import { resetPassword, validateResetToken } from '../../api/authService';
import { useThemeContext } from '../../shared/theme/ThemeContext';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../lib/validations/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function ResetPasswordPage() {
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!token) {
      setTokenError('No se encontró el token de recuperación. Verifica el enlace.');
      setValidating(false);
      return;
    }
    validateResetToken(token)
      .then(({ data }: { data: { valido?: boolean; message?: string } }) => {
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

  const onSubmit = async (formData: ResetPasswordFormData) => {
    setApiError('');
    setSuccess('');
    setLoading(true);
    try {
      await resetPassword(token!, formData.newPassword);
      setSuccess('Contraseña restablecida exitosamente. Serás redirigido al inicio de sesión.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      if (!response) {
        setApiError('No se pudo conectar con el servidor.');
      } else {
        setApiError(response?.data?.message || 'Error al restablecer la contraseña.');
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
        <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-foreground)' }}>
          {tokenValido ? 'Restablecer contraseña' : 'Token inválido'}
        </h3>
        <p style={{ margin: '0.25rem 0 1.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
          {tokenValido
            ? 'Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'
            : 'El enlace de recuperación no es válido o ha expirado.'}
        </p>

        {validating && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <svg className="animate-spin h-8 w-8" style={{ margin: '0 auto' }} viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>Validando token...</p>
          </div>
        )}

        {!validating && tokenError && (
          <>
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', fontSize: '0.875rem' }}>
              {tokenError}
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <RouterLink
                to="/forgot-password"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-600)', textDecoration: 'none' }}
              >
                Solicitar nuevo enlace de recuperación
              </RouterLink>
            </div>
          </>
        )}

        {!validating && tokenValido && (
          <>
            {apiError && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', fontSize: '0.875rem' }}>
                {apiError}
              </div>
            )}

            {success && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#16a34a', fontSize: '0.875rem' }}>
                {success}
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-foreground)', marginBottom: '0.375rem' }}>
                    Nueva contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: errors.newPassword ? '#dc2626' : 'var(--color-muted-foreground)', pointerEvents: 'none' }} />
                    <input
                      {...register('newPassword')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                        borderRadius: 'var(--radius-xl)',
                        border: `1px solid ${errors.newPassword ? 'var(--color-red-500)' : 'var(--color-input)'}`,
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-foreground)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 150ms ease',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = errors.newPassword ? 'var(--color-red-500)' : 'var(--color-input)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-muted-foreground)',
                        padding: '0.25rem',
                        display: 'flex',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-red-600)' }}>{errors.newPassword.message}</p>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-foreground)', marginBottom: '0.375rem' }}>
                    Confirmar contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: errors.confirmPassword ? '#dc2626' : 'var(--color-muted-foreground)', pointerEvents: 'none' }} />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                        borderRadius: 'var(--radius-xl)',
                        border: `1px solid ${errors.confirmPassword ? 'var(--color-red-500)' : 'var(--color-input)'}`,
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-foreground)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 150ms ease',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = errors.confirmPassword ? 'var(--color-red-500)' : 'var(--color-input)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-muted-foreground)',
                        padding: '0.25rem',
                        display: 'flex',
                      }}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-red-600)' }}>{errors.confirmPassword.message}</p>
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
                  ) : 'Restablecer contraseña'}
                </button>
              </form>
            )}
          </>
        )}
      </motion.div>

      <p style={{ margin: '1.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
        &copy; 2025 Universidad Nacional de Trujillo &middot; Ingeniería Industrial
      </p>
    </div>
  );
}

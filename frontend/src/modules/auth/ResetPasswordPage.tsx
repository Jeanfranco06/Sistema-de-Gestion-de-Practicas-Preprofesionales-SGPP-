import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { resetPassword, validateResetToken } from '../../api/authService';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../lib/validations/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card, CardContent } from '../../ui/Card';
import AuthLayout from './components/AuthLayout';

export default function ResetPasswordPage() {
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

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
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

  const title = tokenValido ? 'Restablecer contraseña' : 'Token inválido';
  const subtitle = tokenValido
    ? 'Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'
    : 'El enlace de recuperación no es válido o ha expirado.';

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <Card className="w-full">
        <CardContent className="space-y-6">
          {validating && (
            <div className="text-center py-6">
              <svg className="animate-spin h-8 w-8 mx-auto text-[var(--color-primary-600)]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">Validando token...</p>
            </div>
          )}

          {!validating && tokenError && (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                {tokenError}
              </div>
              <div className="text-center">
                <RouterLink
                  to="/forgot-password"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] rounded"
                >
                  Solicitar nuevo enlace de recuperación
                </RouterLink>
              </div>
            </div>
          )}

          {!validating && tokenValido && (
            <>
              {apiError && (
                <div className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                  {apiError}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
                  {success}
                </div>
              )}

              {!success && (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Input
                      {...register('newPassword')}
                      label="Nueva contraseña"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoFocus
                      error={errors.newPassword?.message}
                      leftIcon={<Lock size={16} />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] rounded"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      {...register('confirmPassword')}
                      label="Confirmar contraseña"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      error={errors.confirmPassword?.message}
                      leftIcon={<Lock size={16} />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowConfirm((p) => !p)}
                          aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] rounded"
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      type="submit"
                      loading={loading}
                      disabled={loading}
                      size="lg"
                      className="w-full"
                    >
                      Restablecer contraseña
                    </Button>
                  </motion.div>
                </form>
              )}
            </>
          )}

          <div className="text-center pt-2">
            <RouterLink
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] rounded"
            >
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </RouterLink>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

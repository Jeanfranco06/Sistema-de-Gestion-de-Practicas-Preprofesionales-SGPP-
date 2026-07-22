import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../../api/authService';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../lib/validations/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card, CardContent } from '../../ui/Card';
import AuthLayout from './components/AuthLayout';

export default function ForgotPasswordPage() {
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

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña."
    >
      <Card className="w-full">
        <CardContent className="space-y-6">
          {apiError && (
            <div className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 whitespace-pre-line">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Input
                {...register('email')}
                label="Correo electrónico institucional"
                type="email"
                placeholder="correo@unitru.edu.pe"
                autoComplete="email"
                autoFocus
                error={errors.email?.message}
                leftIcon={<Mail size={16} />}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                Enviar enlace de recuperación
              </Button>
            </motion.div>
          </form>

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

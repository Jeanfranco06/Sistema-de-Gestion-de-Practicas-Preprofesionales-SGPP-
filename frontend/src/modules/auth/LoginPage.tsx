import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { getHomeRoute } from '../../shared/utils/roleRoutes';
import { loginSchema, type LoginFormData } from '../../lib/validations/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card, CardContent } from '../../ui/Card';
import AuthLayout from './components/AuthLayout';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (user) {
      navigate(getHomeRoute(user.roles), { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setApiError('');
    setLoading(true);
    try {
      const usuario = await login(data.username, data.password);
      const destination = getHomeRoute(usuario.roles);
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      const status = response?.status;
      if (status === 401) setApiError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
      else if (status === 403) setApiError('Tu cuenta está deshabilitada o bloqueada. Contacta a Secretaría.');
      else if (!response) setApiError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      else setApiError(`El servicio respondió con un error inesperado (${status}). Intenta de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Ingresa con tus credenciales institucionales"
    >
      <Card className="w-full">
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="Escudo UNT"
              className="h-20 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-600"
              >
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Input
                {...register('username')}
                label="Usuario"
                placeholder="usuario"
                autoComplete="username"
                error={errors.username?.message}
                leftIcon={<Mail size={16} />}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Input
                {...register('password')}
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end"
            >
              <RouterLink
                to="/forgot-password"
                className="text-sm font-semibold text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] rounded"
              >
                ¿Olvidaste tu contraseña?
              </RouterLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {!loading && <ArrowRight size={18} />}
                Acceder al Sistema
              </Button>
            </motion.div>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              ¿Problemas para ingresar?{' '}
              <a
                href="#"
                className="font-semibold text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] rounded"
              >
                Contacta a Soporte
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

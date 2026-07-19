import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ArrowRight, Eye, EyeOff, Mail, Lock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useThemeContext } from '../../shared/theme/ThemeContext';
import { getHomeRoute } from '../../shared/utils/roleRoutes';
import { loginSchema, type LoginFormData } from '../../lib/validations/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeContext();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm<LoginFormData>({
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
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <div style={{ display: 'flex', width: '100%', flexGrow: 1 }}>
        {/* Left: Branding */}
        <div
          style={{
            display: 'none',
            flex: 6,
            flexDirection: 'column',
            background: 'linear-gradient(135deg, var(--color-blue-900), var(--color-blue-700))',
            position: 'relative',
            overflow: 'hidden',
            padding: '3rem',
            justifyContent: 'space-between',
          }}
          className="md:flex"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <div style={{ background: 'var(--color-amber-500)', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex' }}>
              <School style={{ color: '#1e293b', width: 32, height: 32 }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, letterSpacing: 1, color: 'white', margin: 0, fontSize: '1.125rem' }}>UNT</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Universidad Nacional de Trujillo</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ zIndex: 2, maxWidth: 500 }}
          >
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem', lineHeight: 1.2 }}>
              Sistema de Gestión de Prácticas Preprofesionales
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', fontWeight: 400, lineHeight: 1.5, margin: 0 }}>
              Plataforma institucional para el control, seguimiento y evaluación de las prácticas de la Escuela de Ingeniería Industrial.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ zIndex: 2 }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
              &copy; {new Date().getFullYear()} Facultad de Ingeniería. Todos los derechos reservados.
            </p>
          </motion.div>
        </div>

        {/* Right: Login Form */}
        <div
          style={{
            flex: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-background)',
            padding: '2rem',
          }}
        >
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: 440,
              padding: '2.5rem',
              borderRadius: 'var(--radius-2xl)',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <img
                src="/logo.png"
                alt="Escudo UNT"
                style={{ height: 80, marginBottom: '1.25rem', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: 0, color: 'var(--color-foreground)' }}>
                Iniciar Sesión
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                Ingresa con tus credenciales institucionales
              </p>
            </div>

            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginBottom: '1.5rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#dc2626',
                    fontSize: '0.875rem',
                  }}
                >
                  {apiError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-foreground)', marginBottom: '0.375rem' }}>
                    Usuario o correo
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: errors.username ? '#dc2626' : 'var(--color-muted-foreground)', pointerEvents: 'none' }} />
                    <input
                      {...register('username')}
                      placeholder="usuario@unitru.edu.pe"
                      autoComplete="username"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        borderRadius: 'var(--radius-xl)',
                        border: `1px solid ${errors.username ? 'var(--color-red-500)' : 'var(--color-input)'}`,
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-foreground)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 150ms ease',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = errors.username ? 'var(--color-red-500)' : 'var(--color-input)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.username && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-red-600)' }}>{errors.username.message}</p>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-foreground)', marginBottom: '0.375rem' }}>
                    Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#dc2626' : 'var(--color-muted-foreground)', pointerEvents: 'none' }} />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                        borderRadius: 'var(--radius-xl)',
                        border: `1px solid ${errors.password ? 'var(--color-red-500)' : 'var(--color-input)'}`,
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-foreground)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 150ms ease',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? 'var(--color-red-500)' : 'var(--color-input)'; e.currentTarget.style.boxShadow = 'none'; }}
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
                  {errors.password && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-red-600)' }}>{errors.password.message}</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}
              >
                <RouterLink
                  to="/forgot-password"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-600)', textDecoration: 'none' }}
                >
                  ¿Olvidaste tu contraseña?
                </RouterLink>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                  ) : (
                    <>
                      Acceder al Sistema <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                ¿Problemas para ingresar?{' '}
                <a href="#" style={{ fontWeight: 600, color: 'var(--color-primary-600)', textDecoration: 'none' }}>
                  Contacta a Soporte
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

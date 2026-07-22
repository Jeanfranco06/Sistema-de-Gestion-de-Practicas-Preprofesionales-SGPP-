import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { School, Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../../../shared/theme/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <div className="min-h-screen w-full flex">
      {/* Welcome panel */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between overflow-hidden p-12 text-white bg-gradient-to-br from-[var(--color-unt-blue-dark)] via-[var(--color-unt-blue)] to-[var(--color-unt-blue-light)]">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-[var(--color-unt-yellow)]/10 blur-3xl" aria-hidden="true" />

        <motion.header
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-unt-yellow)] text-[var(--color-unt-blue-dark)]">
            <School className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-widest uppercase">UNT</p>
            <p className="text-xs text-white/80">Universidad Nacional de Trujillo</p>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative z-10 max-w-lg"
        >
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4 text-balance">
            Sistema de Gestión de Prácticas Preprofesionales
          </h1>
          <p className="text-lg text-white/90 leading-relaxed">
            Plataforma institucional para el control, seguimiento y evaluación de las prácticas de la Escuela de Ingeniería Industrial.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Feature text="Seguimiento de horas" />
            <Feature text="Gestión documental" />
            <Feature text="Evaluación integral" />
            <Feature text="Reportes académicos" />
          </div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="relative z-10 text-sm text-white/60"
        >
          <p>&copy; {new Date().getFullYear()} Facultad de Ingeniería. Todos los derechos reservados.</p>
        </motion.footer>
      </div>

      {/* Form panel */}
      <div className="relative w-full md:w-1/2 min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] p-6 sm:p-10">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={mode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        >
          {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">{title}</h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 backdrop-blur-sm">
      <span className="h-2 w-2 rounded-full bg-[var(--color-unt-yellow)]" aria-hidden="true" />
      <span className="text-sm font-medium text-white/95">{text}</span>
    </div>
  );
}

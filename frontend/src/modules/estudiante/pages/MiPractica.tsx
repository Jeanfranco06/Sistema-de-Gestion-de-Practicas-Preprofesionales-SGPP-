import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMiPractica } from '../../../hooks/usePracticas';
import { useCumplimientoHoras } from '../../../hooks/useHoras';
import { tieneControlHoras } from '../../../shared/utils/controlHoras';
import { Card, CardContent, Badge, Progress, Button, Avatar } from '../../../ui';
import {
  Building2, TrendingUp, RefreshCw, FileText, Clock, FolderOpen,
  GraduationCap, CheckCircle2, ChevronRight, Play, User, ArrowLeft, MapPin,
  Loader2, AlertCircle,
} from 'lucide-react';

interface StatusProps {
  color: string;
  label: string;
  bg: string;
  text: string;
}

const STATUS_MAP: Record<string, StatusProps> = {
  REGISTRADA: { color: 'primary', label: 'Registrada', bg: '#eff6ff', text: '#1e40af' },
  ACEPTADA: { color: 'success', label: 'Aceptada', bg: '#ecfdf5', text: '#065f46' },
  EN_CURSO: { color: 'info', label: 'En Curso', bg: '#e0f2fe', text: '#0c4a6e' },
  FINALIZADA: { color: 'secondary', label: 'Finalizada', bg: '#f0fdfa', text: '#115e59' },
  CANCELADA: { color: 'error', label: 'Cancelada', bg: '#fef2f2', text: '#991b1b' },
};

function getStatusProps(status: string | undefined): StatusProps {
  return STATUS_MAP[status ?? ''] ?? { color: 'default', label: status || 'Desconocido', bg: '#f1f5f9', text: '#475569' };
}

interface DashboardCardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function DashboardCard({ title, action, children, className }: DashboardCardProps) {
  return (
    <Card className={`flex flex-col ${className ?? ''}`}>
      <CardContent className="flex flex-col h-full">
        {(title || action) && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            {title && <h3 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>{title}</h3>}
            {action && <div className="self-start sm:self-center">{action}</div>}
          </div>
        )}
        <div className="flex flex-col flex-grow">{children}</div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4">
      <Loader2 className="h-12 w-12 animate-spin" style={{ color: '#1a365d' }} />
      <p className="font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Cargando información de tu práctica...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 md:py-8 w-full">
      <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
      </div>
    </div>
  );
}

function EmptyState({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 md:py-8 w-full">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="flex justify-center mt-8 md:mt-16">
        <Card className="max-w-lg w-full text-center px-6 py-12 md:px-12 md:py-16"
          style={{
            background: 'linear-gradient(180deg, var(--color-card) 0%, var(--color-muted) 100%)',
          }}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-muted)' }}>
            <FileText className="h-10 w-10" style={{ color: 'var(--color-muted-foreground)' }} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3" style={{ color: 'var(--color-foreground)' }}>
            No tienes una práctica activa
          </h2>
          <p className="text-sm md:text-base leading-relaxed mb-8" style={{ color: 'var(--color-muted-foreground)' }}>
            Para iniciar el control formal de tus prácticas preprofesionales, debes solicitar tu práctica seleccionando una empresa y sede.
          </p>
          <Button size="lg" className="w-full sm:w-auto shadow-lg" onClick={() => onNavigate('/estudiante/solicitar-practica')}>
            <Play className="h-4 w-4" />
            Solicitar Práctica
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}

interface KpiItem {
  label: string;
  val: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function KpiCard({ label, val, icon: Icon, color }: Omit<KpiItem, 'bg'> & { icon: React.ElementType; color: string }) {
  return (
    <Card variant="hover" className="p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex justify-between items-center">
        <span className="text-[0.65rem] uppercase tracking-wider font-bold" style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xl md:text-2xl font-extrabold" style={{ color: 'var(--color-foreground)' }}>{val}</p>
    </Card>
  );
}

export default function MiPractica() {
  const navigate = useNavigate();
  const { data: practica, isLoading, isError, error } = useMiPractica();
  const { data: cumplimiento } = useCumplimientoHoras(
    practica?.idExpediente || practica?.expedienteId
  );

  const hasControlHoras = !!(practica?.idExpediente || practica?.expedienteId) &&
    tieneControlHoras(practica?.estadoExpediente || practica?.estado || '');

  const horasTotales = (hasControlHoras ? cumplimiento?.horasRequeridas : undefined) ?? practica?.horasRequeridas ?? 0;
  const horasEjecutadas = hasControlHoras ? (cumplimiento?.horasValidadas ?? 0) : 0;
  const pct = horasTotales > 0 ? Math.min(100, Math.round((horasEjecutadas / horasTotales) * 100)) : 0;
  const practicaStatus = getStatusProps(practica?.estado);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : 'No se pudo cargar la información de tu práctica.'} />;
  if (!practica) return <EmptyState onNavigate={navigate} />;

  const kpis: KpiItem[] = [
    { label: 'Horas Requeridas', val: `${horasTotales} h`, icon: Clock, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300', bg: '#f0f9ff' },
    { label: 'Estado', val: practicaStatus.label, icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', bg: '#ecfdf5' },
    { label: 'Tipo', val: practica.codigoTipoPractica || 'Práctica', icon: FileText, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', bg: '#f5f3ff' },
    { label: 'Sede', val: practica.nombreSede ? (practica.nombreSede.length > 12 ? practica.nombreSede.slice(0, 12) + '...' : practica.nombreSede) : 'No asignada', icon: GraduationCap, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', bg: '#fffbeb' },
  ];

  const quickActions = [
    { title: 'Mis Documentos', sub: 'Sube y revisa archivos', icon: FolderOpen, action: () => navigate('/estudiante/documentos') },
    { title: 'Registrar Horas', sub: 'Control de horas diarias', icon: Clock, action: () => navigate('/estudiante/horas') },
    { title: 'Mis Evaluaciones', sub: 'Consulta resultados', icon: TrendingUp, action: () => navigate('/estudiante/evaluacion') },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 md:py-8 w-full">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        {/* Header Banner */}
        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl mb-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 gap-6"
          style={{ backgroundColor: '#1a365d' }}
        >
          <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
            <GraduationCap className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
          </div>

          <div className="relative z-10 w-full">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white border border-white/30 rounded-lg hover:bg-white/10"
                onClick={() => navigate('/estudiante/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            </div>
            <p className="text-xs uppercase tracking-widest font-semibold opacity-80 block mb-1">
              Control de Prácticas Preprofesionales
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-2 break-words">
              {practica.nombreTipoPractica || 'Mi Práctica'}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm opacity-90">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> {practica.razonSocialEmpresa || 'Empresa no asignada'}
              </span>
              {practica.nombreSede && (
                <>
                  <span className="hidden sm:inline opacity-40">|</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {practica.nombreSede}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="relative z-10 flex flex-col-reverse sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center h-9 w-9 rounded-lg self-end sm:self-auto"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
              aria-label="Actualizar información"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div
              className="flex items-center justify-center gap-1.5 font-bold whitespace-nowrap px-3 md:px-4 py-2 rounded-lg"
              style={{ backgroundColor: practicaStatus.bg, color: practicaStatus.text }}
            >
              <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: practicaStatus.text }} />
              ESTADO: {practicaStatus.label.toUpperCase()}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {kpis.map((kpi, idx) => (
            <KpiCard key={idx} label={kpi.label} val={kpi.val} icon={kpi.icon} color={kpi.color} />
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Detalles de la Práctica */}
          <DashboardCard title="Detalles de la Práctica" className="col-span-1 md:col-span-2 xl:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <div className="p-4 rounded-xl h-full" style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>
                <span className="text-[0.65rem] uppercase tracking-wider font-bold block mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Empresa</span>
                <p className="font-bold text-base" style={{ color: 'var(--color-foreground)' }}>{practica.razonSocialEmpresa || 'Empresa no asignada'}</p>
              </div>
              <div className="p-4 rounded-xl h-full" style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>
                <span className="text-[0.65rem] uppercase tracking-wider font-bold block mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Sede</span>
                <p className="font-bold text-base" style={{ color: 'var(--color-foreground)' }}>{practica.nombreSede || 'Sede no asignada'}</p>
              </div>
              {practica.fechaInicio && (
                <div className="p-4 rounded-xl h-full" style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>
                  <span className="text-[0.65rem] uppercase tracking-wider font-bold block mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Fecha de Inicio</span>
                  <p className="font-bold text-base" style={{ color: 'var(--color-foreground)' }}>{new Date(practica.fechaInicio).toLocaleDateString()}</p>
                </div>
              )}
              {practica.fechaFin && (
                <div className="p-4 rounded-xl h-full" style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>
                  <span className="text-[0.65rem] uppercase tracking-wider font-bold block mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Fecha de Fin</span>
                  <p className="font-bold text-base" style={{ color: 'var(--color-foreground)' }}>{new Date(practica.fechaFin).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Control de Horas */}
          <DashboardCard title="Control de Horas">
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-3xl md:text-4xl font-extrabold leading-none" style={{ color: 'var(--color-foreground)' }}>
                    {pct}%
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                    Avance verificado
                  </p>
                </div>
                <Badge variant={pct >= 100 ? 'success' : 'default'}>
                  {pct >= 100 ? 'Completado' : 'En proceso'}
                </Badge>
              </div>

              <Progress value={pct} size="lg" />

              <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div>
                  <span className="text-[0.65rem] uppercase font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Ejecutadas</span>
                  <p className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>{horasEjecutadas} h</p>
                </div>
                <div className="text-right">
                  <span className="text-[0.65rem] uppercase font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Pendientes</span>
                  <p className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>{horasTotales - horasEjecutadas} h</p>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Gestión Rápida */}
          <DashboardCard title="Gestión Rápida">
            <div className="flex flex-col gap-3 mt-1">
              {quickActions.map((btn, i) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={i}
                    onClick={btn.action}
                    className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl border transition-all group"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-foreground)',
                    }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden text-left">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-muted)' }}>
                        <Icon className="h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
                      </span>
                      <div className="overflow-hidden">
                        <span className="block text-sm font-bold truncate" style={{ color: 'var(--color-foreground)' }}>{btn.title}</span>
                        <span className="block text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>{btn.sub}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} />
                  </button>
                );
              })}
            </div>
          </DashboardCard>

          {/* Equipo de Tutores */}
          {(practica.nombreTutorAcademico || practica.nombreTutorEmpresa) && (
            <DashboardCard title="Equipo de Tutores" className="col-span-1 md:col-span-1 xl:col-span-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {practica.nombreTutorAcademico && (
                  <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: '#1a365d' }}>
                      <User className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[0.65rem] uppercase tracking-wider font-bold block" style={{ color: 'var(--color-muted-foreground)' }}>Tutor Académico</span>
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--color-foreground)' }}>{practica.nombreTutorAcademico}</p>
                    </div>
                  </div>
                )}
                {practica.nombreTutorEmpresa && (
                  <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: '#0d9488' }}>
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[0.65rem] uppercase tracking-wider font-bold block" style={{ color: 'var(--color-muted-foreground)' }}>Tutor Empresarial</span>
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--color-foreground)' }}>{practica.nombreTutorEmpresa}</p>
                    </div>
                  </div>
                )}
              </div>
            </DashboardCard>
          )}
        </div>
      </motion.div>
    </div>
  );
}

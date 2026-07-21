import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMiPractica } from '@/hooks/usePracticas';
import { useMisExpedientes } from '@/hooks/useExpedientes';
import { useCumplimientoHoras } from '@/hooks/useHoras';
import { tieneControlHoras } from '@/shared/utils/controlHoras';
import { Card, CardContent, Badge, Progress, Button, Avatar, type BadgeProps } from '@/ui';
import { cn } from '@/lib/utils';
import {
  Building2, TrendingUp, RefreshCw, FileText, Clock, FolderOpen,
  GraduationCap, CheckCircle2, ChevronRight, Play, User, ArrowLeft, MapPin,
  Loader2, AlertCircle, Award,
} from 'lucide-react';

const STATUS_VARIANT: Record<string, BadgeProps['variant']> = {
  REGISTRADA: 'neutral',
  ACEPTADA: 'success',
  EN_CURSO: 'info',
  FINALIZADA: 'success',
  CANCELADA: 'danger',
};

const STATUS_LABEL: Record<string, string> = {
  REGISTRADA: 'Registrada',
  ACEPTADA: 'Aceptada',
  EN_CURSO: 'En Curso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

function getStatusLabel(status: string | undefined): string {
  return STATUS_LABEL[status ?? ''] || status || 'Desconocido';
}

interface DashboardCardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function DashboardCard({ title, action, children, className }: DashboardCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardContent className="flex flex-col h-full">
        {(title || action) && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            {title && <h3 className="text-lg font-bold text-foreground">{title}</h3>}
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary-600" aria-hidden="true" />
      <p className="font-medium text-muted-foreground">Cargando información de tu práctica...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
      </div>
    </div>
  );
}

function EmptyState({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="flex justify-center mt-8 md:mt-16">
        <Card className="max-w-lg w-full text-center px-6 py-12 md:px-12 md:py-16">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
            <FileText className="h-10 w-10 text-primary-700 dark:text-primary-300" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
            No tienes una práctica activa
          </h2>
          <p className="text-sm md:text-base leading-relaxed mb-8 text-muted-foreground">
            Para iniciar el control formal de tus prácticas preprofesionales, debes solicitar tu práctica seleccionando una empresa y sede.
          </p>
          <Button size="lg" className="w-full sm:w-auto" onClick={() => onNavigate('/estudiante/solicitar-practica')}>
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
}

function KpiCard({ label, val, icon: Icon, color }: KpiItem) {
  return (
    <Card variant="hover" className="p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex justify-between items-center">
        <span className="text-[0.65rem] uppercase tracking-wider font-bold text-muted-foreground">{label}</span>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xl md:text-2xl font-extrabold text-foreground">{val}</p>
    </Card>
  );
}

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  onClick: () => void;
}

function QuickAction({ title, subtitle, icon: Icon, onClick }: QuickActionProps) {
  return (
    <li className="list-none">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary-600/30 dark:hover:border-primary-400/30 transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A3A6E] text-white group-hover:bg-[#4A6FA5] dark:bg-[#4A6FA5] dark:group-hover:bg-[#7A9FD5] transition-colors">
            <Icon className="h-5 w-5" />
          </span>
          <div className="text-left overflow-hidden flex-1">
            <span className="block text-sm font-bold text-foreground truncate">{title}</span>
            <span className="block text-xs text-muted-foreground truncate">{subtitle}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors shrink-0" />
      </button>
    </li>
  );
}

export default function MiPractica() {
  const navigate = useNavigate();
  const { data: practica, isLoading, isError, error } = useMiPractica();
  const { data: expedientes } = useMisExpedientes();
  const { data: cumplimiento } = useCumplimientoHoras(
    practica?.idExpediente || practica?.expedienteId,
  );

  const hasControlHoras = !!(practica?.idExpediente || practica?.expedienteId) &&
    tieneControlHoras(practica?.estadoExpediente || practica?.estado || '');

  const horasTotales = (hasControlHoras ? cumplimiento?.horasRequeridas : undefined) ?? practica?.horasRequeridas ?? 0;
  const horasEjecutadas = hasControlHoras ? (cumplimiento?.horasAcumuladas ?? cumplimiento?.horasValidadas ?? 0) : 0;
  const pct = horasTotales > 0 ? Math.min(100, Math.round((horasEjecutadas / horasTotales) * 100)) : 0;
  const statusKey = practica?.estado ?? '';
  const calificacionFinal = expedientes?.[0]?.calificacionFinal;

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : 'No se pudo cargar la información de tu práctica.'} />;
  if (!practica) return <EmptyState onNavigate={navigate} />;

  const kpis: KpiItem[] = [
    { label: 'Horas Requeridas', val: `${horasTotales} h`, icon: Clock, color: 'bg-[#1A3A6E] text-white dark:bg-[#4A6FA5] dark:text-white' },
    { label: 'Estado', val: getStatusLabel(statusKey), icon: CheckCircle2, color: 'bg-emerald-600 text-white dark:bg-emerald-700 dark:text-white' },
    { label: 'Tipo', val: practica.codigoTipoPractica || 'Práctica', icon: FileText, color: 'bg-primary-600 text-slate-900 dark:bg-primary-700 dark:text-slate-900' },
    { label: 'Sede', val: practica.nombreSede ? (practica.nombreSede.length > 12 ? practica.nombreSede.slice(0, 12) + '...' : practica.nombreSede) : 'No asignada', icon: GraduationCap, color: 'bg-amber-500 text-slate-900 dark:bg-amber-600 dark:text-slate-900' },
    ...(calificacionFinal != null && calificacionFinal !== '' ? [
      { label: 'Calificacion', val: Number(calificacionFinal).toFixed(1), icon: Award, color: 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white' }
    ] : []),
  ];

  const quickActions = [
    { title: 'Mis Documentos', sub: 'Sube y revisa archivos', icon: FolderOpen, action: () => navigate('/estudiante/documentos') },
    { title: 'Registrar Horas', sub: 'Control de horas diarias', icon: Clock, action: () => navigate('/estudiante/horas') },
    { title: 'Mis Evaluaciones', sub: 'Consulta resultados', icon: TrendingUp, action: () => navigate('/estudiante/evaluacion') },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl mb-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 gap-6 bg-gradient-to-br from-primary-700 to-primary-900">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="h-9 w-9 p-0 bg-white/10 hover:bg-white/20 text-white border border-white/20 self-end sm:self-auto"
              aria-label="Actualizar información"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Badge
              variant={STATUS_VARIANT[statusKey] ?? 'neutral'}
              size="md"
              className="flex items-center justify-center gap-1.5 font-bold whitespace-nowrap px-3 md:px-4 py-2 rounded-lg bg-white/15 text-white border border-white/20"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-current" />
              ESTADO: {getStatusLabel(statusKey).toUpperCase()}
            </Badge>
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
              <div className="p-4 rounded-xl h-full bg-muted/50 border border-border">
                <span className="text-[0.65rem] uppercase tracking-wider font-bold block mb-1 text-muted-foreground">Empresa</span>
                <p className="font-bold text-base text-foreground">{practica.razonSocialEmpresa || 'Empresa no asignada'}</p>
              </div>
              <div className="p-4 rounded-xl h-full bg-muted/50 border border-border">
                <span className="text-[0.65rem] uppercase tracking-wider font-bold block mb-1 text-muted-foreground">Sede</span>
                <p className="font-bold text-base text-foreground">{practica.nombreSede || 'Sede no asignada'}</p>
              </div>
              {practica.fechaInicio && (
                <div className="p-4 rounded-xl h-full bg-muted/50 border border-border">
                  <span className="text-[0.65rem] uppercase tracking-wider font-bold block mb-1 text-muted-foreground">Fecha de Inicio</span>
                  <p className="font-bold text-base text-foreground">{new Date(practica.fechaInicio).toLocaleDateString()}</p>
                </div>
              )}
              {practica.fechaFin && (
                <div className="p-4 rounded-xl h-full bg-muted/50 border border-border">
                  <span className="text-[0.65rem] uppercase tracking-wider font-bold block mb-1 text-muted-foreground">Fecha de Fin</span>
                  <p className="font-bold text-base text-foreground">{new Date(practica.fechaFin).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Control de Horas */}
          <DashboardCard title="Control de Horas">
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-3xl md:text-4xl font-extrabold leading-none text-foreground">
                    {pct}%
                  </p>
                  <p className="text-xs font-medium mt-1 text-muted-foreground">
                    Avance verificado
                  </p>
                </div>
                <Badge variant={pct >= 100 ? 'success' : 'default'}>
                  {pct >= 100 ? 'Completado' : 'En proceso'}
                </Badge>
              </div>

              <Progress value={pct} size="lg" />

              <div className="flex justify-between mt-4 pt-4 border-t border-border">
                <div>
                  <span className="text-[0.65rem] uppercase font-semibold text-muted-foreground">Ejecutadas</span>
                  <p className="text-base font-bold text-foreground">{horasEjecutadas} h</p>
                </div>
                <div className="text-right">
                  <span className="text-[0.65rem] uppercase font-semibold text-muted-foreground">Pendientes</span>
                  <p className="text-base font-bold text-foreground">{horasTotales - horasEjecutadas} h</p>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Gestión Rápida */}
          <DashboardCard title="Gestión Rápida">
            <ul className="flex flex-col gap-3 mt-1">
              {quickActions.map((btn) => (
                <QuickAction
                  key={btn.title}
                  title={btn.title}
                  subtitle={btn.sub}
                  icon={btn.icon}
                  onClick={btn.action}
                />
              ))}
            </ul>
          </DashboardCard>

          {/* Equipo de Tutores */}
          {(practica.nombreTutorAcademico || practica.nombreTutorEmpresa) && (
            <DashboardCard title="Equipo de Tutores" className="col-span-1 md:col-span-1 xl:col-span-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {practica.nombreTutorAcademico && (
                  <div className="p-4 rounded-xl flex items-center gap-3 bg-muted/50 border border-border">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white bg-[#1A3A6E] dark:bg-[#4A6FA5]">
                      <User className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[0.65rem] uppercase tracking-wider font-bold block text-muted-foreground">Tutor Académico</span>
                      <p className="font-bold text-sm truncate text-foreground">{practica.nombreTutorAcademico}</p>
                    </div>
                  </div>
                )}
                {practica.nombreTutorEmpresa && (
                  <div className="p-4 rounded-xl flex items-center gap-3 bg-muted/50 border border-border">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white bg-emerald-600 dark:bg-emerald-700">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[0.65rem] uppercase tracking-wider font-bold block text-muted-foreground">Tutor Empresarial</span>
                      <p className="font-bold text-sm truncate text-foreground">{practica.nombreTutorEmpresa}</p>
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

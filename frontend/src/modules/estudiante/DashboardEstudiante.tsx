import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useExpediente, useCumplimiento } from '../../hooks/useDashboardData';
import { Card, CardContent, Badge, Progress, Button, Skeleton, Avatar } from '../../ui';
import { cn } from '../../lib/utils';
import {
  FileText, Building2, TrendingUp, RefreshCw, Info,
  ClipboardList, Clock, FolderOpen, GraduationCap, CheckCircle2,
  ChevronRight, Play, User, ArrowRight,
} from 'lucide-react';

const STATUS_MAP = {
  APROBADO: { variant: 'success', label: 'Aprobado' },
  PENDIENTE: { variant: 'neutral', label: 'Pendiente' },
  OBSERVADO: { variant: 'danger', label: 'Observado' },
  EN_REVISION: { variant: 'info', label: 'En Revisión' },
  CERRADO: { variant: 'neutral', label: 'Cerrado' },
  EN_EJECUCION: { variant: 'default', label: 'En Ejecución' },
} as const;

const DOC_LABELS: Record<string, string> = {
  CARTA_PRESENTACION: 'Carta de Presentación',
  CARTA_ACEPTACION: 'Carta de Aceptación',
  PLAN_PRACTICA: 'Plan de Prácticas',
  INFORME_PARCIAL_1: 'Informe Parcial Semana 5',
  INFORME_PARCIAL_2: 'Informe Parcial Semana 10',
  INFORME_FINAL_INICIAL: 'Informe Final Semana 15',
  INFORME_FINAL: 'Informe Final',
  FICHA_EVALUACION: 'Ficha de Evaluación',
  CONSTANCIA_EMPRESA: 'Constancia de Prácticas',
};

const DOCS_INICIAL = [
  'CARTA_PRESENTACION', 'CARTA_ACEPTACION', 'PLAN_PRACTICA',
  'INFORME_PARCIAL_1', 'INFORME_PARCIAL_2', 'INFORME_FINAL_INICIAL',
  'FICHA_EVALUACION', 'CONSTANCIA_EMPRESA',
];

const DOCS_AVANZADA = [
  'CARTA_PRESENTACION', 'CARTA_ACEPTACION', 'PLAN_PRACTICA',
  'INFORME_FINAL', 'FICHA_EVALUACION', 'CONSTANCIA_EMPRESA',
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-48 w-full rounded-2xl" variant="rectangular" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" variant="rectangular" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" variant="rectangular" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 animate-in">
      <Card className="max-w-xl w-full text-center px-6 py-12 md:px-12 md:py-16">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-border">
          <FolderOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
          Bienvenido al SGPP
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-8 text-sm md:text-base">
          Aún no tienes un expediente registrado. Para iniciar el control formal
          de tus prácticas preprofesionales en la Facultad de Ingeniería, debes
          aperturar tu trámite.
        </p>
        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => navigate('/estudiante/expedientes/nuevo')}
        >
          <Play className="h-4 w-4" />
          Aperturar Nuevo Expediente
        </Button>
      </Card>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

function KpiCard({ label, value, icon: Icon, color }: KpiCardProps) {
  return (
    <Card variant="hover" className="p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex justify-between items-center">
        <span className="text-[0.65rem] uppercase tracking-wider font-bold text-muted-foreground">{label}</span>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xl md:text-2xl font-extrabold text-foreground">{value}</p>
    </Card>
  );
}

interface DocItemProps {
  label: string;
  isReady: boolean;
  onClick?: () => void;
}

function DocItem({ label, isReady, onClick }: DocItemProps) {
  return (
    <li className="group">
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-sm transition-all duration-150 group',
          isReady
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
            : 'border-border bg-card hover:bg-surface-border hover:border-primary-600/20'
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-150',
            isReady
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40'
              : 'bg-surface-border text-muted-foreground group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'
          )}>
            {isReady ? <CheckCircle2 className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
          </span>
          <span className={cn('truncate', isReady ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
            {label}
          </span>
        </div>
        <Badge variant={isReady ? 'success' : 'neutral'} size="sm" className="shrink-0">
          {isReady ? 'Listo' : 'Pendiente'}
        </Badge>
      </button>
    </li>
  );
}

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  route: string;
  onClick: (route: string) => void;
}

function QuickAction({ title, subtitle, icon: Icon, route, onClick }: QuickActionProps) {
  return (
    <li>
      <button
        onClick={() => onClick(route)}
        className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl border border-border bg-card hover:bg-surface-border hover:border-primary-600/30 transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-border text-primary-700 dark:text-primary-300 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
            <Icon className="h-4 w-4" />
          </span>
          <div className="text-left overflow-hidden">
            <span className="block text-sm font-bold text-foreground truncate">{title}</span>
            <span className="block text-xs text-muted-foreground truncate">{subtitle}</span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-600 transition-colors shrink-0" />
      </button>
    </li>
  );
}

interface TimelineItemProps {
  estado: string;
  fecha: string;
  observacion?: string;
  isCurrent: boolean;
}

function TimelineItem({ estado, fecha, observacion, isCurrent }: TimelineItemProps) {
  return (
    <li className="flex gap-3">
      <span className={cn(
        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[4px]',
        isCurrent
          ? 'bg-primary-700 border-white dark:border-dark-card dark:shadow-[0_0_0_2px_rgba(37,99,235,0.3)]'
          : 'bg-surface-light border-white dark:bg-dark-surface dark:border-dark-card border-border'
      )}>
        {isCurrent && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <div className="pt-0.5 flex-1 min-w-0">
        <p className={cn('text-sm', isCurrent ? 'font-bold text-primary-700 dark:text-primary-300' : 'font-semibold text-foreground')}>
          {estado.replace(/_/g, ' ')}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" /> {fecha}
        </p>
        {observacion && (
          <div className="mt-2 px-3 py-2 bg-surface-light dark:bg-dark-surface rounded-lg border-l-3 border-border">
            <p className="text-xs text-foreground leading-relaxed font-medium">{observacion}</p>
          </div>
        )}
      </div>
    </li>
  );
}

export default function DashboardEstudiante() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: expediente, isLoading: expLoading, isError: expError, refetch: refetchExpediente } = useExpediente();
  const { data: horasData, isLoading: horasLoading } = useCumplimiento(expediente ?? undefined);
  const loading = expLoading || (expediente && horasLoading);

  if (loading) return <DashboardSkeleton />;
  if (expError) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <Info className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Error al cargar el dashboard</h3>
        <p className="text-muted-foreground mb-4">No se pudo obtener la información del expediente.</p>
        <Button variant="primary" onClick={() => refetchExpediente()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }
  if (!expediente) return <EmptyState />;

  const horas = horasData || { horasRequeridas: expediente.codigoTipoPractica === 'INICIAL' ? 64 : 360, horasValidadas: 0 };
  const horasTotales = horas.horasRequeridas;
  const horasEjecutadas = horas.horasValidadas;
  const pct = Math.min(100, Math.round((horasEjecutadas / horasTotales) * 100));

  const docsObligatorios = expediente.codigoTipoPractica === 'INICIAL' ? DOCS_INICIAL : DOCS_AVANZADA;
  const docsSubidos = expediente.documentos?.map((d) => d.tipoDocumento) || [];
  const docsAprobados = docsObligatorios.filter((d) => docsSubidos.includes(d)).length;

  const obsActivas = expediente.observacionesList?.filter((o) => !o.subsanado) || [];
  const statusInfo = STATUS_MAP[expediente.estado as keyof typeof STATUS_MAP] || { variant: 'neutral', label: expediente.estado };

  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      {/* ── Header Banner ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-unt-blue text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <GraduationCap className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>

        <div className="relative z-10 w-full">
          <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">
            Panel de Control del Estudiante
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-2">
            Hola, {user?.nombres?.split(' ')[0]}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm opacity-90">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> {expediente.nombreEmpresa || 'Empresa no asignada'}
            </span>
            <span className="hidden sm:inline opacity-40">|</span>
            <span className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" /> Modalidad: {expediente.nombreTipoPractica}
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
          <Button variant="ghost" size="sm" className="h-9 w-9" onClick={() => navigate('/estudiante/perfil')} aria-label="Actualizar Perfil Académico">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9" onClick={() => refetchExpediente()} aria-label="Sincronizar Datos">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Badge variant={statusInfo.variant} className="bg-white/15 text-white border border-white/20 px-3 py-1.5 text-xs font-bold whitespace-nowrap gap-1.5 flex items-center">
            <span className="h-2 w-2 rounded-full bg-current inline-block" />
            ESTADO: {statusInfo.label.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* ── Observaciones alert ──────────────────────────────── */}
      {obsActivas.length > 0 && (
        <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Info className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm text-red-900 dark:text-red-200">Trámite detenido temporalmente</p>
            <p className="text-sm text-red-800 dark:text-red-300">
              Tienes {obsActivas.length} documento(s) con observaciones que requieren tu subsanación inmediata para continuar.
            </p>
          </div>
          <Button variant="danger" size="sm" className="shrink-0" onClick={() => navigate('/estudiante/documentos')}>
            Revisar Observaciones
          </Button>
        </div>
      )}

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Horas Aprobadas"
          value={`${horasEjecutadas} / ${horasTotales}`}
          icon={Clock}
          color="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
        />
        <KpiCard
          label="Requisitos"
          value={`${docsAprobados} / ${docsObligatorios.length}`}
          icon={FileText}
          color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        />
        <KpiCard
          label="Última Actividad"
          value={expediente.fechaActualizacion?.split('T')[0] || 'Reciente'}
          icon={TrendingUp}
          color="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
        />
        <KpiCard
          label="Modalidad"
          value={expediente.nombreTipoPractica || expediente.codigoTipoPractica}
          icon={GraduationCap}
          color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        />
      </div>

      {/* ── Content grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Control de Horas ── */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-bold text-foreground">Control de Horas Oficiales</h3>
            </div>

            <div className="mt-auto flex items-end justify-between mb-3">
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-primary-700 dark:text-primary-300 leading-none">{pct}%</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Avance verificado</p>
              </div>
              <Badge variant={pct >= 100 ? 'success' : 'default'}>
                {pct >= 100 ? 'Completado' : 'En proceso'}
              </Badge>
            </div>

            <Progress value={pct} size="lg" />

            <div className="flex justify-between mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-[0.65rem] uppercase font-semibold text-muted-foreground tracking-wider">Ejecutadas</p>
                <p className="text-base font-bold text-foreground">{horasEjecutadas} h</p>
              </div>
              <div className="text-right">
                <p className="text-[0.65rem] uppercase font-semibold text-muted-foreground tracking-wider">Pendientes</p>
                <p className="text-base font-bold text-foreground">{horasTotales - horasEjecutadas} h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Requisitos Documentarios ── */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                <h3 className="text-base font-bold text-foreground">Requisitos Documentarios</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => navigate('/estudiante/documentos')}>
                Ir a gestión <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <ul className="space-y-2 mt-auto">
              {docsObligatorios.map((docType) => {
                const isReady = docsSubidos.includes(docType);
                return (
                  <DocItem
                    key={docType}
                    label={DOC_LABELS[docType]}
                    isReady={isReady}
                    onClick={() => navigate('/estudiante/documentos')}
                  />
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* ── Gestión Rápida ── */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-bold text-foreground">Gestión Rápida</h3>
            </div>

            <ul className="space-y-3 mt-auto">
              {[
                { title: 'Mis Documentos', sub: 'Sube y revisa oficios', icon: FolderOpen, route: '/estudiante/documentos' },
                { title: 'Datos de Empresa', sub: 'Ver centro de práctica', icon: Building2, route: '/estudiante/sedes' },
                { title: 'Mis Evaluaciones', sub: 'Consulta notas finales', icon: TrendingUp, route: '/estudiante/evaluacion' },
              ].map((item) => (
                <QuickAction
                  key={item.route}
                  title={item.title}
                  subtitle={item.sub}
                  icon={item.icon}
                  route={item.route}
                  onClick={navigate}
                />
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Historial de Movimientos ── */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-bold text-foreground">Historial de Movimientos</h3>
            </div>

            {!expediente.estadoHistorial?.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-surface-light dark:bg-dark-surface rounded-xl mt-auto">
                <Info className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  Aún no se han registrado cambios de estado.
                </p>
              </div>
            ) : (
              <div className="relative ml-2 mt-auto">
                <div className="absolute top-4 bottom-4 left-[13px] w-0.5 bg-border z-0" />
                <ul className="space-y-6 relative z-10">
                  {expediente.estadoHistorial.slice(-4).reverse().map((h, i) => (
                    <TimelineItem
                      key={h.id}
                      estado={h.estadoNuevo || ''}
                      fecha={h.fechaCambio}
                      observacion={h.observacion}
                      isCurrent={i === 0}
                    />
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
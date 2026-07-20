import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useExpediente, useCumplimiento } from '../../hooks/useDashboardData';
import { ESTADOS_EXPEDIENTE } from '../../lib/constants';
import { Card, CardContent, Badge, Progress, Button, Skeleton, Avatar, Separator } from '../../ui';
import { cn } from '../../lib/utils';
import {
  FileText, Building2, TrendingUp, RefreshCw, Info,
  ClipboardList, Clock, FolderOpen, GraduationCap, CheckCircle2,
  ChevronRight, Play, User, ArrowRight, AlertTriangle,
  Award, BookOpen,
} from 'lucide-react';

const STATUS_MAP: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'; label: string }> = {
  UNKNOWN: { variant: 'neutral', label: 'Desconocido' },
  SOLICITADO: { variant: 'neutral', label: 'Solicitud Registrada' },
  EMPRESA_SEDE_ASIGNADA: { variant: 'info', label: 'Empresa Asignada' },
  VALIDADO_SECRETARIA: { variant: 'info', label: 'Validado por Secretaría' },
  CARTA_PRESENTACION_EMITIDA: { variant: 'info', label: 'Carta de Presentación Emitida' },
  CARTA_ACEPTACION_PRESENTADA: { variant: 'info', label: 'Carta de Aceptación Presentada' },
  ASESOR_ASIGNADO: { variant: 'info', label: 'Asesor Asignado' },
  COMITE_ASIGNADO: { variant: 'info', label: 'Comité Asignado' },
  PLAN_PRESENTADO: { variant: 'warning', label: 'Plan Presentado' },
  PLAN_EN_REVISION: { variant: 'info', label: 'Plan en Revisión' },
  PLAN_APROBADO: { variant: 'success', label: 'Plan Aprobado' },
  PLAN_OBSERVADO: { variant: 'danger', label: 'Plan Observado' },
  EN_EJECUCION: { variant: 'info', label: 'En Ejecución' },
  INFORME_PARCIAL_1_PRESENTADO: { variant: 'warning', label: 'Informe Parcial 1 Presentado' },
  INFORME_PARCIAL_2_PRESENTADO: { variant: 'warning', label: 'Informe Parcial 2 Presentado' },
  INFORME_FINAL_PRESENTADO: { variant: 'warning', label: 'Informe Final Presentado' },
  INFORME_FINAL_APROBADO: { variant: 'success', label: 'Informe Final Aprobado' },
  EVALUADO: { variant: 'success', label: 'Evaluado' },
  DICTAMEN_EMITIDO: { variant: 'success', label: 'Dictamen Emitido' },
  CERRADO: { variant: 'neutral', label: 'Expediente Cerrado' },
  CONSTANCIA_EMITIDA: { variant: 'success', label: 'Constancia Emitida' },
} as const;

const DOC_LABELS: Record<string, string> = {
  CARTA_PRESENTACION: 'Carta de Presentación (Institucional)',
  CARTA_ACEPTACION: 'Carta de Aceptación (Empresa)',
  PLAN_PRACTICA: 'Plan de Prácticas (Anexo 1)',
  INFORME_PARCIAL_1: 'Informe Parcial - Semana 5',
  INFORME_PARCIAL_2: 'Informe Parcial - Semana 10',
  INFORME_FINAL_INICIAL: 'Informe Final - Semana 15',
  INFORME_FINAL: 'Informe Final',
  FICHA_EVALUACION: 'Ficha de Evaluación (Anexo 2)',
  CONSTANCIA_EMPRESA: 'Constancia de Prácticas (Empresa)',
  CONSTANCIA_CULMINACION: 'Constancia de Culminación',
  DICTAMEN_FINAL: 'Dictamen Final (Anexo 4)',
};

const DOCS_INICIAL = [
  'CARTA_PRESENTACION', 'CARTA_ACEPTACION', 'PLAN_PRACTICA',
  'INFORME_PARCIAL_1', 'INFORME_PARCIAL_2', 'INFORME_FINAL_INICIAL',
  'CONSTANCIA_EMPRESA',
];

const DOCS_FINAL = [
  'CARTA_PRESENTACION', 'CARTA_ACEPTACION', 'PLAN_PRACTICA',
  'INFORME_FINAL', 'FICHA_EVALUACION', 'CONSTANCIA_EMPRESA',
];

const DOCS_PROFESIONAL = [
  'CARTA_PRESENTACION', 'CARTA_ACEPTACION', 'PLAN_PRACTICA',
  'INFORME_FINAL', 'FICHA_EVALUACION', 'CONSTANCIA_EMPRESA',
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-32 w-full rounded-2xl" variant="rectangular" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" variant="rectangular" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-64 w-full rounded-2xl col-span-2" variant="rectangular" />
        <Skeleton className="h-64 w-full rounded-2xl" variant="rectangular" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" variant="rectangular" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 animate-in">
      <Card className="max-w-2xl w-full text-center px-8 py-16 md:px-16 md:py-20">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
          <GraduationCap className="h-12 w-12 text-primary-700 dark:text-primary-300" />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
          Bienvenido al SGPP
        </h2>
        <p className="text-foreground/70 leading-relaxed mb-8 text-base md:text-lg max-w-lg mx-auto">
          Sistema de Gestión de Prácticas Preprofesionales de la Escuela de Ingeniería Industrial - UNT
        </p>
        <p className="text-foreground/60 leading-relaxed mb-8 text-sm md:text-base">
          Aún no tienes un expediente registrado. Para iniciar el control formal de tus prácticas preprofesionales, debes aperturar tu trámite seleccionando el tipo de práctica correspondiente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => navigate('/estudiante/solicitar-practica')}
          >
            <Play className="h-4 w-4 mr-2" />
            Solicitar Práctica
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => navigate('/estudiante/perfil')}
          >
            <User className="h-4 w-4 mr-2" />
            Mi Perfil Académico
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

function KpiCard({ label, value, icon: Icon, color, trend, trendUp }: KpiCardProps) {
  return (
    <Card variant="hover" className="p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex justify-between items-start">
        <span className="text-[0.65rem] uppercase tracking-wider font-bold text-muted-foreground">{label}</span>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{value}</p>
      {trend && (
        <div className={cn('text-xs font-medium flex items-center gap-1', trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
          <TrendingUp className={cn('h-3 w-3', !trendUp && 'rotate-180')} />
          {trend}
        </div>
      )}
    </Card>
  );
}

interface DocItemProps {
  label: string;
  isReady: boolean;
  onClick?: () => void;
  canUpload?: boolean;
}

function DocItem({ label, isReady, onClick, canUpload }: DocItemProps) {
  return (
    <li className="group list-none">
      <button
        onClick={onClick}
        disabled={!canUpload && !isReady}
        className={cn(
          'w-full flex items-center justify-between gap-2 sm:gap-3 px-2.5 sm:px-3 py-2.5 rounded-lg border text-sm transition-all duration-150 group min-w-0',
          isReady
            ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30'
            : canUpload
              ? 'border-border bg-card hover:bg-muted hover:border-primary-600/50 dark:hover:border-primary-400/50'
              : 'border-border bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden min-w-0">
          <span className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-150',
            isReady
              ? 'bg-emerald-500 text-white dark:bg-emerald-600 dark:text-emerald-100'
              : canUpload
                ? 'bg-[#1A3A6E] text-white group-hover:bg-[#4A6FA5] dark:bg-[#4A6FA5] dark:group-hover:bg-[#7A9FD5]'
                : 'bg-muted text-muted-foreground'
          )}>
            {isReady ? <CheckCircle2 className="h-3.5 w-3.5 text-current" /> : <FileText className="h-3.5 w-3.5 text-current" />}
          </span>
          <span className={cn('truncate min-w-0', isReady ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
            {label}
          </span>
        </div>
        <Badge variant={isReady ? 'success' : canUpload ? 'warning' : 'neutral'} size="sm" className="shrink-0">
          {isReady ? 'Completado' : canUpload ? 'Pendiente' : 'Bloqueado'}
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
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

function QuickAction({ title, subtitle, icon: Icon, route, onClick, badge, badgeVariant = 'neutral' }: QuickActionProps) {
  return (
    <li className="list-none">
      <button
        onClick={() => onClick(route)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary-600/30 dark:hover:border-primary-400/30 transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A3A6E] text-white group-hover:bg-[#4A6FA5] dark:bg-[#4A6FA5] dark:group-hover:bg-[#7A9FD5] transition-colors">
            <Icon className="h-5 w-5 text-current" />
          </span>
          <div className="text-left overflow-hidden flex-1">
            <div className="flex items-center gap-2">
              <span className="block text-sm font-bold text-foreground truncate">{title}</span>
              {badge && (
                <Badge size="sm" variant={badgeVariant} className="shrink-0">{badge}</Badge>
              )}
            </div>
            <span className="block text-xs text-muted-foreground truncate">{subtitle}</span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors shrink-0" />
      </button>
    </li>
  );
}

interface TimelineItemProps {
  estado: string;
  fecha: string;
  observacion?: string;
  isCurrent: boolean;
  isCompleted: boolean;
}

function TimelineItem({ estado, fecha, observacion, isCurrent, isCompleted }: TimelineItemProps) {
  const statusInfo = STATUS_MAP[estado] || { variant: 'neutral' as const, label: estado };

  return (
    <li className="flex gap-3 list-none">
      <span className={cn(
        'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
        isCurrent
          ? 'bg-primary-600 border-primary-200 dark:bg-primary-700 dark:border-primary-400 ring-4 ring-primary-100 dark:ring-primary-900/30'
          : isCompleted
            ? 'bg-emerald-500 border-emerald-200 dark:bg-emerald-600 dark:border-emerald-400'
            : 'bg-muted border-border dark:bg-muted dark:border-border'
      )}>
        {isCompleted && !isCurrent && <CheckCircle2 className="h-4 w-4 text-white" />}
        {isCurrent && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
      </span>
      <div className="pt-1 flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', isCurrent ? 'text-primary-700 dark:text-primary-400' : isCompleted ? 'text-foreground' : 'text-muted-foreground')}>
          {statusInfo.label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" /> {fecha}
        </p>
        {observacion && (
          <div className="mt-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-500/50 dark:border-amber-600/50">
            <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed font-medium">{observacion}</p>
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
          <Info className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Error al cargar el dashboard</h3>
        <p className="text-foreground/70 mb-4">No se pudo obtener la información del expediente.</p>
        <Button variant="primary" onClick={() => refetchExpediente()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }
  if (!expediente) return <EmptyState />;

  const horas = horasData || { horasRequeridas: expediente.codigoTipoPractica === 'INICIAL' ? 64 : 360, horasAcumuladas: 0 };
  const horasTotales = horas.horasRequeridas;
  const horasEjecutadas = horas.horasAcumuladas ?? horas.horasValidadas ?? 0;
  const pct = Math.min(100, Math.round((horasEjecutadas / horasTotales) * 100));

  const docsObligatorios = expediente.codigoTipoPractica === 'INICIAL' ? DOCS_INICIAL : expediente.codigoTipoPractica === 'FINAL' ? DOCS_FINAL : DOCS_PROFESIONAL;
  const docsSubidos = expediente.documentos?.map((d: any) => d.tipoDocumento) || [];
  const docsAprobados = docsObligatorios.filter((d) => docsSubidos.includes(d)).length;

  // Calcular progreso del expediente basado en estado
  const estadosOrden = [
    ESTADOS_EXPEDIENTE.SOLICITADO,
    ESTADOS_EXPEDIENTE.EMPRESA_SEDE_ASIGNADA,
    ESTADOS_EXPEDIENTE.VALIDADO_SECRETARIA,
    ESTADOS_EXPEDIENTE.CARTA_PRESENTACION_EMITIDA,
    ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA,
    expediente.codigoTipoPractica === 'INICIAL' ? ESTADOS_EXPEDIENTE.ASESOR_ASIGNADO : ESTADOS_EXPEDIENTE.COMITE_ASIGNADO,
    ESTADOS_EXPEDIENTE.PLAN_PRESENTADO,
    ESTADOS_EXPEDIENTE.PLAN_APROBADO,
    ESTADOS_EXPEDIENTE.EN_EJECUCION,
    ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO,
    ESTADOS_EXPEDIENTE.EVALUADO,
    ESTADOS_EXPEDIENTE.DICTAMEN_EMITIDO,
    ESTADOS_EXPEDIENTE.CERRADO,
    'CONSTANCIA_EMITIDA',
  ];
  const estadoActualIndex = estadosOrden.indexOf(expediente.estado);
  const progresoExpediente = Math.round((estadoActualIndex / (estadosOrden.length - 1)) * 100);

  const obsActivas = expediente.observacionesList?.filter((o: any) => !o.subsanado) || [];
  const statusKey = expediente.estado as keyof typeof STATUS_MAP;
  const statusInfo = STATUS_MAP[statusKey] ?? STATUS_MAP['UNKNOWN']!;

  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      {/* ── Header Banner ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <GraduationCap className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 md:h-16 md:w-16 border-2 border-white/30 bg-white/20">
              <span className="text-lg md:text-xl font-bold text-white">
                {user?.nombres?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </Avatar>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">
                Panel de Control del Estudiante
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-1">
                Hola, {user?.nombres?.split(' ')[0]}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm opacity-90">
                <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full">
                  <Building2 className="h-3.5 w-3.5" /> {expediente.nombreEmpresa || 'Empresa no asignada'}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full">
                  <ClipboardList className="h-3.5 w-3.5" /> {expediente.nombreTipoPractica}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="ghost" size="sm" className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => navigate('/estudiante/perfil')} aria-label="Perfil">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => refetchExpediente()} aria-label="Actualizar">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Badge variant={statusInfo.variant} className="border border-white/20 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white bg-white/15">
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Observaciones alert ──────────────────────────────── */}
      {obsActivas.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in slide-in-from-top-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-900 dark:text-red-200">Acción Requerida</p>
            <p className="text-sm text-red-800 dark:text-red-300 mt-1">
              Tienes {obsActivas.length} documento(s) con observaciones que requieren tu subsanación inmediata para continuar con el trámite.
            </p>
          </div>
          <Button variant="danger" size="sm" className="shrink-0" onClick={() => navigate('/estudiante/documentos')}>
            Revisar Ahora
          </Button>
        </div>
      )}

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Horas Validadas"
          value={`${horasEjecutadas}h`}
          icon={Clock}
          color="bg-[#1A3A6E] text-white dark:bg-[#4A6FA5] dark:text-white"
          trend={`de ${horasTotales}h requeridas`}
          trendUp={pct >= 50}
        />
        <KpiCard
          label="Documentos"
          value={`${docsAprobados}/${docsObligatorios.length}`}
          icon={FileText}
          color="bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-50"
          trend={`${Math.round((docsAprobados / docsObligatorios.length) * 100)}% completado`}
          trendUp={docsAprobados >= docsObligatorios.length / 2}
        />
        <KpiCard
          label="Progreso"
          value={`${progresoExpediente}%`}
          icon={TrendingUp}
          color="bg-primary-600 text-white dark:bg-primary-700 dark:text-white"
          trend="del expediente"
          trendUp={true}
        />
        <KpiCard
          label="Tipo"
          value={expediente.nombreTipoPractica || expediente.codigoTipoPractica}
          icon={GraduationCap}
          color="bg-primary-600 text-white dark:bg-primary-700 dark:text-white"
        />
      </div>

      {/* ── Content grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Control de Horas ── */}
        <Card className="flex flex-col lg:col-span-2">
          <CardContent className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                <h3 className="text-base font-bold text-foreground">Control de Horas Oficiales</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => navigate('/estudiante/horas')}>
                Registrar Horas <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-[0.65rem] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Ejecutadas</p>
                <p className="text-2xl font-extrabold text-foreground">{horasEjecutadas}h</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-[0.65rem] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Pendientes</p>
                <p className="text-2xl font-extrabold text-foreground">{horasTotales - horasEjecutadas}h</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-[0.65rem] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Requeridas</p>
                <p className="text-2xl font-extrabold text-foreground">{horasTotales}h</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">Avance General</p>
                <Badge variant={pct >= 100 ? 'success' : pct >= 50 ? 'warning' : 'neutral'}>
                  {pct >= 100 ? 'Completado' : pct >= 50 ? 'En progreso' : 'Inicio'}
                </Badge>
              </div>
              <Progress value={pct} size="lg" className="h-3" />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {pct >= 100 ? '¡Has completado las horas requeridas!' : `Faltan ${horasTotales - horasEjecutadas} horas para completar`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Estado del Expediente ── */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary-700 dark:text-primary-400" />
              <h3 className="text-base font-bold text-foreground">Estado del Expediente</h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 bg-[#1A3A6E] dark:bg-[#4A6FA5] text-white">
                <span className="text-3xl font-extrabold">{progresoExpediente}%</span>
              </div>
              <p className="text-sm font-semibold text-foreground text-center mb-1">Progreso del Trámite</p>
              <p className="text-xs text-muted-foreground text-center">{statusInfo.label}</p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Código:</span>
                <span className="font-semibold text-foreground">{expediente.codigoExpediente || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inicio:</span>
                <span className="font-semibold text-foreground">{expediente.fechaCreacion?.split('T')[0] || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Acciones Rápidas ── */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="h-5 w-5 text-primary-700 dark:text-primary-400" />
              <h3 className="text-base font-bold text-foreground">Acciones Rápidas</h3>
            </div>

            <ul className="space-y-2 list-none">
              <QuickAction
                title="Gestión Documental"
                subtitle="Sube y revisa documentos"
                icon={FileText}
                route="/estudiante/documentos"
                onClick={navigate}
                badge={docsAprobados < docsObligatorios.length ? `${docsObligatorios.length - docsAprobados} pendientes` : 'Completado'}
                badgeVariant={docsAprobados < docsObligatorios.length ? 'warning' : 'success'}
              />
              <QuickAction
                title="Plan de Prácticas"
                subtitle="Anexo 1 - Cronograma"
                icon={ClipboardList}
                route="/estudiante/plan-practicas"
                onClick={navigate}
              />
              <QuickAction
                title="Registro de Horas"
                subtitle="Control de asistencia"
                icon={Clock}
                route="/estudiante/horas"
                onClick={navigate}
              />
              <QuickAction
                title="Informes Periódicos"
                subtitle={expediente.codigoTipoPractica === 'INICIAL' ? 'Semanas 5, 10, 15' : 'Informe final'}
                icon={BookOpen}
                route="/estudiante/informes"
                onClick={navigate}
              />
            </ul>
          </CardContent>
        </Card>

        {/* ── Timeline del Expediente ── */}
        <Card className="flex flex-col lg:col-span-2">
          <CardContent className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                <h3 className="text-base font-bold text-foreground">Timeline del Expediente</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => navigate('/estudiante/practica')}>
                Ver detalle <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {!expediente.estadoHistorial?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/50 rounded-xl">
                <Info className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Aún no se han registrado cambios de estado.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Los cambios aparecerán aquí a medida que avance tu trámite.
                </p>
              </div>
            ) : (
              <div className="relative ml-2">
                <div className="absolute top-4 bottom-4 left-[15px] w-0.5 bg-border z-0" />
                <ul className="space-y-5 relative z-10 list-none">
                  {expediente.estadoHistorial.slice(-5).reverse().map((h: any, i: number) => {
                    const isCurrent = i === 0;
                    const isCompleted = i > 0;
                    return (
                      <TimelineItem
                        key={h.id}
                        estado={h.estadoNuevo || ''}
                        fecha={h.fechaCambio}
                        observacion={h.observacion}
                        isCurrent={isCurrent}
                        isCompleted={isCompleted}
                      />
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Requisitos Documentales (Full Width) ── */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <FileText className="h-5 w-5 text-primary-700 dark:text-primary-400 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-foreground">Requisitos Documentales</h3>
              <Badge variant="default" className="ml-0 sm:ml-2">
                {docsAprobados} de {docsObligatorios.length} completados
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-semibold shrink-0 self-end sm:self-auto" onClick={() => navigate('/estudiante/documentos')}>
              Gestionar Documentos <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 list-none">
            {docsObligatorios.map((docType: string) => {
              const isReady = docsSubidos.includes(docType);
              const canUpload =
                (docType === 'CARTA_ACEPTACION' && expediente.estado === ESTADOS_EXPEDIENTE.CARTA_PRESENTACION_EMITIDA) ||
                (docType === 'PLAN_PRACTICA' && (expediente.estado === ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA || expediente.estado === ESTADOS_EXPEDIENTE.ASESOR_ASIGNADO || expediente.estado === ESTADOS_EXPEDIENTE.COMITE_ASIGNADO)) ||
                (docType.startsWith('INFORME') && expediente.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION) ||
                (docType === 'CONSTANCIA_EMPRESA' && expediente.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION) ||
                isReady;

              return (
                <DocItem
                  key={docType}
                  label={DOC_LABELS[docType] || docType}
                  isReady={isReady}
                  onClick={() => navigate('/estudiante/documentos')}
                  canUpload={canUpload}
                />
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

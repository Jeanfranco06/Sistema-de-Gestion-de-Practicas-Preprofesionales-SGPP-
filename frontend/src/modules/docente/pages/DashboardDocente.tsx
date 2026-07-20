import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ListChecks, FileEdit, UserCircle, RefreshCw,
  ChevronRight, CheckCircle2, Clock, GraduationCap, ClipboardList,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useMisExpedientes } from '@/hooks/useExpedientes';
import {
  ESTADOS_EXPEDIENTE,
  ESTADOS_PARA_EVALUAR,
  ESTADOS_FINALIZADOS,
} from '@/lib/constants';
import { Button, Card, CardContent, Badge, Progress, Avatar, Separator } from '@/ui';
import { cn } from '@/lib/utils';

interface Expediente {
  id: string;
  estado: string;
  codigoTipoPractica?: string;
  nombreEstudiante?: string;
  apellidoEstudiante?: string;
  nombreEmpresa?: string;
}

interface EstadoItem {
  name: string;
  value: number;
  color: string;
  darkColor: string;
}

interface TipoItem {
  name: string;
  value: number;
  color: string;
  darkColor: string;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

function KpiCard({ label, value, icon: Icon, color }: KpiCardProps) {
  return (
    <Card variant="hover" className="p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex justify-between items-start">
        <span className="text-[0.65rem] uppercase tracking-wider font-bold text-muted-foreground">{label}</span>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{value}</p>
    </Card>
  );
}

interface QuickActionProps {
  title: string;
  icon: React.ElementType;
  route: string;
  onClick: (route: string) => void;
}

function QuickAction({ title, icon: Icon, route, onClick }: QuickActionProps) {
  return (
    <li className="list-none">
      <button
        type="button"
        onClick={() => onClick(route)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary-600/30 dark:hover:border-primary-400/30 transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A3A6E] text-white group-hover:bg-[#4A6FA5] dark:bg-[#4A6FA5] dark:group-hover:bg-[#7A9FD5] transition-colors">
            <Icon className="h-5 w-5 text-current" />
          </span>
          <span className="block text-sm font-bold text-foreground truncate">{title}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors shrink-0" />
      </button>
    </li>
  );
}

export default function DashboardDocente() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: expedientes = [], isLoading, error, refetch } = useMisExpedientes();

  const kpis = useMemo(() => {
    const activos = expedientes.filter((e: Expediente) => !ESTADOS_FINALIZADOS.includes(e.estado));
    const finalizados = expedientes.length - activos.length;
    return {
      total: expedientes.length,
      activos: activos.length,
      finalizados,
      enEjecucion: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION).length,
      porEvaluar: expedientes.filter((e: Expediente) => ESTADOS_PARA_EVALUAR.includes(e.estado)).length,
      observados: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.OBSERVADO).length,
      planPendiente: expedientes.filter((e: Expediente) =>
        e.estado === ESTADOS_EXPEDIENTE.ASESOR_ASIGNADO || e.estado === ESTADOS_EXPEDIENTE.PLAN_PRESENTADO
      ).length,
    };
  }, [expedientes]);

  const estadoChart: EstadoItem[] = useMemo(() => [
    { name: 'En ejecución', value: kpis.enEjecucion, color: 'bg-blue-500', darkColor: 'dark:bg-blue-400' },
    { name: 'Por evaluar', value: kpis.porEvaluar, color: 'bg-violet-500', darkColor: 'dark:bg-violet-400' },
    { name: 'Observados', value: kpis.observados, color: 'bg-red-500', darkColor: 'dark:bg-red-400' },
    { name: 'Plan / revisión', value: kpis.planPendiente, color: 'bg-amber-500', darkColor: 'dark:bg-amber-400' },
    {
      name: 'Otros activos',
      value: Math.max(kpis.activos - kpis.enEjecucion - kpis.porEvaluar - kpis.observados - kpis.planPendiente, 0),
      color: 'bg-slate-400',
      darkColor: 'dark:bg-slate-500',
    },
  ], [kpis]);

  const tipoChart: TipoItem[] = useMemo(() => {
    const tipos = ['INICIAL', 'FINAL', 'PROFESIONAL'];
    const colors: Record<string, { color: string; darkColor: string }> = {
      INICIAL: { color: 'bg-blue-500', darkColor: 'dark:bg-blue-400' },
      FINAL: { color: 'bg-violet-500', darkColor: 'dark:bg-violet-400' },
      PROFESIONAL: { color: 'bg-emerald-500', darkColor: 'dark:bg-emerald-400' },
    };
    return tipos.map((t) => ({
      name: t.charAt(0) + t.slice(1).toLowerCase(),
      value: expedientes.filter((e: Expediente) => e.codigoTipoPractica === t).length,
      color: colors[t].color,
      darkColor: colors[t].darkColor,
    }));
  }, [expedientes]);

  const maxEstado = Math.max(...estadoChart.map((i) => i.value), 1);
  const maxTipo = Math.max(...tipoChart.map((i) => i.value), 1);
  const avancePct = kpis.total > 0 ? Math.round((kpis.finalizados / kpis.total) * 100) : 0;

  const recientes = useMemo(
    () => [...expedientes].slice(0, 5),
    [expedientes],
  );

  const pendientesAccion = useMemo(
    () => expedientes.filter((e: Expediente) =>
      e.estado === ESTADOS_EXPEDIENTE.OBSERVADO
      || e.estado === ESTADOS_EXPEDIENTE.PLAN_PRESENTADO
      || ESTADOS_PARA_EVALUAR.includes(e.estado)
    ),
    [expedientes],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-border border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      {/* ── Header Banner ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <GraduationCap className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              className="h-14 w-14 md:h-16 md:w-16 border-2 border-white/30 bg-white/20 text-white"
              fallback={user?.nombres?.split(' ').map(n => n[0]).join('').toUpperCase()}
            />
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">
                Panel de Asesoría
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-1">
                Hola, {user?.nombres?.split(' ')[0] || 'Docente'}
              </h1>
              <p className="text-sm opacity-90">
                Supervisa el avance de tus practicantes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="ghost" size="sm" className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => refetch()} aria-label="Actualizar">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => navigate('/docente/practicantes')}>
              <Users className="h-4 w-4 mr-2" />
              Ver practicantes
            </Button>
          </div>
        </div>
      </div>

      {/* ── Alerts ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <RefreshCw className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-900 dark:text-red-200">Error al cargar</p>
            <p className="text-sm text-red-800 dark:text-red-300 mt-1">
              No se pudieron cargar los expedientes. Verifica la conexión con el backend.
            </p>
          </div>
          <Button variant="danger" size="sm" className="shrink-0" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {pendientesAccion.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-amber-900 dark:text-amber-200">Acciones pendientes</p>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              Tienes {pendientesAccion.length} practicante(s) con acciones pendientes de tu parte.
            </p>
          </div>
          <Button size="sm" className="shrink-0" onClick={() => navigate('/docente/practicantes')}>
            Revisar
          </Button>
        </div>
      )}

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Practicantes"
          value={kpis.total}
          icon={UserCircle}
          color="bg-[#1A3A6E] text-white dark:bg-[#4A6FA5] dark:text-white"
        />
        <KpiCard
          label="Activos"
          value={kpis.activos}
          icon={Users}
          color="bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-50"
        />
        <KpiCard
          label="En ejecución"
          value={kpis.enEjecucion}
          icon={ListChecks}
          color="bg-blue-600 text-white dark:bg-blue-700 dark:text-blue-50"
        />
        <KpiCard
          label="Por evaluar"
          value={kpis.porEvaluar}
          icon={FileEdit}
          color="bg-amber-500 text-white dark:bg-amber-600 dark:text-amber-50"
        />
      </div>

      {/* ── Content grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Resumen de asesoría ── */}
        <Card className="flex flex-col lg:col-span-2">
          <CardContent className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                <h3 className="text-base font-bold text-foreground">Resumen de asesoría</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">{avancePct}% finalizados</Badge>
                <Button size="sm" onClick={() => navigate('/docente/practicantes')}>
                  <Users className="h-4 w-4 mr-1" /> Ver practicantes
                </Button>
              </div>
            </div>

            <Progress value={avancePct} max={100} size="md" />
            <p className="text-xs text-muted-foreground mt-2">
              {kpis.finalizados} culminados · {kpis.activos} en seguimiento activo
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              <div className="md:col-span-5">
                <p className="text-xs text-center mb-2 text-muted-foreground">Activos vs finalizados</p>
                <div className="h-[210px] grid place-items-center">
                  <div
                    className="w-[148px] h-[148px] rounded-full grid place-items-center"
                    style={{
                      background: `conic-gradient(var(--color-emerald-500) 0 ${kpis.total ? (kpis.finalizados / kpis.total) * 100 : 0}%, var(--color-border) 0 100%)`,
                    }}
                  >
                    <div className="w-[104px] h-[104px] rounded-full grid place-items-center text-center bg-card">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.finalizados}</span>
                      <span className="text-xs text-muted-foreground">de {kpis.total}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center -mt-1">
                  <Badge variant="info" size="sm"><CheckCircle2 className="h-3 w-3 mr-1" />{kpis.activos} activos</Badge>
                  <Badge variant="warning" size="sm"><Clock className="h-3 w-3 mr-1" />{kpis.observados} observados</Badge>
                </div>
              </div>

              <div className="md:col-span-7">
                <p className="text-xs text-center mb-2 text-muted-foreground">Distribución por estado</p>
                <div className="h-[210px] flex items-end justify-center gap-3 px-2 pb-1 border-b border-border">
                  {estadoChart.map((item) => {
                    const height = Math.max((item.value / maxEstado) * 160, item.value > 0 ? 16 : 4);
                    return (
                      <div key={item.name} className="w-14 text-center">
                        <span className="text-xs text-muted-foreground">{item.value}</span>
                        <div
                          className={cn('mt-1 rounded-t-lg', item.color, item.darkColor)}
                          style={{ height }}
                        />
                        <span className="text-[0.65rem] leading-tight block mt-2 text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Modalidad de práctica</h3>
            <div className="flex items-end justify-center gap-8 px-2 pb-1 border-b border-border">
              {tipoChart.map((item) => {
                const height = Math.max((item.value / maxTipo) * 120, item.value > 0 ? 16 : 4);
                return (
                  <div key={item.name} className="w-[72px] text-center">
                    <span className="text-xs text-muted-foreground">{item.value}</span>
                    <div className={cn('mt-1 rounded-t-lg', item.color, item.darkColor)} style={{ height }} />
                    <span className="text-xs block mt-2 text-muted-foreground">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <div className="space-y-6">
          <Card className="flex flex-col">
            <CardContent className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                <h3 className="text-base font-bold text-foreground">Accesos rápidos</h3>
              </div>
              <ul className="space-y-2 list-none">
                <QuickAction title="Mis practicantes" icon={Users} route="/docente/practicantes" onClick={navigate} />
                <QuickAction title="Evaluaciones pendientes" icon={FileEdit} route="/docente/practicantes" onClick={navigate} />
                <QuickAction title="Revisar planes" icon={ClipboardList} route="/docente/practicantes" onClick={navigate} />
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardContent className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Practicantes recientes</h3>
                <Button size="sm" variant="ghost" onClick={() => navigate('/docente/practicantes')}>
                  Ver todos
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {recientes.map((e: Expediente) => (
                  <div key={e.id} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {e.nombreEstudiante} {e.apellidoEstudiante}
                      </p>
                      <p className="text-xs capitalize truncate text-muted-foreground">
                        {e.nombreEmpresa || e.estado?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                ))}
                {recientes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay practicantes asignados.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

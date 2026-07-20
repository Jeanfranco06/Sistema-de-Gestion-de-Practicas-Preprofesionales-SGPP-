import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ListChecks, FileEdit, Building2, Eye,
  ClipboardList, RefreshCw, ChevronRight, Clock4,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useMisExpedientes } from '@/hooks/useExpedientes';
import { ESTADOS_EXPEDIENTE } from '@/lib/constants';
import {
  Button, Card, CardContent, Badge, Progress, Input, Tooltip, Avatar,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/ui';
import { cn } from '@/lib/utils';

interface Expediente {
  id: string;
  estado: string;
  codigoExpediente?: string;
  nombreEstudiante?: string;
  apellidoEstudiante?: string;
  nombreTipoPractica?: string;
  nombreEmpresa?: string;
  nombreSede?: string;
  idEmpresa?: string | number;
}

interface EstadoItem {
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

const STATUS_LABELS: Record<string, string> = {
  SOLICITADO: 'Solicitado',
  EMPRESA_SEDE_ASIGNADA: 'Empresa y sede asignadas',
  VALIDADO_SECRETARIA: 'Validado por secretaría',
  CARTA_PRESENTACION_EMITIDA: 'Carta de presentación emitida',
  CARTA_ACEPTACION_PRESENTADA: 'Carta de aceptación presentada',
  ASESOR_ASIGNADO: 'Asesor asignado',
  COMITE_ASIGNADO: 'Comité asignado',
  PLAN_PRESENTADO: 'Plan presentado',
  PLAN_EN_REVISION: 'Plan en revisión',
  PLAN_EN_REVISION_COMITE: 'Plan en revisión comité',
  PLAN_OBSERVADO: 'Plan observado',
  PLAN_APROBADO: 'Plan aprobado',
  EN_EJECUCION: 'En ejecución',
  INFORME_PARCIAL_1_PRESENTADO: 'Informe parcial 1',
  INFORME_PARCIAL_2_PRESENTADO: 'Informe parcial 2',
  INFORME_FINAL_PRESENTADO: 'Informe final presentado',
  INFORME_EN_REVISION: 'Informe en revisión',
  INFORME_APROBADO: 'Informe aprobado',
  EVALUACION_PENDIENTE: 'Evaluación pendiente',
  EVALUACION_EMPRESA_PENDIENTE: 'Evaluación empresa pendiente',
  EVALUACION_COMPLETA: 'Evaluación completa',
  DICTAMEN_EMITIDO: 'Dictamen emitido',
  EVALUADO: 'Evaluado',
  CERRADO: 'Cerrado',
  OBSERVADO: 'Observado',
  SUBSANADO: 'Subsanado',
  EN_REVISION: 'En revisión',
  RECHAZADO: 'Rechazado',
  SUSPENDIDO: 'Suspendido',
  CANCELADO: 'Cancelado',
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  COMPLETADO: 'Completado',
  VIGENTE: 'Vigente',
  ACTIVO: 'Activo',
};

function statusVariant(status?: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (!status) return 'neutral';
  const s = status.toUpperCase();
  if (['APROBADO', 'APROBADA', 'FINALIZADO', 'CUMPLIDO', 'ACEPTADO', 'COMPLETADO', 'ACTIVO', 'VIGENTE',
    ESTADOS_EXPEDIENTE.CERRADO, ESTADOS_EXPEDIENTE.EVALUADO, ESTADOS_EXPEDIENTE.PLAN_APROBADO].includes(s)) return 'success';
  if (['RECHAZADO', 'RECHAZADA', 'CANCELADO', 'ANULADO', 'ERROR', 'VENCIDO', 'DESAPROBADO',
    ESTADOS_EXPEDIENTE.RECHAZADO].includes(s)) return 'danger';
  if (['OBSERVADA', 'PENDIENTE', 'EN_REVISION', 'PROCESO', 'BORRADOR',
    ESTADOS_EXPEDIENTE.OBSERVADO, ESTADOS_EXPEDIENTE.PLAN_OBSERVADO, ESTADOS_EXPEDIENTE.SUBSANADO].includes(s)) return 'warning';
  if (['INFORME_PRESENTADO',
    ESTADOS_EXPEDIENTE.EN_EJECUCION, ESTADOS_EXPEDIENTE.SOLICITADO, ESTADOS_EXPEDIENTE.PLAN_PRESENTADO,
    ESTADOS_EXPEDIENTE.DICTAMEN_EMITIDO, ESTADOS_EXPEDIENTE.CARTA_PRESENTACION_EMITIDA,
    ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA].includes(s)) return 'info';
  return 'neutral';
}

function estadoLabel(estado?: string): string {
  if (!estado) return 'Pendiente';
  return STATUS_LABELS[estado] || estado.replace(/_/g, ' ').toLowerCase();
}

export default function DashboardTutor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: expedientes = [], isLoading, error, refetch } = useMisExpedientes();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => expedientes.filter((e: Expediente) => {
    const q = searchTerm.toLowerCase();
    return !q || (`${e.nombreEstudiante} ${e.apellidoEstudiante}`).toLowerCase().includes(q)
      || e.codigoExpediente?.toLowerCase().includes(q)
      || e.nombreEmpresa?.toLowerCase().includes(q);
  }), [expedientes, searchTerm]);

  const evaluadosCount = useMemo(
    () => expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.EVALUADO).length,
    [expedientes],
  );

  const kpis = useMemo(() => ({
    total: expedientes.length,
    enEjecucion: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION).length,
    porEvaluar: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO).length,
    empresas: new Set(expedientes.map((e: Expediente) => e.idEmpresa).filter(Boolean)).size,
  }), [expedientes]);

  const estadoChart: EstadoItem[] = useMemo(() => ([
    { name: 'En Ejecución', value: kpis.enEjecucion, color: 'bg-emerald-500', darkColor: 'dark:bg-emerald-400' },
    { name: 'Por Evaluar', value: kpis.porEvaluar, color: 'bg-amber-500', darkColor: 'dark:bg-amber-400' },
    { name: 'Evaluados', value: evaluadosCount, color: 'bg-blue-500', darkColor: 'dark:bg-blue-400' },
    {
      name: 'Otros',
      value: kpis.total - kpis.enEjecucion - kpis.porEvaluar - evaluadosCount,
      color: 'bg-slate-400',
      darkColor: 'dark:bg-slate-500',
    },
  ]), [kpis, evaluadosCount]);

  const maxEstado = Math.max(...estadoChart.map((i) => i.value), 1);
  const avancePct = kpis.total > 0 ? Math.round(((kpis.enEjecucion + evaluadosCount) / kpis.total) * 100) : 0;

  const recientes = useMemo(
    () => [...expedientes].slice(0, 5),
    [expedientes],
  );

  const pendientesAccion = useMemo(
    () => expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO),
    [expedientes],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-border border-t-primary-600" />
      </div>
    );
  }

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      {/* ── Header Banner ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <Building2 className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              className="h-14 w-14 md:h-16 md:w-16 border-2 border-white/30 bg-white/20 text-white"
              fallback={user?.nombres?.split(' ').map(n => n[0]).join('').toUpperCase()}
            />
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">
                Panel del Tutor Externo
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-1">
                Hola, {user?.nombres?.split(' ')[0] || 'Tutor'}
              </h1>
              <p className="text-sm opacity-90">
                Seguimiento de practicantes y evaluaciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="ghost" size="sm" className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => refetch()} aria-label="Actualizar">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => navigate('/tutor/evaluaciones')}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Evaluaciones
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
              No se pudieron cargar los expedientes.
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
            <Clock4 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-amber-900 dark:text-amber-200">Evaluaciones pendientes</p>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              Hay {pendientesAccion.length} evaluación(es) pendiente(s).
            </p>
          </div>
          <Button size="sm" className="shrink-0" onClick={() => navigate('/tutor/evaluaciones')}>
            Gestionar
          </Button>
        </div>
      )}

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Practicantes"
          value={kpis.total}
          icon={Users}
          color="bg-[#1A3A6E] text-white dark:bg-[#4A6FA5] dark:text-white"
        />
        <KpiCard
          label="En Ejecución"
          value={kpis.enEjecucion}
          icon={ListChecks}
          color="bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-50"
        />
        <KpiCard
          label="Por Evaluar"
          value={kpis.porEvaluar}
          icon={FileEdit}
          color="bg-amber-500 text-slate-900 dark:bg-amber-600 dark:text-amber-50"
        />
        <KpiCard
          label="Empresas"
          value={kpis.empresas}
          icon={Building2}
          color="bg-blue-600 text-white dark:bg-blue-700 dark:text-blue-50"
        />
      </div>

      {/* ── Content grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Resumen de Evaluaciones ── */}
        <Card className="flex flex-col lg:col-span-2">
          <CardContent className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                <h3 className="text-base font-bold text-foreground">Resumen de Evaluaciones</h3>
              </div>
              <Badge variant="default" size="sm">{avancePct}% en curso</Badge>
            </div>

            <Progress value={avancePct} max={100} size="md" />
            <p className="text-xs text-muted-foreground mt-2">
              {kpis.enEjecucion + evaluadosCount} practicantes en curso · {kpis.porEvaluar} pendientes de evaluación
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              <div className="md:col-span-5">
                <p className="text-xs text-center mb-2 text-muted-foreground">Evaluaciones vs Pendientes</p>
                <div className="h-[210px] grid place-items-center">
                  <div
                    className="w-[148px] h-[148px] rounded-full grid place-items-center"
                    style={{
                      background: `conic-gradient(var(--color-emerald-500) 0 ${kpis.total ? (evaluadosCount / kpis.total) * 100 : 0}%, var(--color-amber-500) 0 ${kpis.total ? ((evaluadosCount + kpis.porEvaluar) / kpis.total) * 100 : 0}%, var(--color-border) 0 100%)`,
                    }}
                  >
                    <div className="w-[104px] h-[104px] rounded-full grid place-items-center text-center bg-card">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.enEjecucion + evaluadosCount}</span>
                      <span className="text-xs text-muted-foreground">de {kpis.total}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center -mt-1">
                  <Badge variant="info" size="sm"><Users className="h-3 w-3 mr-1" />{kpis.total} total</Badge>
                  <Badge variant="warning" size="sm"><FileEdit className="h-3 w-3 mr-1" />{kpis.porEvaluar} pendientes</Badge>
                </div>
              </div>

              <div className="md:col-span-7">
                <p className="text-xs text-center mb-2 text-muted-foreground">Distribución de Estados</p>
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
                <QuickAction title="Mis Evaluaciones" icon={ClipboardList} route="/tutor/evaluaciones" onClick={navigate} />
                <QuickAction title="Ver Practicantes" icon={Users} route="/tutor/dashboard" onClick={navigate} />
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardContent className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Últimos Practicantes</h3>
                <Button size="sm" variant="ghost" onClick={() => navigate('/tutor/practicantes')}>
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
                        {e.estado?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                ))}
                {recientes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay practicantes recientes.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-base font-bold text-foreground mb-4">Mis Practicantes Asignados</h2>

          <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap gap-3 items-center mb-4">
            <div className="min-w-[300px] flex-1 max-w-md">
              <Input
                placeholder="Buscar practicante (nombre, código o empresa)"
                value={searchTerm}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(event.target.value); setPage(0); }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-foreground">Estudiante</TableHead>
                  <TableHead className="text-foreground">Tipo</TableHead>
                  <TableHead className="text-foreground">Estado</TableHead>
                  <TableHead className="text-foreground">Empresa / Sede</TableHead>
                  <TableHead className="text-center text-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((e: Expediente) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <p className="font-medium text-sm text-foreground">{e.nombreEstudiante} {e.apellidoEstudiante}</p>
                      <p className="font-mono text-xs text-muted-foreground">{e.codigoExpediente}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info" size="sm">{e.nombreTipoPractica}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(e.estado)} size="sm">{estadoLabel(e.estado)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs block text-foreground">{e.nombreEmpresa || '—'}</span>
                      <span className="text-xs block text-muted-foreground">{e.nombreSede || ''}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Tooltip content="Ver detalle">
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Validar horas">
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/tutor/horas/${e.id}`)}>
                            <Clock4 className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        {[ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO, ESTADOS_EXPEDIENTE.INFORME_APROBADO].includes(e.estado) && (
                          <Tooltip content="Evaluar desempeño">
                            <Button size="sm" onClick={() => navigate(`/tutor/evaluaciones/${e.id}`)}>
                              <ClipboardList className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      No se encontraron practicantes asignados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Filas por página:</span>
                <select
                  value={rowsPerPage}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { setRowsPerPage(+event.target.value); setPage(0); }}
                  className="rounded-xl border border-border bg-card px-2 py-1 text-sm text-foreground"
                >
                  {[5, 10, 25].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <span>{page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filtered.length)} de {filtered.length}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
                <Button size="sm" variant="secondary" disabled={(page + 1) * rowsPerPage >= filtered.length} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

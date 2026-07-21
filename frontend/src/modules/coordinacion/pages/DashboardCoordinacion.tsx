import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ClipboardList, ListChecks, AlertTriangle,
  FileEdit, Building2, RefreshCw, ChevronRight,
  FileText, Eye, Building, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/AuthContext';
import { hasAnyRole } from '../../../shared/utils/roleRoutes';
import { useExpedientes } from '../../../hooks/useExpedientes';
import { coordinacionApi } from '../../../api/coordinacionApi';
import { ESTADOS_EXPEDIENTE, ESTADOS_FINALIZADOS, ESTADOS_PARA_EVALUAR, COLORS } from '../../../lib/constants';
import { showSuccess, showError } from '../../../lib/toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Progress, Tooltip, Input, Select, Card, CardContent, CardHeader, CardTitle,
} from '../../../ui';
import { cn } from '../../../lib/utils';

const MySwal = withReactContent(Swal);

const ESTADOS = Object.values(ESTADOS_EXPEDIENTE);

const ESTADO_COLOR: Record<string, string> = {
  [ESTADOS_EXPEDIENTE.SOLICITADO]: COLORS.MUTED,
  [ESTADOS_EXPEDIENTE.EMPRESA_SEDE_ASIGNADA]: COLORS.UNT_BLUE,
  [ESTADOS_EXPEDIENTE.VALIDADO_SECRETARIA]: COLORS.SUCCESS,
  [ESTADOS_EXPEDIENTE.CARTA_PRESENTACION_EMITIDA]: COLORS.UNT_BLUE,
  [ESTADOS_EXPEDIENTE.ASESOR_ASIGNADO]: COLORS.UNT_BLUE,
  [ESTADOS_EXPEDIENTE.COMITE_ASIGNADO]: COLORS.UNT_BLUE,
  [ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA]: COLORS.UNT_BLUE,
  [ESTADOS_EXPEDIENTE.PLAN_PRESENTADO]: COLORS.WARNING,
  [ESTADOS_EXPEDIENTE.PLAN_EN_REVISION]: COLORS.WARNING,
  [ESTADOS_EXPEDIENTE.PLAN_EN_REVISION_COMITE]: COLORS.WARNING,
  [ESTADOS_EXPEDIENTE.PLAN_APROBADO]: '#22C55E',
  [ESTADOS_EXPEDIENTE.PLAN_OBSERVADO]: COLORS.DANGER,
  EN_REVISION: COLORS.WARNING,
  [ESTADOS_EXPEDIENTE.OBSERVADO]: COLORS.DANGER,
  [ESTADOS_EXPEDIENTE.SUBSANADO]: COLORS.WARNING,
  [ESTADOS_EXPEDIENTE.EN_EJECUCION]: COLORS.UNT_BLUE,
  [ESTADOS_EXPEDIENTE.INFORME_PARCIAL_1_PRESENTADO]: COLORS.UNT_BLUE_LIGHT,
  [ESTADOS_EXPEDIENTE.INFORME_PARCIAL_2_PRESENTADO]: COLORS.UNT_BLUE_LIGHT,
  [ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO]: COLORS.UNT_BLUE_LIGHT,
  [ESTADOS_EXPEDIENTE.INFORME_EN_REVISION]: COLORS.WARNING,
  [ESTADOS_EXPEDIENTE.INFORME_APROBADO]: '#22C55E',
  [ESTADOS_EXPEDIENTE.EVALUACION_EMPRESA_PENDIENTE]: COLORS.WARNING,
  [ESTADOS_EXPEDIENTE.EVALUACION_COMPLETA]: '#22C55E',
  [ESTADOS_EXPEDIENTE.EVALUADO]: '#22C55E',
  [ESTADOS_EXPEDIENTE.DICTAMEN_EMITIDO]: '#22C55E',
  [ESTADOS_EXPEDIENTE.CERRADO]: COLORS.MUTED,
};

const CHART_COLORS = [COLORS.UNT_BLUE, COLORS.UNT_BLUE_LIGHT, '#F5C518', COLORS.DANGER, '#22C55E', COLORS.WARNING, '#7A9FD5', '#D4A808'];

const ACCENT_COLORS = {
  blue: 'bg-[#1A3A6E] text-white dark:bg-[#4A6FA5] dark:text-white',
  yellow: 'bg-primary-600 text-[#1E293B] dark:bg-primary-500 dark:text-[#1E293B]',
  emerald: 'bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-50',
  amber: 'bg-amber-500 text-slate-900 dark:bg-amber-600 dark:text-slate-900',
  red: 'bg-red-600 text-white dark:bg-red-700 dark:text-white',
};

export const DashboardCoordinacion = () => {
  const { user } = useAuth();
  const puedeEmitirCarta = hasAnyRole(user?.roles, ['ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR']);
  const puedeAsignarComite = hasAnyRole(user?.roles, ['ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: expedientes = [], isLoading, isError, refetch } = useExpedientes();
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const { mutateAsync: emitirCartaMut } = useMutation({
    mutationFn: (id: string) => coordinacionApi.emitirCartaPresentacion(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expedientes'] }); },
  });

  const handleEmitirCarta = async (id: string) => {
    try {
      const res = await MySwal.fire({
        title: 'Emitir Carta de Presentación',
        text: '¿Estás seguro de emitir y firmar la Carta de Presentación para este expediente?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, emitir',
        cancelButtonText: 'Cancelar',
      });
      if (res.isConfirmed) {
        await emitirCartaMut(id);
        showSuccess('Carta de Presentación emitida y firmada electrónicamente.');
      }
    } catch {
      showError('No se pudo emitir la Carta de Presentación.');
    }
  };

  const filtered = useMemo(() => expedientes.filter(e => {
    const q = searchTerm.toLowerCase();
    return (!q || e.nombreEstudiante?.toLowerCase().includes(q) || e.apellidoEstudiante?.toLowerCase().includes(q) || e.codigoExpediente?.toLowerCase().includes(q))
      && (filtroTipo === 'TODOS' || e.codigoTipoPractica === filtroTipo)
      && (filtroEstado === 'TODOS' || e.estado === filtroEstado);
  }), [expedientes, searchTerm, filtroTipo, filtroEstado]);

  const kpis = useMemo(() => ({
    total: expedientes.length,
    activos: expedientes.filter(e => !ESTADOS_FINALIZADOS.includes(e.estado)).length,
    cerrados: expedientes.filter(e => e.estado === ESTADOS_EXPEDIENTE.CERRADO).length,
    enEjecucion: expedientes.filter(e => e.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION).length,
    observados: expedientes.filter(e => e.estado === ESTADOS_EXPEDIENTE.OBSERVADO).length,
    pendientesCarta: expedientes.filter(e => e.estado === ESTADOS_EXPEDIENTE.VALIDADO_SECRETARIA).length,
    planPendiente: expedientes.filter(e => [
      ESTADOS_EXPEDIENTE.ASESOR_ASIGNADO,
      ESTADOS_EXPEDIENTE.COMITE_ASIGNADO,
      ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA,
    ].includes(e.estado)).length,
    porEvaluar: expedientes.filter(e => ESTADOS_PARA_EVALUAR.includes(e.estado)).length,
  }), [expedientes]);

  const tiposChart = useMemo(() => {
    const map: Record<string, number> = {};
    expedientes.forEach(e => { const k = e.nombreTipoPractica || e.codigoTipoPractica || 'Otro'; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expedientes]);

  const estadosChart = useMemo(() => {
    const order = [
      ESTADOS_EXPEDIENTE.SOLICITADO,
      ESTADOS_EXPEDIENTE.PLAN_PRESENTADO,
      ESTADOS_EXPEDIENTE.PLAN_EN_REVISION,
      ESTADOS_EXPEDIENTE.PLAN_OBSERVADO,
      ESTADOS_EXPEDIENTE.PLAN_APROBADO,
      ESTADOS_EXPEDIENTE.EN_EJECUCION,
      ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO,
      ESTADOS_EXPEDIENTE.INFORME_APROBADO,
      ESTADOS_EXPEDIENTE.EVALUADO,
      ESTADOS_EXPEDIENTE.CERRADO,
    ];
    const map: Record<string, number> = {};
    order.forEach(s => map[s] = 0);
    expedientes.forEach(e => { if (map[e.estado] !== undefined) map[e.estado]++; });
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [expedientes]);

  const alertas = useMemo(() => {
    const items: { tipo: string; exp: string; estudiante: string; severity: 'error' | 'warning' }[] = [];
    expedientes.filter(e => e.estado === ESTADOS_EXPEDIENTE.OBSERVADO).forEach(e => {
      items.push({ tipo: 'Observado', exp: e.codigoExpediente, estudiante: `${e.nombreEstudiante} ${e.apellidoEstudiante}`, severity: 'error' });
    });
    expedientes.filter(e => e.estado === 'EN_REVISION').forEach(e => {
      items.push({ tipo: 'En revisión', exp: e.codigoExpediente, estudiante: `${e.nombreEstudiante} ${e.apellidoEstudiante}`, severity: 'warning' });
    });
    return items.slice(0, 10);
  }, [expedientes]);

  const estadoLabel = (estado?: string) => estado?.replace(/_/g, ' ').toLowerCase() || 'Pendiente';
  const avancePct = kpis.total > 0 ? Math.round((kpis.cerrados / kpis.total) * 100) : 0;
  const recientes = useMemo(() => [...expedientes].slice(0, 5), [expedientes]);

  const stats = [
    { label: 'Total', value: kpis.total, icon: Users, accent: ACCENT_COLORS.blue },
    { label: 'Activos', value: kpis.activos, icon: ListChecks, accent: ACCENT_COLORS.emerald },
    { label: 'Pendientes carta', value: kpis.pendientesCarta, icon: FileText, accent: ACCENT_COLORS.amber },
    { label: 'Plan pendiente', value: kpis.planPendiente, icon: ClipboardList, accent: ACCENT_COLORS.yellow },
    { label: 'Por evaluar', value: kpis.porEvaluar, icon: FileEdit, accent: ACCENT_COLORS.red },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Cargando expedientes...</p>
      </div>
    );
  }

  const tipoOptions = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'INICIAL', label: 'Inicial' },
    { value: 'FINAL', label: 'Final' },
    { value: 'PROFESIONAL', label: 'Profesional' },
  ];

  const estadoOptions = [
    { value: 'TODOS', label: 'Todos' },
    ...ESTADOS.map(s => ({ value: s, label: s.replace(/_/g, ' ') })),
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A3A6E] text-white dark:bg-[#4A6FA5]">
              <Building className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">
              Hola, {user?.nombres?.split(' ')[0] || 'Coordinación'}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Panel Ejecutivo – Visión general de todos los expedientes de práctica
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} className="w-full gap-1 sm:w-auto">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Actualizar
        </Button>
      </div>

      {(error || isError) && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error || 'No se pudieron cargar los expedientes. Verifica la conexión.'}</span>
          <button className="ml-auto text-sm font-bold leading-none text-red-800 hover:text-red-900 dark:text-red-200 dark:hover:text-red-100" onClick={() => setError('')} aria-label="Cerrar">
            &times;
          </button>
        </div>
      )}
      {!error && !isError && expedientes.length === 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          No hay expedientes registrados en el sistema.
        </div>
      )}

      <h2 className="text-base font-bold text-foreground md:text-lg">Indicadores Estadísticos</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 flex flex-col gap-1.5">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', s.accent)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Resumen de Cerrados</CardTitle>
                <Badge variant="info" size="sm">{avancePct}% cerrados</Badge>
              </div>
              <Progress value={avancePct} size="md" />
              <p className="mt-2 text-xs text-muted-foreground">
                {kpis.cerrados} expedientes cerrados · {kpis.enEjecucion} en ejecución
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-center text-xs text-muted-foreground">Expedientes por tipo de práctica</p>
                  {tiposChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={tiposChart}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          dataKey="value"
                          label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {tiposChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">Sin datos</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-center text-xs text-muted-foreground">Distribución por estado</p>
                  {estadosChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={estadosChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {estadosChart.map((entry) => (
                            <Cell key={entry.name} fill={ESTADO_COLOR[entry.name.replace(/ /g, '_')] || COLORS.MUTED} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">Sin datos</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <CardTitle className="text-sm font-semibold mb-3">Accesos rápidos</CardTitle>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => navigate('/admin/expedientes')}>
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  Ver expedientes
                </Button>
                <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => navigate('/admin/sedes')}>
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  Ver sedes
                </Button>
                <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => navigate('/coordinacion/reportes')}>
                  <FileEdit className="h-4 w-4" aria-hidden="true" />
                  Reportes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Últimos expedientes</CardTitle>
                <Button size="sm" variant="ghost" className="gap-1" onClick={() => navigate('/admin/expedientes')}>
                  Ver todos
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <div className="space-y-1">
                {recientes.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 py-1.5">
                    <Users className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {e.nombreEstudiante} {e.apellidoEstudiante}
                      </p>
                      <p className="truncate text-xs capitalize text-muted-foreground">
                        {e.estado?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                ))}
                {recientes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay expedientes recientes.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <CardTitle className="text-sm font-semibold mb-3 text-muted-foreground">Alertas activas</CardTitle>
              {alertas.length > 0 ? alertas.map((a, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-2 py-2',
                    i < alertas.length - 1 && 'border-b border-border'
                  )}
                >
                  <AlertTriangle className={cn('h-[18px] w-[18px] shrink-0', a.severity === 'error' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{a.exp}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.estudiante}</p>
                  </div>
                  <Badge variant={a.severity === 'error' ? 'danger' : 'warning'} size="sm">{a.tipo}</Badge>
                </div>
              )) : (
                <p className="py-2 text-sm text-muted-foreground">No hay alertas activas</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent>
          <CardTitle className="text-sm font-semibold mb-3">Listado de expedientes</CardTitle>
          {puedeAsignarComite && (
            <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
              Para prácticas Final o Profesional, selecciona <strong>Asignar comité</strong> cuando el estado sea Carta de Aceptación presentada.
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Input
              label="Buscar"
              placeholder="Estudiante o código"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
              className="min-w-[260px]"
            />
            <Select
              label="Tipo"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              options={tipoOptions}
              className="min-w-[160px]"
            />
            <Select
              label="Estado"
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              options={estadoOptions}
              className="min-w-[190px]"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Código</TableHead>
                  <TableHead className="font-semibold">Estudiante</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Asesor / Empresa</TableHead>
                  <TableHead className="text-center font-semibold">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.codigoExpediente}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{e.nombreEstudiante} {e.apellidoEstudiante}</p>
                    </TableCell>
                    <TableCell><Badge variant="info" size="sm">{e.nombreTipoPractica}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={
                        [ESTADOS_EXPEDIENTE.OBSERVADO].includes(e.estado) ? 'danger' :
                        ['EN_REVISION', ESTADOS_EXPEDIENTE.PLAN_PRESENTADO].includes(e.estado) ? 'warning' :
                        ['APROBADO', ESTADOS_EXPEDIENTE.EVALUADO, ESTADOS_EXPEDIENTE.CERRADO].includes(e.estado) ? 'success' : 'info'
                      } size="sm">{estadoLabel(e.estado)}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-foreground">{e.nombreAsesor || '—'}</p>
                      <p className="text-xs text-muted-foreground">{e.nombreEmpresa || ''}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-center gap-1">
                        {puedeEmitirCarta && e.estado === ESTADOS_EXPEDIENTE.VALIDADO_SECRETARIA && (
                          <Tooltip content="Emitir y firmar Carta de Presentación">
                            <Button size="sm" variant="primary" onClick={() => handleEmitirCarta(e.id)} className="whitespace-nowrap text-xs font-semibold">
                              Emitir Carta
                            </Button>
                          </Tooltip>
                        )}
                        {puedeAsignarComite
                          && ['FINAL', 'PROFESIONAL'].includes(e.codigoTipoPractica)
                          && e.estado === ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA && (
                            <Tooltip content="Seleccionar integrantes activos del comité">
                              <Button size="sm" variant="primary" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)} className="whitespace-nowrap text-xs font-semibold">
                                Asignar comité
                              </Button>
                            </Tooltip>
                          )}
                        <Tooltip content="Ver detalle">
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}>
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-4 text-center text-muted-foreground">
                      No se encontraron expedientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filtered.length > 0 ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filtered.length)} de ${filtered.length}` : '0 resultados'}
                </span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
                  className="rounded border border-border bg-card px-2 py-1 text-sm text-foreground"
                >
                  {[5, 10, 25].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-muted-foreground">por página</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="w-full sm:w-auto">
                  Anterior
                </Button>
                <Button size="sm" variant="secondary" disabled={(page + 1) * rowsPerPage >= filtered.length} onClick={() => setPage(p => p + 1)} className="w-full sm:w-auto">
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

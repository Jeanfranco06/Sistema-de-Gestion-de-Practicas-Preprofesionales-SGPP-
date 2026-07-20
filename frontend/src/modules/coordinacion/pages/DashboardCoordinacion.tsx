import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ClipboardList, ListChecks, AlertTriangle,
  FileEdit, Building2, RefreshCw, ChevronRight,
  FileText, Eye, Building,
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
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Progress, Tooltip, Input, Select } from '../../../ui';

const MySwal = withReactContent(Swal);

const ESTADOS = [
  'SOLICITADO', 'EMPRESA_SEDE_ASIGNADA', 'VALIDADO_SECRETARIA', 'CARTA_PRESENTACION_EMITIDA',
  'ASESOR_ASIGNADO', 'COMITE_ASIGNADO',
  'CARTA_ACEPTACION_PRESENTADA', 'PLAN_PRESENTADO', 'EN_REVISION', 'OBSERVADO',
  'SUBSANADO', 'APROBADO', 'EN_EJECUCION', 'INFORME_PARCIAL_PRESENTADO',
  'INFORME_FINAL_PRESENTADO', 'EVALUADO', 'CERRADO',
];

const ESTADO_COLOR: Record<string, string> = {
  SOLICITADO: '#94a3b8', EMPRESA_SEDE_ASIGNADA: '#3b82f6',
  VALIDADO_SECRETARIA: '#10b981', CARTA_PRESENTACION_EMITIDA: '#6366f1',
  ASESOR_ASIGNADO: '#3b82f6', COMITE_ASIGNADO: '#3b82f6',
  CARTA_ACEPTACION_PRESENTADA: '#3b82f6', PLAN_PRESENTADO: '#eab308',
  EN_REVISION: '#eab308', OBSERVADO: '#ef4444', SUBSANADO: '#f59e0b',
  APROBADO: '#22c55e', EN_EJECUCION: '#6366f1',
  INFORME_PARCIAL_PRESENTADO: '#06b6d4', INFORME_FINAL_PRESENTADO: '#06b6d4',
  EVALUADO: '#22c55e', CERRADO: '#64748b',
};

const CHART_COLORS = ['#2563eb', '#0d9488', '#eab308', '#ef4444', '#6366f1', '#ec4899', '#f97316', '#06b6d4'];

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
        MySwal.fire('Éxito', 'Carta de Presentación emitida y firmada electrónicamente.', 'success');
      }
    } catch {
      MySwal.fire('Error', 'No se pudo emitir la Carta de Presentación.', 'error');
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
    activos: expedientes.filter(e => !['EVALUADO', 'CERRADO'].includes(e.estado)).length,
    cerrados: expedientes.filter(e => e.estado === 'CERRADO').length,
    enEjecucion: expedientes.filter(e => e.estado === 'EN_EJECUCION').length,
    observados: expedientes.filter(e => e.estado === 'OBSERVADO').length,
    pendientesCarta: expedientes.filter(e => e.estado === 'VALIDADO_SECRETARIA').length,
    planPendiente: expedientes.filter(e => ['ASESOR_ASIGNADO', 'COMITE_ASIGNADO', 'CARTA_ACEPTACION_PRESENTADA'].includes(e.estado)).length,
    porEvaluar: expedientes.filter(e => ['INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO'].includes(e.estado)).length,
  }), [expedientes]);

  const tiposChart = useMemo(() => {
    const map: Record<string, number> = {};
    expedientes.forEach(e => { const k = e.nombreTipoPractica || e.codigoTipoPractica || 'Otro'; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expedientes]);

  const estadosChart = useMemo(() => {
    const order = ['SOLICITADO', 'PLAN_PRESENTADO', 'EN_REVISION', 'OBSERVADO', 'APROBADO', 'EN_EJECUCION', 'INFORME_FINAL_PRESENTADO', 'EVALUADO', 'CERRADO'];
    const map: Record<string, number> = {};
    order.forEach(s => map[s] = 0);
    expedientes.forEach(e => { if (map[e.estado] !== undefined) map[e.estado]++; });
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [expedientes]);

  const alertas = useMemo(() => {
    const items: { tipo: string; exp: string; estudiante: string; severity: 'error' | 'warning' }[] = [];
    expedientes.filter(e => e.estado === 'OBSERVADO').forEach(e => {
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
    { label: 'Total', value: kpis.total, icon: <Users className="h-4 w-4" />, accent: 'blue' },
    { label: 'Activos', value: kpis.activos, icon: <ListChecks className="h-4 w-4" />, accent: 'teal' },
    { label: 'Pendientes carta', value: kpis.pendientesCarta, icon: <FileText className="h-4 w-4" />, accent: 'violet' },
    { label: 'Plan pendiente', value: kpis.planPendiente, icon: <ClipboardList className="h-4 w-4" />, accent: 'emerald' },
    { label: 'Por evaluar', value: kpis.porEvaluar, icon: <FileEdit className="h-4 w-4" />, accent: 'orange' },
  ];

  const accentColors: Record<string, string> = {
    blue: '#3b82f6', teal: '#0d9488', violet: '#6366f1', emerald: '#10b981', orange: '#f97316',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '50vh' }}>
        <div className="animate-spin h-8 w-8 border-4 rounded-full" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Hola, {user?.nombres?.split(' ')[0] || 'Coordinación'}
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            Panel Ejecutivo – Visión general de todos los expedientes de práctica
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} className="gap-1">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {(error || isError) && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error || 'No se pudieron cargar los expedientes. Verifica la conexión.'}</span>
          <button className="ml-auto text-sm font-bold leading-none" onClick={() => setError('')} style={{ color: 'var(--color-error)' }}>&times;</button>
        </div>
      )}
      {!error && !isError && expedientes.length === 0 && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          No hay expedientes registrados en el sistema.
        </div>
      )}

      <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Indicadores Estadísticos</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border p-4 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: `${accentColors[s.accent]}15` }}>
              {s.icon}
            </div>
            <span className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{s.value}</span>
            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Resumen de Cerrados</span>
              <Badge variant="info" size="sm">{avancePct}% cerrados</Badge>
            </div>
            <Progress value={avancePct} size="md" />
            <p className="text-xs mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
              {kpis.cerrados} expedientes cerrados · {kpis.enEjecucion} en ejecución
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-center mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Expedientes por tipo de práctica</p>
                {tiposChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={tiposChart} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                        dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {tiposChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--color-muted-foreground)' }}>Sin datos</p>
                )}
              </div>
              <div>
                <p className="text-xs text-center mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Distribución por estado</p>
                {estadosChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={estadosChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <RechartsTooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {estadosChart.map((entry) => (
                          <Cell key={entry.name} fill={ESTADO_COLOR[entry.name.replace(/ /g, '_')] || '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--color-muted-foreground)' }}>Sin datos</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-foreground)' }}>Accesos rápidos</p>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => navigate('/admin/expedientes')}>
                <ClipboardList className="h-4 w-4" />
                Ver expedientes
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => navigate('/admin/sedes')}>
                <Building2 className="h-4 w-4" />
                Ver sedes
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => navigate('/coordinacion/reportes')}>
                <FileEdit className="h-4 w-4" />
                Reportes
              </Button>
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Últimos expedientes</p>
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => navigate('/admin/expedientes')}>
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {recientes.map((e) => (
                <div key={e.id} className="flex items-center gap-2 py-1.5">
                  <Users className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                      {e.nombreEstudiante} {e.apellidoEstudiante}
                    </p>
                    <p className="text-xs capitalize truncate" style={{ color: 'var(--color-muted-foreground)' }}>
                      {e.estado?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}
              {recientes.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No hay expedientes recientes.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-muted-foreground)' }}>Alertas activas</p>
            {alertas.length > 0 ? alertas.map((a, i) => (
              <div key={i} className="flex items-center gap-2 py-2" style={{ borderBottom: i < alertas.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <AlertTriangle className="h-[18px] w-[18px] shrink-0" style={{ color: a.severity === 'error' ? '#ef4444' : '#eab308' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{a.exp}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>{a.estudiante}</p>
                </div>
                <Badge variant={a.severity === 'error' ? 'danger' : 'warning'} size="sm">{a.tipo}</Badge>
              </div>
            )) : (
              <p className="text-sm py-2" style={{ color: 'var(--color-muted-foreground)' }}>No hay alertas activas</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-foreground)' }}>Listado de expedientes</p>
        {puedeAsignarComite && (
          <div className="flex items-center gap-2 p-4 rounded-xl text-sm mb-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            Para prácticas Final o Profesional, selecciona <strong>Asignar comité</strong> cuando el estado sea Carta de Aceptación presentada.
          </div>
        )}

        <div className="p-4 mb-3 flex gap-3 items-center flex-wrap rounded-xl border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
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

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Código</TableHead>
                <TableHead className="font-semibold">Estudiante</TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="font-semibold">Asesor / Empresa</TableHead>
                <TableHead className="font-semibold text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.codigoExpediente}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{e.nombreEstudiante} {e.apellidoEstudiante}</p>
                  </TableCell>
                  <TableCell><Badge variant="info" size="sm">{e.nombreTipoPractica}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={
                      ['OBSERVADO'].includes(e.estado) ? 'danger' :
                      ['EN_REVISION', 'PLAN_PRESENTADO'].includes(e.estado) ? 'warning' :
                      ['APROBADO', 'EVALUADO', 'CERRADO'].includes(e.estado) ? 'success' : 'info'
                    } size="sm">{estadoLabel(e.estado)}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs" style={{ color: 'var(--color-foreground)' }}>{e.nombreAsesor || '—'}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{e.nombreEmpresa || ''}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-center">
                      {puedeEmitirCarta && e.estado === 'VALIDADO_SECRETARIA' && (
                        <Tooltip content="Emitir y firmar Carta de Presentación">
                          <Button size="sm" variant="primary"
                            onClick={() => handleEmitirCarta(e.id)}
                            className="whitespace-nowrap text-xs font-semibold px-2">
                            Emitir Carta
                          </Button>
                        </Tooltip>
                      )}
                      {puedeAsignarComite
                        && ['FINAL', 'PROFESIONAL'].includes(e.codigoTipoPractica)
                        && e.estado === 'CARTA_ACEPTACION_PRESENTADA' && (
                          <Tooltip content="Seleccionar integrantes activos del comité">
                            <Button size="sm" variant="primary"
                              onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}
                              className="whitespace-nowrap text-xs font-semibold px-2">
                              Asignar comité
                            </Button>
                          </Tooltip>
                        )}
                      <Tooltip content="Ver detalle">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4" style={{ color: 'var(--color-muted-foreground)' }}>
                    No se encontraron expedientes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                {filtered.length > 0 ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filtered.length)} de ${filtered.length}` : '0 resultados'}
              </span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
                className="text-sm border rounded px-2 py-1"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
              >
                {[5, 10, 25].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>por página</span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
                Anterior
              </Button>
              <Button size="sm" variant="secondary" disabled={(page + 1) * rowsPerPage >= filtered.length} onClick={() => setPage(p => p + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

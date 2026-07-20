import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Scale, Eye, AlertTriangle,
  Users, ClipboardList, FileEdit, ListChecks, RefreshCw,
  ChevronRight, Building2, Search, FileText, X, BarChart3,
  Loader2, Info,
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/AuthContext';
import {
  useMisExpedientes,
  useAprobarInformeFinal,
  useEmitirDictamen,
} from '../../../hooks/useExpedientes';
import { planesApi } from '../../../api/planesApi';
import { ESTADOS_EXPEDIENTE, ESTADOS_CON_PLAN_EN_REVISION, ESTADOS_PARA_DICTAMEN } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import {
  Button, Input, Badge, Select, Progress, Tooltip,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Textarea, Card, CardContent, CardHeader, CardTitle,
} from '../../../ui';
import StatusChip from '../../../shared/components/StatusChip';

const MySwal = withReactContent(Swal);

interface Expediente {
  id: string;
  codigoExpediente: string;
  nombreEstudiante: string;
  apellidoEstudiante: string;
  codigoTipoPractica: string;
  nombreTipoPractica: string;
  estado: string;
  nombreAsesor: string;
  nombreEmpresa: string;
}

const ESTADOS_COMITE = Object.values(ESTADOS_EXPEDIENTE);

const esFinalOProfesional = (expediente: Expediente) => ['FINAL', 'PROFESIONAL'].includes(expediente.codigoTipoPractica);
const estadoLabel = (estado: string | undefined) => estado?.replace(/_/g, ' ').toLowerCase() || 'Pendiente';

const initialMotion = { opacity: 0 };
const animateMotion = { opacity: 1 };
const transitionMotion = { duration: 0.6 };

export const PanelComite = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: expedientes = [], isLoading, isError, error, refetch } = useMisExpedientes();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const [openDictamen, setOpenDictamen] = useState(false);
  const [dictamenExp, setDictamenExp] = useState<Expediente | null>(null);
  const [dictamenText, setDictamenText] = useState('');

  const aprobarInformeMutation = useAprobarInformeFinal();
  const emitirDictamenMutation = useEmitirDictamen();

  const isMutating =
    aprobarInformeMutation.isPending ||
    emitirDictamenMutation.isPending;

  const filtered = useMemo(() => expedientes.filter((e: Expediente) => {
    const q = searchTerm.toLowerCase();
    const fullName = `${e.nombreEstudiante} ${e.apellidoEstudiante}`.toLowerCase();
    const matchSearch = !q || fullName.includes(q) || e.codigoExpediente?.toLowerCase().includes(q);
    const matchTipo = filtroTipo === 'TODOS' || e.codigoTipoPractica === filtroTipo;
    const matchEstado = filtroEstado === 'TODOS' || e.estado === filtroEstado;
    return matchSearch && matchTipo && matchEstado;
  }), [expedientes, searchTerm, filtroTipo, filtroEstado]);

  const kpis = useMemo(() => ({
    total: expedientes.length,
    pendientes: expedientes.filter((e: Expediente) => esFinalOProfesional(e) && ESTADOS_CON_PLAN_EN_REVISION.includes(e.estado)).length,
    enEjecucion: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION).length,
    infFinalPresentado: expedientes.filter((e: Expediente) => esFinalOProfesional(e) && e.estado === ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO).length,
    observados: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.OBSERVADO).length,
    cerrados: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.CERRADO).length,
  }), [expedientes]);

  const estadoChart = useMemo(() => [
    { name: 'Plan por revisar', value: kpis.pendientes, color: 'bg-amber-500 dark:bg-amber-500' },
    { name: 'En ejecución', value: kpis.enEjecucion, color: 'bg-emerald-500 dark:bg-emerald-500' },
    { name: 'Inf. final x aprobar', value: kpis.infFinalPresentado, color: 'bg-violet-500 dark:bg-violet-500' },
    { name: 'Observados', value: kpis.observados, color: 'bg-red-500 dark:bg-red-500' },
    { name: 'Cerrados', value: kpis.cerrados, color: 'bg-blue-500 dark:bg-blue-500' },
  ], [kpis]);

  const tipoChart = useMemo(() => {
    const tipos = ['INICIAL', 'FINAL', 'PROFESIONAL'];
    return tipos.map((t) => ({
      name: t.charAt(0) + t.slice(1).toLowerCase(),
      value: expedientes.filter((e: Expediente) => e.codigoTipoPractica === t).length,
    }));
  }, [expedientes]);

  const maxEstado = Math.max(...estadoChart.map((i) => i.value), 1);
  const maxTipo = Math.max(...tipoChart.map((i) => i.value), 1);
  const avancePct = kpis.total > 0 ? Math.round((kpis.cerrados / kpis.total) * 100) : 0;

  const recientes = useMemo(() => [...expedientes].slice(0, 5), [expedientes]);

  const pendientesAccion = useMemo(
    () => expedientes.filter((e: Expediente) =>
      esFinalOProfesional(e) && (e.estado === ESTADOS_EXPEDIENTE.PLAN_PRESENTADO || e.estado === ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO)
    ),
    [expedientes],
  );

  const handleInvalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['expedientes'] });
  };

  const handleAction = async (action: 'aprobarPlan' | 'aprobarInforme', id: string) => {
    const result = await MySwal.fire({
      title: action === 'aprobarPlan' ? '¿Aprobar plan?' : '¿Aprobar informe final?',
      text: action === 'aprobarPlan'
        ? 'El plan de trabajo será marcado como aprobado.'
        : 'El informe final será aprobado por el comité.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
    });
    if (!result.isConfirmed) return;
    try {
      if (action === 'aprobarPlan') {
        const planRes = await planesApi.getActivoByExpediente(id);
        const planId = (planRes.data?.data as { id?: string } | undefined)?.id;
        if (!planId) throw new Error('No se encontró un plan activo para este expediente');
        await planesApi.aprobar(planId);
      } else {
        await aprobarInformeMutation.mutateAsync(id);
      }
      MySwal.fire('Operación exitosa', '', 'success');
      handleInvalidate();
    } catch (err: any) {
      MySwal.fire('Error', err?.response?.data?.message || err?.message || 'No se pudo completar la operación.', 'error');
    }
  };

  const handleEmitirDictamen = async () => {
    if (!dictamenText.trim() || !dictamenExp) return;
    try {
      await emitirDictamenMutation.mutateAsync({ id: dictamenExp.id, dictamen: dictamenText });
      setOpenDictamen(false);
      setDictamenExp(null);
      setDictamenText('');
      MySwal.fire('Dictamen emitido', 'El dictamen final fue registrado exitosamente.', 'success');
      handleInvalidate();
    } catch {
      MySwal.fire('Error', 'No se pudo emitir el dictamen.', 'error');
    }
  };

  const handleObservarPlan = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Observar plan de prácticas',
      input: 'textarea',
      inputLabel: 'Observaciones para el estudiante',
      inputPlaceholder: 'Detalle los aspectos que debe subsanar...',
      inputValidator: (value) => !value?.trim() && 'La observación es obligatoria.',
      showCancelButton: true,
      confirmButtonText: 'Registrar observación',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      const planRes = await planesApi.getActivoByExpediente(id);
      const planId = (planRes.data?.data as { id?: string } | undefined)?.id;
      if (!planId) throw new Error('No se encontró un plan activo para este expediente');
      await planesApi.observar(planId, { descripcion: result.value.trim() });
      MySwal.fire('Plan observado', 'Se notificó la observación al estudiante.', 'success');
      handleInvalidate();
    } catch (error: any) {
      MySwal.fire('Error', error?.response?.data?.message || error?.message || 'No se pudo registrar la observación.', 'error');
    }
  };

  const stats = [
    { label: 'Total expedientes', value: kpis.total, icon: Users, color: 'bg-[#1A3A6E] text-white dark:bg-[#4A6FA5] dark:text-white' },
    { label: 'Plan por revisar', value: kpis.pendientes, icon: ClipboardList, color: 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white' },
    { label: 'En ejecución', value: kpis.enEjecucion, icon: ListChecks, color: 'bg-emerald-600 text-white dark:bg-emerald-700 dark:text-white' },
    { label: 'Inf. final x aprobar', value: kpis.infFinalPresentado, icon: FileEdit, color: 'bg-violet-600 text-white dark:bg-violet-700 dark:text-white' },
  ];

  const tipoOptions = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'INICIAL', label: 'Inicial' },
    { value: 'FINAL', label: 'Final' },
    { value: 'PROFESIONAL', label: 'Profesional' },
  ];

  const estadoOptions = [
    { value: 'TODOS', label: 'Todos' },
    ...ESTADOS_COMITE.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
  ];

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Cargando expedientes...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={initialMotion}
      animate={animateMotion}
      transition={transitionMotion}
      className="space-y-6 animate-in p-4 sm:p-6"
    >
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 text-white shadow-lg">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <Building2 className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                Hola, {user?.nombres?.split(' ')[0] || 'Comité'}
              </h1>
              <p className="text-sm text-white/80 mt-1">
                Panel del Comité de Prácticas · Revisa, aprueba planes, supervisa informes finales y emite dictámenes
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="text-white border-white/30 bg-white/10 hover:bg-white/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <Info className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-900 dark:text-red-200">Error de carga</p>
            <p className="text-sm text-red-800 dark:text-red-300 mt-1">
              {error instanceof Error ? error.message : 'No se pudieron cargar los expedientes.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="shrink-0">
            Reintentar
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} variant="hover" className="p-5 flex items-center gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold text-foreground leading-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Pendientes Alert */}
      {pendientesAccion.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-blue-900 dark:text-blue-200">Acciones pendientes</p>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              Hay {pendientesAccion.length} acción(es) pendiente(s) en el panel.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                Resumen de Expedientes
              </CardTitle>
              <Badge variant="info" size="sm">{avancePct}% cerrados</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={avancePct} max={100} size="md" />
            <p className="text-xs text-muted-foreground">
              {kpis.cerrados} expedientes cerrados · {kpis.enEjecucion} en ejecución
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Donut Chart */}
              <div>
                <p className="text-xs text-center mb-3 font-semibold text-muted-foreground">Expedientes por Estado</p>
                <div className="h-52 flex items-center justify-center">
                  <div
                    className="w-36 h-36 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(#10b981 0 ${kpis.total ? (kpis.cerrados / kpis.total) * 100 : 0}%, #f59e0b 0 ${kpis.total ? ((kpis.cerrados + kpis.pendientes) / kpis.total) * 100 : 0}%, #e2e8f0 0 100%)`,
                    }}
                  >
                    <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center bg-card">
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{kpis.cerrados}</span>
                      <span className="text-xs text-muted-foreground">de {kpis.total}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  <Badge variant="info" size="sm"><Users className="h-3 w-3 mr-1" />{kpis.total} total</Badge>
                  <Badge variant="warning" size="sm"><AlertTriangle className="h-3 w-3 mr-1" />{kpis.observados} observados</Badge>
                </div>
              </div>

              {/* Bar Chart */}
              <div>
                <p className="text-xs text-center mb-3 font-semibold text-muted-foreground">Distribución de Estados</p>
                <div className="h-52 flex items-end justify-center gap-3 px-2 pb-2 border-b border-border">
                  {estadoChart.map((item) => {
                    const height = Math.max((item.value / maxEstado) * 160, item.value > 0 ? 16 : 4);
                    return (
                      <div key={item.name} className="w-14 text-center">
                        <span className="text-xs text-muted-foreground">{item.value}</span>
                        <div
                          className={cn('mt-2 rounded-t-lg', item.color)}
                          style={{ height }}
                        />
                        <span className="text-[0.65rem] leading-tight mt-2 block text-muted-foreground">
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Accesos rápidos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary-700 dark:text-primary-400">
                <FileText className="h-4 w-4" />
                Accesos rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => navigate('/admin/expedientes')}>
                <ClipboardList className="h-4 w-4 mr-2" /> Ver expedientes
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => navigate('/admin/sedes')}>
                <Building2 className="h-4 w-4 mr-2" /> Ver sedes
              </Button>
            </CardContent>
          </Card>

          {/* Últimos expedientes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Últimos expedientes
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/expedientes')}>
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recientes.map((e: Expediente) => (
                <div key={e.id} className="flex items-center gap-3 py-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <Users className="h-4 w-4 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {e.nombreEstudiante} {e.apellidoEstudiante}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground truncate">
                      {e.estado?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}
              {recientes.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay expedientes recientes.</p>
              )}
            </CardContent>
          </Card>

          {/* Modalidades */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Expedientes por Modalidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-end justify-center gap-6 px-2 pb-2 border-b border-border">
                {tipoChart.map((item, index) => {
                  const height = Math.max((item.value / maxTipo) * 120, item.value > 0 ? 16 : 4);
                  const color = index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-violet-500' : 'bg-emerald-500';
                  return (
                    <div key={item.name} className="w-16 text-center">
                      <span className="text-xs text-muted-foreground">{item.value}</span>
                      <div className={cn('mt-2 rounded-t-lg', color)} style={{ height }} />
                      <span className="text-xs mt-2 block text-muted-foreground">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de Expedientes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary-700 dark:text-primary-400" />
            Lista de Expedientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Estudiante o código"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setPage(0); }}
                className="pl-9"
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => { setSearchTerm(''); setPage(0); }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="min-w-[160px]">
              <Select
                label="Tipo"
                value={filtroTipo}
                options={tipoOptions}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFiltroTipo(e.target.value); setPage(0); }}
              />
            </div>
            <div className="min-w-[190px]">
              <Select
                label="Estado"
                value={filtroEstado}
                options={estadoOptions}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFiltroEstado(e.target.value); setPage(0); }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Código</TableHead>
                    <TableHead className="font-semibold">Estudiante</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Asesor / Empresa</TableHead>
                    <TableHead className="text-center font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((e: Expediente) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">{e.codigoExpediente}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm text-foreground">{e.nombreEstudiante} {e.apellidoEstudiante}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" size="sm">{e.nombreTipoPractica}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={e.estado} label={estadoLabel(e.estado)} />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs block text-foreground">{e.nombreAsesor || '—'}</span>
                        <span className="text-xs text-muted-foreground">{e.nombreEmpresa || ''}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          <Tooltip content="Ver detalle">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}
                              className="px-2.5"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          {esFinalOProfesional(e) && e.estado === ESTADOS_EXPEDIENTE.PLAN_PRESENTADO && (
                            <Tooltip content="Aprobar plan">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleAction('aprobarPlan', e.id)}
                                className="px-2.5"
                                disabled={isMutating}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          )}
                          {esFinalOProfesional(e) && e.estado === ESTADOS_EXPEDIENTE.PLAN_PRESENTADO && (
                            <Tooltip content="Observar plan">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleObservarPlan(e.id)}
                                className="px-2.5"
                                disabled={isMutating}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          )}
                          {esFinalOProfesional(e) && e.estado === ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO && (
                            <Tooltip content="Aprobar informe final">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleAction('aprobarInforme', e.id)}
                                className="px-2.5"
                                disabled={isMutating}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          )}
                          {esFinalOProfesional(e) && (
                            <Tooltip content="Evaluar componentes">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => navigate(`/comite/evaluaciones/${e.id}`)}
                                className="px-2.5"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          )}
                          {esFinalOProfesional(e) && ESTADOS_PARA_DICTAMEN.includes(e.estado) && (
                            <Tooltip content="Emitir dictamen">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => { setDictamenExp(e); setDictamenText(''); setOpenDictamen(true); }}
                                className="px-2.5"
                              >
                                <Scale className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                        No hay expedientes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground flex-wrap gap-3">
              <span>{filtered.length} expedientes</span>
              <div className="flex items-center gap-3">
                <select
                  value={rowsPerPage}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setRowsPerPage(+e.target.value); setPage(0); }}
                  className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs text-foreground"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <div className="flex gap-2 items-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                  >
                    Anterior
                  </Button>
                  <span>Pág. {page + 1} de {totalPages}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={(page + 1) * rowsPerPage >= filtered.length}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Dictamen */}
      <Dialog open={openDictamen} onOpenChange={setOpenDictamen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary-700 dark:text-primary-400" />
              Emitir Dictamen Final
            </DialogTitle>
            <DialogDescription>
              Expediente: {dictamenExp?.codigoExpediente} — {dictamenExp?.nombreEstudiante} {dictamenExp?.apellidoEstudiante}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <Textarea
              label="Detalle del dictamen"
              rows={4}
              value={dictamenText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDictamenText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenDictamen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEmitirDictamen} disabled={!dictamenText.trim() || isMutating}>
              Emitir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};


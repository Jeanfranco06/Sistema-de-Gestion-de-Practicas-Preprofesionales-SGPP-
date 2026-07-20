import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Scale, Eye, AlertTriangle,
  Users, ClipboardList, FileEdit, ListChecks, RefreshCw,
  ChevronRight, Building2, Search, FileText, X, BarChart3,
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
import {
  Button, Input, Badge, Select, Progress, Tooltip,
  Dialog, Textarea, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../../../ui';
import StatusChip from '../../../shared/components/StatusChip';
import Alert from '@mui/material/Alert';

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
    { name: 'Plan por revisar', value: kpis.pendientes, color: '#f59e0b' },
    { name: 'En ejecución', value: kpis.enEjecucion, color: '#10b981' },
    { name: 'Inf. final x aprobar', value: kpis.infFinalPresentado, color: '#8b5cf6' },
    { name: 'Observados', value: kpis.observados, color: '#ef4444' },
    { name: 'Cerrados', value: kpis.cerrados, color: '#3b82f6' },
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
    { label: 'Total expedientes', value: kpis.total, icon: Users, color: 'var(--color-primary)' },
    { label: 'Plan por revisar', value: kpis.pendientes, icon: ClipboardList, color: 'var(--color-warning)' },
    { label: 'En ejecución', value: kpis.enEjecucion, icon: ListChecks, color: 'var(--color-info)' },
    { label: 'Inf. final x aprobar', value: kpis.infFinalPresentado, icon: FileEdit, color: 'var(--color-success)' },
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
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-2 rounded-full" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={initialMotion}
      animate={animateMotion}
      transition={transitionMotion}
      className="space-y-6"
    >
      <div
        className="rounded-2xl p-6 text-white flex flex-wrap items-center justify-between gap-4"
        style={{ backgroundColor: '#1a365d' }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/15">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Hola, {user?.nombres?.split(' ')[0] || 'Comité'}
            </h1>
            <p className="text-sm text-white/80">
              Panel del Comité de Prácticas · Revisa, aprueba planes, supervisa informes finales y emite dictámenes
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} className="text-white border-white/30 hover:bg-white/10">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {isError && (
        <Alert severity="error" className="rounded-xl">
          {error instanceof Error ? error.message : 'No se pudieron cargar los expedientes.'}
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl border p-4 flex items-center gap-3"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {pendientesAccion.length > 0 && (
        <Alert severity="info" className="rounded-xl">
          Hay {pendientesAccion.length} acción(es) pendiente(s) en el panel.
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border p-5" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderTop: '3px solid var(--color-primary)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>Resumen de Expedientes</h2>
            <Badge variant="info">{avancePct}% cerrados</Badge>
          </div>
          <Progress value={avancePct} max={100} size="md" />
          <p className="text-xs mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
            {kpis.cerrados} expedientes cerrados · {kpis.enEjecucion} en ejecución
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <p className="text-xs text-center mb-3" style={{ color: 'var(--color-muted-foreground)' }}>Expedientes por Estado</p>
              <div className="h-52 flex items-center justify-center">
                <div
                  className="w-36 h-36 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(#10b981 0 ${kpis.total ? (kpis.cerrados / kpis.total) * 100 : 0}%, #f59e0b 0 ${kpis.total ? ((kpis.cerrados + kpis.pendientes) / kpis.total) * 100 : 0}%, #e0e7ff 0 100%)`,
                  }}
                >
                  <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--color-card)' }}>
                    <span className="text-xl font-bold text-emerald-600">{kpis.cerrados}</span>
                    <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>de {kpis.total}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                <Badge variant="info"><Users className="h-3 w-3 mr-1" />{kpis.total} total</Badge>
                <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />{kpis.observados} observados</Badge>
              </div>
            </div>

            <div>
              <p className="text-xs text-center mb-3" style={{ color: 'var(--color-muted-foreground)' }}>Distribución de Estados</p>
              <div
                className="h-52 flex items-end justify-center gap-3 px-2 pb-2 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {estadoChart.map((item) => {
                  const height = Math.max((item.value / maxEstado) * 160, item.value > 0 ? 16 : 4);
                  return (
                    <div key={item.name} className="w-14 text-center">
                      <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{item.value}</span>
                      <div
                        className="mt-2 rounded-t-lg"
                        style={{ height, backgroundColor: item.color }}
                      />
                      <span className="text-[0.65rem] leading-tight mt-2 block" style={{ color: 'var(--color-muted-foreground)' }}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderTop: '3px solid var(--color-primary)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Accesos rápidos</h3>
            <div className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => navigate('/admin/expedientes')}>
                <ClipboardList className="h-4 w-4 mr-2" /> Ver expedientes
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => navigate('/admin/sedes')}>
                <Building2 className="h-4 w-4 mr-2" /> Ver sedes
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Últimos expedientes</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/expedientes')}>
                Ver todos <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {recientes.map((e: Expediente) => (
                <div key={e.id} className="flex items-center gap-2 py-1">
                  <Users className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                      {e.nombreEstudiante} {e.apellidoEstudiante}
                    </p>
                    <p className="text-xs capitalize" style={{ color: 'var(--color-muted-foreground)' }}>
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

          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-muted-foreground)' }}>Expedientes por Modalidad</h3>
            <div
              className="h-40 flex items-end justify-center gap-6 px-2 pb-2 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {tipoChart.map((item, index) => {
                const height = Math.max((item.value / maxTipo) * 120, item.value > 0 ? 16 : 4);
                const color = index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#10b981';
                return (
                  <div key={item.name} className="w-16 text-center">
                    <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{item.value}</span>
                    <div className="mt-2 rounded-t-lg" style={{ height, backgroundColor: color }} />
                    <span className="text-xs mt-2 block" style={{ color: 'var(--color-muted-foreground)' }}>{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderTop: '3px solid var(--color-primary)' }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>Lista de Expedientes</h2>

        <div
          className="rounded-xl border p-4 mb-4 flex flex-wrap gap-3 items-center"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
            <Input
              placeholder="Estudiante o código"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setPage(0); }}
              className="pl-9"
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => { setSearchTerm(''); setPage(0); }}
                style={{ color: 'var(--color-muted-foreground)' }}
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

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
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
                    <TableCell><span className="font-mono text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{e.codigoExpediente}</span></TableCell>
                    <TableCell>
                      <span className="font-medium text-sm" style={{ color: 'var(--color-foreground)' }}>{e.nombreEstudiante} {e.apellidoEstudiante}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{e.nombreTipoPractica}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={e.estado} label={estadoLabel(e.estado)} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs block" style={{ color: 'var(--color-foreground)' }}>{e.nombreAsesor || '—'}</span>
                      <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{e.nombreEmpresa || ''}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Tooltip content="Ver detalle">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}
                            className="px-2"
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
                              className="px-2"
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
                              className="px-2"
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
                              className="px-2"
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
                              className="px-2"
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
                              className="px-2"
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
                    <TableCell colSpan={6} className="text-center py-8 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                      No hay expedientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div
            className="flex items-center justify-between px-4 py-3 border-t text-sm"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
          >
            <span>{filtered.length} expedientes</span>
            <div className="flex items-center gap-3">
              <select
                value={rowsPerPage}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setRowsPerPage(+e.target.value); setPage(0); }}
                className="rounded border px-2 py-1 text-xs"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
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
      </div>

      <Dialog open={openDictamen} onOpenChange={setOpenDictamen}>
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-2xl border shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>Emitir Dictamen Final</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                Expediente: {dictamenExp?.codigoExpediente} — {dictamenExp?.nombreEstudiante} {dictamenExp?.apellidoEstudiante}
              </p>
            </div>
            <div className="p-6">
              <Textarea
                label="Detalle del dictamen"
                rows={4}
                value={dictamenText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDictamenText(e.target.value)}
              />
            </div>
            <div className="p-6 border-t flex justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
              <Button variant="secondary" onClick={() => setOpenDictamen(false)}>Cancelar</Button>
              <Button onClick={handleEmitirDictamen} disabled={!dictamenText.trim() || isMutating}>
                Emitir
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </motion.div>
  );
};

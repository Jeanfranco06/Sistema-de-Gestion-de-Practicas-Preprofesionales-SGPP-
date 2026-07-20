import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, ListChecks, FileEdit, Building2, Eye,
  ClipboardList, RefreshCw, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useMisExpedientes } from '@/hooks/useExpedientes';
import { Button } from '@/ui/Button';
import { Badge } from '@/ui/Badge';
import { Progress } from '@/ui/Progress';
import { Input } from '@/ui/Input';
import { Tooltip } from '@/ui/Tooltip';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/ui/Table';

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
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  bgColor: string;
  color: string;
  borderColor: string;
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

const COLORS = {
  emerald: '#10b981',
  amber: '#f59e0b',
  blue: '#3b82f6',
  slate: '#94a3b8',
  border: '#e2e8f0',
};

function statusVariant(status?: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (!status) return 'neutral';
  const s = status.toUpperCase();
  if (['APROBADO', 'APROBADA', 'CERRADO', 'FINALIZADO', 'CUMPLIDO', 'ACEPTADO', 'COMPLETADO', 'EVALUADO', 'ACTIVO', 'VIGENTE'].includes(s)) return 'success';
  if (['RECHAZADO', 'RECHAZADA', 'CANCELADO', 'ANULADO', 'ERROR', 'VENCIDO', 'DESAPROBADO'].includes(s)) return 'danger';
  if (['OBSERVADO', 'OBSERVADA', 'PENDIENTE', 'EN_REVISION', 'PROCESO', 'BORRADOR', 'PLAN_OBSERVADO', 'SUBSANADO'].includes(s)) return 'warning';
  if (['EN_EJECUCION', 'SOLICITADO', 'PLAN_PRESENTADO', 'INFORME_PRESENTADO', 'DICTAMEN_EMITIDO', 'CARTA_PRESENTACION_EMITIDA', 'CARTA_ACEPTACION_PRESENTADA'].includes(s)) return 'info';
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
    () => expedientes.filter((e: Expediente) => e.estado === 'EVALUADO').length,
    [expedientes],
  );

  const kpis = useMemo(() => ({
    total: expedientes.length,
    enEjecucion: expedientes.filter((e: Expediente) => e.estado === 'EN_EJECUCION').length,
    porEvaluar: expedientes.filter((e: Expediente) => e.estado === 'INFORME_FINAL_PRESENTADO').length,
    empresas: new Set(expedientes.map((e: Expediente) => e.idEmpresa).filter(Boolean)).size,
  }), [expedientes]);

  const estadoChart: EstadoItem[] = useMemo(() => ([
    { name: 'En Ejecución', value: kpis.enEjecucion, color: COLORS.emerald },
    { name: 'Por Evaluar', value: kpis.porEvaluar, color: COLORS.amber },
    { name: 'Evaluados', value: evaluadosCount, color: COLORS.blue },
    {
      name: 'Otros',
      value: kpis.total - kpis.enEjecucion - kpis.porEvaluar - evaluadosCount,
      color: COLORS.slate,
    },
  ]), [kpis, evaluadosCount]);

  const maxEstado = Math.max(...estadoChart.map((i) => i.value), 1);
  const avancePct = kpis.total > 0 ? Math.round(((kpis.enEjecucion + evaluadosCount) / kpis.total) * 100) : 0;

  const recientes = useMemo(
    () => [...expedientes].slice(0, 5),
    [expedientes],
  );

  const pendientesAccion = useMemo(
    () => expedientes.filter((e: Expediente) => e.estado === 'INFORME_FINAL_PRESENTADO'),
    [expedientes],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 rounded-full" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  const stats: StatItem[] = [
    { label: 'Practicantes', value: kpis.total, icon: Users, bgColor: 'rgba(59, 130, 246, 0.1)', color: COLORS.blue, borderColor: 'rgba(59, 130, 246, 0.25)' },
    { label: 'En Ejecución', value: kpis.enEjecucion, icon: ListChecks, bgColor: 'rgba(16, 185, 129, 0.1)', color: COLORS.emerald, borderColor: 'rgba(16, 185, 129, 0.25)' },
    { label: 'Por Evaluar', value: kpis.porEvaluar, icon: FileEdit, bgColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.25)' },
    { label: 'Empresas', value: kpis.empresas, icon: Building2, bgColor: 'rgba(245, 158, 11, 0.1)', color: COLORS.amber, borderColor: 'rgba(245, 158, 11, 0.25)' },
  ];

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div style={{ color: 'var(--color-primary)' }}>
            <Building2 className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
              Hola, {user?.nombres?.split(' ')[0] || 'Tutor'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Panel del Tutor Externo · Seguimiento de practicantes y evaluaciones
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border p-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }}>
          <span className="text-sm flex-1">No se pudieron cargar los expedientes.</span>
          <button className="text-sm font-bold leading-none" onClick={() => refetch()}>&times;</button>
        </div>
      )}

      {pendientesAccion.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border p-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--color-info)' }}>
          <span className="text-sm flex-1">
            Hay {pendientesAccion.length} evaluación(es) pendiente(s).
          </span>
          <Button size="sm" onClick={() => navigate('/tutor/evaluaciones')}>Gestionar</Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bgColor, color: s.color, border: `1px solid ${s.borderColor}` }}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderTopWidth: '3px', borderTopColor: 'var(--color-primary)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>Resumen de Evaluaciones</h2>
              <Badge variant="default" size="sm">{avancePct}% en curso</Badge>
            </div>
            <Progress value={avancePct} max={100} size="md" />
            <p className="text-xs mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
              {kpis.enEjecucion + evaluadosCount} practicantes en curso · {kpis.porEvaluar} pendientes de evaluación
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              <div className="md:col-span-5">
                <p className="text-xs text-center mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Evaluaciones vs Pendientes</p>
                <div className="h-[210px] grid place-items-center">
                  <div
                    className="w-[148px] h-[148px] rounded-full grid place-items-center"
                    style={{
                      background: `conic-gradient(${COLORS.emerald} 0 ${kpis.total ? (evaluadosCount / kpis.total) * 100 : 0}%, ${COLORS.amber} 0 ${kpis.total ? ((evaluadosCount + kpis.porEvaluar) / kpis.total) * 100 : 0}%, ${COLORS.border} 0 100%)`,
                    }}
                  >
                    <div className="w-[104px] h-[104px] rounded-full grid place-items-center text-center" style={{ backgroundColor: 'var(--color-card)' }}>
                      <span className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{kpis.enEjecucion + evaluadosCount}</span>
                      <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>de {kpis.total}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center -mt-1">
                  <Badge variant="info" size="sm"><Users className="h-3 w-3 mr-1" />{kpis.total} total</Badge>
                  <Badge variant="warning" size="sm"><FileEdit className="h-3 w-3 mr-1" />{kpis.porEvaluar} pendientes</Badge>
                </div>
              </div>

              <div className="md:col-span-7">
                <p className="text-xs text-center mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Distribución de Estados</p>
                <div className="h-[210px] flex items-end justify-center gap-3 px-2 pb-1" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {estadoChart.map((item) => {
                    const height = Math.max((item.value / maxEstado) * 160, item.value > 0 ? 16 : 4);
                    return (
                      <div key={item.name} className="w-14 text-center">
                        <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{item.value}</span>
                        <div className="mt-1 rounded-t-lg" style={{ height, backgroundColor: item.color }} />
                        <span className="text-[0.65rem] leading-tight block mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderTopWidth: '3px', borderTopColor: 'var(--color-primary)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Accesos rápidos</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/tutor/evaluaciones')}>
                <ClipboardList className="h-4 w-4" />
                Mis Evaluaciones
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/tutor/dashboard')}>
                <Users className="h-4 w-4" />
                Ver Practicantes
              </Button>
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Últimos Practicantes</h3>
              <Button size="sm" variant="ghost" onClick={() => {}}>
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {recientes.map((e: Expediente) => (
                <div key={e.id} className="flex items-center gap-2">
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
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No hay practicantes recientes.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderTopWidth: '3px', borderTopColor: 'var(--color-primary)' }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>Mis Practicantes Asignados</h2>

        <div className="rounded-xl border p-4 flex flex-wrap gap-3 items-center mb-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="min-w-[300px] flex-1 max-w-md">
            <Input
              placeholder="Buscar practicante (nombre, código o empresa)"
              value={searchTerm}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(event.target.value); setPage(0); }}
            />
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: 'var(--color-border)' }}>
                <TableHead style={{ color: 'var(--color-foreground)' }}>Estudiante</TableHead>
                <TableHead style={{ color: 'var(--color-foreground)' }}>Tipo</TableHead>
                <TableHead style={{ color: 'var(--color-foreground)' }}>Estado</TableHead>
                <TableHead style={{ color: 'var(--color-foreground)' }}>Empresa / Sede</TableHead>
                <TableHead className="text-center" style={{ color: 'var(--color-foreground)' }}>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((e: Expediente) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <p className="font-medium text-sm" style={{ color: 'var(--color-foreground)' }}>{e.nombreEstudiante} {e.apellidoEstudiante}</p>
                    <p className="font-mono text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{e.codigoExpediente}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info" size="sm">{e.nombreTipoPractica}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(e.estado)} size="sm">{estadoLabel(e.estado)}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs block" style={{ color: 'var(--color-foreground)' }}>{e.nombreEmpresa || '—'}</span>
                    <span className="text-xs block" style={{ color: 'var(--color-muted-foreground)' }}>{e.nombreSede || ''}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Tooltip content="Ver detalle">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      {['INFORME_FINAL_PRESENTADO', 'INFORME_APROBADO'].includes(e.estado) && (
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
                  <TableCell colSpan={5} className="text-center py-8 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                    No se encontraron practicantes asignados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}>
            <div className="flex items-center gap-2">
              <span>Filas por página:</span>
              <select
                value={rowsPerPage}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { setRowsPerPage(+event.target.value); setPage(0); }}
                className="rounded border px-2 py-1 text-sm"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
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
      </div>
    </motion.div>
  );
}

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, ListChecks, FileEdit, UserCircle, RefreshCw,
  ChevronRight, CheckCircle2, Clock, GraduationCap, ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useMisExpedientes } from '@/hooks/useExpedientes';
import { Button } from '@/ui/Button';
import { Badge } from '@/ui/Badge';
import { Progress } from '@/ui/Progress';

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
}

interface TipoItem {
  name: string;
  value: number;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  bgColor: string;
  color: string;
  borderColor: string;
}

const COLORS = {
  blue: '#3b82f6',
  violet: '#8b5cf6',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  slate: '#94a3b8',
  border: '#e2e8f0',
};

export default function DashboardDocente() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: expedientes = [], isLoading, error, refetch } = useMisExpedientes();

  const kpis = useMemo(() => {
    const activos = expedientes.filter((e: Expediente) => !['EVALUADO', 'CERRADO'].includes(e.estado));
    const finalizados = expedientes.length - activos.length;
    return {
      total: expedientes.length,
      activos: activos.length,
      finalizados,
      enEjecucion: expedientes.filter((e: Expediente) => e.estado === 'EN_EJECUCION').length,
      porEvaluar: expedientes.filter((e: Expediente) =>
        ['INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO'].includes(e.estado)
      ).length,
      observados: expedientes.filter((e: Expediente) => e.estado === 'OBSERVADO').length,
      planPendiente: expedientes.filter((e: Expediente) =>
        e.estado === 'ASESOR_ASIGNADO' || e.estado === 'PLAN_PRESENTADO'
      ).length,
    };
  }, [expedientes]);

  const estadoChart: EstadoItem[] = useMemo(() => [
    { name: 'En ejecución', value: kpis.enEjecucion, color: COLORS.blue },
    { name: 'Por evaluar', value: kpis.porEvaluar, color: COLORS.violet },
    { name: 'Observados', value: kpis.observados, color: COLORS.red },
    { name: 'Plan / revisión', value: kpis.planPendiente, color: COLORS.amber },
    {
      name: 'Otros activos',
      value: Math.max(kpis.activos - kpis.enEjecucion - kpis.porEvaluar - kpis.observados - kpis.planPendiente, 0),
      color: COLORS.slate,
    },
  ], [kpis]);

  const tipoChart: TipoItem[] = useMemo(() => {
    const tipos = ['INICIAL', 'FINAL', 'PROFESIONAL'];
    return tipos.map((t) => ({
      name: t.charAt(0) + t.slice(1).toLowerCase(),
      value: expedientes.filter((e: Expediente) => e.codigoTipoPractica === t).length,
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
      e.estado === 'OBSERVADO'
      || e.estado === 'PLAN_PRESENTADO'
      || ['INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO'].includes(e.estado)
    ),
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
    { label: 'Practicantes', value: kpis.total, icon: UserCircle, bgColor: 'rgba(59, 130, 246, 0.1)', color: COLORS.blue, borderColor: 'rgba(59, 130, 246, 0.25)' },
    { label: 'Activos', value: kpis.activos, icon: Users, bgColor: 'rgba(16, 185, 129, 0.1)', color: COLORS.emerald, borderColor: 'rgba(16, 185, 129, 0.25)' },
    { label: 'En ejecución', value: kpis.enEjecucion, icon: ListChecks, bgColor: 'rgba(139, 92, 246, 0.1)', color: COLORS.violet, borderColor: 'rgba(139, 92, 246, 0.25)' },
    { label: 'Por evaluar', value: kpis.porEvaluar, icon: FileEdit, bgColor: 'rgba(245, 158, 11, 0.1)', color: COLORS.amber, borderColor: 'rgba(245, 158, 11, 0.25)' },
  ];

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
            <GraduationCap className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
              Hola, {user?.nombres?.split(' ')[0] || 'Docente'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Panel de asesoría · Supervisa el avance de tus practicantes
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
          <span className="text-sm flex-1">No se pudieron cargar los expedientes. Verifica la conexión con el backend.</span>
          <button className="text-sm font-bold leading-none" onClick={() => refetch()}>&times;</button>
        </div>
      )}

      {pendientesAccion.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border p-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--color-warning)' }}>
          <span className="text-sm flex-1">
            Tienes {pendientesAccion.length} practicante(s) con acciones pendientes de tu parte.
          </span>
          <Button size="sm" onClick={() => navigate('/docente/practicantes')}>Revisar</Button>
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
              <h2 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>Resumen de asesoría</h2>
              <Badge variant="default" size="sm">{avancePct}% finalizados</Badge>
            </div>
            <Progress value={avancePct} max={100} size="md" />
            <p className="text-xs mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
              {kpis.finalizados} culminados · {kpis.activos} en seguimiento activo
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              <div className="md:col-span-5">
                <p className="text-xs text-center mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Activos vs finalizados</p>
                <div className="h-[210px] grid place-items-center">
                  <div
                    className="w-[148px] h-[148px] rounded-full grid place-items-center"
                    style={{
                      background: `conic-gradient(${COLORS.emerald} 0 ${kpis.total ? (kpis.finalizados / kpis.total) * 100 : 0}%, ${COLORS.border} 0 100%)`,
                    }}
                  >
                    <div className="w-[104px] h-[104px] rounded-full grid place-items-center text-center" style={{ backgroundColor: 'var(--color-card)' }}>
                      <span className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{kpis.finalizados}</span>
                      <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>de {kpis.total}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center -mt-1">
                  <Badge variant="info" size="sm"><CheckCircle2 className="h-3 w-3 mr-1" />{kpis.activos} activos</Badge>
                  <Badge variant="warning" size="sm"><Clock className="h-3 w-3 mr-1" />{kpis.observados} observados</Badge>
                </div>
              </div>

              <div className="md:col-span-7">
                <p className="text-xs text-center mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Distribución por estado</p>
                <div className="h-[210px] flex items-end justify-center gap-3 px-2 pb-1" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {estadoChart.map((item) => {
                    const height = Math.max((item.value / maxEstado) * 160, item.value > 0 ? 16 : 4);
                    return (
                      <div key={item.name} className="w-14 text-center">
                        <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{item.value}</span>
                        <div
                          className="mt-1 rounded-t-lg"
                          style={{ height, backgroundColor: item.color }}
                        />
                        <span className="text-[0.65rem] leading-tight block mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <hr className="my-6" style={{ borderColor: 'var(--color-border)' }} />

            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-muted-foreground)' }}>Modalidad de práctica</h3>
            <div className="flex items-end justify-center gap-8 px-2 pb-1" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {tipoChart.map((item, index) => {
                const height = Math.max((item.value / maxTipo) * 120, item.value > 0 ? 16 : 4);
                const bg = index === 0 ? COLORS.blue : index === 1 ? COLORS.violet : COLORS.emerald;
                return (
                  <div key={item.name} className="w-[72px] text-center">
                    <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{item.value}</span>
                    <div className="mt-1 rounded-t-lg" style={{ height, backgroundColor: bg }} />
                    <span className="text-xs block mt-2" style={{ color: 'var(--color-muted-foreground)' }}>{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderTopWidth: '3px', borderTopColor: 'var(--color-primary)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Accesos rápidos</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/docente/practicantes')}>
                <Users className="h-4 w-4" />
                Mis practicantes
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/docente/practicantes')}>
                <FileEdit className="h-4 w-4" />
                Evaluaciones pendientes
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/docente/practicantes')}>
                <ClipboardList className="h-4 w-4" />
                Revisar planes
              </Button>
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Practicantes recientes</h3>
              <Button size="sm" variant="ghost" onClick={() => navigate('/docente/practicantes')}>
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
                      {e.nombreEmpresa || e.estado?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}
              {recientes.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No hay practicantes asignados.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

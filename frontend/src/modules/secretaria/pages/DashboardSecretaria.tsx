import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen, RefreshCw, FileText, Award, AlertTriangle,
  Users, ArrowRight, Briefcase, CheckCircle2, Clock, BarChart3, PieChart
} from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { useExpedientes } from '../../../hooks/useExpedientes';
import { ESTADOS_EXPEDIENTE, ESTADOS_FINALIZADOS } from '../../../lib/constants';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { Progress } from '../../../ui/Progress';
import { Card } from '../../../ui/Card';

export default function DashboardSecretaria() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: expedientes = [], isLoading, refetch } = useExpedientes();

  const kpis = useMemo(() => {
    const total = expedientes.length;
    const activos = expedientes.filter((e: any) => !ESTADOS_FINALIZADOS.includes(e.estado));
    return {
      total,
      activos: activos.length,
      finalizados: total - activos.length,
      pendientesCarta: expedientes.filter((e: any) => e.estado === ESTADOS_EXPEDIENTE.SOLICITADO || e.estado === ESTADOS_EXPEDIENTE.EMPRESA_SEDE_ASIGNADA).length,
      pendientesConstancia: expedientes.filter((e: any) => e.estado === ESTADOS_EXPEDIENTE.EVALUADO).length,
      observados: expedientes.filter((e: any) => e.estado === ESTADOS_EXPEDIENTE.OBSERVADO).length,
    };
  }, [expedientes]);

  const estadoChart = useMemo(() => [
    { name: 'Trámite Inicial', value: kpis.pendientesCarta, color: '#3b82f6' },
    { name: 'En Ejecución', value: expedientes.filter((e: any) => e.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION).length, color: '#10b981' },
    { name: 'Observados', value: kpis.observados, color: '#ef4444' },
    { name: 'Para Constancia', value: kpis.pendientesConstancia, color: '#f59e0b' },
    { name: 'Otros activos', value: Math.max(kpis.activos - kpis.pendientesCarta - expedientes.filter((e: any) => e.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION).length - kpis.observados - kpis.pendientesConstancia, 0), color: '#94a3b8' },
  ], [kpis, expedientes]);

  const maxEstado = Math.max(...estadoChart.map(i => i.value), 1);
  const avancePct = kpis.total > 0 ? Math.round((kpis.finalizados / kpis.total) * 100) : 0;
  const pendientesAccion = useMemo(() => expedientes.filter((e: any) => e.estado === ESTADOS_EXPEDIENTE.SOLICITADO || e.estado === ESTADOS_EXPEDIENTE.EVALUADO), [expedientes]);
  const recientes = useMemo(() => [...expedientes].slice(0, 5), [expedientes]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] flex-col gap-3">
        <div className="animate-spin h-10 w-10 border-4 rounded-full" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Cargando panel administrativo...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-6">
      <div className="rounded-2xl p-6 md:p-8 relative overflow-hidden" style={{ backgroundColor: '#1a365d', color: 'white' }}>
        <Briefcase className="absolute -right-10 -top-10 opacity-10 h-48 w-48 hidden md:block" />
        <p className="text-xs uppercase tracking-widest opacity-80 font-semibold mb-1">Panel Administrativo</p>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Hola, {user?.nombres?.split(' ')[0] || 'Secretaría'}</h1>
        <p className="text-sm opacity-90">Gestión de trámites, emisión de documentos y validación de requisitos</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-1" /> Actualizar</Button>
      </div>

      {pendientesAccion.length > 0 && (
        <div className="rounded-xl border p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--color-warning)/10', borderColor: 'var(--color-warning)' }}>
          <AlertTriangle className="h-5 w-5 mt-0.5" style={{ color: 'var(--color-warning)' }} />
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: 'var(--color-warning)' }}>Atención requerida</p>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Hay {pendientesAccion.length} trámite(s) pendientes de atención documental rápida.</p>
          </div>
          <Button size="sm" onClick={() => navigate('/secretaria/recepcion')}>Gestionar Ahora</Button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Expedientes', val: kpis.total, icon: FolderOpen, color: '#0ea5e9' },
          { label: 'Trámites Activos', val: kpis.activos, icon: Clock, color: '#10b981' },
          { label: 'Cartas Pendientes', val: kpis.pendientesCarta, icon: FileText, color: '#8b5cf6' },
          { label: 'Constancias Pendientes', val: kpis.pendientesConstancia, icon: Award, color: '#f59e0b' },
        ].map((kpi, idx) => (
          <div key={idx} className="rounded-xl border p-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-muted-foreground)' }}>{kpi.label}</span>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}><kpi.icon className="h-5 w-5" /></div>
            </div>
            <span className="text-3xl font-extrabold" style={{ color: 'var(--color-foreground)' }}>{kpi.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold" style={{ color: 'var(--color-foreground)' }}>Estado Global de Expedientes</h3>
              <Badge variant="primary">{avancePct}% cerrados</Badge>
            </div>
            <Progress value={avancePct} className="h-3 mb-2" />
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted-foreground)' }}>
              {kpis.finalizados} trámites finalizados de un total de {kpis.total}. Actualmente hay {kpis.activos} en proceso.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <p className="text-sm font-bold mb-4" style={{ color: 'var(--color-foreground)' }}>Tasa de Finalización</p>
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray={`${(kpis.finalizados / Math.max(kpis.total, 1)) * 264} 264`} strokeLinecap="round" />
                  </svg>
                  <div className="text-center">
                    <span className="text-3xl font-extrabold" style={{ color: '#1a365d' }}>{kpis.finalizados}</span>
                    <p className="text-xs font-semibold uppercase" style={{ color: 'var(--color-muted-foreground)' }}>Completados</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  <Badge variant="info">{kpis.activos} activos</Badge>
                  {kpis.observados > 0 && <Badge variant="error">{kpis.observados} observados</Badge>}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold mb-4 text-center" style={{ color: 'var(--color-foreground)' }}>Distribución por Etapa</p>
                <div className="h-48 flex items-end justify-between gap-1 px-2 border-b-2" style={{ borderColor: '#e2e8f0' }}>
                  {estadoChart.map(item => (
                    <div key={item.name} className="w-1/5 flex flex-col items-center">
                      <span className="text-xs font-bold mb-1" style={{ color: item.value > 0 ? 'var(--color-foreground)' : 'var(--color-muted-foreground)', opacity: item.value > 0 ? 1 : 0.4 }}>{item.value}</span>
                      <div className="w-full flex justify-center" style={{ height: 180 }}>
                        <div
                          className="w-4/5 rounded-t-md transition-all duration-1000"
                          style={{ height: `${Math.max((item.value / maxEstado) * 100, item.value > 0 ? 10 : 2)}%`, backgroundColor: item.color, boxShadow: `0 4px 12px ${item.color}40` }}
                        />
                      </div>
                      <span className="text-[0.65rem] font-semibold text-center mt-2 leading-tight h-6" style={{ color: 'var(--color-muted-foreground)' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--color-foreground)' }}>Accesos Rápidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'Recepción Administrativa', sub: 'Procesar documentos', icon: FileText, action: () => navigate('/secretaria/recepcion') },
                { title: 'Validar Requisitos', sub: 'Revisión de estudiantes', icon: CheckCircle2, action: () => navigate('/admin/validar-requisitos') },
                { title: 'Explorar Expedientes', sub: 'Todos los trámites', icon: FolderOpen, action: () => navigate('/admin/expedientes') },
              ].map(btn => (
                <button key={btn.title} onClick={btn.action}
                  className="rounded-xl border p-4 text-left flex items-center gap-3 transition-all hover:border-primary"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}><btn.icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--color-foreground)' }}>{btn.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>{btn.sub}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--color-foreground)' }}>Últimos Registros</h3>
            <div className="space-y-3">
              {recientes.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
                    <Users className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{e.nombreEstudiante} {e.apellidoEstudiante}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--color-muted-foreground)' }}>{e.estado?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
              {recientes.length === 0 && <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No hay expedientes recientes.</p>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, RefreshCw, Search, ChevronRight,
  FileText, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { useExpedientes } from '../../../hooks/useExpedientes';
import { ESTADOS_EXPEDIENTE, ESTADOS_FINALIZADOS } from '../../../lib/constants';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Badge } from '../../../ui/Badge';
import { Table } from '../../../ui/Table';

const ESTADOS = Object.values(ESTADOS_EXPEDIENTE);

function getEstadoBadge(estado: string) {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    [ESTADOS_EXPEDIENTE.OBSERVADO]: 'error',
    APROBADO: 'success',
    [ESTADOS_EXPEDIENTE.EVALUADO]: 'success',
    [ESTADOS_EXPEDIENTE.CERRADO]: 'success',
    [ESTADOS_EXPEDIENTE.SOLICITADO]: 'info',
    EN_REVISION: 'warning',
  };
  return map[estado] || 'default';
}

export function GestionExpedientes() {
  const navigate = useNavigate();
  const { data: expedientes = [], isLoading, refetch } = useExpedientes();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => expedientes.filter((e: any) => {
    const q = searchTerm.toLowerCase();
    return (!q || e.nombreEstudiante?.toLowerCase().includes(q) || e.apellidoEstudiante?.toLowerCase().includes(q) || e.codigoExpediente?.toLowerCase().includes(q))
      && (filtroTipo === 'TODOS' || e.codigoTipoPractica === filtroTipo)
      && (filtroEstado === 'TODOS' || e.estado === filtroEstado);
  }), [expedientes, searchTerm, filtroTipo, filtroEstado]);

  const kpis = useMemo(() => ({
    total: expedientes.length,
    activos: expedientes.filter((e: any) => !ESTADOS_FINALIZADOS.includes(e.estado)).length,
    enEjecucion: expedientes.filter((e: any) => e.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION).length,
    cerrados: expedientes.filter((e: any) => e.estado === ESTADOS_EXPEDIENTE.CERRADO).length,
  }), [expedientes]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Gestión de Expedientes</h1>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Listado y control de todos los expedientes de práctica</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-1" /> Actualizar</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Expedientes', value: kpis.total, icon: FolderOpen, color: 'var(--color-primary)' },
          { label: 'Activos', value: kpis.activos, icon: Clock, color: 'var(--color-info)' },
          { label: 'En Ejecución', value: kpis.enEjecucion, icon: FileText, color: 'var(--color-warning)' },
          { label: 'Cerrados', value: kpis.cerrados, icon: CheckCircle2, color: 'var(--color-success)' },
        ].map((kpi, idx) => (
          <div key={idx} className="rounded-xl border p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}><kpi.icon className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{kpi.value}</p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4 flex flex-wrap gap-3 items-center" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
          <Input
            placeholder="Buscar por estudiante o código"
            value={searchTerm}
            onChange={(e: any) => { setSearchTerm(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => { setFiltroTipo(e.target.value); setPage(0); }}
          className="rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
        >
          <option value="TODOS">Todos los tipos</option>
          <option value="INICIAL">Inicial</option>
          <option value="FINAL">Final</option>
          <option value="PROFESIONAL">Profesional</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); setPage(0); }}
          className="rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
        >
          <option value="TODOS">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-2 rounded-full" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-muted)' }}>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Código</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Estudiante</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Tipo</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Estado</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Asesor / Empresa</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((e: any) => (
                    <tr key={e.id} className="hover:opacity-80 transition-opacity border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="p-3"><span className="font-mono text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{e.codigoExpediente}</span></td>
                      <td className="p-3"><span className="font-medium text-sm" style={{ color: 'var(--color-foreground)' }}>{e.nombreEstudiante} {e.apellidoEstudiante}</span></td>
                      <td className="p-3"><Badge variant="outline">{e.nombreTipoPractica}</Badge></td>
                      <td className="p-3"><Badge variant={getEstadoBadge(e.estado)}>{e.estado?.replace(/_/g, ' ')}</Badge></td>
                      <td className="p-3">
                        <span className="text-xs" style={{ color: 'var(--color-foreground)' }}>{e.nombreAsesor || '—'}</span>
                        {e.nombreEmpresa && <span className="text-xs block" style={{ color: 'var(--color-muted-foreground)' }}>{e.nombreEmpresa}</span>}
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/expedientes/${e.id}`)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No se encontraron expedientes</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
            <div className="flex items-center justify-between px-3 py-2 border-t text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}>
              <span>{filtered.length} expedientes</span>
              <div className="flex gap-2 items-center">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-2 py-1 rounded border text-xs disabled:opacity-50" style={{ borderColor: 'var(--color-border)' }}>Anterior</button>
                <span>Pág. {page + 1}</span>
                <button disabled={(page + 1) * rowsPerPage >= filtered.length} onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded border text-xs disabled:opacity-50" style={{ borderColor: 'var(--color-border)' }}>Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

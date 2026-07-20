import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, RefreshCw, Search, ChevronRight,
  FileText, CheckCircle2, Clock
} from 'lucide-react';
import { useExpedientes } from '../../../hooks/useExpedientes';
import { ESTADOS_EXPEDIENTE, ESTADOS_FINALIZADOS } from '../../../lib/constants';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Badge } from '../../../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../ui/Table';
import { Card, CardContent } from '../../../ui/Card';
import { Select } from '../../../ui/Select';
import { cn } from '../../../lib/utils';

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
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 md:p-8 text-white shadow-lg">
        <FolderOpen className="absolute -right-10 -top-10 h-48 w-48 opacity-10 hidden md:block" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">Administración</p>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Gestión de Expedientes</h1>
            <p className="text-sm opacity-90">Listado y control de todos los expedientes de práctica</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="shrink-0 bg-white/10 text-white border-white/20 hover:bg-white/20">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Expedientes', value: kpis.total, icon: FolderOpen, color: 'bg-[#1A3A6E] text-white dark:bg-[#4A6FA5] dark:text-white' },
          { label: 'Activos', value: kpis.activos, icon: Clock, color: 'bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-50' },
          { label: 'En Ejecución', value: kpis.enEjecucion, icon: FileText, color: 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white' },
          { label: 'Cerrados', value: kpis.cerrados, icon: CheckCircle2, color: 'bg-primary-600 text-white dark:bg-primary-700 dark:text-white' },
        ].map((kpi, idx) => (
          <Card key={idx} className="p-4 flex items-center gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', kpi.color)}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{kpi.value}</p>
              <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <CardContent className="p-0 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por estudiante o código"
              value={searchTerm}
              onChange={(e: any) => { setSearchTerm(e.target.value); setPage(0); }}
              className="pl-9"
            />
          </div>
          <Select
            label="Tipo"
            value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value); setPage(0); }}
            options={[
              { value: 'TODOS', label: 'Todos los tipos' },
              { value: 'INICIAL', label: 'Inicial' },
              { value: 'FINAL', label: 'Final' },
              { value: 'PROFESIONAL', label: 'Profesional' },
            ]}
            className="min-w-[160px]"
          />
          <Select
            label="Estado"
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPage(0); }}
            options={[
              { value: 'TODOS', label: 'Todos los estados' },
              ...ESTADOS.map(s => ({ value: s, label: s.replace(/_/g, ' ') })),
            ]}
            className="min-w-[180px]"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 rounded-full border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="font-semibold text-muted-foreground">Código</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Estudiante</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Tipo</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Estado</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Asesor / Empresa</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell><span className="font-mono text-xs text-muted-foreground">{e.codigoExpediente}</span></TableCell>
                      <TableCell><span className="font-medium text-sm text-foreground">{e.nombreEstudiante} {e.apellidoEstudiante}</span></TableCell>
                      <TableCell><Badge variant="outline">{e.nombreTipoPractica}</Badge></TableCell>
                      <TableCell><Badge variant={getEstadoBadge(e.estado)}>{e.estado?.replace(/_/g, ' ')}</Badge></TableCell>
                      <TableCell>
                        <span className="text-xs text-foreground">{e.nombreAsesor || '—'}</span>
                        {e.nombreEmpresa && <span className="text-xs block text-muted-foreground">{e.nombreEmpresa}</span>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/expedientes/${e.id}`)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                        No se encontraron expedientes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground" style={{ borderColor: 'var(--color-border)' }}>
              <span>{filtered.length} expedientes</span>
              <div className="flex gap-2 items-center">
                <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <span className="px-2">Pág. {page + 1}</span>
                <Button variant="ghost" size="sm" disabled={(page + 1) * rowsPerPage >= filtered.length} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

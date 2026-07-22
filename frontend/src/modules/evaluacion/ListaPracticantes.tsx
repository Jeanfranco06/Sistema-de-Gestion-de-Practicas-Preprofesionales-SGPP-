import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, FileText, ChevronRight, Users, X,
  Eye, Building2, FileEdit,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useMisExpedientes } from '../../hooks/useExpedientes';
import { hasAnyRole } from '../../shared/utils/roleRoutes';
import {
  ESTADOS_EXPEDIENTE,
  ESTADOS_INFORME_PARCIAL_PRESENTADO,
  ESTADOS_PARA_EVALUAR,
  ESTADOS_FINALIZADOS,
} from '../../lib/constants';
import StatusChip from '../../shared/components/StatusChip';
import {
  Button, Input, Badge, Select, Tooltip, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../../ui';

interface Practicante {
  id: string;
  nombreEstudiante: string;
  apellidoEstudiante: string;
  codigoEstudiantil: string;
  codigoExpediente: string;
  nombreEmpresa: string;
  nombreSede: string;
  nombreTipoPractica: string;
  codigoTipoPractica: string;
  estado: string;
}

const ESTADOS_FILTRO = [
  'TODOS',
  ESTADOS_EXPEDIENTE.EN_EJECUCION,
  ESTADOS_EXPEDIENTE.PLAN_PRESENTADO,
  ESTADOS_EXPEDIENTE.OBSERVADO,
  ESTADOS_EXPEDIENTE.INFORME_PARCIAL_1_PRESENTADO,
  ESTADOS_EXPEDIENTE.INFORME_PARCIAL_2_PRESENTADO,
  ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO,
  ESTADOS_EXPEDIENTE.EVALUADO,
  ESTADOS_EXPEDIENTE.CERRADO,
];

const estadoLabel = (estado: string | undefined) => estado?.replace(/_/g, ' ').toLowerCase() || 'Pendiente';

const initialMotion = { opacity: 0 };
const animateMotion = { opacity: 1 };
const transitionMotion = { duration: 0.6 };

export const ListaPracticantes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: practicantes = [], isLoading } = useMisExpedientes();

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isTutor = hasAnyRole(user?.roles, ['TUTOR_EXTERNO']);
  const isAdmin = hasAnyRole(user?.roles, ['ADMIN_SISTEMA', 'ADMINISTRADOR']);
  const isComite = hasAnyRole(user?.roles, ['COMITE_PRACTICAS']);
  console.log("DEBUG - ListaPracticantes:", { roles: user?.roles, isAdmin, isComite });
  const location = useLocation();
  const isOnTutorPath = location.pathname.startsWith('/tutor');
  const basePath = (isTutor || isOnTutorPath) ? '/tutor' : '/docente';

  const filteredPracticantes = useMemo(() => {
    const q = search.toLowerCase();
    return practicantes.filter((p: Practicante) => {
      const fullName = `${p.nombreEstudiante} ${p.apellidoEstudiante}`.toLowerCase();
      const matchSearch = !q
        || fullName.includes(q)
        || p.codigoEstudiantil?.toLowerCase().includes(q)
        || p.codigoExpediente?.toLowerCase().includes(q)
        || p.nombreEmpresa?.toLowerCase().includes(q);
      const matchEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
      const matchTipo = filtroTipo === 'TODOS' || p.codigoTipoPractica === filtroTipo;
      const matchTutorRuta = !isOnTutorPath || p.codigoTipoPractica !== 'INICIAL';
      return matchSearch && matchEstado && matchTipo && matchTutorRuta;
    });
  }, [practicantes, search, filtroEstado, filtroTipo, isOnTutorPath]);

  const stats = useMemo(() => ({
    total: practicantes.length,
    activos: practicantes.filter((p: Practicante) => !ESTADOS_FINALIZADOS.includes(p.estado)).length,
    enEjecucion: practicantes.filter((p: Practicante) => p.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION).length,
    porEvaluar: practicantes.filter((p: Practicante) => ESTADOS_PARA_EVALUAR.includes(p.estado)).length,
  }), [practicantes]);

  const handleEvaluar = (id: string) => {
    navigate(`${basePath}/evaluaciones/${id}`);
  };

  const limpiarFiltros = () => {
    setSearch('');
    setFiltroEstado('TODOS');
    setFiltroTipo('TODOS');
    setPage(0);
  };

  const statItems = [
    { label: 'Total', value: stats.total, icon: Users, color: 'var(--color-primary)' },
    { label: 'Activos', value: stats.activos, icon: Building2, color: 'var(--color-info)' },
    { label: 'En ejecución', value: stats.enEjecucion, icon: FileEdit, color: 'var(--color-warning)' },
    { label: 'Por evaluar', value: stats.porEvaluar, icon: FileText, color: 'var(--color-success)' },
  ];

  const estadoOptions = ESTADOS_FILTRO.map((s) => ({
    value: s,
    label: s === 'TODOS' ? 'Todos' : s.replace(/_/g, ' '),
  }));

  const tipoOptions = [
    { value: 'TODOS', label: 'Todas' },
    { value: 'INICIAL', label: 'Inicial' },
    { value: 'FINAL', label: 'Final' },
    { value: 'PROFESIONAL', label: 'Profesional' },
  ];

  const paginated = filteredPracticantes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filteredPracticantes.length / rowsPerPage) || 1;

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
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mis practicantes</h1>
            <p className="text-sm text-white/80">
              {(isTutor || isOnTutorPath)
                ? 'Estudiantes asignados a tu tutoría externa'
                : 'Gestiona y evalúa a los estudiantes bajo tu asesoría'}
            </p>
          </div>
        </div>
        <Badge variant="info">{filteredPracticantes.length} resultados</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((stat, idx) => (
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

      {filteredPracticantes.length === 0 ? (
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <Users className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--color-muted-foreground)' }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
            {search || filtroEstado !== 'TODOS' || filtroTipo !== 'TODOS'
              ? 'No se encontraron practicantes'
              : 'No hay practicantes asignados'}
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
            {search || filtroEstado !== 'TODOS' || filtroTipo !== 'TODOS'
              ? 'Intenta ajustar los filtros de búsqueda.'
              : 'Cuando te asignen estudiantes, aparecerán aquí.'}
          </p>
          {(search || filtroEstado !== 'TODOS' || filtroTipo !== 'TODOS') && (
            <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
              <X className="h-4 w-4 mr-1" /> Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div
          className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderTop: '3px solid var(--color-primary)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>Filtros de búsqueda</h2>

          <div
            className="rounded-xl border p-4 mb-4 flex flex-wrap gap-3 items-center"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
              <Input
                placeholder="Buscar por nombre, código, expediente o empresa..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9 pr-9"
              />
              {search && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => { setSearch(''); setPage(0); }}
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="min-w-[160px]">
              <Select
                label="Estado"
                value={filtroEstado}
                options={estadoOptions}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFiltroEstado(e.target.value); setPage(0); }}
              />
            </div>
            <div className="min-w-[160px]">
              <Select
                label="Modalidad"
                value={filtroTipo}
                options={tipoOptions}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFiltroTipo(e.target.value); setPage(0); }}
              />
            </div>
            <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
              <X className="h-4 w-4 mr-1" /> Limpiar filtros
            </Button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Estudiante</TableHead>
                    <TableHead className="font-semibold">Expediente</TableHead>
                    <TableHead className="font-semibold">Empresa</TableHead>
                    <TableHead className="font-semibold">Modalidad</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-center font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((p: Practicante) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span className="font-medium text-sm block" style={{ color: 'var(--color-foreground)' }}>
                          {p.nombreEstudiante} {p.apellidoEstudiante}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                          {p.codigoEstudiantil || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs" style={{ color: 'var(--color-foreground)' }}>
                          {p.codigoExpediente || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm block" style={{ color: 'var(--color-foreground)' }}>{p.nombreEmpresa || '—'}</span>
                        <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{p.nombreSede || ''}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{p.nombreTipoPractica || p.codigoTipoPractica || '—'}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={p.estado} label={estadoLabel(p.estado)} />
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Tooltip content="Ver expediente">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/coordinacion/expedientes/${p.id}`)}
                            className="px-2 mr-1"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        {!(isTutor || isOnTutorPath) && (
                          <Tooltip content="Documentos">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/docente/documentos/${p.id}`)}
                              className="px-2 mr-1"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        )}
                        {(isAdmin || isComite || !(isTutor || isOnTutorPath) || (p.codigoTipoPractica !== 'INICIAL' && ESTADOS_PARA_EVALUAR.includes(p.estado))) && (
                          <Button
                            size="sm"
                            onClick={() => handleEvaluar(p.id)}
                          >
                            Evaluar <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPracticantes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                        No se encontraron practicantes
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
              <span>{filteredPracticantes.length} practicantes</span>
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
                    disabled={(page + 1) * rowsPerPage >= filteredPracticantes.length}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

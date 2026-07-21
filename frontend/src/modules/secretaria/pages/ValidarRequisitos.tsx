import { useState, useEffect, useMemo, useCallback } from 'react';
import { COLORS } from '@/lib/constants';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useSecretariaEstudiantes, useUpdateDatosAcademicos } from '../../../hooks/useUsuarios';
import { useValidarAcademico, useUltimoResultado } from '../../../hooks/useValidaciones';
import { academicoApi } from '../../../api/validacionesApi';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  Avatar,
  Progress,
  Tooltip,
} from '../../../ui';
import { motion } from 'framer-motion';
import { showSuccess, showError, showWarning } from '../../../lib/toast';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Pencil,
  Search,
  Scale,
  CheckSquare,
  Clock,
  GraduationCap,
  Filter,
  RefreshCw,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import {
  Typography,
  Box,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  Alert,
  LinearProgress,
  Chip as MuiChip,
  IconButton,
} from '@mui/material';

const TIPO_PRACTICA_OPTS = ['INICIAL', 'FINAL', 'PROFESIONAL'] as const;

const ESTADOS_ACADEMICOS = ['MATRICULADO', 'ACTIVO', 'REGULAR', 'SUSPENDIDO', 'EGRESADO', 'GRADUADO'] as const;

const ESTADO_ACADEMICO_DOT: Record<string, { dot: string; bg: string }> = {
  MATRICULADO: { dot: COLORS.INFO, bg: '#eff6ff' },
  ACTIVO: { dot: COLORS.SUCCESS, bg: '#ecfdf5' },
  REGULAR: { dot: '#F5C518', bg: '#fffbeb' },
  SUSPENDIDO: { dot: '#f59e0b', bg: '#fffbeb' },
  EGRESADO: { dot: COLORS.MUTED, bg: '#f1f5f9' },
  GRADUADO: { dot: '#8b5cf6', bg: '#f5f3ff' },
};

interface Estudiante {
  id: string;
  codigoEstudiantil?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  semestreActual?: number;
  creditosAprobados?: number;
  creditosRequeridosPractica?: number;
  promedioPonderado?: number;
  estadoAcademico?: string;
}

interface DetalleRegla {
  nombreRegla: string;
  codigoRegla: string;
  obligatorio: boolean;
  cumplido: boolean;
  descripcion?: string;
  observaciones?: string;
}

interface ResultadoValidacion {
  apto: boolean;
  observacionesGenerales?: string;
  normasAplicadas?: string[];
  reglasCumplidas: number;
  totalReglas: number;
  tipoPractica?: string;
  periodoAcademico?: string;
  requisitosFaltantes?: string[];
  detalles?: DetalleRegla[];
  fechaValidacion?: string;
}

interface HistorialValidacion extends ResultadoValidacion {
  idResultado?: string;
}

const getInitials = (nombre?: string, apellido?: string) => {
  const n = nombre ? nombre.charAt(0).toUpperCase() : '';
  const a = apellido ? apellido.charAt(0).toUpperCase() : '';
  return n + a || '?';
};

export const ValidarRequisitos = () => {
  const queryClient = useQueryClient();

  const {
    data: estudiantes = [],
    isLoading,
    error: estudiantesError,
    refetch: refetchEstudiantes,
  } = useSecretariaEstudiantes();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof Estudiante | 'acciones'>('codigoEstudiantil');

  const [filtroEstadoAc, setFiltroEstadoAc] = useState('todos');

  const [openValidarDialog, setOpenValidarDialog] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [tipoPracticaValidar, setTipoPracticaValidar] = useState<string>('FINAL');
  const [resultadoValidacion, setResultadoValidacion] = useState<ResultadoValidacion | null>(null);
  const [detalleExpandido, setDetalleExpandido] = useState<number | null>(null);

  const [openHistorialDialog, setOpenHistorialDialog] = useState(false);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    semestreActual: '',
    creditosAprobados: '',
    creditosRequeridosPractica: '',
    promedioPonderado: '',
    estadoAcademico: '',
  });

  const validarMutation = useValidarAcademico();
  const updateMutation = useUpdateDatosAcademicos();

  const {
    data: ultimoResultado,
    isLoading: ultimoLoading,
  } = useUltimoResultado(selectedEstudiante?.id, tipoPracticaValidar);

  const {
    data: historialValidaciones = [],
    isLoading: historialLoading,
  } = useQuery({
    queryKey: ['validacion-academica', 'resultados', selectedEstudiante?.id],
    queryFn: async () => {
      const res = await academicoApi.getResultadosByEstudiante(selectedEstudiante!.id);
      return (res.data?.data ?? []) as HistorialValidacion[];
    },
    enabled: openHistorialDialog && !!selectedEstudiante?.id,
  });

  useEffect(() => {
    if (estudiantesError) {
      console.error('Error loading estudiantes:', estudiantesError);
      showError('Error', 'No se pudieron cargar los estudiantes.');
    }
  }, [estudiantesError]);

  const handleOpenValidar = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setTipoPracticaValidar('FINAL');
    setResultadoValidacion(null);
    setDetalleExpandido(null);
    setOpenValidarDialog(true);
  };

  const handleEjecutarValidacion = () => {
    if (!selectedEstudiante) return;
    setResultadoValidacion(null);
    validarMutation.mutate(
      {
        estudianteId: selectedEstudiante.id,
        codigoTipoPractica: tipoPracticaValidar,
        periodoAcademico: `${new Date().getFullYear()}-II`,
      },
      {
        onSuccess: (res) => {
          const data: ResultadoValidacion | undefined = res.data?.data;
          setResultadoValidacion(data ?? null);
          if (data) {
            if (data.apto) {
              showSuccess('ESTUDIANTE HABILITADO', data.observacionesGenerales || '');
            } else {
              showWarning('ESTUDIANTE NO HABILITADO', data.observacionesGenerales || '');
            }
          }
          queryClient.invalidateQueries({ queryKey: ['validacion-academica', 'ultimo'] });
          queryClient.invalidateQueries({ queryKey: ['validacion-academica', 'resultados'] });
        },
        onError: (error: any) => {
          const msg =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            'Error al ejecutar la validación';
          showError('Error', msg);
        },
      }
    );
  };

  const handleOpenHistorial = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setOpenHistorialDialog(true);
  };

  const handleEdit = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setEditForm({
      semestreActual: estudiante.semestreActual?.toString() ?? '',
      creditosAprobados: estudiante.creditosAprobados?.toString() ?? '',
      creditosRequeridosPractica: estudiante.creditosRequeridosPractica?.toString() ?? '',
      promedioPonderado: estudiante.promedioPonderado?.toString() ?? '',
      estadoAcademico: estudiante.estadoAcademico || '',
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedEstudiante) return;
    updateMutation.mutate(
      { id: selectedEstudiante.id, data: editForm },
      {
        onSuccess: () => {
          showSuccess('Datos actualizados');
          setOpenEditDialog(false);
        },
        onError: (error: any) => {
          showError(
            'Error',
            error?.response?.data?.message || 'No se pudo actualizar.'
          );
        },
      }
    );
  };

  const handleSort = (property: keyof Estudiante | 'acciones') => {
    if (property === 'acciones') return;
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedEstudiantes = useMemo(() => {
    let filtered = [...estudiantes];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.codigoEstudiantil || '').toLowerCase().includes(s) ||
          (e.nombres || '').toLowerCase().includes(s) ||
          (e.apellidoPaterno || '').toLowerCase().includes(s)
      );
    }
    if (filtroEstadoAc !== 'todos') {
      filtered = filtered.filter((e) => e.estadoAcademico === filtroEstadoAc);
    }
    filtered.sort((a, b) => {
      let aVal: string | number | undefined = a[orderBy as keyof Estudiante] ?? '';
      let bVal: string | number | undefined = b[orderBy as keyof Estudiante] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [estudiantes, searchTerm, filtroEstadoAc, orderBy, order]);

  const paginated = sortedEstudiantes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const kpis = useMemo(() => {
    return {
      total: estudiantes.length,
      activos: estudiantes.filter((e) => e.estadoAcademico === 'ACTIVO').length,
      matriculados: estudiantes.filter((e) => e.estadoAcademico === 'MATRICULADO').length,
      egresados: estudiantes.filter((e) => ['EGRESADO', 'GRADUADO'].includes(e.estadoAcademico || '')).length,
    };
  }, [estudiantes]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  }, []);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroEstadoAc('todos');
    setPage(0);
  };

  const headCells: { id: keyof Estudiante | 'acciones'; label: string; sortable?: boolean }[] = [
    { id: 'codigoEstudiantil', label: 'Código' },
    { id: 'nombres', label: 'Estudiante' },
    { id: 'semestreActual', label: 'Ciclo' },
    { id: 'creditosAprobados', label: 'Créditos Aprob.' },
    { id: 'promedioPonderado', label: 'Promedio' },
    { id: 'estadoAcademico', label: 'Estado Acad.' },
    { id: 'acciones', label: 'Acciones', sortable: false },
  ];

  const estadoOptions = useMemo(
    () => [{ value: 'todos', label: 'Todos' }, ...ESTADOS_ACADEMICOS.map((ea) => ({ value: ea, label: ea }))],
    []
  );

  const totalPages = Math.max(1, Math.ceil(sortedEstudiantes.length / rowsPerPage));

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4"
        style={{ height: '60vh', color: 'var(--color-muted-foreground)' }}
      >
        <Loader2 size={48} className="animate-spin" style={{ color: COLORS.UNT_BLUE_DARK }} />
        <p className="font-medium">Cargando estudiantes...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full px-2 sm:px-4 md:px-5 py-4 md:py-6 pb-16"
    >
      {/* Banner */}
      <div
        className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 rounded-2xl md:rounded-3xl p-4 md:p-8 relative overflow-hidden"
        style={{ backgroundColor: COLORS.UNT_BLUE_DARK, color: 'white' }}
      >
        <div
          className="absolute right-0 top-0 opacity-10 pointer-events-none"
          style={{ right: '-1rem', top: '-1rem' }}
        >
          <ClipboardCheck size={180} />
        </div>
        <div className="relative z-10 w-full">
          <span
            className="block text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ opacity: 0.8 }}
          >
            Secretaría Académica
          </span>
          <h1
            className="font-extrabold mt-0 mb-2 break-words"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}
          >
            Validación de Requisitos
          </h1>
          <p style={{ opacity: 0.9 }}>
            Verificación de requisitos académicos y normativos para inicio de prácticas preprofesionales.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2 self-end md:self-center">
          <Tooltip content="Actualizar listado">
            <button
              onClick={() => refetchEstudiantes()}
              className="p-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')
              }
            >
              <RefreshCw size={20} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div
          className="rounded-2xl p-4 flex items-center gap-3 border"
          style={{ backgroundColor: '#eff6ff', borderColor: '#3b82f620' }}
        >
          <div style={{ color: COLORS.INFO }}>
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-2xl font-extrabold" style={{ color: '#1e40af' }}>
              {kpis.total}
            </p>
            <p className="text-xs font-semibold" style={{ color: '#1e40af', opacity: 0.8 }}>
              Total Estudiantes
            </p>
          </div>
        </div>
        <div
          className="rounded-2xl p-4 flex items-center gap-3 border"
          style={{ backgroundColor: '#ecfdf5', borderColor: '#10b98120' }}
        >
          <div style={{ color: COLORS.SUCCESS }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-2xl font-extrabold" style={{ color: '#065f46' }}>
              {kpis.activos}
            </p>
            <p className="text-xs font-semibold" style={{ color: '#065f46', opacity: 0.8 }}>
              Activos
            </p>
          </div>
        </div>
        <div
          className="rounded-2xl p-4 flex items-center gap-3 border"
          style={{ backgroundColor: '#f5f3ff', borderColor: '#8b5cf620' }}
        >
          <div style={{ color: '#8b5cf6' }}>
            <ClipboardCheck size={20} />
          </div>
          <div>
            <p className="text-2xl font-extrabold" style={{ color: '#5b21b6' }}>
              {kpis.matriculados}
            </p>
            <p className="text-xs font-semibold" style={{ color: '#5b21b6', opacity: 0.8 }}>
              Matriculados
            </p>
          </div>
        </div>
        <div
          className="rounded-2xl p-4 flex items-center gap-3 border"
          style={{ backgroundColor: '#fff7ed', borderColor: '#f9731620' }}
        >
          <div style={{ color: '#f97316' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-2xl font-extrabold" style={{ color: '#9a3412' }}>
              {kpis.egresados}
            </p>
            <p className="text-xs font-semibold" style={{ color: '#9a3412', opacity: 0.8 }}>
              Egresados/Graduados
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl border p-4 md:p-6 mb-6"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-grow min-w-[260px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-muted-foreground)' }}
            />
            <Input
              placeholder="Buscar por código o nombre del estudiante..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="min-w-[200px] flex-grow-0">
            <Select
              label="Estado Académico"
              value={filtroEstadoAc}
              onChange={(e) => {
                setFiltroEstadoAc(e.target.value);
                setPage(0);
              }}
              options={estadoOptions}
            />
          </div>
          <Tooltip content="Limpiar filtros">
            <button
              onClick={limpiarFiltros}
              className="p-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: '#f1f5f9', color: COLORS.MUTED }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.BORDER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            >
              <Filter size={20} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border p-0 overflow-hidden relative"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 z-10">
            <div className="h-1 w-full overflow-hidden" style={{ backgroundColor: COLORS.BORDER }}>
              <div
                className="h-full animate-pulse"
                style={{ backgroundColor: COLORS.UNT_BLUE_DARK, width: '100%' }}
              />
            </div>
          </div>
        )}
        <div
          className="overflow-x-auto transition-opacity duration-200"
          style={{ opacity: isLoading ? 0.6 : 1 }}
        >
          <Table className="min-w-[800px]">
            <TableHeader style={{ backgroundColor: COLORS.BG_LIGHT, borderBottom: `2px solid ${COLORS.BORDER}` }}>
              <TableRow>
                {headCells.map((hc) => (
                  <TableHead
                    key={hc.id}
                    className="py-4 cursor-pointer select-none"
                    style={{ fontWeight: 700, color: '#475569' }}
                    onClick={() => hc.sortable !== false && handleSort(hc.id)}
                  >
                    <div className="flex items-center gap-1">
                      {hc.label}
                      {hc.sortable !== false && orderBy === hc.id && (
                        order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((est) => {
                const nombre = `${est.nombres || ''} ${est.apellidoPaterno || ''}${
                  est.apellidoMaterno ? ' ' + est.apellidoMaterno : ''
                }`;
                const sc = ESTADO_ACADEMICO_DOT[est.estadoAcademico || ''] || {
                  dot: '#94a3b8',
                  bg: '#f1f5f9',
                };
                return (
                  <TableRow key={est.id}>
                    <TableCell>
                      <span
                        className="font-semibold font-mono text-sm"
                        style={{ color: 'var(--color-muted-foreground)' }}
                      >
                        {est.codigoEstudiantil}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          fallback={getInitials(est.nombres, est.apellidoPaterno)}
                          size="md"
                          style={{
                            backgroundColor: sc.bg,
                            color: sc.dot,
                            border: `1px solid ${sc.dot}40`,
                          }}
                        />
                        <span
                          className="font-bold text-sm"
                          style={{ color: 'var(--color-foreground)' }}
                        >
                          {nombre}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {est.semestreActual ?? '—'}°
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>
                        {est.creditosAprobados ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                        {est.promedioPonderado ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sc.dot }}
                        />
                        <span className="text-xs font-bold" style={{ color: sc.dot }}>
                          {est.estadoAcademico || '—'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip content="Validar requisitos">
                          <button
                            onClick={() => handleOpenValidar(est)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: COLORS.SUCCESS, backgroundColor: '#ecfdf5' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#059669';
                              e.currentTarget.style.backgroundColor = '#d1fae5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = COLORS.SUCCESS;
                              e.currentTarget.style.backgroundColor = '#ecfdf5';
                            }}
                          >
                            <ClipboardCheck size={18} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Historial de validaciones">
                          <button
                            onClick={() => handleOpenHistorial(est)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: COLORS.INFO, backgroundColor: '#eff6ff' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#2563eb';
                              e.currentTarget.style.backgroundColor = '#dbeafe';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = COLORS.INFO;
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                            }}
                          >
                            <Clock size={18} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Editar datos académicos">
                          <button
                            onClick={() => handleEdit(est)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#8b5cf6', backgroundColor: '#f5f3ff' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#7c3aed';
                              e.currentTarget.style.backgroundColor = '#ede9fe';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#8b5cf6';
                              e.currentTarget.style.backgroundColor = '#f5f3ff';
                            }}
                          >
                            <Pencil size={18} />
                          </button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedEstudiantes.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div
                      className="flex flex-col items-center gap-2"
                      style={{ color: 'var(--color-muted-foreground)' }}
                    >
                      <Search size={48} style={{ opacity: 0.5 }} />
                      <p className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                        No se encontraron estudiantes
                      </p>
                      <p className="text-sm">Intenta ajustar los filtros o verifica la conexión.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            <span>Filas por página:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              className="rounded-lg border px-2 py-1 text-sm"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
            >
              {[5, 10, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              {page + 1} de {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* Validar Dialog */}
      <Dialog
        open={openValidarDialog}
        onClose={() => {
          if (!validarMutation.isPending) setOpenValidarDialog(false);
        }}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: resultadoValidacion
              ? resultadoValidacion.apto
                ? '#065f46'
                : '#9a3412'
              : COLORS.UNT_BLUE_DARK,
            color: COLORS.WHITE,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 2.5,
            px: 4,
          }}
        >
          <Scale />
          <Typography sx={{ fontWeight: 700 }} variant="h6">
            Validación Académica: {selectedEstudiante?.codigoEstudiantil || ''}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: COLORS.WHITE }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { md: 'flex-end' },
              }}
            >
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Tipo de Práctica</InputLabel>
                <MuiSelect
                  value={tipoPracticaValidar}
                  label="Tipo de Práctica"
                  onChange={(e) => {
                    setTipoPracticaValidar(e.target.value as string);
                    setResultadoValidacion(null);
                  }}
                  disabled={validarMutation.isPending}
                  sx={{ borderRadius: 1.2 }}
                >
                  {TIPO_PRACTICA_OPTS.map((tp) => {
                    const label =
                      tp === 'INICIAL'
                        ? 'Práctica Inicial'
                        : tp === 'FINAL'
                        ? 'Práctica Final'
                        : 'Práctica Profesional';
                    return (
                      <MenuItem key={tp} value={tp}>
                        {label}
                      </MenuItem>
                    );
                  })}
                </MuiSelect>
              </FormControl>
              <MuiButton
                variant="contained"
                color={resultadoValidacion ? 'warning' : 'primary'}
                onClick={handleEjecutarValidacion}
                disabled={validarMutation.isPending}
                startIcon={
                  validarMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ClipboardCheck size={18} />
                  )
                }
                sx={{ px: 3, borderRadius: 1.2, height: 40 }}
              >
                {validarMutation.isPending
                  ? 'Validando...'
                  : resultadoValidacion
                  ? 'Re-validar'
                  : 'Ejecutar Validación'}
              </MuiButton>
            </Box>

            {ultimoResultado && !resultadoValidacion && !ultimoLoading && (
              <Alert severity="info" icon={<Clock />} sx={{ borderRadius: 2 }}>
                Última validación ({(ultimoResultado as any).tipoPractica}):{' '}
                <strong>{(ultimoResultado as any).apto ? 'APTO' : 'NO APTO'}</strong>
                {' — '}{' '}
                {(ultimoResultado as any).fechaValidacion
                  ? new Date((ultimoResultado as any).fechaValidacion).toLocaleDateString()
                  : '—'}
              </Alert>
            )}

            {resultadoValidacion && (
              <>
                <Alert severity={resultadoValidacion.apto ? 'success' : 'warning'} sx={{ borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 'bold' }} variant="subtitle1">
                    {resultadoValidacion.apto
                      ? '✓ ESTUDIANTE HABILITADO'
                      : '✗ ESTUDIANTE NO HABILITADO'}
                  </Typography>
                  <Typography variant="body2">{resultadoValidacion.observacionesGenerales}</Typography>
                </Alert>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <MuiChip
                    label={`Normas: ${(resultadoValidacion.normasAplicadas || []).join(', ')}`}
                    color="info"
                    variant="outlined"
                  />
                  <MuiChip
                    label={`Reglas: ${resultadoValidacion.reglasCumplidas}/${resultadoValidacion.totalReglas}`}
                    color="success"
                    variant="outlined"
                  />
                  <MuiChip label={`Tipo: ${resultadoValidacion.tipoPractica}`} variant="outlined" />
                  <MuiChip
                    label={`Periodo: ${resultadoValidacion.periodoAcademico || '—'}`}
                    variant="outlined"
                  />
                </Box>

                <div
                  style={{
                    ['--color-primary-600' as string]: resultadoValidacion.apto
                      ? 'var(--color-success)'
                      : 'var(--color-warning)',
                  }}
                >
                  <Progress
                    value={resultadoValidacion.reglasCumplidas}
                    max={Math.max(resultadoValidacion.totalReglas, 1)}
                    size="sm"
                  />
                </div>

                {resultadoValidacion.requisitosFaltantes &&
                  resultadoValidacion.requisitosFaltantes.length > 0 && (
                    <Alert severity="error" icon={<AlertCircle />} sx={{ borderRadius: 2 }}>
                      <Typography sx={{ fontWeight: 'bold' }} variant="subtitle2">
                        Requisitos faltantes:
                      </Typography>
                      <ul style={{ margin: 4, paddingLeft: 20 }}>
                        {resultadoValidacion.requisitosFaltantes.map((req, i) => (
                          <li key={i}>
                            <Typography variant="body2">{req}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                <Typography
                  variant="h6"
                  sx={{
                    borderBottom: '2px solid',
                    borderColor: COLORS.UNT_BLUE_DARK,
                    pb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: COLORS.UNT_BLUE_DARK,
                  }}
                >
                  <CheckSquare /> Detalle de Reglas Evaluadas
                </Typography>

                {(resultadoValidacion.detalles || []).map((detalle, idx) => {
                  const isExpanded = detalleExpandido === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-l-4 p-4"
                      style={{
                        backgroundColor: COLORS.WHITE,
                        borderColor: 'var(--color-border)',
                        borderLeftColor: detalle.cumplido ? COLORS.SUCCESS : COLORS.DANGER,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {detalle.cumplido ? (
                          <CheckCircle2 size={18} style={{ color: COLORS.SUCCESS, marginTop: 4 }} />
                        ) : (
                          <XCircle size={18} style={{ color: COLORS.DANGER, marginTop: 4 }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center gap-2 flex-wrap">
                            <div>
                              <p
                                className="font-bold text-sm"
                                style={{ color: 'var(--color-foreground)' }}
                              >
                                {detalle.nombreRegla}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                                {detalle.codigoRegla}{' '}
                                {detalle.obligatorio ? '(Obligatorio)' : '(No obligatorio)'}
                              </p>
                            </div>
                            <MuiChip
                              label={detalle.cumplido ? 'CUMPLE' : 'NO CUMPLE'}
                              color={detalle.cumplido ? 'success' : 'error'}
                              size="small"
                            />
                          </div>
                          {isExpanded && (
                            <div
                              className="mt-3 p-3 rounded-lg text-sm"
                              style={{ backgroundColor: COLORS.BG_LIGHT }}
                            >
                              {detalle.descripcion && (
                                <p className="mb-1" style={{ color: 'var(--color-foreground)' }}>
                                  <strong>Descripción:</strong> {detalle.descripcion}
                                </p>
                              )}
                              <p style={{ color: 'var(--color-foreground)' }}>
                                <strong>Observación:</strong> {detalle.observaciones || '—'}
                              </p>
                            </div>
                          )}
                        </div>
                        <IconButton
                          size="small"
                          onClick={() => setDetalleExpandido(isExpanded ? null : idx)}
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </IconButton>
                      </div>
                    </div>
                  );
                })}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textAlign: 'right' }}
                >
                  Validado el{' '}
                  {resultadoValidacion.fechaValidacion
                    ? new Date(resultadoValidacion.fechaValidacion).toLocaleString()
                    : '—'}
                </Typography>
              </>
            )}

            {!resultadoValidacion && !validarMutation.isPending && (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <GraduationCap size={48} style={{ opacity: 0.3 }} />
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Seleccione el tipo de práctica y ejecute la validación para ver los resultados.
                </Typography>
                <Typography variant="caption">
                  Se evaluarán normas vigentes como Reglamento Específico II y Lineamientos UNT 2025.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: COLORS.BG_LIGHT, borderTop: `1px solid ${COLORS.BORDER}` }}>
          <MuiButton
            onClick={() => setOpenValidarDialog(false)}
            color="inherit"
            disabled={validarMutation.isPending}
            sx={{ fontWeight: 600, color: COLORS.MUTED }}
          >
            Cerrar
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Historial Dialog */}
      <Dialog
        open={openHistorialDialog}
        onClose={() => setOpenHistorialDialog(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: COLORS.UNT_BLUE_DARK,
            color: COLORS.WHITE,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 2.5,
            px: 4,
          }}
        >
          <Clock />{' '}
          <Typography sx={{ fontWeight: 700 }} variant="h6">
            Historial de Validaciones: {selectedEstudiante?.codigoEstudiantil}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: COLORS.WHITE }}>
          {historialLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Loader2 size={40} className="animate-spin" style={{ color: COLORS.UNT_BLUE_DARK }} />
            </Box>
          ) : historialValidaciones.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Clock size={48} style={{ opacity: 0.3 }} />
              <Typography variant="body1" sx={{ mt: 1 }}>
                El estudiante no tiene validaciones registradas.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(historialValidaciones as HistorialValidacion[]).map((h, idx) => (
                <div
                  key={h.idResultado || idx}
                  className="rounded-xl border p-4"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {h.apto ? (
                        <CheckCircle2 size={18} style={{ color: COLORS.SUCCESS }} />
                      ) : (
                        <XCircle size={18} style={{ color: COLORS.DANGER }} />
                      )}
                      <span
                        className="font-bold text-sm"
                        style={{ color: 'var(--color-foreground)' }}
                      >
                        {h.apto ? 'APTO' : 'NO APTO'} — {h.tipoPractica}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MuiChip
                        label={`${h.reglasCumplidas}/${h.totalReglas} reglas`}
                        size="small"
                        color={h.apto ? 'success' : 'error'}
                        variant="outlined"
                      />
                      <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                        {h.fechaValidacion
                          ? new Date(h.fechaValidacion).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap mb-2">
                    {(h.normasAplicadas || []).map((n, ni) => (
                      <MuiChip key={ni} label={n} size="small" variant="outlined" color="info" />
                    ))}
                  </div>
                  {h.observacionesGenerales && (
                    <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                      {h.observacionesGenerales}
                    </p>
                  )}
                  {h.requisitosFaltantes && h.requisitosFaltantes.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 1, borderRadius: 1 }} icon={<AlertTriangle />}>
                      <Typography variant="caption">
                        <strong>Faltantes:</strong> {h.requisitosFaltantes.join(', ')}
                      </Typography>
                    </Alert>
                  )}
                </div>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: COLORS.BG_LIGHT, borderTop: `1px solid ${COLORS.BORDER}` }}>
          <MuiButton
            onClick={() => setOpenHistorialDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600, color: COLORS.MUTED }}
          >
            Cerrar
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: COLORS.UNT_BLUE_DARK,
            color: COLORS.WHITE,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 2.5,
            px: 4,
          }}
        >
          <Pencil />{' '}
          <Typography sx={{ fontWeight: 700 }} variant="h6">
            Editar Datos Académicos
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: COLORS.WHITE }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Semestre Actual"
                type="number"
                value={editForm.semestreActual}
                onChange={(e) =>
                  setEditForm({ ...editForm, semestreActual: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Créditos Aprobados"
                type="number"
                value={editForm.creditosAprobados}
                onChange={(e) =>
                  setEditForm({ ...editForm, creditosAprobados: e.target.value })
                }
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Créditos Requeridos"
                type="number"
                value={editForm.creditosRequeridosPractica}
                onChange={(e) =>
                  setEditForm({ ...editForm, creditosRequeridosPractica: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Promedio Ponderado"
                type="number"
                slotProps={{ htmlInput: { step: 0.01 } }}
                value={editForm.promedioPonderado}
                onChange={(e) =>
                  setEditForm({ ...editForm, promedioPonderado: e.target.value })
                }
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Estado Académico</InputLabel>
              <MuiSelect
                value={editForm.estadoAcademico}
                label="Estado Académico"
                onChange={(e) =>
                  setEditForm({ ...editForm, estadoAcademico: e.target.value as string })
                }
              >
                {ESTADOS_ACADEMICOS.map((ea) => (
                  <MenuItem key={ea} value={ea}>
                    {ea}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: COLORS.BG_LIGHT, borderTop: `1px solid ${COLORS.BORDER}` }}>
          <MuiButton
            onClick={() => setOpenEditDialog(false)}
            color="inherit"
            sx={{ fontWeight: 600, color: COLORS.MUTED }}
          >
            Cancelar
          </MuiButton>
          <MuiButton
            variant="contained"
            onClick={handleSaveEdit}
            disabled={updateMutation.isPending}
            startIcon={
              updateMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )
            }
            sx={{
              px: 4,
              borderRadius: 2,
              fontWeight: 700,
              bgcolor: COLORS.UNT_BLUE_DARK,
              '&:hover': { bgcolor: '#1e40af' },
            }}
          >
            Guardar Cambios
          </MuiButton>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

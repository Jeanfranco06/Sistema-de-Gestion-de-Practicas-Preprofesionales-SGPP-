import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search,
  Building2,
  MapPin,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  X,
  Info,
  Building,
  Landmark,
  GraduationCap,
} from 'lucide-react';
import {
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { sedeApi } from '@/api/sedesApi';
import { practicaApi } from '@/api/practicasApi';
import Swal from 'sweetalert2';
import { showSuccess, showError } from '@/lib/toast';
import {
  Button,
  Input,
  Badge,
  Avatar,
  Tooltip,
  Card,
  Select,
} from '@/ui';
import { cn } from '@/lib/utils';
import { SedeDetailsDrawer, type SedeDetalle } from '../components/SedeDetailsDrawer';

interface SedeCatalogo {
  id: string;
  nombreSede: string;
  razonSocialEmpresa: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  tipoEntidad: string;
  vacantesDisponibles: number;
  esElegible: boolean;
  motivoNoElegible?: string;
  tieneConvenioVigente: boolean;
  tieneValidacionVigente: boolean;
  resultadoValidacion?: string;
  tieneTutorActivo: boolean;
  areaDisponible?: string;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

const getConvenioBadgeVariant = (sede: SedeCatalogo): 'success' | 'danger' => {
  return sede.tieneConvenioVigente ? 'success' : 'danger';
};

const getValidacionBadgeVariant = (
  sede: SedeCatalogo
): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (!sede.tieneValidacionVigente) return 'neutral';
  switch (sede.resultadoValidacion) {
    case 'APROBADA':
      return 'success';
    case 'OBSERVADA':
      return 'warning';
    case 'RECHAZADA':
      return 'danger';
    default:
      return 'neutral';
  }
};

export const CatalogoSedes = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoEntidad, setTipoEntidad] = useState('');
  const [vigenciaConvenio, setVigenciaConvenio] = useState('todos');
  const [disponibilidad, setDisponibilidad] = useState('todos');
  const [estadoValidacion, setEstadoValidacion] = useState('todos');
  const [tieneTutor, setTieneTutor] = useState('todos');
  const [mostrarSoloElegibles, setMostrarSoloElegibles] = useState(false);
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    data: sedes = [],
    isLoading,
    error: catalogError,
  } = useQuery<SedeCatalogo[]>({
    queryKey: ['sedes', 'catalogo', 'catalogo-sedes-page'],
    queryFn: async () => {
      const res = await sedeApi.getCatalogo();
      const payload = res.data as
        | { data?: SedeCatalogo[] }
        | SedeCatalogo[]
        | undefined;
      return Array.isArray(payload) ? payload : payload?.data ?? [];
    },
  });

  const { data: selectedSede, error: detailError } = useQuery<SedeDetalle | undefined>({
    queryKey: ['sedes', 'detalle', selectedSedeId],
    queryFn: async () => {
      if (!selectedSedeId) return undefined;
      const res = await sedeApi.getDetalle(selectedSedeId);
      const payload = res.data as
        | { data?: SedeDetalle }
        | SedeDetalle
        | undefined;
      return payload && !Array.isArray(payload) ? (payload.data ?? payload) : undefined;
    },
    enabled: !!selectedSedeId,
  });

  const seleccionarMutation = useMutation({
    mutationFn: (sedeId: string) => practicaApi.seleccionarSede(sedeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes', 'catalogo'] });
      queryClient.invalidateQueries({ queryKey: ['practicas'] });
    },
  });

  useEffect(() => {
    if (catalogError) {
      console.error('Error cargando catálogo de sedes:', catalogError);
      setLocalError(
        'Error al cargar el catálogo de sedes. Por favor, intenta nuevamente.'
      );
    }
  }, [catalogError]);

  useEffect(() => {
    if (detailError) {
      console.error('Error cargando detalle de sede:', detailError);
      setLocalError('Error al cargar el detalle de la sede.');
    }
  }, [detailError]);

  const filteredSedes = useMemo(() => {
    return sedes.filter((sede) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        sede.nombreSede?.toLowerCase().includes(searchLower) ||
        sede.razonSocialEmpresa?.toLowerCase().includes(searchLower) ||
        sede.distrito?.toLowerCase().includes(searchLower) ||
        sede.provincia?.toLowerCase().includes(searchLower) ||
        sede.departamento?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
      if (tipoEntidad && sede.tipoEntidad !== tipoEntidad) return false;
      if (vigenciaConvenio === 'vigente' && !sede.tieneConvenioVigente) return false;
      if (vigenciaConvenio === 'no vigente' && sede.tieneConvenioVigente) return false;
      if (disponibilidad === 'disponible' && sede.vacantesDisponibles <= 0) return false;
      if (disponibilidad === 'no disponible' && sede.vacantesDisponibles > 0) return false;
      if (estadoValidacion === 'aprobada' && sede.resultadoValidacion !== 'APROBADA')
        return false;
      if (estadoValidacion === 'observada' && sede.resultadoValidacion !== 'OBSERVADA')
        return false;
      if (estadoValidacion === 'rechazada' && sede.resultadoValidacion !== 'RECHAZADA')
        return false;
      if (tieneTutor === 'si' && !sede.tieneTutorActivo) return false;
      if (tieneTutor === 'no' && sede.tieneTutorActivo) return false;
      if (mostrarSoloElegibles && !sede.esElegible) return false;
      return true;
    });
  }, [
    sedes,
    searchTerm,
    tipoEntidad,
    vigenciaConvenio,
    disponibilidad,
    estadoValidacion,
    tieneTutor,
    mostrarSoloElegibles,
  ]);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setTipoEntidad('');
    setVigenciaConvenio('todos');
    setDisponibilidad('todos');
    setEstadoValidacion('todos');
    setTieneTutor('todos');
    setMostrarSoloElegibles(false);
  };

  const handleOpenDetails = (sede: SedeCatalogo) => {
    setSelectedSedeId(sede.id);
    setDrawerOpen(true);
  };

  const handleCloseDetails = () => {
    setDrawerOpen(false);
    setSelectedSedeId(null);
  };

  const handleSeleccionarSede = async (sede: SedeCatalogo) => {
    if (!sede.esElegible) {
      showError(
        'Sede no elegible',
        sede.motivoNoElegible ||
          'La sede no cumple con los requisitos para ser seleccionada.'
      );
      return;
    }

    const result = await Swal.fire({
      title: '¿Seleccionar esta sede?',
      text: `Confirmas que deseas seleccionar "${sede.nombreSede}" en ${sede.razonSocialEmpresa} para tus prácticas preprofesionales.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, seleccionar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    seleccionarMutation.mutate(sede.id, {
      onSuccess: () => {
        showSuccess(
          '¡Sede seleccionada!',
          `Has seleccionado exitosamente "${sede.nombreSede}". Ahora debes completar tu registro de prácticas.`
        );
      },
      onError: (err: unknown) => {
        console.error('Error seleccionando sede:', err);
        const axiosErr = err as {
          response?: {
            data?: { message?: string; error?: string };
          };
        };
        const msg =
          axiosErr.response?.data?.message ||
          axiosErr.response?.data?.error ||
          'No se pudo completar la selección. Intenta nuevamente.';
        showError('Error', msg);
      },
    });
  };

  const stats: StatItem[] = useMemo(
    () => [
      {
        label: 'Sedes',
        value: sedes.length,
        icon: Building2,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        valueColor: 'text-blue-700',
      },
      {
        label: 'Elegibles',
        value: filteredSedes.filter((s) => s.esElegible).length,
        icon: CheckCircle2,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        valueColor: 'text-emerald-700',
      },
      {
        label: 'Con convenio',
        value: filteredSedes.filter((s) => s.tieneConvenioVigente).length,
        icon: Briefcase,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600',
        valueColor: 'text-teal-700',
      },
      {
        label: 'Con tutor',
        value: filteredSedes.filter((s) => s.tieneTutorActivo).length,
        icon: Users,
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        valueColor: 'text-violet-700',
      },
    ],
    [sedes, filteredSedes]
  );

  if (isLoading && sedes.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <CircularProgress size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-6">
        {/* Banner */}
        <div
          className="rounded-2xl p-6 flex items-center gap-4 flex-wrap"
          style={{ backgroundColor: '#1a365d', color: 'white' }}
        >
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Building2 className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Catálogo de empresas y sedes
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Explora las sedes disponibles para tus prácticas preprofesionales
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-sm font-medium border"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'rgba(255,255,255,0.3)',
            }}
          >
            {filteredSedes.length} resultados
          </span>
        </div>

        {localError && (
          <Alert
            severity="error"
            className="my-2"
            onClose={() => setLocalError(null)}
          >
            {localError}
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="p-4 flex items-start gap-3"
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                    stat.iconBg,
                    stat.iconColor
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span
                    className="text-xs uppercase tracking-wide block"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {stat.label}
                  </span>
                  <span
                    className={cn('text-lg font-semibold', stat.valueColor)}
                  >
                    {stat.value}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filtros */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter
              className="h-5 w-5"
              style={{ color: 'var(--color-primary-600)' }}
            />
            <h3
              className="font-semibold"
              style={{ color: 'var(--color-foreground)' }}
            >
              Filtros de Búsqueda
            </h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--color-muted-foreground)' }}
              />
              <Input
                placeholder="Buscar por empresa, sede, distrito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X
                    className="h-4 w-4"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Tipo Entidad"
                value={tipoEntidad}
                onChange={(e) => setTipoEntidad(e.target.value)}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'PÚBLICA', label: 'Pública' },
                  { value: 'PRIVADA', label: 'Privada' },
                  { value: 'MIXTA', label: 'Mixta' },
                ]}
              />
              <Select
                label="Convenio"
                value={vigenciaConvenio}
                onChange={(e) => setVigenciaConvenio(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'vigente', label: 'Vigente' },
                  { value: 'no vigente', label: 'No vigente' },
                ]}
              />
              <Select
                label="Validación"
                value={estadoValidacion}
                onChange={(e) => setEstadoValidacion(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'aprobada', label: 'Aprobada' },
                  { value: 'observada', label: 'Observada' },
                  { value: 'rechazada', label: 'Rechazada' },
                ]}
              />
              <Select
                label="Tutor"
                value={tieneTutor}
                onChange={(e) => setTieneTutor(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'si', label: 'Con tutor' },
                  { value: 'no', label: 'Sin tutor' },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={mostrarSoloElegibles}
                    onChange={(e) => setMostrarSoloElegibles(e.target.checked)}
                  />
                }
                label="Solo sedes elegibles"
              />
              <Button variant="secondary" onClick={limpiarFiltros}>
                <X className="h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Resultados */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3
            className="font-semibold"
            style={{ color: 'var(--color-foreground)' }}
          >
            Resultados
          </h3>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="default">{filteredSedes.length}</Badge>
            <Building2
              className="h-5 w-5"
              style={{ color: 'var(--color-muted-foreground)' }}
            />
            <span
              className="text-sm"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              de {sedes.length} sedes totales
            </span>
            <div
              className="h-6 w-px"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <Badge variant="success">
              {filteredSedes.filter((s) => s.esElegible).length} elegibles
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSedes.map((sede) => (
            <Card
              key={sede.id}
              className={cn(
                'h-full flex flex-col p-5',
                sede.esElegible
                  ? 'border-2 border-emerald-200'
                  : 'border border-gray-200'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    size="lg"
                    className={cn(
                      sede.esElegible
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    )}
                    fallback={<Building2 className="h-6 w-6" />}
                  />
                  <div className="flex-1 min-w-0">
                    <h2
                      className="font-bold truncate"
                      style={{ color: 'var(--color-foreground)' }}
                    >
                      {sede.razonSocialEmpresa}
                    </h2>
                    <p
                      className="text-sm truncate"
                      style={{ color: 'var(--color-muted-foreground)' }}
                    >
                      {sede.nombreSede}
                    </p>
                  </div>
                </div>
                {sede.esElegible && (
                  <Tooltip content="Sede elegible para selección">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500 shrink-0" />
                  </Tooltip>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="neutral">
                  <MapPin className="h-3 w-3 mr-1" />
                  {sede.distrito}
                </Badge>
                <Badge variant="neutral">
                  {sede.tipoEntidad === 'PÚBLICA' ? (
                    <Building className="h-3 w-3 mr-1" />
                  ) : sede.tipoEntidad === 'PRIVADA' ? (
                    <Landmark className="h-3 w-3 mr-1" />
                  ) : (
                    <GraduationCap className="h-3 w-3 mr-1" />
                  )}
                  {sede.tipoEntidad}
                </Badge>
                <Badge variant={getConvenioBadgeVariant(sede)}>
                  {sede.tieneConvenioVigente ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {sede.tieneConvenioVigente ? 'Convenio Vigente' : 'Sin Convenio'}
                </Badge>
              </div>

              <div
                className="rounded-lg p-4 mb-4 space-y-2"
                style={{ backgroundColor: 'var(--color-muted)' }}
              >
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>
                    {sede.departamento}, {sede.provincia}, {sede.distrito}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>{sede.areaDisponible || 'Área no especificada'}</span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>{sede.vacantesDisponibles || 0} vacantes disponibles</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={getValidacionBadgeVariant(sede)}>
                  {sede.resultadoValidacion || 'No validada'}
                </Badge>
              </div>

              {!sede.esElegible && sede.motivoNoElegible && (
                <Alert severity="warning" className="mb-4 py-1">
                  <span className="text-xs font-medium">
                    {sede.motivoNoElegible}
                  </span>
                </Alert>
              )}
              {sede.esElegible && (
                <Alert severity="success" className="mb-4 py-1">
                  <span className="text-xs font-medium">
                    Cumple todos los requisitos para prácticas
                  </span>
                </Alert>
              )}

              <div className="mt-auto flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleOpenDetails(sede)}
                >
                  <Info className="h-4 w-4" />
                  Ver Detalle
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                  onClick={() => handleSeleccionarSede(sede)}
                  disabled={!sede.esElegible}
                >
                  {seleccionarMutation.isPending &&
                  seleccionarMutation.variables === sede.id ? (
                    <>
                      <CircularProgress size={16} sx={{ color: 'white' }} />
                      Seleccionando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Seleccionar
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}

          {filteredSedes.length === 0 && !isLoading && (
            <Card className="col-span-full text-center py-12">
              <Building2
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: 'var(--color-muted-foreground)' }}
              />
              <h3
                className="font-bold mb-2"
                style={{ color: 'var(--color-foreground)' }}
              >
                No se encontraron sedes
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                Intenta ajustar los filtros de búsqueda para encontrar más
                opciones.
              </p>
              <Button variant="secondary" onClick={limpiarFiltros}>
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </Card>
          )}
        </div>

        {/* Drawer de detalle */}
        <SedeDetailsDrawer
          open={drawerOpen}
          onClose={handleCloseDetails}
          sede={selectedSede ?? null}
        />
      </div>
    </motion.div>
  );
};

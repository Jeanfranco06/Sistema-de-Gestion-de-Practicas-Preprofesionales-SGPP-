import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  GraduationCap, Building2, CheckCircle, ArrowLeft, ArrowRight,
  FileText, Star, Trophy, XCircle, Loader2, Info, ChevronDown, ChevronUp, Filter,
} from 'lucide-react';
import { useTiposPractica, useSolicitarPractica } from '../../../hooks/usePracticas';
import { useCatalogoSedes } from '../../../hooks/useSedes';
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge,
  Dialog, DialogContent, DialogFooter, Input, Select,
} from '../../../ui';
import { cn } from '../../../lib/utils';

const MySwal = withReactContent(Swal);

const STEPS = [
  { id: 'tipo', label: 'Tipo de Práctica', description: 'Selecciona el tipo de práctica' },
  { id: 'sede', label: 'Empresa y Sede', description: 'Elige la empresa y sede' },
  { id: 'confirmacion', label: 'Confirmación', description: 'Revisa y confirma' },
];

interface TipoPractica {
  id: string | number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  horasRequeridas: number;
}

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
}

const tipoIcons: Record<string, React.ReactNode> = {
  INICIAL: <GraduationCap className="h-12 w-12" />,
  FINAL: <Star className="h-12 w-12" />,
  PROFESIONAL: <Trophy className="h-12 w-12" />,
};

export function SolicitarPractica() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTipo, setSelectedTipo] = useState<TipoPractica | null>(null);
  const [selectedSede, setSelectedSede] = useState<SedeCatalogo | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: tipos = [], isLoading: loadingTipos } = useTiposPractica();
  const { data: sedes = [], isLoading: loadingSedes } = useCatalogoSedes();

  // Filters state
  const [filterElegible, setFilterElegible] = useState(true);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDepartamento, setFilterDepartamento] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const solicitarMutation = useSolicitarPractica();

  const loading = loadingTipos || loadingSedes;

  const handleSelectTipo = useCallback((tipo: TipoPractica) => {
    setSelectedTipo(tipo);
  }, []);

  const handleSelectSede = useCallback((sede: SedeCatalogo) => {
    if (sede.esElegible) {
      setSelectedSede(sede);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (activeStep === 0 && !selectedTipo) {
      MySwal.fire({
        icon: 'warning',
        title: 'Selecciona un tipo',
        text: 'Debes seleccionar un tipo de práctica para continuar.',
        confirmButtonColor: '#F5C518',
      });
      return;
    }
    if (activeStep === 1 && !selectedSede) {
      MySwal.fire({
        icon: 'warning',
        title: 'Selecciona una sede',
        text: 'Debes seleccionar una empresa y sede para continuar.',
        confirmButtonColor: '#F5C518',
      });
      return;
    }
    if (activeStep === STEPS.length - 1) {
      setConfirmOpen(true);
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [activeStep, selectedTipo, selectedSede]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedSede || !selectedTipo) return;
    try {
      setConfirmOpen(false);
      await solicitarMutation.mutateAsync({ sedeId: selectedSede.id, tipoPracticaId: String(selectedTipo.id) });
      await MySwal.fire({
        icon: 'success',
        title: '¡Práctica solicitada!',
        text: `Has solicitado exitosamente tu práctica ${selectedTipo.nombre} en ${selectedSede.nombreSede} de ${selectedSede.razonSocialEmpresa}.`,
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      navigate('/estudiante/practica');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string;
            error?: string;
            detalles?: Array<{ descripcion?: string; nombreRegla?: string } | string>;
          };
        };
      };
      const msg = axiosErr.response?.data?.message || axiosErr.response?.data?.error || 'No se pudo completar la solicitud. Intenta nuevamente.';
      const detalles = axiosErr.response?.data?.detalles;

      if (detalles && detalles.length > 0) {
        const detallesHtml = detalles
          .map((d) => {
            if (typeof d === 'string') return `<li class="text-left mb-2">${d}</li>`;
            return `<li class="text-left mb-2">${d.descripcion || d.nombreRegla || ''}</li>`;
          })
          .join('');

        MySwal.fire({
          icon: 'warning',
          title: 'Requisitos académicos no cumplidos',
          html: `<div class="text-left text-sm text-slate-700 dark:text-slate-300">
            <p class="mb-3">No cumples con los requisitos académicos para este tipo de práctica:</p>
            <ul class="list-disc pl-5">${detallesHtml}</ul>
            <p class="mt-3 text-slate-500 dark:text-slate-400">Por favor, completa los requisitos faltantes antes de solicitar la práctica.</p>
          </div>`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#F59E0B',
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: msg,
          confirmButtonColor: '#C62828',
        });
      }
    }
  }, [selectedSede, selectedTipo, solicitarMutation, navigate]);

  const getEmpresasUnicas = (): SedeCatalogo[] => {
    const seen = new Set<string>();
    return sedes.filter((s: SedeCatalogo) => {
      const key = s.razonSocialEmpresa;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Filter logic
  const filteredSedes = sedes.filter((sede: SedeCatalogo) => {
    // Filter by elegibility
    if (filterElegible && !sede.esElegible) return false;

    // Filter by search text
    if (filterSearch) {
      const searchLower = filterSearch.toLowerCase();
      const matchesSearch =
        sede.nombreSede.toLowerCase().includes(searchLower) ||
        sede.razonSocialEmpresa.toLowerCase().includes(searchLower) ||
        sede.direccion.toLowerCase().includes(searchLower) ||
        sede.departamento.toLowerCase().includes(searchLower) ||
        sede.provincia.toLowerCase().includes(searchLower) ||
        sede.distrito.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filter by departamento
    if (filterDepartamento && sede.departamento !== filterDepartamento) return false;

    // Filter by empresa
    if (filterEmpresa && sede.razonSocialEmpresa !== filterEmpresa) return false;

    return true;
  });

  const getSedesPorEmpresa = (razonSocial: string): SedeCatalogo[] => {
    return filteredSedes.filter((s: SedeCatalogo) => s.razonSocialEmpresa === razonSocial);
  };

  // Get unique departamentos for filter
  const departamentosUnicos = Array.from(new Set(sedes.map((s: SedeCatalogo) => s.departamento)))
    .filter((d): d is string => typeof d === 'string')
    .sort();

  // Get unique empresas for filter
  const empresasUnicas = Array.from(new Set(sedes.map((s: SedeCatalogo) => s.razonSocialEmpresa)))
    .filter((e): e is string => typeof e === 'string')
    .sort();

  // Clear filters
  const clearFilters = () => {
    setFilterElegible(true);
    setFilterSearch('');
    setFilterDepartamento('');
    setFilterEmpresa('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Cargando información...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 mb-6 flex items-center gap-4 text-white shadow-lg">
        <div className="flex items-center justify-center rounded-full shrink-0 w-14 h-14 bg-white/15">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Solicitar Práctica Preprofesional</h2>
          <p className="text-sm opacity-90 mt-1">
            Completa los pasos para solicitar tu práctica en una empresa o institución.
          </p>
        </div>
      </div>

      {/* Custom Stepper */}
      <nav aria-label="Progreso de solicitud" className="mb-6">
        <ol className="flex items-center justify-center gap-2" role="list">
          {STEPS.map((step, index) => (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base font-bold shrink-0 transition-colors',
                    index < activeStep && 'bg-primary-600 text-white dark:bg-primary-700',
                    index === activeStep && 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/50',
                    index > activeStep && 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground',
                  )}
                  aria-current={index === activeStep ? 'step' : undefined}
                >
                  {index < activeStep ? (
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                  ) : (
                    <span className="sr-only">Paso {index + 1}:</span>
                  )}
                  {index >= activeStep && index + 1}
                </div>
                <span
                  className={cn(
                    'text-sm hidden sm:inline transition-colors',
                    index === activeStep && 'font-semibold text-foreground',
                    index < activeStep && 'text-muted-foreground',
                    index > activeStep && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-px w-6 sm:w-12 md:w-16 mx-2 transition-colors',
                    index < activeStep ? 'bg-primary-600 dark:bg-primary-700' : 'bg-border dark:bg-border'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step 1: Tipo de Práctica */}
      {activeStep === 0 && (
        <section aria-labelledby="step1-heading" className="space-y-4">
          <div>
            <h3 id="step1-heading" className="text-lg md:text-xl font-semibold mb-1 text-foreground">
              Selecciona el tipo de práctica que deseas solicitar
            </h3>
            <p className="text-sm text-muted-foreground">
              Cada tipo de práctica tiene un requisito de horas mínimo. Elige según tu avance académico.
            </p>
          </div>
          <div
            className="space-y-3"
            role="radiogroup"
            aria-labelledby="step1-heading"
          >
            {tipos.map((tipo: TipoPractica) => {
              const selected = selectedTipo?.id === tipo.id;
              return (
                <Card
                  key={tipo.id}
                  className={cn(
                    'p-0 overflow-hidden transition-all duration-200',
                    selected
                      ? 'border-primary-600 dark:border-primary-500 ring-2 ring-primary-500/20'
                      : 'border-border hover:border-primary-400 dark:hover:border-primary-700'
                  )}
                >
                  <label
                    className={cn(
                      'relative flex items-start gap-4 p-4 md:p-5 cursor-pointer transition-colors',
                      selected
                        ? 'bg-primary-50/50 dark:bg-primary-950/30'
                        : 'bg-card hover:bg-muted/50'
                    )}
                  >
                    <input
                      type="radio"
                      name="tipo-practica"
                      value={tipo.id}
                      checked={selected}
                      onChange={() => handleSelectTipo(tipo)}
                      className="sr-only"
                    />
                    <div className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors',
                      selected ? 'border-primary-600 bg-primary-600 dark:border-primary-500 dark:bg-primary-500' : 'border-border bg-card dark:border-border dark:bg-muted'
                    )}>
                      {selected && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#1A3A6E] text-white dark:bg-[#4A6FA5]">
                          {tipoIcons[tipo.codigo] || <GraduationCap className="h-6 w-6" aria-hidden="true" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-base md:text-lg">{tipo.nombre}</h4>
                          <Badge variant="info" size="sm" className="mt-1">
                            {tipo.horasRequeridas} horas
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tipo.descripcion || `Práctica ${tipo.nombre.toLowerCase()}`}
                      </p>
                    </div>
                    {selected && (
                      <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" aria-hidden="true" />
                    )}
                  </label>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 2: Empresa y Sede */}
      {activeStep === 1 && (
        <section aria-labelledby="step2-heading" className="space-y-4">
          <div>
            <h3 id="step2-heading" className="text-lg md:text-xl font-semibold mb-1 text-foreground">
              Selecciona la empresa y sede para tu práctica
            </h3>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Las sedes marcadas con{' '}
                <Badge variant="success" size="sm">
                  <CheckCircle className="h-3 w-3 mr-0.5" aria-hidden="true" /> Elegible
                </Badge>{' '}
                cumplen todos los requisitos y pueden ser seleccionadas.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Filter Header */}
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors"
              aria-expanded={filtersExpanded}
              aria-controls="filters-content"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1A3A6E] dark:bg-[#4A6FA5] text-white">
                  <Filter className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col items-start">
                  <h4 className="font-semibold text-foreground text-sm">Filtros de búsqueda</h4>
                  <span className="text-xs text-muted-foreground">
                    {filteredSedes.length} de {sedes.length} sedes encontradas
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(filterSearch || filterDepartamento || filterEmpresa || !filterElegible) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="text-xs text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium px-2 py-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
                {filtersExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                )}
              </div>
            </button>

            {/* Filter Content */}
            {filtersExpanded && (
              <div id="filters-content" className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <Input
                      id="search-sedes"
                      label="Buscar por nombre, empresa o dirección"
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder="Ej: Empresa XYZ, Av. Principal..."
                    />
                  </div>

                  {/* Empresa */}
                  <Select
                    id="filter-empresa"
                    label="Empresa"
                    value={filterEmpresa}
                    onChange={(e) => setFilterEmpresa(e.target.value)}
                    placeholder="Todas las empresas"
                    options={empresasUnicas.map((empresa) => ({ value: empresa, label: empresa }))}
                  />

                  {/* Departamento */}
                  <Select
                    id="filter-departamento"
                    label="Departamento"
                    value={filterDepartamento}
                    onChange={(e) => setFilterDepartamento(e.target.value)}
                    placeholder="Todos los departamentos"
                    options={departamentosUnicos.map((dept) => ({ value: dept, label: dept }))}
                  />
                </div>

                {/* Elegible toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filterElegible}
                        onChange={(e) => setFilterElegible(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        filterElegible ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500' : 'border-border bg-card dark:border-border dark:bg-muted'
                      )}>
                        {filterElegible && (
                          <CheckCircle className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Solo sedes elegibles
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Sedes que cumplen todos los requisitos
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {sedes.length === 0 ? (
            <div className="text-center py-12" role="status">
              <Building2 className="h-16 w-16 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
              <h4 className="text-lg font-bold mb-1 text-foreground">
                No hay sedes registradas
              </h4>
              <p className="text-sm text-muted-foreground">
                Actualmente no hay sedes disponibles en el sistema.
              </p>
            </div>
          ) : (
            <div
              className="flex flex-col gap-4"
              role="radiogroup"
              aria-labelledby="step2-heading"
            >
              {getEmpresasUnicas().map((empresa) => {
                const sedesEmpresa = getSedesPorEmpresa(empresa.razonSocialEmpresa);
                const tieneElegible = sedesEmpresa.some((s) => s.esElegible);
                return (
                  <div key={empresa.razonSocialEmpresa} className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1A3A6E] dark:bg-[#4A6FA5] text-white">
                        <Building2 className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <h4 className="font-semibold text-foreground text-base md:text-lg">{empresa.razonSocialEmpresa}</h4>
                      {!tieneElegible && (
                        <Badge variant="warning" size="sm">Sin sedes elegibles</Badge>
                      )}
                    </div>
                    <div className="space-y-2 pl-10">
                      {sedesEmpresa.map((sede) => {
                        const selected = selectedSede?.id === sede.id;
                        const elegible = sede.esElegible;
                        return (
                          <Card
                            key={sede.id}
                            className={cn(
                              'p-0 overflow-hidden transition-all duration-200',
                              !elegible && 'opacity-75 border-red-200 dark:border-red-800/50',
                              selected && elegible && 'border-primary-600 dark:border-primary-500 ring-2 ring-primary-500/20'
                            )}
                          >
                            <label
                              className={cn(
                                'relative flex items-start gap-4 p-4 cursor-pointer transition-colors',
                                !elegible && 'cursor-not-allowed',
                                selected && elegible
                                  ? 'bg-primary-50/50 dark:bg-primary-950/30'
                                  : 'bg-card hover:bg-muted/50'
                              )}
                            >
                              <input
                                type="radio"
                                name="sede-practica"
                                value={sede.id}
                                checked={selected}
                                onChange={() => elegible && handleSelectSede(sede)}
                                disabled={!elegible}
                                className="sr-only"
                              />
                              <div className={cn(
                                'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors',
                                selected ? 'border-primary-600 bg-primary-600 dark:border-primary-500 dark:bg-primary-500' : 'border-border bg-card dark:border-border dark:bg-muted',
                                !elegible && 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30'
                              )}>
                                {selected && (
                                  <div className="w-3 h-3 rounded-full bg-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-foreground text-base md:text-lg">{sede.nombreSede}</h5>
                                    <p className="text-sm text-muted-foreground mt-1">{sede.direccion}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {sede.departamento}, {sede.provincia}, {sede.distrito}
                                    </p>
                                  </div>
                                  {elegible ? (
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" aria-hidden="true" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" aria-hidden="true" />
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="neutral" size="sm">{sede.tipoEntidad}</Badge>
                                  {sede.vacantesDisponibles > 0 && (
                                    <Badge variant="success" size="sm">
                                      {sede.vacantesDisponibles} vacantes
                                    </Badge>
                                  )}
                                  {elegible ? (
                                    <Badge variant="success" size="sm">
                                      <CheckCircle className="h-3 w-3 mr-0.5" aria-hidden="true" /> Elegible
                                    </Badge>
                                  ) : (
                                    <Badge variant="danger" size="sm">
                                      <XCircle className="h-3 w-3 mr-0.5" aria-hidden="true" /> No elegible
                                    </Badge>
                                  )}
                                </div>
                                {!elegible && sede.motivoNoElegible && (
                                  <div className="mt-2 rounded-md py-1.5 px-2 text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                    {sede.motivoNoElegible}
                                  </div>
                                )}
                              </div>
                            </label>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Step 3: Confirmación */}
      {activeStep === 2 && (
        <section aria-labelledby="step3-heading" className="space-y-6">
          <div>
            <h3 id="step3-heading" className="text-xl md:text-2xl font-bold mb-2 text-foreground">
              Confirma tu solicitud de práctica
            </h3>
            <p className="text-sm text-muted-foreground">
              Revisa los detalles de tu solicitud antes de enviarla.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Práctica Card */}
            {selectedTipo && (
              <Card className="border-l-4 border-l-primary-600 overflow-hidden">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center rounded-xl shrink-0 h-14 w-14 bg-primary-600 text-white shadow-md">
                      {tipoIcons[selectedTipo.codigo] || <GraduationCap className="h-7 w-7" aria-hidden="true" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 mb-1">
                        Tipo de Práctica
                      </p>
                      <h4 className="font-bold text-lg text-foreground mb-1">{selectedTipo.nombre}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="info" size="sm">
                          {selectedTipo.horasRequeridas} horas
                        </Badge>
                        {selectedTipo.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {selectedTipo.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empresa y Sede Card */}
            {selectedSede && (
              <Card className="border-l-4 border-l-[#1A3A6E] dark:border-l-[#4A6FA5] overflow-hidden">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center rounded-xl shrink-0 h-14 w-14 bg-[#1A3A6E] dark:bg-[#4A6FA5] text-white shadow-md">
                      <Building2 className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#1A3A6E] dark:text-[#7A9FD5] mb-1">
                        Empresa y Sede
                      </p>
                      <h4 className="font-bold text-lg text-foreground mb-1">{selectedSede.razonSocialEmpresa}</h4>
                      <p className="text-sm font-medium text-foreground mb-1">{selectedSede.nombreSede}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="success" size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" /> Elegible
                        </Badge>
                        <Badge variant="neutral" size="sm">{selectedSede.tipoEntidad}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-700 dark:text-primary-400" aria-hidden="true" />
                Detalles de la Sede
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dirección</p>
                  <p className="text-sm text-foreground">{selectedSede?.direccion}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ubicación</p>
                  <p className="text-sm text-foreground">
                    {selectedSede?.distrito}, {selectedSede?.provincia}, {selectedSede?.departamento}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vacantes Disponibles</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      {selectedSede?.vacantesDisponibles} vacantes
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo de Entidad</p>
                  <p className="text-sm text-foreground">{selectedSede?.tipoEntidad}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center rounded-full shrink-0 h-10 w-10 bg-amber-100 dark:bg-amber-900/50">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-foreground text-sm">Información Importante</h4>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Al confirmar, se registrará tu solicitud con estado &quot;REGISTRADA&quot;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Posteriormente deberás completar los documentos requeridos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Recibirás notificaciones sobre el estado de tu solicitud</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 gap-4">
        <Button
          variant="secondary"
          onClick={activeStep === 0 ? () => navigate('/estudiante/sedes') : handleBack}
          disabled={solicitarMutation.isPending}
          className="flex-1 sm:flex-none w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {activeStep === 0 ? 'Ir a Catálogo' : 'Anterior'}
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={solicitarMutation.isPending}
          className="flex-1 sm:flex-none w-full sm:w-auto"
        >
          {activeStep === STEPS.length - 1 ? 'Solicitar Práctica' : 'Siguiente'}
          {activeStep < STEPS.length - 1 && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="md" aria-labelledby="dialog-title" className="p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1A3A6E] dark:bg-[#4A6FA5] text-white px-6 py-5 relative overflow-hidden border-b-4 border-primary-600">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative flex items-center gap-4">
              <div className="flex items-center justify-center rounded-xl h-14 w-14 bg-primary-500/20 border border-primary-400/50 backdrop-blur-sm">
                <FileText className="h-7 w-7 text-primary-400" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white" id="dialog-title">Confirmar Solicitud</CardTitle>
                <p className="text-white/80 text-sm mt-1">Revisa los detalles antes de enviar</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div className="bg-muted dark:bg-muted border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[#1A3A6E] dark:text-[#7A9FD5] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-foreground">
                  Esta acción registrará tu solicitud de práctica con estado &quot;REGISTRADA&quot;.
                  Podrás completar los documentos requeridos posteriormente.
                </p>
              </div>
            </div>

            {/* Practice Type Summary */}
            {selectedTipo && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center rounded-xl h-12 w-12 bg-primary-600 text-white shadow-md border-2 border-primary-400/30">
                    {tipoIcons[selectedTipo.codigo] || <GraduationCap className="h-6 w-6" aria-hidden="true" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 mb-1">
                      Tipo de Práctica
                    </p>
                    <h4 className="font-semibold text-foreground">{selectedTipo.nombre}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info" size="sm">
                        {selectedTipo.horasRequeridas} horas
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sede Summary */}
            {selectedSede && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center rounded-xl h-12 w-12 bg-[#1A3A6E] dark:bg-[#4A6FA5] shadow-md">
                    <Building2 className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1A3A6E] dark:text-[#7A9FD5] mb-1">
                      Empresa y Sede
                    </p>
                    <h4 className="font-semibold text-foreground">{selectedSede.razonSocialEmpresa}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{selectedSede.nombreSede}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="success" size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" /> Elegible
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-muted dark:bg-muted/50 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={solicitarMutation.isPending}
              className="flex-1 sm:flex-none w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={solicitarMutation.isPending}
              className="flex-1 sm:flex-none w-full sm:w-auto"
            >
              {solicitarMutation.isPending ? 'Solicitando...' : 'Confirmar y Solicitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

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
  Dialog, DialogContent, DialogFooter,
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

const tipoColors: Record<string, { icon: string }> = {
  INICIAL: { icon: 'text-blue-600 dark:text-blue-400' },
  FINAL: { icon: 'text-green-600 dark:text-green-400' },
  PROFESIONAL: { icon: 'text-purple-600 dark:text-purple-400' },
};

const getTipoColorClasses = (codigo: string) => {
  const defaultColor = tipoColors.INICIAL;
  const colors = tipoColors[codigo] || defaultColor;
  return {
    icon: colors?.icon || defaultColor?.icon || 'text-blue-600',
  };
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
        confirmButtonColor: '#0ea5e9',
      });
      return;
    }
    if (activeStep === 1 && !selectedSede) {
      MySwal.fire({
        icon: 'warning',
        title: 'Selecciona una sede',
        text: 'Debes seleccionar una empresa y sede para continuar.',
        confirmButtonColor: '#0ea5e9',
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
            if (typeof d === 'string') return `<li style="text-align: left; margin-bottom: 8px;">${d}</li>`;
            return `<li style="text-align: left; margin-bottom: 8px;">${d.descripcion || d.nombreRegla || ''}</li>`;
          })
          .join('');

        MySwal.fire({
          icon: 'warning',
          title: 'Requisitos académicos no cumplidos',
          html: `<div style="text-align: left; font-size: 0.9rem;">
            <p style="margin-bottom: 12px;">No cumples con los requisitos académicos para este tipo de práctica:</p>
            <ul style="padding-left: 20px; margin: 0;">${detallesHtml}</ul>
            <p style="margin-top: 12px; color: #666;">Por favor, completa los requisitos faltantes antes de solicitar la práctica.</p>
          </div>`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b',
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: msg,
          confirmButtonColor: '#dc2626',
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

  const getSedesPorEmpresa = (razonSocial: string): SedeCatalogo[] => {
    return filteredSedes.filter((s: SedeCatalogo) => s.razonSocialEmpresa === razonSocial);
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
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-6 mb-6 flex items-center gap-4 text-white shadow-lg">
        <div className="flex items-center justify-center rounded-full shrink-0 w-14 h-14 bg-white/15">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Solicitar Práctica Preprofesional</h2>
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
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-colors',
                    index < activeStep && 'bg-green-500 text-white dark:bg-green-600',
                    index === activeStep && 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50',
                    index > activeStep && 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                  )}
                  aria-current={index === activeStep ? 'step' : undefined}
                >
                  {index < activeStep ? (
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span className="sr-only">Paso {index + 1}:</span>
                  )}
                  {index >= activeStep && index + 1}
                </div>
                <span
                  className={cn(
                    'text-sm hidden sm:inline transition-colors',
                    index === activeStep && 'font-semibold text-foreground',
                    index < activeStep && 'text-slate-600 dark:text-slate-300',
                    index > activeStep && 'text-slate-400 dark:text-slate-500',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-px w-8 sm:w-16 mx-2 transition-colors',
                    index < activeStep ? 'bg-green-500 dark:bg-green-600' : 'bg-slate-200 dark:bg-slate-700'
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
            <h3 id="step1-heading" className="text-lg font-semibold mb-1 text-foreground">
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
              const colors = getTipoColorClasses(tipo.codigo);
              return (
                <label
                  key={tipo.id}
                  className={cn(
                    'relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                    'hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20',
                    'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                    selected ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/30' : 'border-border bg-card',
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
                    selected ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                  )}>
                    {selected && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className={cn('flex items-center justify-center w-12 h-12 rounded-lg', colors.icon, selected ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-800')}>
                        {tipoIcons[tipo.codigo] || <GraduationCap className="h-6 w-6" aria-hidden="true" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-base">{tipo.nombre}</h4>
                        <Badge variant={selected ? 'info' : 'neutral'} size="sm" className="mt-1">
                          {tipo.horasRequeridas} horas
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tipo.descripcion || `Práctica ${tipo.nombre.toLowerCase()}`}
                    </p>
                  </div>
                  {selected && (
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
                  )}
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 2: Empresa y Sede */}
      {activeStep === 1 && (
        <section aria-labelledby="step2-heading" className="space-y-4">
          <div>
            <h3 id="step2-heading" className="text-lg font-semibold mb-1 text-foreground">
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-blue-900 rounded-xl overflow-hidden">
            {/* Filter Header */}
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-slate-700/50 transition-colors"
              aria-expanded={filtersExpanded}
              aria-controls="filters-content"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-700">
                  <Filter className="h-4 w-4 text-white" aria-hidden="true" />
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
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-2 py-1 rounded-md hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
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
                    <label htmlFor="search-sedes" className="block text-xs font-semibold text-foreground mb-1.5">
                      <Building2 className="h-3 w-3 inline mr-1" aria-hidden="true" />
                      Buscar por nombre, empresa o dirección
                    </label>
                    <div className="relative">
                      <input
                        id="search-sedes"
                        type="text"
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        placeholder="Ej: Empresa XYZ, Av. Principal..."
                        className="w-full px-3 py-2.5 pl-10 text-sm border border-blue-200 dark:border-blue-900 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      />
                      <Building2 className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Empresa */}
                  <div>
                    <label htmlFor="filter-empresa" className="block text-xs font-semibold text-foreground mb-1.5">
                      Empresa
                    </label>
                    <select
                      id="filter-empresa"
                      value={filterEmpresa}
                      onChange={(e) => setFilterEmpresa(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-blue-200 dark:border-blue-900 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    >
                      <option value="">Todas las empresas</option>
                      {empresasUnicas.map((empresa) => (
                        <option key={empresa} value={empresa}>{empresa}</option>
                      ))}
                    </select>
                  </div>

                  {/* Departamento */}
                  <div>
                    <label htmlFor="filter-departamento" className="block text-xs font-semibold text-foreground mb-1.5">
                      Departamento
                    </label>
                    <select
                      id="filter-departamento"
                      value={filterDepartamento}
                      onChange={(e) => setFilterDepartamento(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-blue-200 dark:border-blue-900 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    >
                      <option value="">Todos los departamentos</option>
                      {departamentosUnicos.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Elegible toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-900">
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
                        filterElegible ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-800'
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
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                        <Building2 className="h-4 w-4 text-white" aria-hidden="true" />
                      </div>
                      <h4 className="font-semibold text-foreground text-base">{empresa.razonSocialEmpresa}</h4>
                      {!tieneElegible && (
                        <Badge variant="warning" size="sm">Sin sedes elegibles</Badge>
                      )}
                    </div>
                    <div className="space-y-2 pl-10">
                      {sedesEmpresa.map((sede) => {
                        const selected = selectedSede?.id === sede.id;
                        const elegible = sede.esElegible;
                        return (
                          <label
                            key={sede.id}
                            className={cn(
                              'relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200',
                              elegible ? 'hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20' : 'cursor-not-allowed opacity-75',
                              'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                              selected ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/30' : 'border-border bg-card',
                              !elegible && 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/20',
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
                              selected ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800',
                              !elegible && 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30'
                            )}>
                              {selected && (
                                <div className="w-3 h-3 rounded-full bg-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-foreground text-base">{sede.nombreSede}</h5>
                                  <p className="text-sm text-muted-foreground mt-1">{sede.direccion}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {sede.departamento}, {sede.provincia}, {sede.distrito}
                                  </p>
                                </div>
                                {elegible ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" aria-hidden="true" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" aria-hidden="true" />
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="neutral" size="sm">{sede.tipoEntidad}</Badge>
                                {sede.vacantesDisponibles > 0 && (
                                  <Badge variant="success" size="sm">
                                    {sede.vacantesDisponibles} vacantes
                                  </Badge>
                                )}
                                {elegible && (
                                  <Badge variant="success" size="sm">
                                    <CheckCircle className="h-3 w-3 mr-0.5" aria-hidden="true" /> Elegible
                                  </Badge>
                                )}
                              </div>
                              {!elegible && sede.motivoNoElegible && (
                                <div className="mt-2 rounded-md py-1.5 px-2 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                                  {sede.motivoNoElegible}
                                </div>
                              )}
                            </div>
                          </label>
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
            <h3 id="step3-heading" className="text-xl font-bold mb-2 text-foreground">
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
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center rounded-xl shrink-0 h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                      <div className="text-white">
                        {tipoIcons[selectedTipo.codigo] || <GraduationCap className="h-7 w-7" aria-hidden="true" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                        Tipo de Práctica
                      </p>
                      <h4 className="font-bold text-lg text-foreground mb-1">{selectedTipo.nombre}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="info" size="sm" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
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
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 dark:bg-green-900/20 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center rounded-xl shrink-0 h-14 w-14 bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                      <Building2 className="h-7 w-7 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">
                        Empresa y Sede
                      </p>
                      <h4 className="font-bold text-lg text-foreground mb-1">{selectedSede.razonSocialEmpresa}</h4>
                      <p className="text-sm font-medium text-foreground mb-1">{selectedSede.nombreSede}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="success" size="sm" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
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
          <Card className="border border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
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
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center rounded-full shrink-0 h-10 w-10 bg-amber-100 dark:bg-amber-900/50">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-foreground text-sm">Información Importante</h4>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Al confirmar, se registrará tu solicitud con estado "REGISTRADA"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Posteriormente deberás completar los documentos requeridos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
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
          className="flex-1 sm:flex-none"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {activeStep === 0 ? 'Ir a Catálogo' : 'Anterior'}
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={solicitarMutation.isPending}
          className="flex-1 sm:flex-none"
        >
          {activeStep === STEPS.length - 1 ? 'Solicitar Práctica' : 'Siguiente'}
          {activeStep < STEPS.length - 1 && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="md" aria-labelledby="dialog-title" className="p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-unt-blue text-white px-6 py-5 relative overflow-hidden border-b-4 border-unt-yellow">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative flex items-center gap-4">
              <div className="flex items-center justify-center rounded-xl h-14 w-14 bg-unt-yellow/20 border border-unt-yellow/50 backdrop-blur-sm">
                <FileText className="h-7 w-7 text-unt-yellow" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white" id="dialog-title">Confirmar Solicitud</CardTitle>
                <p className="text-slate-200 text-sm mt-1">Revisa los detalles antes de enviar</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div className="bg-blue-50 dark:bg-slate-900/50 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-unt-blue shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Esta acción registrará tu solicitud de práctica con estado "REGISTRADA". 
                  Podrás completar los documentos requeridos posteriormente.
                </p>
              </div>
            </div>

            {/* Practice Type Summary */}
            {selectedTipo && (
              <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center rounded-xl h-12 w-12 bg-unt-blue text-white shadow-md border-2 border-unt-yellow/30">
                    <div className="text-white">
                      {tipoIcons[selectedTipo.codigo] || <GraduationCap className="h-6 w-6" aria-hidden="true" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-unt-blue dark:text-unt-yellow mb-1">
                      Tipo de Práctica
                    </p>
                    <h4 className="font-semibold text-foreground">{selectedTipo.nombre}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info" size="sm" className="bg-blue-100 text-unt-blue dark:bg-unt-blue/30 dark:text-blue-200">
                        {selectedTipo.horasRequeridas} horas
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sede Summary */}
            {selectedSede && (
              <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center rounded-xl h-12 w-12 bg-green-600 shadow-md">
                    <Building2 className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 mb-1">
                      Empresa y Sede
                    </p>
                    <h4 className="font-semibold text-foreground">{selectedSede.razonSocialEmpresa}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{selectedSede.nombreSede}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="success" size="sm" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" /> Elegible
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-border">
            <Button 
              variant="secondary" 
              onClick={() => setConfirmOpen(false)} 
              disabled={solicitarMutation.isPending}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={solicitarMutation.isPending}
              className="flex-1 sm:flex-none bg-unt-blue hover:bg-unt-blue-light text-white"
            >
              {solicitarMutation.isPending ? 'Solicitando...' : 'Confirmar y Solicitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  GraduationCap, Building2, CheckCircle, ArrowLeft, ArrowRight,
  FileText, Star, Trophy, XCircle, Loader2, AlertCircle,
} from 'lucide-react';
import { useTiposPractica, useSolicitarPractica } from '../../../hooks/usePracticas';
import { useCatalogoSedes } from '../../../hooks/useSedes';
import {
  Button, Card, CardContent, Badge, Avatar,
  Dialog, DialogContent, DialogTitle, DialogFooter,
  Tooltip,
} from '../../../ui';
import { cn } from '../../../lib/utils';

const MySwal = withReactContent(Swal);

const STEPS = ['Tipo de Práctica', 'Empresa y Sede', 'Confirmación'];

interface TipoPractica {
  id: string;
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

const tipoColors: Record<string, { bg: string; border: string; icon: string }> = {
  INICIAL: { bg: '#e3f2fd', border: '#1976d2', icon: '#1976d2' },
  FINAL: { bg: '#e8f5e9', border: '#2e7d32', icon: '#2e7d32' },
  PROFESIONAL: { bg: '#f3e5f5', border: '#7b1fa2', icon: '#7b1fa2' },
};

export function SolicitarPractica() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTipo, setSelectedTipo] = useState<TipoPractica | null>(null);
  const [selectedSede, setSelectedSede] = useState<SedeCatalogo | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: tipos = [], isLoading: loadingTipos } = useTiposPractica();
  const { data: sedes = [], isLoading: loadingSedes } = useCatalogoSedes();
  const solicitarMutation = useSolicitarPractica();

  const loading = loadingTipos || loadingSedes;

  const handleSelectTipo = (tipo: TipoPractica) => {
    setSelectedTipo(tipo);
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedTipo) {
      MySwal.fire('Selecciona un tipo', 'Debes seleccionar un tipo de práctica para continuar.', 'warning');
      return;
    }
    if (activeStep === 1 && !selectedSede) {
      MySwal.fire('Selecciona una sede', 'Debes seleccionar una empresa y sede para continuar.', 'warning');
      return;
    }
    if (activeStep === STEPS.length - 1) {
      setConfirmOpen(true);
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!selectedSede || !selectedTipo) return;
    try {
      setConfirmOpen(false);
      await solicitarMutation.mutateAsync({ sedeId: selectedSede.id, tipoPracticaId: selectedTipo.id });
      await MySwal.fire({
        icon: 'success',
        title: '¡Práctica solicitada!',
        text: `Has solicitado exitosamente tu práctica ${selectedTipo.nombre} en ${selectedSede.nombreSede} de ${selectedSede.razonSocialEmpresa}.`,
        timer: 4000,
        showConfirmButton: false,
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
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const getEmpresasUnicas = (): SedeCatalogo[] => {
    const seen = new Set<string>();
    return sedes.filter((s) => {
      const key = s.razonSocialEmpresa;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const getSedesPorEmpresa = (razonSocial: string): SedeCatalogo[] => {
    return sedes.filter((s) => s.razonSocialEmpresa === razonSocial);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#1a365d' }} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Banner */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center gap-3"
        style={{ backgroundColor: '#1a365d', color: 'white' }}
      >
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Solicitar Práctica Preprofesional</h2>
          <p className="text-sm opacity-85 mt-1">
            Completa los pasos para solicitar tu práctica en una empresa o institución.
          </p>
        </div>
      </div>

      {/* Custom Stepper */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {STEPS.map((label, index) => (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0',
                  index < activeStep && 'bg-green-500 text-white',
                  index === activeStep && 'bg-blue-600 text-white',
                  index > activeStep && 'bg-gray-200 text-gray-500',
                )}
              >
                {index < activeStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-sm hidden sm:inline',
                  index === activeStep && 'font-semibold text-gray-900',
                  index < activeStep && 'text-gray-500',
                  index > activeStep && 'text-gray-400',
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn('h-px w-8 sm:w-16 mx-2', index < activeStep ? 'bg-green-500' : 'bg-gray-200')}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Tipo de Práctica */}
      {activeStep === 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>
            Selecciona el tipo de práctica que deseas solicitar
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
            Cada tipo de práctica tiene un requisito de horas mínimo. Elige según tu avance académico.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tipos.map((tipo) => {
              const colors = tipoColors[tipo.codigo] || { bg: '#f5f5f5', border: '#9e9e9e', icon: '#757575' };
              const selected = selectedTipo?.id === tipo.id;
              return (
                <Card
                  key={tipo.id}
                  onClick={() => handleSelectTipo(tipo)}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:-translate-y-0.5',
                    selected && 'ring-2',
                  )}
                  style={{
                    borderColor: selected ? colors.border : undefined,
                    backgroundColor: selected ? colors.bg : undefined,
                    borderWidth: selected ? '2px' : undefined,
                  } as React.CSSProperties}
                >
                  <CardContent className="text-center py-6 px-4">
                    <div style={{ color: colors.icon }} className="mb-3 flex justify-center">
                      {tipoIcons[tipo.codigo] || <GraduationCap className="h-12 w-12" />}
                    </div>
                    <h4 className="text-xl font-bold mb-1">{tipo.nombre}</h4>
                    <p
                      className="text-sm mb-3"
                      style={{ color: 'var(--color-muted-foreground)', minHeight: '2.5rem' }}
                    >
                      {tipo.descripcion || `Práctica ${tipo.nombre.toLowerCase()}`}
                    </p>
                    <Badge variant={selected ? 'info' : 'neutral'} size="sm">
                      {tipo.horasRequeridas} horas requeridas
                    </Badge>
                    {selected && (
                      <div className="mt-3">
                        <CheckCircle className="h-7 w-7 mx-auto" style={{ color: '#2e7d32' }} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Empresa y Sede */}
      {activeStep === 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>
            Selecciona la empresa y sede para tu práctica
          </h3>
          <div className="mb-4">
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Las sedes marcadas con{' '}
              <Badge variant="success" size="sm">
                <CheckCircle className="h-3 w-3 mr-0.5" /> Elegible
              </Badge>{' '}
              cumplen todos los requisitos y pueden ser seleccionadas.
            </p>
          </div>

          {sedes.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
              <h4 className="text-lg font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>
                No hay sedes registradas
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                Actualmente no hay sedes disponibles en el sistema.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {getEmpresasUnicas().map((empresa) => {
                const sedesEmpresa = getSedesPorEmpresa(empresa.razonSocialEmpresa);
                const tieneElegible = sedesEmpresa.some((s) => s.esElegible);
                return (
                  <div key={empresa.razonSocialEmpresa}>
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar
                        size="sm"
                        fallback={<Building2 className="h-4 w-4 text-white" /> as unknown as string}
                        className="bg-blue-600"
                      />
                      <h4 className="font-semibold">{empresa.razonSocialEmpresa}</h4>
                      {!tieneElegible && (
                        <Badge variant="warning" size="sm">Sin sedes elegibles</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sedesEmpresa.map((sede) => {
                        const selected = selectedSede?.id === sede.id;
                        const elegible = sede.esElegible;
                        return (
                          <Tooltip
                            key={sede.id}
                            content={elegible ? 'Haz clic para seleccionar' : sede.motivoNoElegible || 'No disponible'}
                          >
                            <Card
                              onClick={() => elegible && setSelectedSede(sede)}
                              className={cn(
                                'transition-all duration-200',
                                elegible ? 'cursor-pointer' : 'cursor-not-allowed',
                                selected && 'ring-2 ring-blue-500',
                                elegible && !selected && 'hover:-translate-y-0.5',
                              )}
                              style={{
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: selected
                                  ? '#1976d2'
                                  : elegible
                                    ? '#86efac'
                                    : '#fca5a5',
                                backgroundColor: selected
                                  ? '#e3f2fd'
                                  : elegible
                                    ? '#f0fdf4'
                                    : '#fef2f2',
                                opacity: elegible ? 1 : 0.75,
                              } as React.CSSProperties}
                            >
                              <CardContent className="py-3 px-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{sede.nombreSede}</p>
                                    <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                                      {sede.direccion}
                                    </p>
                                    <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                                      {sede.departamento}, {sede.provincia}, {sede.distrito}
                                    </span>
                                  </div>
                                  {elegible ? (
                                    <CheckCircle className="h-5 w-5 shrink-0" style={{ color: '#16a34a' }} />
                                  ) : (
                                    <XCircle className="h-5 w-5 shrink-0" style={{ color: '#dc2626' }} />
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <Badge variant="neutral" size="sm">{sede.tipoEntidad}</Badge>
                                  {sede.vacantesDisponibles > 0 && (
                                    <Badge variant="success" size="sm">
                                      {sede.vacantesDisponibles} vacantes
                                    </Badge>
                                  )}
                                </div>
                                {!elegible && sede.motivoNoElegible && (
                                  <div
                                    className="mt-2 rounded-md py-1 px-2 text-xs font-medium"
                                    style={{ backgroundColor: '#fef3cd', color: '#92400e' }}
                                  >
                                    {sede.motivoNoElegible}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmación */}
      {activeStep === 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>
            Confirma tu solicitud de práctica
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
            Revisa los datos antes de enviar tu solicitud.
          </p>

          {selectedTipo && (
            <div
              className="rounded-xl p-4 mb-3 border"
              style={{ backgroundColor: '#f8fafc', borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-muted-foreground)' }}>
                Tipo de Práctica
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-full shrink-0 h-10 w-10"
                  style={{ backgroundColor: tipoColors[selectedTipo.codigo]?.icon || '#1976d2' }}
                >
                  <div className="text-white">
                    {tipoIcons[selectedTipo.codigo] || <GraduationCap className="h-5 w-5" />}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedTipo.nombre}</p>
                  <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                    {selectedTipo.horasRequeridas} horas requeridas
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedSede && (
            <div
              className="rounded-xl p-4 mb-3 border"
              style={{ backgroundColor: '#f8fafc', borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-muted-foreground)' }}>
                Empresa y Sede
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-full shrink-0 h-10 w-10 bg-blue-600">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedSede.razonSocialEmpresa}</p>
                  <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                    {selectedSede.nombreSede}
                  </p>
                  <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    {selectedSede.direccion} - {selectedSede.distrito}, {selectedSede.departamento}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div
            className="mt-3 rounded-lg p-3 text-sm flex items-start gap-2"
            style={{ backgroundColor: '#e0f2fe', color: '#0c4a6e' }}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Al confirmar, se registrará tu solicitud de práctica con estado "REGISTRADA".
              Posteriormente deberás completar los documentos requeridos.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          onClick={activeStep === 0 ? () => navigate('/estudiante/sedes') : handleBack}
          disabled={solicitarMutation.isPending}
        >
          <ArrowLeft className="h-4 w-4" />
          {activeStep === 0 ? 'Ir a Catálogo' : 'Anterior'}
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={solicitarMutation.isPending}
        >
          {activeStep === STEPS.length - 1 ? 'Solicitar Práctica' : 'Siguiente'}
          {activeStep < STEPS.length - 1 && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="sm">
          <div
            className="rounded-t-2xl px-6 py-4 flex items-center gap-2"
            style={{ backgroundColor: '#1a365d', color: 'white' }}
          >
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Confirmar solicitud</h2>
          </div>
          <div className="p-6 space-y-2">
            <p className="text-sm font-medium">¿Estás seguro de solicitar esta práctica?</p>
            {selectedTipo && (
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                <strong>Tipo:</strong> {selectedTipo.nombre} ({selectedTipo.horasRequeridas}h)
              </p>
            )}
            {selectedSede && (
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                <strong>Sede:</strong> {selectedSede.nombreSede} - {selectedSede.razonSocialEmpresa}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={solicitarMutation.isPending}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={solicitarMutation.isPending}
            >
              {solicitarMutation.isPending ? 'Solicitando...' : 'Confirmar y Solicitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, FileText, Eye, Users, ClipboardList,
  ListChecks, FileEdit, Building2, Building, Loader2, Info,
} from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { useExpedienteById, useIniciarEjecucion } from '../../../hooks/useExpedientes';
import { expedientesApi } from '../../../api/expedientesApi';
import { planesApi } from '../../../api/planesApi';
import { empresaApi, sedeApi } from '../../../api/sedesApi';
import { coordinacionApi, horasApi, reportesCoordinacionApi, trazabilidadApi } from '../../../api/coordinacionApi';
import { tieneControlHoras } from '../../../shared/utils/controlHoras';
import { hasAnyRole } from '../../../shared/utils/roleRoutes';
import { ESTADOS_EXPEDIENTE, ESTADOS_PARA_DICTAMEN } from '../../../lib/constants';
import {
  Button, Badge, Progress, Tooltip, Card, CardContent, CardHeader, CardTitle,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell, Separator,
} from '../../../ui';
import { cn } from '../../../lib/utils';

const MySwal = withReactContent(Swal);

const getPayload = (response: any) => response?.data?.data ?? response?.data ?? null;

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'No disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es-PE');
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return 'No disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('es-PE');
};

const getEstadoColor = (estado = '') => {
  const normalized = estado.toUpperCase();
  if ([ESTADOS_EXPEDIENTE.CERRADO, ESTADOS_EXPEDIENTE.PLAN_APROBADO, ESTADOS_EXPEDIENTE.EVALUADO].includes(normalized)) return 'success' as const;
  if ([ESTADOS_EXPEDIENTE.OBSERVADO, ESTADOS_EXPEDIENTE.PLAN_OBSERVADO, 'VENCIDO'].includes(normalized)) return 'warning' as const;
  if ([ESTADOS_EXPEDIENTE.RECHAZADO].includes(normalized)) return 'danger' as const;
  return 'info' as const;
};

interface InfoRow {
  label: string;
  value: string | number | null | undefined;
}

const InfoBlock = ({ title, rows }: { title: string; rows: InfoRow[] }) => (
  <Card className="h-full">
    <CardContent>
      <CardTitle className="text-base font-bold mb-3">{title}</CardTitle>
      <div className="grid gap-2">
        {rows.map((row: InfoRow) => (
          <div key={row.label}>
            <div className="text-xs text-muted-foreground">{row.label}</div>
            <div className="break-words text-sm text-foreground">{row.value || 'No disponible'}</div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AlertBox = ({ severity, children }: { severity: 'info' | 'warning' | 'error' | 'success'; children: React.ReactNode }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-100',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-100',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-100',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-100',
  };
  return (
    <div className={cn('rounded-xl border p-3 text-sm', styles[severity])}>
      {children}
    </div>
  );
};

const StackWarnings = ({ warnings }: { warnings: string[] }) => (
  <div className="mb-3 space-y-2">
    {warnings.map((warning, index) => (
      <AlertBox key={`${warning}-${index}`} severity="warning">{warning}</AlertBox>
    ))}
  </div>
);

const StackList = ({ items }: { items: InfoRow[] }) => (
  <div className="grid gap-2">
    {items.map((item: InfoRow) => (
      <Card key={item.label}>
        <CardContent className="py-2">
          <div className="text-xs text-muted-foreground">{item.label}</div>
          <div className="text-sm font-semibold text-foreground">{item.value || 'No disponible'}</div>
        </CardContent>
      </Card>
    ))}
  </div>
);

interface Expediente {
  id: string;
  codigoExpediente: string;
  nombreEstudiante: string;
  apellidoEstudiante: string;
  codigoEstudiantil: string;
  condicionSolicitante: string;
  periodoAcademico: string;
  nombreTipoPractica: string;
  codigoTipoPractica: string;
  nombreEmpresa: string;
  rucEmpresa: string;
  nombreSede: string;
  idEmpresa: string;
  idSedePractica: string;
  nombreAsesor: string;
  resolucionAsesor: string;
  comite: Array<{ nombreUsuario: string; rolComite: string }>;
  fechaInicioPractica: string;
  fechaFinPractica: string;
  duracionSemanas: number;
  estado: string;
  fechaCreacion: string;
  fechaPresentacionPlan: string;
  fechaActualizacion: string;
  numeroInformesParciales: number;
  fechaPresentacionInformeFinal: string;
  planTrabajoAprobado: boolean;
  informeFinalPresentado: boolean;
  calificacionFinal: string;
  observaciones: string;
  documentos: Array<{ id: string; tipoDocumento: string; nombreArchivo: string; fechaSubida: string; observaciones: string }>;
  observacionesList: Array<{ id: string; tipo: string; subsanado: boolean; descripcion: string; nombreUsuarioOrigen: string; fechaCreacion: string; respuestaSubsanacion: string }>;
  idAsesor: string;
}

interface IntegranteComite {
  idUsuario: string;
  nombres: string;
  apellidos: string;
  rolComite: string;
}

export const DetalleExpediente = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [accionEnCurso, setAccionEnCurso] = useState('');
  const [openComiteDialog, setOpenComiteDialog] = useState(false);
  const [integrantesComite, setIntegrantesComite] = useState<IntegranteComite[]>([]);
  const [miembrosComiteSeleccionados, setMiembrosComiteSeleccionados] = useState<string[]>([]);
  const [cargandoComite, setCargandoComite] = useState(false);
  const [asignandoComite, setAsignandoComite] = useState(false);

  const { data: expediente, isLoading, error } = useExpedienteById(id);

  const consultarHoras = expediente ? tieneControlHoras(expediente.estado) : false;

  const empresaQuery = useQuery({
    queryKey: ['empresa', expediente?.idEmpresa],
    queryFn: async () => { const r = await empresaApi.getById(expediente!.idEmpresa); return getPayload(r); },
    enabled: !!expediente?.idEmpresa,
  });

  const sedeQuery = useQuery({
    queryKey: ['sede', expediente?.idSedePractica],
    queryFn: async () => { const r = await sedeApi.getDetalle(expediente!.idSedePractica); return getPayload(r); },
    enabled: !!expediente?.idSedePractica,
  });

  const controlHorasQuery = useQuery({
    queryKey: ['controlHoras', id],
    queryFn: async () => { const r = await horasApi.getControl(id!); return getPayload(r); },
    enabled: consultarHoras,
  });

  const cumplimientoHorasQuery = useQuery({
    queryKey: ['cumplimientoHoras', id],
    queryFn: async () => { const r = await horasApi.getCumplimiento(id!); return getPayload(r); },
    enabled: consultarHoras,
  });

  const registrosHorasQuery = useQuery({
    queryKey: ['registrosHoras', id],
    queryFn: async () => { const r = await horasApi.getRegistros(id!); return getPayload(r) || []; },
    enabled: consultarHoras,
  });

  const trazabilidadQuery = useQuery({
    queryKey: ['trazabilidad', id],
    queryFn: async () => { const r = await trazabilidadApi.getExpediente(id!); return getPayload(r); },
    enabled: !!id,
  });

  const historialQuery = useQuery({
    queryKey: ['historialGeneracion', id],
    queryFn: async () => { const r = await reportesCoordinacionApi.getHistorialGeneracion({ idExpediente: id }); return getPayload(r) || []; },
    enabled: !!id,
  });

  useMemo(() => {
    const nextWarnings: string[] = [];
    if (empresaQuery.isError) nextWarnings.push('No se pudo cargar el detalle ampliado de la empresa.');
    if (sedeQuery.isError) nextWarnings.push('No se pudo cargar el detalle ampliado de la sede.');
    if (controlHorasQuery.isError && consultarHoras) nextWarnings.push('El control de horas no está disponible para tu rol o aún no fue iniciado.');
    if (cumplimientoHorasQuery.isError && consultarHoras) nextWarnings.push('No se pudo verificar el cumplimiento de horas para este expediente.');
    if (registrosHorasQuery.isError && consultarHoras) nextWarnings.push('No se pudieron cargar los registros detallados de horas.');
    if (trazabilidadQuery.isError) nextWarnings.push('La trazabilidad integral no pudo reconstruirse en este momento.');
    if (historialQuery.isError) nextWarnings.push('No se pudo consultar el historial de generación documental.');
    setWarnings(nextWarnings);
  }, [empresaQuery.isError, sedeQuery.isError, controlHorasQuery.isError, cumplimientoHorasQuery.isError,
    registrosHorasQuery.isError, trazabilidadQuery.isError, historialQuery.isError, consultarHoras]);

  const puedeEmitirDocumentosInstitucionales = hasAnyRole(
    user?.roles,
    ['ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR']
  );
  const puedeRevisarExpediente = hasAnyRole(
    user?.roles,
    ['ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']
  );
  const puedeAsignarComite = hasAnyRole(
    user?.roles,
    ['ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR']
  );

  const { mutateAsync: emitirCarta } = useMutation({
    mutationFn: () => coordinacionApi.emitirCartaPresentacion(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes', id] }),
  });

  const { mutateAsync: aprobarPlan } = useMutation({
    mutationFn: async () => {
      const planRes = await planesApi.getActivoByExpediente(id!);
      const planId = (planRes.data?.data as { id?: string } | undefined)?.id;
      if (!planId) throw new Error('No se encontró un plan activo para este expediente');
      return planesApi.aprobar(planId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes', id] }),
  });

  const { mutateAsync: iniciarEjecucion } = useIniciarEjecucion();

  const { mutateAsync: aprobarInforme } = useMutation({
    mutationFn: () => expedientesApi.aprobarInformeFinal(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes', id] }),
  });

  const { mutateAsync: emitirDictamen } = useMutation({
    mutationFn: (dictamen: string) => expedientesApi.emitirDictamen(id!, dictamen),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes', id] }),
  });

  const { mutateAsync: emitirConstancia } = useMutation({
    mutationFn: () => coordinacionApi.emitirConstancia(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes', id] }),
  });

  const { mutateAsync: asignarComite } = useMutation({
    mutationFn: (payload: { miembros: Array<{ idUsuario: string; rolComite: string }> }) => expedientesApi.asignarComite(id!, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes', id] }),
  });

  const { mutateAsync: habilitarExamenAplazados } = useMutation({
    mutationFn: () => expedientesApi.habilitarExamenAplazados(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes', id] }),
  });

  const { mutateAsync: registrarExamenAplazados } = useMutation({
    mutationFn: (nota: string) => expedientesApi.registrarExamenAplazados(id!, { nota: Number(nota), comentarios: '' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes', id] }),
  });

  const ejecutarAccion = async (tipo: string) => {
    const acciones: Record<string, { title: string; text: string; confirmButtonText: string; success: string; input?: string; inputLabel?: string; inputValidator?: (v: string) => string | boolean; ejecutar: (value?: any) => Promise<any> }> = {
      carta: {
        title: 'Emitir Carta de Presentación',
        text: 'La carta se generará y quedará registrada en el expediente.',
        confirmButtonText: 'Emitir carta',
        success: 'La Carta de Presentación fue emitida correctamente.',
        ejecutar: () => emitirCarta(),
      },
      aprobarPlan: {
        title: 'Aprobar Plan de Prácticas',
        text: 'El plan quedará aprobado y el expediente avanzará a la siguiente etapa.',
        confirmButtonText: 'Aprobar plan',
        success: 'El Plan de Prácticas fue aprobado correctamente.',
        ejecutar: () => aprobarPlan(),
      },
      iniciarEjecucion: {
        title: 'Iniciar Ejecución de Práctica',
        text: 'Ingresa la fecha de inicio y la duración en semanas separadas por coma (ej. 2026-08-01, 16).',
        confirmButtonText: 'Iniciar ejecución',
        success: 'La ejecución de la práctica fue iniciada correctamente.',
        input: 'text',
        inputLabel: 'Fecha de inicio (YYYY-MM-DD) y semanas',
        inputValidator: (value: string) => {
          if (!value?.trim()) return 'El dato es obligatorio.';
          const [fecha, semanasStr] = value.split(',').map((s) => s.trim());
          if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return 'La fecha debe tener formato YYYY-MM-DD.';
          const semanas = Number(semanasStr);
          if (Number.isNaN(semanas) || semanas < 1 || semanas > 52) return 'Las semanas deben estar entre 1 y 52.';
          return false;
        },
        ejecutar: (value?: string) => {
          const [fecha, semanasStr] = (value || '').split(',').map((s) => s.trim());
          return iniciarEjecucion({ id: id!, fechaInicio: fecha, duracionSemanas: Number(semanasStr) });
        },
      },
      aprobarInforme: {
        title: 'Aprobar Informe Final',
        text: 'El informe final quedará aprobado por la instancia responsable.',
        confirmButtonText: 'Aprobar informe',
        success: 'El Informe Final fue aprobado correctamente.',
        ejecutar: () => aprobarInforme(),
      },
      dictamen: {
        title: 'Emitir Dictamen Final',
        text: 'Registra la decisión colegiada que acompañará al documento institucional.',
        confirmButtonText: 'Emitir dictamen',
        success: 'El Dictamen Final fue emitido correctamente.',
        input: 'textarea',
        inputLabel: 'Dictamen u observaciones finales',
        inputValidator: (value: string) => !value?.trim() && 'El dictamen es obligatorio.',
        ejecutar: (dictamen?: string) => emitirDictamen(dictamen!.trim()),
      },
      constancia: {
        title: 'Emitir Constancia de Prácticas',
        text: 'El expediente se cerrará, si corresponde, antes de generar la constancia.',
        confirmButtonText: 'Emitir constancia',
        success: 'La constancia fue emitida correctamente.',
        ejecutar: () => emitirConstancia(),
      },
      habilitarExamenAplazados: {
        title: 'Habilitar Examen de Aplazados',
        text: 'Habilita al estudiante para rendir el examen de aplazados (semana 17).',
        confirmButtonText: 'Habilitar',
        success: 'Examen de aplazados habilitado.',
        ejecutar: () => habilitarExamenAplazados(),
      },
      registrarExamenAplazados: {
        title: 'Registrar Nota de Examen de Aplazados',
        text: 'Ingresa la nota obtenida en el examen de aplazados (escala 0-20).',
        confirmButtonText: 'Registrar nota',
        success: 'Nota registrada correctamente.',
        input: 'number',
        inputLabel: 'Nota (0-20)',
        inputValidator: (value: string) => {
          const n = Number(value);
          if (Number.isNaN(n) || n < 0 || n > 20) return 'La nota debe estar entre 0 y 20.';
          return false;
        },
        ejecutar: (nota?: string) => registrarExamenAplazados(nota!),
      },
    };
    const accion = acciones[tipo];
    if (!accion) return;
    const confirmacion = await MySwal.fire({
      title: accion.title,
      text: accion.text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: accion.confirmButtonText,
      cancelButtonText: 'Cancelar',
      input: accion.input as any,
      inputLabel: accion.inputLabel,
      inputValidator: accion.inputValidator as any,
    });
    if (!confirmacion.isConfirmed) return;

    try {
      setAccionEnCurso(tipo);
      await accion.ejecutar(confirmacion.value);
      MySwal.fire('Operación completada', accion.success, 'success');
    } catch (err: any) {
      MySwal.fire('No se pudo completar la operación',
        err.response?.data?.message || 'Verifica que el expediente cumpla los requisitos del flujo.', 'error');
    } finally {
      setAccionEnCurso('');
    }
  };

  const abrirAsignacionComite = async () => {
    try {
      setCargandoComite(true);
      const response = await expedientesApi.getComiteIntegrantesActivos();
      const integrantes: IntegranteComite[] = getPayload(response) || [];
      if (!integrantes.length) {
        MySwal.fire('Comité no configurado', 'No existen integrantes activos. Regístralos desde la gestión institucional antes de asignarlos.', 'info');
        return;
      }
      setIntegrantesComite(integrantes);
      setMiembrosComiteSeleccionados(integrantes.slice(0, 3).map((integrante) => integrante.idUsuario));
      setOpenComiteDialog(true);
    } catch (err: any) {
      MySwal.fire('No se pudo cargar el comité', err.response?.data?.message || 'Intenta nuevamente.', 'error');
    } finally {
      setCargandoComite(false);
    }
  };

  const alternarMiembroComite = (idUsuario: string) => {
    setMiembrosComiteSeleccionados((actuales) => {
      if (actuales.includes(idUsuario)) {
        return actuales.filter((idActual) => idActual !== idUsuario);
      }
      if (actuales.length >= 3) {
        MySwal.fire('Máximo alcanzado', 'El comité puede tener hasta tres integrantes.', 'info');
        return actuales;
      }
      return [...actuales, idUsuario];
    });
  };

  const confirmarAsignacionComite = async () => {
    const miembros = integrantesComite
      .filter((integrante) => miembrosComiteSeleccionados.includes(integrante.idUsuario))
      .map((integrante) => ({
        idUsuario: integrante.idUsuario,
        rolComite: integrante.rolComite || 'MIEMBRO',
      }));

    if (!miembros.length) {
      MySwal.fire('Selecciona integrantes', 'Debes asignar al menos un integrante activo.', 'warning');
      return;
    }

    try {
      setAsignandoComite(true);
      await asignarComite({ miembros });
      setOpenComiteDialog(false);
      MySwal.fire('Comité asignado', 'El expediente avanzó a COMITE_ASIGNADO.', 'success');
    } catch (err: any) {
      MySwal.fire('No se pudo asignar el comité', err.response?.data?.message || 'Verifica el estado del expediente.', 'error');
    } finally {
      setAsignandoComite(false);
    }
  };

  const ultimaConstancia = useMemo(
    () =>
      (historialQuery.data || []).find((item: any) =>
        String(item.tipoDocumento || '').toUpperCase().includes('CONSTANCIA')
      ) || null,
    [historialQuery.data]
  );

  const progresoHoras = useMemo(() => {
    if (!controlHorasQuery.data?.horasRequeridas) return 0;
    return Math.min(100, Math.round(((controlHorasQuery.data.horasAcumuladas || 0) / controlHorasQuery.data.horasRequeridas) * 100));
  }, [controlHorasQuery.data]);

  const evaluacionResumen = useMemo(
    () => [
      { label: 'Plan de trabajo', value: expediente?.planTrabajoAprobado ? 'Aprobado' : 'Pendiente' },
      { label: 'Informe final', value: expediente?.informeFinalPresentado ? 'Presentado' : 'Pendiente' },
      { label: 'Calificación final', value: expediente?.calificacionFinal ?? 'No registrada' },
      { label: 'Condición de cierre', value: expediente?.estado },
    ],
    [expediente]
  );

  const tabs = ['Resumen General', 'Documentos y Observaciones', 'Monitoreo y Horas', 'Trazabilidad y Cierre'];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card className="p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" aria-hidden="true" />
          <p className="mt-2 text-sm text-muted-foreground">Cargando expediente...</p>
        </Card>
      </div>
    );
  }

  if (error || !expediente) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <AlertBox severity="error">
          {error ? 'Error al cargar el expediente.' : 'No se encontró información del expediente.'}
        </AlertBox>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="mb-1 text-2xl font-extrabold text-primary-700 dark:text-primary-400 md:text-3xl">
                Detalle de Expediente
              </h1>
              <p className="text-sm text-muted-foreground">
                {expediente.codigoExpediente} · {expediente.nombreTipoPractica} · Periodo {expediente.periodoAcademico || 'No definido'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1">
              <Badge variant={getEstadoColor(expediente.estado)} size="sm">{expediente.estado}</Badge>
              {puedeEmitirDocumentosInstitucionales && expediente.estado === ESTADOS_EXPEDIENTE.VALIDADO_SECRETARIA && (
                <Button size="sm" className="min-h-10 w-full sm:w-auto" disabled={accionEnCurso === 'carta'} onClick={() => ejecutarAccion('carta')}>
                  {accionEnCurso === 'carta' ? 'Emitiendo...' : 'Emitir carta'}
                </Button>
              )}
              {puedeAsignarComite
                && ['FINAL', 'PROFESIONAL'].includes(expediente.codigoTipoPractica)
                && expediente.estado === ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA && (
                  <Button size="sm" variant="secondary" className="min-h-10 w-full sm:w-auto" disabled={cargandoComite} onClick={abrirAsignacionComite}>
                    {cargandoComite ? 'Cargando comité...' : 'Asignar comité'}
                  </Button>
                )}
              {puedeRevisarExpediente && expediente.estado === ESTADOS_EXPEDIENTE.PLAN_PRESENTADO && (
                <Button size="sm" className="min-h-10 w-full sm:w-auto" disabled={accionEnCurso === 'aprobarPlan'} onClick={() => ejecutarAccion('aprobarPlan')}>
                  {accionEnCurso === 'aprobarPlan' ? 'Aprobando...' : 'Aprobar plan'}
                </Button>
              )}
              {puedeRevisarExpediente && expediente.estado === ESTADOS_EXPEDIENTE.PLAN_APROBADO && (
                <Button size="sm" variant="secondary" className="min-h-10 w-full sm:w-auto" disabled={accionEnCurso === 'iniciarEjecucion'} onClick={() => ejecutarAccion('iniciarEjecucion')}>
                  {accionEnCurso === 'iniciarEjecucion' ? 'Iniciando...' : 'Iniciar ejecución'}
                </Button>
              )}
              {puedeRevisarExpediente && expediente.estado === ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO && (
                <Button size="sm" className="min-h-10 w-full sm:w-auto" disabled={accionEnCurso === 'aprobarInforme'} onClick={() => ejecutarAccion('aprobarInforme')}>
                  {accionEnCurso === 'aprobarInforme' ? 'Aprobando...' : 'Aprobar informe'}
                </Button>
              )}
              {puedeRevisarExpediente && ESTADOS_PARA_DICTAMEN.includes(expediente.estado) && (
                <Button size="sm" variant="secondary" className="min-h-10 w-full sm:w-auto" disabled={accionEnCurso === 'dictamen'} onClick={() => ejecutarAccion('dictamen')}>
                  {accionEnCurso === 'dictamen' ? 'Emitiendo...' : 'Emitir dictamen'}
                </Button>
              )}
              {puedeEmitirDocumentosInstitucionales && ([ESTADOS_EXPEDIENTE.EVALUADO, ESTADOS_EXPEDIENTE.DICTAMEN_EMITIDO].includes(expediente.estado)
                || (expediente.estado === ESTADOS_EXPEDIENTE.CERRADO && !ultimaConstancia)) ? (
                  <Button size="sm" className="min-h-10 w-full sm:w-auto" disabled={accionEnCurso === 'constancia'} onClick={() => ejecutarAccion('constancia')}>
                    {accionEnCurso === 'constancia' ? 'Emitiendo...' : 'Emitir constancia'}
                  </Button>
                ) : null}
              {puedeRevisarExpediente && expediente.codigoTipoPractica === 'INICIAL'
                && expediente.estado === ESTADOS_EXPEDIENTE.EVALUADO
                && Number(expediente.calificacionFinal) < 13.5 && (
                  <Button size="sm" variant="secondary" className="min-h-10 w-full sm:w-auto" disabled={accionEnCurso === 'habilitarExamenAplazados'} onClick={() => ejecutarAccion('habilitarExamenAplazados')}>
                    {accionEnCurso === 'habilitarExamenAplazados' ? 'Habilitando...' : 'Habilitar examen aplazados'}
                  </Button>
              )}
              {puedeRevisarExpediente && expediente.estado === ESTADOS_EXPEDIENTE.EXAMEN_APLAZADOS_HABILITADO && (
                <Button size="sm" className="min-h-10 w-full sm:w-auto" disabled={accionEnCurso === 'registrarExamenAplazados'} onClick={() => ejecutarAccion('registrarExamenAplazados')}>
                  {accionEnCurso === 'registrarExamenAplazados' ? 'Registrando...' : 'Registrar nota aplazados'}
                </Button>
              )}
              <Button size="sm" variant="secondary" className="min-h-10 w-full sm:w-auto" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} aria-hidden="true" /> Volver
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Vista integral del expediente con información académica, documental, horas, trazabilidad y cierre institucional.
          </p>
        </div>

        {warnings.length > 0 && <StackWarnings warnings={warnings} />}

        <Dialog open={openComiteDialog} onOpenChange={(open) => { if (!asignandoComite) setOpenComiteDialog(open); }}>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Asignar comité activo</DialogTitle>
              <DialogDescription>
                Selecciona entre uno y tres integrantes vigentes. Sus cargos institucionales se conservarán en el expediente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              {integrantesComite.map((integrante) => (
                <label
                  key={integrante.idUsuario}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-600"
                    checked={miembrosComiteSeleccionados.includes(integrante.idUsuario)}
                    onChange={() => alternarMiembroComite(integrante.idUsuario)}
                    disabled={asignandoComite}
                  />
                  <span className="text-sm text-foreground">
                    {integrante.nombres || ''} {integrante.apellidos || ''} ({integrante.rolComite || 'MIEMBRO'})
                  </span>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpenComiteDialog(false)} disabled={asignandoComite} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button variant="primary" onClick={confirmarAsignacionComite} disabled={asignandoComite || !miembrosComiteSeleccionados.length} className="w-full sm:w-auto">
                {asignandoComite ? 'Asignando...' : 'Confirmar asignación'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="overflow-hidden">
          <Tabs value={tabs[tabValue]} onValueChange={(v) => setTabValue(tabs.indexOf(v))}>
            <div className="border-b border-border">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
                {tabs.map((tab, i) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    aria-selected={tabValue === i ? 'true' : 'false'}
                    data-state={tabValue === i ? 'active' : 'inactive'}
                    onClick={() => setTabValue(i)}
                    className={cn(
                      'rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-all',
                      tabValue === i
                        ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-400'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={tabs[0]}>
              <div className="p-3 md:p-4">
                <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-4">
                  <InfoBlock
                    title="Estudiante"
                    rows={[
                      { label: 'Código', value: expediente.codigoEstudiantil },
                      { label: 'Nombre', value: `${expediente.nombreEstudiante || ''} ${expediente.apellidoEstudiante || ''}`.trim() },
                      { label: 'Condición solicitante', value: expediente.condicionSolicitante },
                      { label: 'Periodo académico', value: expediente.periodoAcademico },
                    ]}
                  />
                  <InfoBlock
                    title="Empresa y Sede"
                    rows={[
                      { label: 'Empresa', value: expediente.nombreEmpresa || empresaQuery.data?.razonSocial },
                      { label: 'RUC', value: expediente.rucEmpresa || empresaQuery.data?.ruc },
                      { label: 'Sede', value: expediente.nombreSede || sedeQuery.data?.nombreSede },
                      { label: 'Dirección sede', value: sedeQuery.data?.direccion },
                    ]}
                  />
                  <InfoBlock
                    title="Asesoría y Comité"
                    rows={[
                      { label: 'Docente asesor', value: expediente.nombreAsesor },
                      { label: 'Resolución', value: expediente.resolucionAsesor },
                      {
                        label: 'Comité asignado',
                        value: expediente.comite?.length
                          ? expediente.comite.map((item: any) => `${item.nombreUsuario} (${item.rolComite})`).join(', ')
                          : 'Sin miembros registrados',
                      },
                      { label: 'Tutor externo', value: 'No disponible en la API actual del expediente' },
                    ]}
                  />
                  <InfoBlock
                    title="Práctica"
                    rows={[
                      { label: 'Tipo', value: expediente.nombreTipoPractica },
                      { label: 'Inicio', value: formatDate(expediente.fechaInicioPractica) },
                      { label: 'Fin', value: formatDate(expediente.fechaFinPractica) },
                      { label: 'Duración', value: expediente.duracionSemanas ? `${expediente.duracionSemanas} semanas` : 'No definida' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
                  <Card>
                    <CardContent>
                      <CardTitle className="text-base font-bold mb-3">Plan, evaluaciones y dictamen</CardTitle>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {evaluacionResumen.map((item) => (
                          <Card key={item.label}>
                            <CardContent className="py-2">
                              <div className="text-xs text-muted-foreground">{item.label}</div>
                              <div className="text-base font-semibold text-foreground">{item.value}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <p className="text-sm text-muted-foreground">
                        {expediente.observaciones || 'Sin observaciones generales registradas en el expediente.'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <CardTitle className="text-base font-bold mb-3">Hitos del expediente</CardTitle>
                      <StackList
                        items={[
                          { label: 'Fecha de creación', value: formatDateTime(expediente.fechaCreacion) },
                          { label: 'Presentación del plan', value: formatDateTime(expediente.fechaPresentacionPlan) },
                          { label: 'Actualización más reciente', value: formatDateTime(expediente.fechaActualizacion) },
                          { label: 'Número de informes parciales', value: expediente.numeroInformesParciales ?? 'No definido' },
                        ]}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value={tabs[1]}>
              <div className="p-3 md:p-4">
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <Card>
                    <CardContent>
                      <CardTitle className="text-base font-bold mb-3">Documentos del expediente</CardTitle>
                      {(expediente.documentos || []).length > 0 ? (
                        <div className="space-y-2">
                          {expediente.documentos.map((doc: any) => (
                            <Card key={doc.id}>
                              <CardContent className="py-2">
                                <div className="text-sm font-bold text-foreground">{doc.tipoDocumento}</div>
                                <div className="text-sm text-muted-foreground">{doc.nombreArchivo}</div>
                                <div className="text-xs text-muted-foreground">Subido: {formatDateTime(doc.fechaSubida)}</div>
                                {doc.observaciones && (
                                  <div className="mt-1 text-xs text-foreground">{doc.observaciones}</div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <AlertBox severity="info">No hay documentos asociados al expediente.</AlertBox>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <CardTitle className="text-base font-bold mb-3">Observaciones y subsanaciones</CardTitle>
                      {(expediente.observacionesList || []).length > 0 ? (
                        <div className="space-y-2">
                          {expediente.observacionesList.map((obs: any) => (
                            <Card key={obs.id}>
                              <CardContent className="py-2">
                                <div className="flex flex-wrap justify-between gap-1">
                                  <div className="text-sm font-bold text-foreground">{obs.tipo}</div>
                                  <Badge variant={obs.subsanado ? 'success' : 'warning'} size="sm">{obs.subsanado ? 'Subsanado' : 'Pendiente'}</Badge>
                                </div>
                                <div className="mt-1 text-sm text-foreground">{obs.descripcion}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Registrado por {obs.nombreUsuarioOrigen} · {formatDateTime(obs.fechaCreacion)}
                                </div>
                                {obs.respuestaSubsanacion && (
                                  <div className="mt-2 text-xs text-foreground">Respuesta: {obs.respuestaSubsanacion}</div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <AlertBox severity="success">No se registran observaciones pendientes o históricas.</AlertBox>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value={tabs[2]}>
              <div className="p-3 md:p-4">
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <Card>
                    <CardContent>
                      <CardTitle className="text-base font-bold mb-3">Control de horas</CardTitle>
                      {controlHorasQuery.data ? (
                        <>
                          <div className="mb-1 flex justify-between">
                            <div className="text-sm text-foreground">Avance acumulado</div>
                            <div className="text-sm font-bold text-foreground">
                              {controlHorasQuery.data.horasAcumuladas || 0} / {controlHorasQuery.data.horasRequeridas || 0} horas
                            </div>
                          </div>
                          <Progress value={progresoHoras} size="md" />
                          <div className="mt-2 text-xs text-muted-foreground">
                            Estado del control: {controlHorasQuery.data.estado} · Inicio {formatDate(controlHorasQuery.data.fechaInicio)} · Fin estimado {formatDate(controlHorasQuery.data.fechaFinEstimada)}
                          </div>

                          {cumplimientoHorasQuery.data && (
                            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                              <Card>
                                <CardContent className="py-2">
                                  <div className="text-xs text-muted-foreground">Cumplimiento</div>
                                  <div className="text-base font-bold text-foreground">{cumplimientoHorasQuery.data.cumplido ? 'Alcanzado' : 'Pendiente'}</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="py-2">
                                  <div className="text-xs text-muted-foreground">Horas pendientes</div>
                                  <div className="text-base font-bold text-foreground">{cumplimientoHorasQuery.data.horasPendientes ?? 0}</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="py-2">
                                  <div className="text-xs text-muted-foreground">Coherencia temporal</div>
                                  <div className="text-base font-bold text-foreground">{cumplimientoHorasQuery.data.coherenciaTemporalOk ? 'Correcta' : 'Revisar'}</div>
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          {(cumplimientoHorasQuery.data?.alertas || []).length > 0 && (
                            <div className="mt-3 space-y-2">
                              {(cumplimientoHorasQuery.data.alertas || []).map((alerta: string, index: number) => (
                                <AlertBox key={`${alerta}-${index}`} severity="warning">{alerta}</AlertBox>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <AlertBox severity="info">El control de horas no está disponible para este expediente o tu rol actual.</AlertBox>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <CardTitle className="text-base font-bold mb-3">Registros de monitoreo y horas</CardTitle>
                      {(registrosHorasQuery.data || []).length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Horas</TableHead>
                                <TableHead>Actividad</TableHead>
                                <TableHead>Validación</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(registrosHorasQuery.data || []).map((registro: any) => (
                                <TableRow key={registro.id}>
                                  <TableCell>{formatDate(registro.fecha)}</TableCell>
                                  <TableCell>{registro.horas}</TableCell>
                                  <TableCell>{registro.descripcionActividad}</TableCell>
                                  <TableCell>
                                    <Badge variant={registro.validadoPorTutor ? 'success' : 'warning'} size="sm">
                                      {registro.validadoPorTutor ? 'Validado' : 'Pendiente'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <AlertBox severity="info">No hay registros de horas visibles para este expediente.</AlertBox>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value={tabs[3]}>
              <div className="p-3 md:p-4">
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
                  <Card>
                    <CardContent>
                      <CardTitle className="text-base font-bold mb-3">Línea de tiempo y trazabilidad</CardTitle>
                      {trazabilidadQuery.data?.lineaTiempo?.length ? (
                        <div className="grid gap-2">
                          {trazabilidadQuery.data.lineaTiempo.slice().reverse().map((evento: any) => (
                            <Card key={`${evento.origenFuente}-${evento.referenciaId}-${evento.fechaHora}`}>
                              <CardContent className="py-2">
                                <div className="flex flex-wrap justify-between gap-1">
                                  <Badge variant="info" size="sm">{evento.categoria}</Badge>
                                  <div className="text-xs text-muted-foreground">{formatDateTime(evento.fechaHora)}</div>
                                </div>
                                <div className="mt-1 text-sm font-bold text-foreground">{evento.accion}</div>
                                <div className="text-sm text-muted-foreground">{evento.descripcion || 'Sin descripción adicional'}</div>
                                {(evento.actor || evento.rolActor) && (
                                  <div className="mt-1 text-xs text-foreground">{evento.actor || 'Sistema'} {evento.rolActor ? `· ${evento.rolActor}` : ''}</div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <AlertBox severity="info">No se encontró trazabilidad reconstruida para este expediente.</AlertBox>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <CardTitle className="text-base font-bold mb-3">Dictamen y constancia emitida</CardTitle>
                      <StackList
                        items={[
                          { label: 'Estado final', value: expediente.estado },
                          { label: 'Calificación final', value: expediente.calificacionFinal ?? 'No registrada' },
                          { label: 'Informe final', value: expediente.informeFinalPresentado ? 'Presentado' : 'Pendiente' },
                          {
                            label: 'Constancia emitida',
                            value: ultimaConstancia
                              ? `${ultimaConstancia.nombreArchivo} · ${formatDateTime(ultimaConstancia.fechaGeneracion)}`
                              : 'No registrada',
                          },
                        ]}
                      />
                      <Separator className="my-3" />
                      <CardTitle className="text-sm font-bold mb-2">Historial documental</CardTitle>
                      {(historialQuery.data || []).length > 0 ? (
                        <div className="grid gap-2">
                          {(historialQuery.data || []).slice(0, 6).map((item: any) => (
                            <Card key={item.id}>
                              <CardContent className="py-2">
                                <div className="text-sm font-bold text-foreground">{item.tipoDocumento || item.tipoReporte || 'Documento institucional'}</div>
                                <div className="text-xs text-muted-foreground">{item.nombreArchivo} · {formatDateTime(item.fechaGeneracion)}</div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <AlertBox severity="info">Aún no existe historial de documentos generados para este expediente.</AlertBox>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </motion.div>
  );
};

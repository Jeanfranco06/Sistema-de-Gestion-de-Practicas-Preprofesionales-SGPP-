import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, FileText, Scale, Award, Eye, Users, ClipboardList, ListChecks, FileEdit, Building2, Building } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { useExpedienteById, useIniciarEjecucion } from '../../../hooks/useExpedientes';
import { expedientesApi } from '../../../api/expedientesApi';
import { planesApi } from '../../../api/planesApi';
import { empresaApi, sedeApi } from '../../../api/sedesApi';
import { coordinacionApi, horasApi, reportesCoordinacionApi, trazabilidadApi } from '../../../api/coordinacionApi';
import { tieneControlHoras } from '../../../shared/utils/controlHoras';
import { hasAnyRole } from '../../../shared/utils/roleRoutes';
import { ESTADOS_EXPEDIENTE, ESTADOS_PARA_DICTAMEN } from '../../../lib/constants';
import { Button, Badge, Progress, Tooltip } from '../../../ui';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

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
  if (['CERRADO', 'APROBADO', 'EVALUADO'].includes(normalized)) return 'success' as const;
  if (['OBSERVADO', 'VENCIDO'].includes(normalized)) return 'warning' as const;
  if (['RECHAZADO'].includes(normalized)) return 'danger' as const;
  return 'info' as const;
};

interface InfoRow {
  label: string;
  value: string | number | null | undefined;
}

const InfoBlock = ({ title, rows }: { title: string; rows: InfoRow[] }) => (
  <div className="rounded-2xl border p-2.25 h-full" style={{ borderColor: 'var(--color-border)' }}>
    <div className="text-base font-bold mb-1.5" style={{ color: 'var(--color-foreground)' }}>{title}</div>
    <div className="grid gap-1.25">
      {rows.map((row: InfoRow) => (
        <div key={row.label}>
          <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{row.label}</div>
          <div className="text-sm break-words" style={{ color: 'var(--color-foreground)' }}>{row.value || 'No disponible'}</div>
        </div>
      ))}
    </div>
  </div>
);

const StackWarnings = ({ warnings }: { warnings: string[] }) => (
  <div className="space-y-2 mb-3">
    {warnings.map((warning, index) => (
      <Alert key={`${warning}-${index}`} severity="warning">{warning}</Alert>
    ))}
  </div>
);

const StackList = ({ items }: { items: InfoRow[] }) => (
  <div className="grid gap-1.25">
    {items.map((item: InfoRow) => (
      <div key={item.label} className="rounded-2xl border p-1.5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{item.label}</div>
        <div className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{item.value || 'No disponible'}</div>
      </div>
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-xl border p-5 text-center" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <CircularProgress />
          <div className="text-sm mt-2" style={{ color: 'var(--color-muted-foreground)' }}>Cargando expediente...</div>
        </div>
      </div>
    );
  }

  if (error || !expediente) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Alert severity="error">{error ? 'Error al cargar el expediente.' : 'No se encontró información del expediente.'}</Alert>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="flex flex-wrap justify-between gap-2 mb-1.5">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-0.75" style={{ color: 'var(--color-primary)' }}>Detalle de Expediente</h1>
              <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                {expediente.codigoExpediente} · {expediente.nombreTipoPractica} · Periodo {expediente.periodoAcademico || 'No definido'}
              </div>
            </div>
            <div className="flex gap-1 items-center flex-wrap justify-end">
              <Badge variant={getEstadoColor(expediente.estado)} size="sm">{expediente.estado}</Badge>
              {puedeEmitirDocumentosInstitucionales && expediente.estado === ESTADOS_EXPEDIENTE.VALIDADO_SECRETARIA && (
                <Button size="sm"
                  disabled={accionEnCurso === 'carta'}
                  onClick={() => ejecutarAccion('carta')}>
                  {accionEnCurso === 'carta' ? 'Emitiendo...' : 'Emitir carta'}
                </Button>
              )}
              {puedeAsignarComite
                && ['FINAL', 'PROFESIONAL'].includes(expediente.codigoTipoPractica)
                && expediente.estado === ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA && (
                  <Button size="sm" variant="secondary"
                    disabled={cargandoComite}
                    onClick={abrirAsignacionComite}>
                    {cargandoComite ? 'Cargando comité...' : 'Asignar comité'}
                  </Button>
                )}
              {puedeRevisarExpediente && expediente.estado === ESTADOS_EXPEDIENTE.PLAN_PRESENTADO && (
                <Button size="sm"
                  disabled={accionEnCurso === 'aprobarPlan'}
                  onClick={() => ejecutarAccion('aprobarPlan')}>
                  {accionEnCurso === 'aprobarPlan' ? 'Aprobando...' : 'Aprobar plan'}
                </Button>
              )}
              {puedeRevisarExpediente && expediente.estado === ESTADOS_EXPEDIENTE.PLAN_APROBADO && (
                <Button size="sm" variant="secondary"
                  disabled={accionEnCurso === 'iniciarEjecucion'}
                  onClick={() => ejecutarAccion('iniciarEjecucion')}>
                  {accionEnCurso === 'iniciarEjecucion' ? 'Iniciando...' : 'Iniciar ejecución'}
                </Button>
              )}
              {puedeRevisarExpediente && expediente.estado === ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO && (
                <Button size="sm"
                  disabled={accionEnCurso === 'aprobarInforme'}
                  onClick={() => ejecutarAccion('aprobarInforme')}>
                  {accionEnCurso === 'aprobarInforme' ? 'Aprobando...' : 'Aprobar informe'}
                </Button>
              )}
              {puedeRevisarExpediente && ESTADOS_PARA_DICTAMEN.includes(expediente.estado) && (
                <Button size="sm" variant="secondary"
                  disabled={accionEnCurso === 'dictamen'}
                  onClick={() => ejecutarAccion('dictamen')}>
                  {accionEnCurso === 'dictamen' ? 'Emitiendo...' : 'Emitir dictamen'}
                </Button>
              )}
              {puedeEmitirDocumentosInstitucionales && ([ESTADOS_EXPEDIENTE.EVALUADO, ESTADOS_EXPEDIENTE.DICTAMEN_EMITIDO].includes(expediente.estado)
                || (expediente.estado === ESTADOS_EXPEDIENTE.CERRADO && !ultimaConstancia)) ? (
                  <Button size="sm"
                    disabled={accionEnCurso === 'constancia'}
                    onClick={() => ejecutarAccion('constancia')}>
                    {accionEnCurso === 'constancia' ? 'Emitiendo...' : 'Emitir constancia'}
                  </Button>
                ) : null}
              {puedeRevisarExpediente && expediente.codigoTipoPractica === 'INICIAL'
                && expediente.estado === ESTADOS_EXPEDIENTE.EVALUADO
                && Number(expediente.calificacionFinal) < 13.5 && (
                  <Button size="sm" variant="secondary"
                    disabled={accionEnCurso === 'habilitarExamenAplazados'}
                    onClick={() => ejecutarAccion('habilitarExamenAplazados')}>
                    {accionEnCurso === 'habilitarExamenAplazados' ? 'Habilitando...' : 'Habilitar examen aplazados'}
                  </Button>
              )}
              {puedeRevisarExpediente && expediente.estado === ESTADOS_EXPEDIENTE.EXAMEN_APLAZADOS_HABILITADO && (
                <Button size="sm"
                  disabled={accionEnCurso === 'registrarExamenAplazados'}
                  onClick={() => ejecutarAccion('registrarExamenAplazados')}>
                  {accionEnCurso === 'registrarExamenAplazados' ? 'Registrando...' : 'Registrar nota aplazados'}
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Volver
              </Button>
            </div>
          </div>
          <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Vista integral del expediente con información académica, documental, horas, trazabilidad y cierre institucional.
          </div>
        </div>

        {warnings.length > 0 && <StackWarnings warnings={warnings} />}

        <Dialog open={openComiteDialog} onClose={() => !asignandoComite && setOpenComiteDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Asignar comité activo</DialogTitle>
          <DialogContent dividers>
            <div className="text-sm mb-1.5" style={{ color: 'var(--color-muted-foreground)' }}>
              Selecciona entre uno y tres integrantes vigentes. Sus cargos institucionales se conservarán en el expediente.
            </div>
            <div className="grid gap-0.5">
              {integrantesComite.map((integrante) => (
                <FormControlLabel
                  key={integrante.idUsuario}
                  control={(
                    <Checkbox
                      checked={miembrosComiteSeleccionados.includes(integrante.idUsuario)}
                      onChange={() => alternarMiembroComite(integrante.idUsuario)}
                      disabled={asignandoComite}
                    />
                  )}
                  label={`${integrante.nombres || ''} ${integrante.apellidos || ''} (${integrante.rolComite || 'MIEMBRO'})`}
                />
              ))}
            </div>
          </DialogContent>
          <DialogActions>
            <Button variant="secondary" onClick={() => setOpenComiteDialog(false)} disabled={asignandoComite}>Cancelar</Button>
            <Button variant="primary" onClick={confirmarAsignacionComite} disabled={asignandoComite || !miembrosComiteSeleccionados.length}>
              {asignandoComite ? 'Asignando...' : 'Confirmar asignación'}
            </Button>
          </DialogActions>
        </Dialog>

        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setTabValue(i)}
                className="px-4 py-3 text-sm font-medium transition-all border-b-2"
                style={{
                  color: tabValue === i ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  borderBottomColor: tabValue === i ? 'var(--color-primary)' : 'transparent',
                  backgroundColor: tabValue === i ? 'var(--color-muted)' : 'transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {tabValue === 0 && (
            <div className="p-3">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-2 mb-2">
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

              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-2">
                <div className="rounded-2xl border p-2.25" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-base font-bold mb-1.5">Plan, evaluaciones y dictamen</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {evaluacionResumen.map((item) => (
                      <div key={item.label} className="rounded-2xl border p-1.75" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{item.label}</div>
                        <div className="text-base font-semibold">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <hr className="my-2" style={{ borderColor: 'var(--color-border)' }} />
                  <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                    {expediente.observaciones || 'Sin observaciones generales registradas en el expediente.'}
                  </div>
                </div>

                <div className="rounded-2xl border p-2.25" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-base font-bold mb-1.5">Hitos del expediente</div>
                  <StackList
                    items={[
                      { label: 'Fecha de creación', value: formatDateTime(expediente.fechaCreacion) },
                      { label: 'Presentación del plan', value: formatDateTime(expediente.fechaPresentacionPlan) },
                      { label: 'Actualización más reciente', value: formatDateTime(expediente.fechaActualizacion) },
                      { label: 'Número de informes parciales', value: expediente.numeroInformesParciales ?? 'No definido' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {tabValue === 1 && (
            <div className="p-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                <div className="rounded-2xl border p-2.25" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-base font-bold mb-1.5">Documentos del expediente</div>
                  {(expediente.documentos || []).length > 0 ? (
                    <div className="space-y-1.25">
                      {expediente.documentos.map((doc: any) => (
                        <div key={doc.id} className="rounded-2xl border p-1.5" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="text-sm font-bold">{doc.tipoDocumento}</div>
                          <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{doc.nombreArchivo}</div>
                          <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Subido: {formatDateTime(doc.fechaSubida)}</div>
                          {doc.observaciones && (
                            <div className="text-xs mt-0.5">{doc.observaciones}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert severity="info">No hay documentos asociados al expediente.</Alert>
                  )}
                </div>

                <div className="rounded-2xl border p-2.25" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-base font-bold mb-1.5">Observaciones y subsanaciones</div>
                  {(expediente.observacionesList || []).length > 0 ? (
                    <div className="space-y-1.25">
                      {expediente.observacionesList.map((obs: any) => (
                        <div key={obs.id} className="rounded-2xl border p-1.5" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="flex justify-between gap-1 flex-wrap">
                            <div className="text-sm font-bold">{obs.tipo}</div>
                            <Badge variant={obs.subsanado ? 'success' : 'warning'} size="sm">{obs.subsanado ? 'Subsanado' : 'Pendiente'}</Badge>
                          </div>
                          <div className="text-sm mt-1">{obs.descripcion}</div>
                          <div className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                            Registrado por {obs.nombreUsuarioOrigen} · {formatDateTime(obs.fechaCreacion)}
                          </div>
                          {obs.respuestaSubsanacion && (
                            <div className="text-xs mt-0.75">Respuesta: {obs.respuestaSubsanacion}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert severity="success">No se registran observaciones pendientes o históricas.</Alert>
                  )}
                </div>
              </div>
            </div>
          )}

          {tabValue === 2 && (
            <div className="p-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                <div className="rounded-2xl border p-2.25" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-base font-bold mb-1.5">Control de horas</div>
                  {controlHorasQuery.data ? (
                    <>
                      <div className="flex justify-between mb-1">
                        <div className="text-sm">Avance acumulado</div>
                        <div className="text-sm font-bold">
                          {controlHorasQuery.data.horasAcumuladas || 0} / {controlHorasQuery.data.horasRequeridas || 0} horas
                        </div>
                      </div>
                      <Progress value={progresoHoras} size="md" />
                      <div className="text-xs mt-1.5" style={{ color: 'var(--color-muted-foreground)' }}>
                        Estado del control: {controlHorasQuery.data.estado} · Inicio {formatDate(controlHorasQuery.data.fechaInicio)} · Fin estimado {formatDate(controlHorasQuery.data.fechaFinEstimada)}
                      </div>

                      {cumplimientoHorasQuery.data && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 mt-2">
                          <div className="rounded-2xl border p-1.5" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Cumplimiento</div>
                            <div className="text-base font-bold">{cumplimientoHorasQuery.data.cumplido ? 'Alcanzado' : 'Pendiente'}</div>
                          </div>
                          <div className="rounded-2xl border p-1.5" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Horas pendientes</div>
                            <div className="text-base font-bold">{cumplimientoHorasQuery.data.horasPendientes ?? 0}</div>
                          </div>
                          <div className="rounded-2xl border p-1.5" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Coherencia temporal</div>
                            <div className="text-base font-bold">{cumplimientoHorasQuery.data.coherenciaTemporalOk ? 'Correcta' : 'Revisar'}</div>
                          </div>
                        </div>
                      )}

                      {(cumplimientoHorasQuery.data?.alertas || []).length > 0 && (
                        <div className="mt-2">
                          {(cumplimientoHorasQuery.data.alertas || []).map((alerta: string, index: number) => (
                            <Alert key={`${alerta}-${index}`} severity="warning" sx={{ mb: 1 }}>{alerta}</Alert>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Alert severity="info">El control de horas no está disponible para este expediente o tu rol actual.</Alert>
                  )}
                </div>

                <div className="rounded-2xl border p-2.25" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-base font-bold mb-1.5">Registros de monitoreo y horas</div>
                  {(registrosHorasQuery.data || []).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <th className="text-left p-2 font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Fecha</th>
                            <th className="text-left p-2 font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Horas</th>
                            <th className="text-left p-2 font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Actividad</th>
                            <th className="text-left p-2 font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Validación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(registrosHorasQuery.data || []).map((registro: any) => (
                            <tr key={registro.id} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                              <td className="p-2">{formatDate(registro.fecha)}</td>
                              <td className="p-2">{registro.horas}</td>
                              <td className="p-2">{registro.descripcionActividad}</td>
                              <td className="p-2">
                                <Badge variant={registro.validadoPorTutor ? 'success' : 'warning'} size="sm">
                                  {registro.validadoPorTutor ? 'Validado' : 'Pendiente'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Alert severity="info">No hay registros de horas visibles para este expediente.</Alert>
                  )}
                </div>
              </div>
            </div>
          )}

          {tabValue === 3 && (
            <div className="p-3">
              <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-2">
                <div className="rounded-2xl border p-2.25" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-base font-bold mb-1.5">Línea de tiempo y trazabilidad</div>
                  {trazabilidadQuery.data?.lineaTiempo?.length ? (
                    <div className="grid gap-1.25">
                      {trazabilidadQuery.data.lineaTiempo.slice().reverse().map((evento: any) => (
                        <div key={`${evento.origenFuente}-${evento.referenciaId}-${evento.fechaHora}`} className="rounded-2xl border p-1.5" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="flex justify-between gap-1 flex-wrap">
                            <Badge variant="info" size="sm">{evento.categoria}</Badge>
                            <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{formatDateTime(evento.fechaHora)}</div>
                          </div>
                          <div className="text-sm font-bold mt-1">{evento.accion}</div>
                          <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{evento.descripcion || 'Sin descripción adicional'}</div>
                          {(evento.actor || evento.rolActor) && (
                            <div className="text-xs mt-0.75">{evento.actor || 'Sistema'} {evento.rolActor ? `· ${evento.rolActor}` : ''}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert severity="info">No se encontró trazabilidad reconstruida para este expediente.</Alert>
                  )}
                </div>

                <div className="rounded-2xl border p-2.25" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-base font-bold mb-1.5">Dictamen y constancia emitida</div>
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
                  <hr className="my-2" style={{ borderColor: 'var(--color-border)' }} />
                  <div className="text-sm font-bold mb-1">Historial documental</div>
                  {(historialQuery.data || []).length > 0 ? (
                    <div className="grid gap-1">
                      {(historialQuery.data || []).slice(0, 6).map((item: any) => (
                        <div key={item.id} className="rounded-2xl border p-1.25" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="text-sm font-bold">{item.tipoDocumento || item.tipoReporte || 'Documento institucional'}</div>
                          <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{item.nombreArchivo} · {formatDateTime(item.fechaGeneracion)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert severity="info">Aún no existe historial de documentos generados para este expediente.</Alert>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

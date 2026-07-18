import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Tabs,
  Typography,
} from '@mui/material';
import { ArrowBack, CheckCircle, Description, Gavel, WorkspacePremium } from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import PageContainer from '../../../shared/components/PageContainer';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { expedientesApi } from '../../../api/expedientesApi';
import { empresaApi, sedeApi } from '../../../api/sedesApi';
import { coordinacionApi, horasApi, reportesCoordinacionApi, trazabilidadApi } from '../../../api/coordinacionApi';
import { tieneControlHoras } from '../../../shared/utils/controlHoras';
import { hasAnyRole } from '../../../shared/utils/roleRoutes';

const MySwal = withReactContent(Swal);

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </Box>
  );
}

const getPayload = (response) => response?.data?.data ?? response?.data ?? null;

const formatDate = (value) => {
  if (!value) return 'No disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es-PE');
};

const formatDateTime = (value) => {
  if (!value) return 'No disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('es-PE');
};

const getEstadoColor = (estado = '') => {
  const normalized = estado.toUpperCase();
  if (['CERRADO', 'APROBADO', 'EVALUADO'].includes(normalized)) return 'success';
  if (['OBSERVADO', 'VENCIDO'].includes(normalized)) return 'warning';
  if (['RECHAZADO'].includes(normalized)) return 'error';
  return 'primary';
};

const InfoBlock = ({ title, rows }) => (
  <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5, height: '100%' }}>
    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
      {title}
    </Typography>
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      {rows.map((row) => (
        <Box key={row.label}>
          <Typography variant="caption" color="text.secondary">
            {row.label}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {row.value || 'No disponible'}
          </Typography>
        </Box>
      ))}
    </Box>
  </Paper>
);

export const DetalleExpediente = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expediente, setExpediente] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [sede, setSede] = useState(null);
  const [controlHoras, setControlHoras] = useState(null);
  const [cumplimientoHoras, setCumplimientoHoras] = useState(null);
  const [registrosHoras, setRegistrosHoras] = useState([]);
  const [trazabilidad, setTrazabilidad] = useState(null);
  const [historialGeneracion, setHistorialGeneracion] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [accionEnCurso, setAccionEnCurso] = useState('');
  const puedeEmitirDocumentosInstitucionales = hasAnyRole(
    user?.roles,
    ['ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR']
  );
  const puedeRevisarExpediente = hasAnyRole(
    user?.roles,
    ['ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']
  );

  const cargarDetalle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    setWarnings([]);

    try {
      const expedienteRes = await expedientesApi.getById(id);
      const expedienteData = getPayload(expedienteRes);
      setExpediente(expedienteData);

      const consultarHoras = tieneControlHoras(expedienteData?.estado);
      const secundarias = await Promise.allSettled([
        expedienteData?.idEmpresa ? empresaApi.getById(expedienteData.idEmpresa) : Promise.resolve(null),
        expedienteData?.idSedePractica ? sedeApi.getDetalle(expedienteData.idSedePractica) : Promise.resolve(null),
        consultarHoras ? horasApi.getControl(id) : Promise.resolve(null),
        consultarHoras ? horasApi.getCumplimiento(id) : Promise.resolve(null),
        consultarHoras ? horasApi.getRegistros(id) : Promise.resolve(null),
        trazabilidadApi.getExpediente(id),
        reportesCoordinacionApi.getHistorialGeneracion({ idExpediente: id }),
      ]);

      const nextWarnings = [];

      const [empresaRes, sedeRes, controlRes, cumplimientoRes, registrosRes, trazabilidadRes, historialRes] = secundarias;

      if (empresaRes.status === 'fulfilled') setEmpresa(getPayload(empresaRes.value));
      else if (empresaRes.reason) nextWarnings.push('No se pudo cargar el detalle ampliado de la empresa.');

      if (sedeRes.status === 'fulfilled') setSede(getPayload(sedeRes.value));
      else if (sedeRes.reason) nextWarnings.push('No se pudo cargar el detalle ampliado de la sede.');

      if (controlRes.status === 'fulfilled') setControlHoras(getPayload(controlRes.value));
      else if (consultarHoras) nextWarnings.push('El control de horas no está disponible para tu rol o aún no fue iniciado.');

      if (cumplimientoRes.status === 'fulfilled') setCumplimientoHoras(getPayload(cumplimientoRes.value));
      else if (consultarHoras) nextWarnings.push('No se pudo verificar el cumplimiento de horas para este expediente.');

      if (registrosRes.status === 'fulfilled') setRegistrosHoras(getPayload(registrosRes.value) || []);
      else if (consultarHoras) nextWarnings.push('No se pudieron cargar los registros detallados de horas.');

      if (trazabilidadRes.status === 'fulfilled') setTrazabilidad(getPayload(trazabilidadRes.value));
      else nextWarnings.push('La trazabilidad integral no pudo reconstruirse en este momento.');

      if (historialRes.status === 'fulfilled') setHistorialGeneracion(getPayload(historialRes.value) || []);
      else nextWarnings.push('No se pudo consultar el historial de generación documental.');

      setWarnings(nextWarnings);
    } catch (err) {
      console.error('Error cargando detalle de expediente:', err);
      setError('No se pudo cargar el expediente solicitado.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  const ejecutarAccion = async (tipo) => {
    const acciones = {
      carta: {
        title: 'Emitir Carta de Presentación',
        text: 'La carta se generará y quedará registrada en el expediente.',
        confirmButtonText: 'Emitir carta',
        success: 'La Carta de Presentación fue emitida correctamente.',
        ejecutar: () => coordinacionApi.emitirCartaPresentacion(id),
      },
      aprobarPlan: {
        title: 'Aprobar Plan de Prácticas',
        text: 'El plan quedará aprobado y el expediente avanzará a la siguiente etapa.',
        confirmButtonText: 'Aprobar plan',
        success: 'El Plan de Prácticas fue aprobado correctamente.',
        ejecutar: () => expedientesApi.aprobarPlan(id),
      },
      aprobarInforme: {
        title: 'Aprobar Informe Final',
        text: 'El informe final quedará aprobado por la instancia responsable.',
        confirmButtonText: 'Aprobar informe',
        success: 'El Informe Final fue aprobado correctamente.',
        ejecutar: () => expedientesApi.aprobarInformeFinal(id),
      },
      dictamen: {
        title: 'Emitir Dictamen Final',
        text: 'Registra la decisión colegiada que acompañará al documento institucional.',
        confirmButtonText: 'Emitir dictamen',
        success: 'El Dictamen Final fue emitido correctamente.',
        input: 'textarea',
        inputLabel: 'Dictamen u observaciones finales',
        inputValidator: (value) => !value?.trim() && 'El dictamen es obligatorio.',
        ejecutar: (dictamen) => expedientesApi.emitirDictamen(id, dictamen.trim()),
      },
      constancia: {
        title: 'Emitir Constancia de Prácticas',
        text: 'El expediente se cerrará, si corresponde, antes de generar la constancia.',
        confirmButtonText: 'Emitir constancia',
        success: 'La constancia fue emitida correctamente.',
        ejecutar: () => coordinacionApi.emitirConstancia(id),
      },
    };
    const accion = acciones[tipo];
    const confirmacion = await MySwal.fire({
      title: accion.title,
      text: accion.text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: accion.confirmButtonText,
      cancelButtonText: 'Cancelar',
      input: accion.input,
      inputLabel: accion.inputLabel,
      inputValidator: accion.inputValidator,
    });
    if (!confirmacion.isConfirmed) return;

    try {
      setAccionEnCurso(tipo);
      await accion.ejecutar(confirmacion.value);
      await cargarDetalle();
      MySwal.fire('Operación completada', accion.success, 'success');
    } catch (err) {
      MySwal.fire('No se pudo completar la operación',
        err.response?.data?.message || 'Verifica que el expediente cumpla los requisitos del flujo.', 'error');
    } finally {
      setAccionEnCurso('');
    }
  };

  const ultimaConstancia = useMemo(
    () =>
      historialGeneracion.find((item) =>
        String(item.tipoDocumento || '').toUpperCase().includes('CONSTANCIA')
      ) || null,
    [historialGeneracion]
  );

  const progresoHoras = useMemo(() => {
    if (!controlHoras?.horasRequeridas) return 0;
    return Math.min(100, Math.round(((controlHoras.horasAcumuladas || 0) / controlHoras.horasRequeridas) * 100));
  }, [controlHoras]);

  const evaluacionResumen = useMemo(
    () => [
      {
        label: 'Plan de trabajo',
        value: expediente?.planTrabajoAprobado ? 'Aprobado' : 'Pendiente',
      },
      {
        label: 'Informe final',
        value: expediente?.informeFinalPresentado ? 'Presentado' : 'Pendiente',
      },
      {
        label: 'Calificación final',
        value: expediente?.calificacionFinal ?? 'No registrada',
      },
      {
        label: 'Condición de cierre',
        value: expediente?.estado,
      },
    ],
    [expediente]
  );

  if (loading) {
    return (
      <PageContainer>
        <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cargando expediente...
          </Typography>
        </Paper>
      </PageContainer>
    );
  }

  if (error || !expediente) {
    return (
      <PageContainer>
        <Alert severity="error">{error || 'No se encontró información del expediente.'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
          <Box>
            <Typography variant="h4" color="primary.main" sx={{ mb: 0.75, fontWeight: 800 }}>
              Detalle de Expediente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {expediente.codigoExpediente} · {expediente.nombreTipoPractica} · Periodo {expediente.periodoAcademico || 'No definido'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Chip label={expediente.estado} color={getEstadoColor(expediente.estado)} />
            {puedeEmitirDocumentosInstitucionales && expediente.estado === 'VALIDADO_SECRETARIA' && (
              <Button
                variant="contained"
                startIcon={<Description />}
                disabled={accionEnCurso === 'carta'}
                onClick={() => ejecutarAccion('carta')}
              >
                {accionEnCurso === 'carta' ? 'Emitiendo...' : 'Emitir carta'}
              </Button>
            )}
            {puedeRevisarExpediente && expediente.estado === 'PLAN_PRESENTADO' && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                disabled={accionEnCurso === 'aprobarPlan'}
                onClick={() => ejecutarAccion('aprobarPlan')}
              >
                {accionEnCurso === 'aprobarPlan' ? 'Aprobando...' : 'Aprobar plan'}
              </Button>
            )}
            {puedeRevisarExpediente && expediente.estado === 'INFORME_FINAL_PRESENTADO' && (
              <Button
                variant="contained"
                color="info"
                startIcon={<CheckCircle />}
                disabled={accionEnCurso === 'aprobarInforme'}
                onClick={() => ejecutarAccion('aprobarInforme')}
              >
                {accionEnCurso === 'aprobarInforme' ? 'Aprobando...' : 'Aprobar informe'}
              </Button>
            )}
            {puedeRevisarExpediente && ['INFORME_APROBADO', 'EVALUACION_COMPLETA', 'EVALUADO'].includes(expediente.estado) && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Gavel />}
                disabled={accionEnCurso === 'dictamen'}
                onClick={() => ejecutarAccion('dictamen')}
              >
                {accionEnCurso === 'dictamen' ? 'Emitiendo...' : 'Emitir dictamen'}
              </Button>
            )}
            {puedeEmitirDocumentosInstitucionales && (['EVALUADO', 'DICTAMEN_EMITIDO'].includes(expediente.estado)
              || (expediente.estado === 'CERRADO' && !ultimaConstancia) ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WorkspacePremium />}
                  disabled={accionEnCurso === 'constancia'}
                  onClick={() => ejecutarAccion('constancia')}
                >
                  {accionEnCurso === 'constancia' ? 'Emitiendo...' : 'Emitir constancia'}
                </Button>
              ) : null)}
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
              Volver
            </Button>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Vista integral del expediente con información académica, documental, horas, trazabilidad y cierre institucional.
        </Typography>
      </Box>

      {warnings.length > 0 && (
        <StackWarnings warnings={warnings} />
      )}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label="Resumen General" />
          <Tab label="Documentos y Observaciones" />
          <Tab label="Monitoreo y Horas" />
          <Tab label="Trazabilidad y Cierre" />
        </Tabs>
        <Divider />

        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: 'repeat(4, minmax(0, 1fr))' },
              gap: 2,
              mb: 2,
            }}
          >
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
                { label: 'Empresa', value: expediente.nombreEmpresa || empresa?.razonSocial },
                { label: 'RUC', value: expediente.rucEmpresa || empresa?.ruc },
                { label: 'Sede', value: expediente.nombreSede || sede?.nombreSede },
                { label: 'Dirección sede', value: sede?.direccion },
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
                    ? expediente.comite.map((item) => `${item.nombreUsuario} (${item.rolComite})`).join(', ')
                    : 'Sin miembros registrados',
                },
                {
                  label: 'Tutor externo',
                  value: 'No disponible en la API actual del expediente',
                },
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
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: '1.2fr 0.8fr' },
              gap: 2,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                Plan, evaluaciones y dictamen
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                {evaluacionResumen.map((item) => (
                  <Paper key={item.label} variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">
                      {item.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {expediente.observaciones || 'Sin observaciones generales registradas en el expediente.'}
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                Hitos del expediente
              </Typography>
              <StackList
                items={[
                  { label: 'Fecha de creación', value: formatDateTime(expediente.fechaCreacion) },
                  { label: 'Presentación del plan', value: formatDateTime(expediente.fechaPresentacionPlan) },
                  { label: 'Actualización más reciente', value: formatDateTime(expediente.fechaActualizacion) },
                  { label: 'Número de informes parciales', value: expediente.numeroInformesParciales ?? 'No definido' },
                ]}
              />
            </Paper>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
              gap: 2,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                Documentos del expediente
              </Typography>
              {(expediente.documentos || []).length > 0 ? (
                <Stack spacing={1.25}>
                  {expediente.documentos.map((doc) => (
                    <Paper key={doc.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Typography sx={{ fontWeight: 700 }} variant="body2">
                        {doc.tipoDocumento}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doc.nombreArchivo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Subido: {formatDateTime(doc.fechaSubida)}
                      </Typography>
                      {doc.observaciones && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                          {doc.observaciones}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">No hay documentos asociados al expediente.</Alert>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                Observaciones y subsanaciones
              </Typography>
              {(expediente.observacionesList || []).length > 0 ? (
                <Stack spacing={1.25}>
                  {expediente.observacionesList.map((obs) => (
                    <Paper key={obs.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 700 }} variant="body2">
                          {obs.tipo}
                        </Typography>
                        <Chip
                          size="small"
                          label={obs.subsanado ? 'Subsanado' : 'Pendiente'}
                          color={obs.subsanado ? 'success' : 'warning'}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {obs.descripcion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Registrado por {obs.nombreUsuarioOrigen} · {formatDateTime(obs.fechaCreacion)}
                      </Typography>
                      {obs.respuestaSubsanacion && (
                        <Typography variant="caption" sx={{ mt: 0.75, display: 'block' }}>
                          Respuesta: {obs.respuestaSubsanacion}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Alert severity="success">No se registran observaciones pendientes o históricas.</Alert>
              )}
            </Paper>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
              gap: 2,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                Control de horas
              </Typography>
              {controlHoras ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Avance acumulado</Typography>
                    <Typography sx={{ fontWeight: 700 }} variant="body2">
                      {controlHoras.horasAcumuladas || 0} / {controlHoras.horasRequeridas || 0} horas
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progresoHoras} sx={{ height: 10, borderRadius: 999, mb: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Estado del control: {controlHoras.estado} · Inicio {formatDate(controlHoras.fechaInicio)} · Fin estimado {formatDate(controlHoras.fechaFinEstimada)}
                  </Typography>

                  {cumplimientoHoras && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Cumplimiento</Typography>
                        <Typography sx={{ fontWeight: 700 }} variant="body1">
                          {cumplimientoHoras.cumplido ? 'Alcanzado' : 'Pendiente'}
                        </Typography>
                      </Paper>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Horas pendientes</Typography>
                        <Typography sx={{ fontWeight: 700 }} variant="body1">
                          {cumplimientoHoras.horasPendientes ?? 0}
                        </Typography>
                      </Paper>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Coherencia temporal</Typography>
                        <Typography sx={{ fontWeight: 700 }} variant="body1">
                          {cumplimientoHoras.coherenciaTemporalOk ? 'Correcta' : 'Revisar'}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {(cumplimientoHoras?.alertas || []).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {(cumplimientoHoras.alertas || []).map((alerta, index) => (
                        <Alert key={`${alerta}-${index}`} severity="warning" sx={{ mb: 1 }}>
                          {alerta}
                        </Alert>
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Alert severity="info">El control de horas no está disponible para este expediente o tu rol actual.</Alert>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                Registros de monitoreo y horas
              </Typography>
              {registrosHoras.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Horas</TableCell>
                        <TableCell>Actividad</TableCell>
                        <TableCell>Validación</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {registrosHoras.map((registro) => (
                        <TableRow key={registro.id}>
                          <TableCell>{formatDate(registro.fecha)}</TableCell>
                          <TableCell>{registro.horas}</TableCell>
                          <TableCell>{registro.descripcionActividad}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={registro.validadoPorTutor ? 'Validado' : 'Pendiente'}
                              color={registro.validadoPorTutor ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No hay registros de horas visibles para este expediente.</Alert>
              )}
            </Paper>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: '1.15fr 0.85fr' },
              gap: 2,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                Línea de tiempo y trazabilidad
              </Typography>
              {trazabilidad?.lineaTiempo?.length ? (
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {trazabilidad.lineaTiempo.slice().reverse().map((evento) => (
                    <Paper key={`${evento.origenFuente}-${evento.referenciaId}-${evento.fechaHora}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                        <Chip size="small" label={evento.categoria} color="primary" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(evento.fechaHora)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                        {evento.accion}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {evento.descripcion || 'Sin descripción adicional'}
                      </Typography>
                      {(evento.actor || evento.rolActor) && (
                        <Typography variant="caption" sx={{ mt: 0.75, display: 'block' }}>
                          {evento.actor || 'Sistema'} {evento.rolActor ? `· ${evento.rolActor}` : ''}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No se encontró trazabilidad reconstruida para este expediente.</Alert>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                Dictamen y constancia emitida
              </Typography>
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
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
                Historial documental
              </Typography>
              {historialGeneracion.length > 0 ? (
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {historialGeneracion.slice(0, 6).map((item) => (
                    <Paper key={item.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                      <Typography sx={{ fontWeight: 700 }} variant="body2">
                        {item.tipoDocumento || item.tipoReporte || 'Documento institucional'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.nombreArchivo} · {formatDateTime(item.fechaGeneracion)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">Aún no existe historial de documentos generados para este expediente.</Alert>
              )}
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
    </PageContainer>
  );
};

function StackWarnings({ warnings }) {
  return (
    <Box sx={{ mb: 3, display: 'grid', gap: 1.25 }}>
      {warnings.map((warning, index) => (
        <Alert key={`${warning}-${index}`} severity="warning">
          {warning}
        </Alert>
      ))}
    </Box>
  );
}

function StackList({ items }) {
  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      {items.map((item) => (
        <Paper key={item.label} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {item.label}
          </Typography>
          <Typography sx={{ fontWeight: 600 }} variant="body2">
            {item.value || 'No disponible'}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

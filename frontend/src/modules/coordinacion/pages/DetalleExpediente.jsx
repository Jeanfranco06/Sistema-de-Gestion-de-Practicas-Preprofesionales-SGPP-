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
  Tabs,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Autocomplete,
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import { ArrowBack, AssignmentTurnedIn, History, HourglassBottom, Delete as DeleteIcon, Add as AddIcon, Email, Assignment, Note, Description, Timeline, Verified, Download, PlayArrow } from '@mui/icons-material';
import PageContainer from '../../../shared/components/PageContainer';
import { useParams, useNavigate } from 'react-router-dom';
import { expedientesApi } from '../../../api/expedientesApi';
import { empresaApi, sedeApi } from '../../../api/sedesApi';
import { horasApi, reportesCoordinacionApi, trazabilidadApi } from '../../../api/coordinacionApi';
import { tutoresApi, usuariosApi } from '../../../api/usuariosApi';
import Swal from 'sweetalert2';

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
    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
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

  const [iniciarDialogOpen, setIniciarDialogOpen] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [duracionSemanas, setDuracionSemanas] = useState(16);

  const [historialGeneracion, setHistorialGeneracion] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const [tutorDialog, setTutorDialog] = useState(false);
  const [tutoresList, setTutoresList] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState('');

  const fetchTutores = async () => {
      try {
          const res = await tutoresApi.getAll();
          setTutoresList(getPayload(res) || []);
      } catch (e) {
          console.error(e);
      }
  };

  const [asesorDialog, setAsesorDialog] = useState(false);
  const [asesoresList, setAsesoresList] = useState([]);
  const [selectedAsesor, setSelectedAsesor] = useState('');
  const [resolucionAsesor, setResolucionAsesor] = useState('');

  const fetchAsesores = async () => {
      try {
          const res = await usuariosApi.getAll({ params: { rol: 'DOCENTE_ASESOR' } });
          setAsesoresList(getPayload(res) || []);
      } catch (e) {
          console.error(e);
      }
  };

  const handleAssignAsesor = async () => {
      if (!selectedAsesor || !resolucionAsesor) return;
      try {
          await expedientesApi.asignarAsesor(id, { idAsesor: selectedAsesor, resolucion: resolucionAsesor });
          Swal.fire('Éxito', 'Docente asesor asignado correctamente', 'success');
          setAsesorDialog(false);
          cargarDetalle();
      } catch (e) {
          Swal.fire('Error', e.response?.data?.message || 'No se pudo asignar asesor', 'error');
      }
  };

  const handleIniciarEjecucion = async () => {
    try {
        Swal.fire({ title: 'Iniciando ejecución...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const isoDate = fechaInicio.toISOString().split('T')[0];
        await expedientesApi.iniciarEjecucion(id, isoDate, duracionSemanas);
        Swal.fire('Éxito', 'Ejecución de prácticas iniciada correctamente.', 'success');
        setIniciarDialogOpen(false);
        cargarDetalle();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.response?.data?.message || 'No se pudo iniciar la ejecución.', 'error');
    }
  };

  const [comiteDialog, setComiteDialog] = useState(false);
  const [comiteList, setComiteList] = useState([]);
  const [selectedComite, setSelectedComite] = useState([{ idUsuario: '', rolComite: 'PRESIDENTE' }]);

  const fetchComite = async () => {
      try {
          const res = await usuariosApi.getAll({ params: { rol: 'DOCENTE_ASESOR' } }); 
          setComiteList(getPayload(res) || []);
      } catch (e) {
          console.error(e);
      }
  };

  const handleAssignComite = async () => {
      const validMembers = selectedComite.filter(m => m.idUsuario && m.rolComite);
      if (validMembers.length === 0) return;
      try {
          await expedientesApi.asignarComite(id, { miembros: validMembers });
          Swal.fire('Éxito', 'Comité asignado correctamente', 'success');
          setComiteDialog(false);
          cargarDetalle();
      } catch (e) {
          Swal.fire('Error', e.response?.data?.message || 'No se pudo asignar comité', 'error');
      }
  };

  const handleAssignTutor = async () => {
      if (!selectedTutor) return;
      try {
          await expedientesApi.asignarTutorExterno(id, { idTutorExterno: selectedTutor });
          Swal.fire('Éxito', 'Tutor externo asignado correctamente', 'success');
          setTutorDialog(false);
          cargarDetalle();
      } catch (e) {
          Swal.fire('Error', e.response?.data?.message || 'No se pudo asignar comité', 'error');
      }
  };

  const cargarDetalle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    setWarnings([]);

    try {
      const expedienteRes = await expedientesApi.getById(id);
      const expedienteData = getPayload(expedienteRes);
      setExpediente(expedienteData);

      const secundarias = await Promise.allSettled([
        expedienteData?.idEmpresa ? empresaApi.getById(expedienteData.idEmpresa) : Promise.resolve(null),
        expedienteData?.idSedePractica ? sedeApi.getDetalle(expedienteData.idSedePractica) : Promise.resolve(null),
        horasApi.getControl(id),
        horasApi.getCumplimiento(id),
        horasApi.getRegistros(id),
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

      if (cumplimientoRes.status === 'fulfilled') setCumplimientoHoras(getPayload(cumplimientoRes.value));

      if (registrosRes.status === 'fulfilled') setRegistrosHoras(getPayload(registrosRes.value) || []);

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

  const canModify = () => {
      if (!expediente) return false;
      const closedStates = [
          'PLAN_PRESENTADO', 'PLAN_APROBADO', 'EN_EJECUCION', 
          'EVALUADO', 'CERRADO', 'RECHAZADO', 'VENCIDO'
      ];
      return !closedStates.includes(expediente.estado?.toUpperCase());
  };

  const handleDownload = async (fileName, originalName) => {
    if (!fileName) return;
    try {
        Swal.fire({ title: 'Descargando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await api.get(`/documentos/download/${fileName}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', originalName || fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        Swal.close();
    } catch (error) {
        console.error('Download error:', error);
        Swal.fire('Error', 'No se pudo descargar el archivo.', 'error');
    }
  };

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
            <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 0.75 }}>
              Detalle de Expediente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {expediente.codigoExpediente} · {expediente.nombreTipoPractica} · Periodo {expediente.periodoAcademico || 'No definido'}
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            {expediente.estado === 'APROBADO' && (
              <Button 
                variant="contained" 
                color="success"
                startIcon={<PlayArrow />}
                onClick={() => setIniciarDialogOpen(true)}
              >
                Iniciar Ejecución
              </Button>
            )}
            <Chip 
              label={expediente.estado.replace(/_/g, ' ')} 
              color="primary"
              variant="outlined"
            />
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
                { 
                  label: 'Docente asesor', 
                  value: expediente.nombreAsesor ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{expediente.nombreAsesor}</Typography>
                        {canModify() && expediente.nombreTipoPractica?.toUpperCase().includes('INICIAL') && (
                          <Button size="small" variant="outlined" color="primary" onClick={() => { fetchAsesores(); setAsesorDialog(true); }}>Cambiar Asesor</Button>
                        )}
                    </Box>
                  ) : expediente.nombreTipoPractica?.toUpperCase().includes('INICIAL') ? (
                    canModify() ? <Button size="small" variant="outlined" color="primary" onClick={() => { fetchAsesores(); setAsesorDialog(true); }}>Asignar Asesor</Button> : 'Sin asignar'
                  ) : 'No aplica'
                },
                { label: 'Resolución', value: expediente.resolucionAsesor },
                {
                  label: 'Comité asignado',
                  value: expediente.comite?.length
                    ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{expediente.comite.map((item) => `${item.nombreUsuario} (${item.rolComite})`).join(', ')}</Typography>
                            {canModify() && !expediente.nombreTipoPractica?.toUpperCase().includes('INICIAL') && (
                              <Button size="small" variant="outlined" color="primary" onClick={() => { fetchComite(); setComiteDialog(true); }}>Cambiar Comité</Button>
                            )}
                        </Box>
                      )
                    : !expediente.nombreTipoPractica?.toUpperCase().includes('INICIAL') ? (
                        canModify() ? <Button size="small" variant="outlined" color="primary" onClick={() => { fetchComite(); setComiteDialog(true); }}>Asignar Comité</Button> : 'Sin asignar'
                    ) : 'No aplica',
                },
                {
                  label: 'Tutor externo',
                  value: expediente.tutorEmpresa?.id 
                      ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                  {`${expediente.tutorEmpresa.nombres || ''} ${expediente.tutorEmpresa.apellidoPaterno || ''}`.trim() || 'Tutor Externo asignado'}
                              </Typography>
                              {canModify() && (
                                <Button size="small" variant="outlined" color="primary" onClick={() => { fetchTutores(); setTutorDialog(true); }}>
                                    Cambiar Tutor
                                </Button>
                              )}
                          </Box>
                      )
                      : (
                          canModify() ? (
                            <Button size="small" variant="outlined" color="primary" onClick={() => { fetchTutores(); setTutorDialog(true); }}>
                                Asignar Tutor Externo
                            </Button>
                          ) : 'Sin asignar'
                      ),
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Plan, evaluaciones y dictamen
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                {evaluacionResumen.map((item) => (
                  <Paper key={item.label} variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Documentos del expediente
              </Typography>
              {(expediente.documentos || []).length > 0 ? (
                <Stack spacing={1.25}>
                  {expediente.documentos.map((doc) => (
                    <Paper key={doc.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {doc.tipoDocumento}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doc.nombreArchivo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Subido: {formatDateTime(doc.fechaSubida)}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleDownload(doc.rutaArchivo || doc.nombreArchivo, doc.nombreArchivo)}
                        >
                            Descargar
                        </Button>
                      </Box>
                      {doc.observaciones && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Observaciones y subsanaciones
              </Typography>
              {(expediente.observacionesList || []).length > 0 ? (
                <Stack spacing={1.25}>
                  {expediente.observacionesList.map((obs) => (
                    <Paper key={obs.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" fontWeight={700}>
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
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Registrado por {obs.nombreUsuarioOrigen} · {formatDateTime(obs.fechaCreacion)}
                      </Typography>
                      {obs.respuestaSubsanacion && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.75 }}>
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Control de horas
              </Typography>
              {controlHoras ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Avance acumulado</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {controlHoras.horasAcumuladas || 0} / {controlHoras.horasRequeridas || 0} horas
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progresoHoras} sx={{ height: 10, borderRadius: 999, mb: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Estado del control: {controlHoras.estado} · Inicio {formatDate(controlHoras.fechaInicio)} · Fin estimado {formatDate(controlHoras.fechaFinEstimada)}
                  </Typography>

                  {cumplimientoHoras && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Cumplimiento</Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {cumplimientoHoras.cumplido ? 'Alcanzado' : 'Pendiente'}
                        </Typography>
                      </Paper>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Horas pendientes</Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {cumplimientoHoras.horasPendientes ?? 0}
                        </Typography>
                      </Paper>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Coherencia temporal</Typography>
                        <Typography variant="body1" fontWeight={700}>
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
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
                      <Typography variant="body2" fontWeight={700} sx={{ mt: 1 }}>
                        {evento.accion}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {evento.descripcion || 'Sin descripción adicional'}
                      </Typography>
                      {(evento.actor || evento.rolActor) && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.75 }}>
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
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
              <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                Historial documental
              </Typography>
              {historialGeneracion.length > 0 ? (
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {historialGeneracion.slice(0, 6).map((item) => (
                    <Paper key={item.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                      <Typography variant="body2" fontWeight={700}>
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

      <Dialog open={tutorDialog} onClose={() => setTutorDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Asignar Tutor Externo</DialogTitle>
          <DialogContent dividers>
              <Stack spacing={2} sx={{ mt: 1 }}>
                  <Autocomplete
                      options={tutoresList}
                      getOptionLabel={(tutor) => `${tutor.nombres || ''} ${tutor.apellidoPaterno || ''} - ${tutor.cargo || 'Sin cargo'}`.trim()}
                      onChange={(_, newValue) => setSelectedTutor(newValue ? newValue.idUsuario : '')}
                      renderInput={(params) => <TextField {...params} label="Buscar Tutor Externo" variant="outlined" fullWidth />}
                      noOptionsText="No hay tutores externos registrados"
                  />
              </Stack>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setTutorDialog(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleAssignTutor} disabled={!selectedTutor}>Asignar Tutor</Button>
          </DialogActions>
      </Dialog>

      <Dialog open={asesorDialog} onClose={() => setAsesorDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Asignar Docente Asesor</DialogTitle>
          <DialogContent dividers>
              <Stack spacing={2} sx={{ mt: 1 }}>
                  <Autocomplete
                      options={asesoresList}
                      getOptionLabel={(u) => `${u.nombres || ''} ${u.apellidoPaterno || ''} ${u.apellidoMaterno || ''}`.trim()}
                      onChange={(_, newValue) => setSelectedAsesor(newValue ? newValue.id : '')}
                      renderInput={(params) => <TextField {...params} label="Buscar Docente Asesor" variant="outlined" fullWidth />}
                      noOptionsText="No hay docentes registrados con ese rol"
                  />
                  <TextField 
                      label="Número de Resolución" 
                      variant="outlined" 
                      fullWidth 
                      value={resolucionAsesor}
                      onChange={(e) => setResolucionAsesor(e.target.value)}
                  />
              </Stack>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setAsesorDialog(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleAssignAsesor} disabled={!selectedAsesor || !resolucionAsesor}>Asignar Asesor</Button>
          </DialogActions>
      </Dialog>

      <Dialog open={comiteDialog} onClose={() => setComiteDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Asignar Miembros del Comité</DialogTitle>
          <DialogContent dividers>
              <Stack spacing={2} sx={{ mt: 1 }}>
                  {selectedComite.map((miembro, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Autocomplete
                              sx={{ flex: 1 }}
                              options={comiteList}
                              getOptionLabel={(u) => `${u.nombres || ''} ${u.apellidoPaterno || ''}`.trim()}
                              value={comiteList.find(c => c.id === miembro.idUsuario) || null}
                              onChange={(_, newValue) => {
                                  const newComite = [...selectedComite];
                                  newComite[index].idUsuario = newValue ? newValue.id : '';
                                  setSelectedComite(newComite);
                              }}
                              renderInput={(params) => <TextField {...params} label={`Miembro ${index + 1}`} variant="outlined" />}
                              noOptionsText="No hay docentes"
                          />
                          <TextField
                              select
                              label="Rol en el Comité"
                              value={miembro.rolComite}
                              onChange={(e) => {
                                  const newComite = [...selectedComite];
                                  newComite[index].rolComite = e.target.value;
                                  setSelectedComite(newComite);
                              }}
                              sx={{ width: 200 }}
                          >
                              <MenuItem value="PRESIDENTE">Presidente</MenuItem>
                              <MenuItem value="SECRETARIO">Secretario</MenuItem>
                              <MenuItem value="VOCAL">Vocal</MenuItem>
                          </TextField>
                          <IconButton color="error" onClick={() => {
                              setSelectedComite(selectedComite.filter((_, i) => i !== index));
                          }}>
                              <DeleteIcon />
                          </IconButton>
                      </Box>
                  ))}
                  {selectedComite.length < 3 && (
                      <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setSelectedComite([...selectedComite, { idUsuario: '', rolComite: 'VOCAL' }])}>
                          Agregar Miembro
                      </Button>
                  )}
              </Stack>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setComiteDialog(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleAssignComite} disabled={selectedComite.length === 0 || selectedComite.some(m => !m.idUsuario)}>Asignar Comité</Button>
          </DialogActions>
      </Dialog>

      <Dialog open={iniciarDialogOpen} onClose={() => setIniciarDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Iniciar Ejecución de Prácticas</DialogTitle>
        <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    label="Fecha de Inicio"
                    type="date"
                    fullWidth
                    value={fechaInicio.toISOString().split('T')[0]}
                    onChange={(e) => setFechaInicio(new Date(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Duración (Semanas)"
                    type="number"
                    fullWidth
                    value={duracionSemanas}
                    onChange={(e) => setDuracionSemanas(e.target.value)}
                    inputProps={{ min: 1 }}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setIniciarDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleIniciarEjecucion} variant="contained" color="success">
                Iniciar Práctica
            </Button>
        </DialogActions>
      </Dialog>
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
          <Typography variant="body2" fontWeight={600}>
            {item.value || 'No disponible'}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

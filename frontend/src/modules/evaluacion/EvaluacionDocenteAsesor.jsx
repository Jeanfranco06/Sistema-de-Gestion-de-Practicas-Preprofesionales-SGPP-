import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Chip, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow,
    IconButton, Tabs, Tab
} from '@mui/material';
import { Download, Description, Person, Business, Assessment, ArrowBack } from '@mui/icons-material';
import { evaluacionesApi } from '../../api/evaluacionesApi';
import { expedientesApi } from '../../api/expedientesApi';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ModulePageShell, ModulePageHeader,
} from '../../shared/components/module/ModulePageShell';
import ContentCard from '../../shared/components/ContentCard';

const MySwal = withReactContent(Swal);

export const EvaluacionDocenteAsesor = () => {
    const { user } = useAuth();
    const { id: idExpedienteParams } = useParams();
    const navigate = useNavigate();
    const idExpediente = Number(idExpedienteParams);
    const expedienteIdValido = Number.isSafeInteger(idExpediente) && idExpediente > 0;
    
    const [criterios, setCriterios] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [componenteActual, setComponenteActual] = useState('DOCENTE');
    
    const [evaluacion, setEvaluacion] = useState({
        idExpediente: idExpediente,
        tipoEvaluador: 'DOCENTE',
        evaluadorId: null,
        componente: 'DOCENTE',
        detalles: [],
        comentarios: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [expediente, setExpediente] = useState(null);

    const loadCriterios = async (componente) => {
        try {
            const res = await evaluacionesApi.obtenerCriteriosPorTipo(componente);
            const crit = res.data || [];
            setCriterios(crit);
            setEvaluacion(prev => ({
                ...prev,
                componente: componente,
                detalles: crit.map(c => ({
                    idCriterio: c.id,
                    puntajeObtenido: 0,
                    comentarios: ''
                }))
            }));
        } catch (error) {
            console.error('Error fetching criterios:', error);
        }
    };

    const fetchData = async () => {
        try {
            const expRes = await expedientesApi.getById(idExpediente).catch(() => ({ data: null }));
            const evRes = await evaluacionesApi.obtenerEvaluacionesPorPractica(idExpediente).catch(() => ({ data: [] }));
            
            setExpediente(expRes.data?.data || expRes.data);
            setEvaluaciones(evRes.data || []);
            await loadCriterios('DOCENTE');
        } catch {
            MySwal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: 'Error al cargar los datos del expediente.'
            });
        }
    };

    useEffect(() => {
        if (expedienteIdValido) {
            fetchData();
        }
    }, [idExpediente, expedienteIdValido]);

    const handleTabChange = (event, newValue) => {
        setComponenteActual(newValue);
        loadCriterios(newValue);
    };

    const handlePuntajeChange = (index, value) => {
        const newDetalles = [...evaluacion.detalles];
        const numValue = parseInt(value) || 0;
        newDetalles[index] = {
            ...newDetalles[index],
            puntajeObtenido: Math.min(Math.max(numValue, 0), 20) // Nota vigesimal (0-20)
        };
        setEvaluacion(prev => ({ ...prev, detalles: newDetalles }));
    };

    const handleComentarioChange = (index, value) => {
        const newDetalles = [...evaluacion.detalles];
        newDetalles[index] = { ...newDetalles[index], comentarios: value };
        setEvaluacion(prev => ({ ...prev, detalles: newDetalles }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const confirmResult = await MySwal.fire({
            title: '¿Confirmar Evaluación?',
            text: `Vas a registrar la evaluación de la sección ${componenteActual}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            customClass: { confirmButton: 'wow-btn' }
        });

        if (!confirmResult.isConfirmed) return;

        if (!user?.id) {
            MySwal.fire('Sesión no disponible', 'Vuelve a iniciar sesión antes de registrar la evaluación.', 'error');
            return;
        }

        setLoading(true);
        try {
            MySwal.fire({ title: 'Guardando...', didOpen: () => MySwal.showLoading() });
            await evaluacionesApi.crearEvaluacion({
                ...evaluacion,
                idExpediente,
                evaluadorId: user.id,
            });
            
            const evRes = await evaluacionesApi.obtenerEvaluacionesPorPractica(idExpediente);
            setEvaluaciones(evRes.data || []);
            
            MySwal.fire({
                icon: 'success',
                title: 'Evaluación Registrada',
                timer: 2000,
                showConfirmButton: false
            });
        } catch {
            MySwal.fire('Error', 'No se pudo guardar la evaluación.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadDocument = async (rutaArchivo, nombreArchivo) => {
        try {
            MySwal.fire({ title: 'Descargando...', didOpen: () => MySwal.showLoading() });
            const res = await api.get(`/documentos/download/${rutaArchivo}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nombreArchivo || rutaArchivo);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            MySwal.close();
        } catch {
            MySwal.fire('Error', 'No se pudo descargar el archivo.', 'error');
        }
    };

    const ultimaEvaluacion = evaluaciones.length > 0 ? evaluaciones[evaluaciones.length - 1] : null;
    const promedioFinal = ultimaEvaluacion?.promedioFinal || 0;
    const progresoColor = promedioFinal >= 14 ? 'var(--wow-success)' : promedioFinal >= 11 ? 'var(--wow-warning)' : 'var(--wow-danger)';

    if (!expedienteIdValido) {
        return (
            <ModulePageShell>
                <ContentCard>
                    <Typography color="error">No se indicó un expediente válido para evaluar.</Typography>
                    <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/docente/practicantes')}>
                        Volver a practicantes
                    </Button>
                </ContentCard>
            </ModulePageShell>
        );
    }

    return (
        <ModulePageShell>
            <ModulePageHeader
                icon={<Assessment />}
                title="Evaluación docente asesor"
                subtitle="Sistema de calificación por competencias UNT"
                action={
                    <IconButton onClick={() => navigate('/docente/practicantes')} size="small">
                        <ArrowBack fontSize="small" />
                    </IconButton>
                }
            />

            {expediente && (
                <ContentCard>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="caption" color="text.secondary">Expediente del estudiante</Typography>
                            <Typography variant="h6" sx={{ mt: 0.5, mb: 1 }}>
                                {expediente.nombreEstudiante} {expediente.apellidoEstudiante}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip icon={<Person />} label={expediente.codigoEstudiantil} size="small" variant="outlined" />
                                <Chip icon={<Business />} label={expediente.nombreEmpresa} size="small" variant="outlined" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" color="text.secondary">Promedio general</Typography>
                            <Typography variant="h4" fontWeight={600} sx={{ color: progresoColor }}>
                                {promedioFinal}
                            </Typography>
                            <Box className="wow-progress-bg" sx={{ mt: 1 }}>
                                <div className="wow-progress-fill" style={{ width: `${(promedioFinal / 20) * 100}%`, background: progresoColor }} />
                            </Box>
                        </Grid>
                    </Grid>

                    {expediente.documentos?.length > 0 && (
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                Documentos de referencia
                            </Typography>
                            <Grid container spacing={1}>
                                {expediente.documentos.map((doc) => (
                                    <Grid item xs={12} sm={6} md={4} key={doc.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                                            <Description fontSize="small" color="action" />
                                            <Typography variant="body2" noWrap sx={{ flex: 1 }}>{doc.tipoDocumento}</Typography>
                                            <IconButton size="small" onClick={() => handleDownloadDocument(doc.rutaArchivo, doc.nombreArchivo)}>
                                                <Download fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </ContentCard>
            )}

            <Tabs value={componenteActual} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="1. Seguimiento docente (30%)" value="DOCENTE" />
                <Tab label="2. Informe final (30%)" value="INFORME" />
                <Tab label="3. Sustentación (10%)" value="SUSTENTACION" />
            </Tabs>

            <ContentCard>
                <Grid container spacing={2}>
                    {criterios.map((criterio, index) => (
                        <Grid item xs={12} md={6} key={criterio.id}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.light', borderRadius: 1.5, height: '100%', bgcolor: 'info.light' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>{criterio.nombre}</Typography>
                                    <Chip label={`Peso: ${criterio.puntajeMaximo}%`} size="small" variant="outlined" />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                    {criterio.descripcion}
                                </Typography>
                                <TextField
                                    label="Nota (0-20)"
                                    type="number"
                                    fullWidth
                                    size="small"
                                    InputProps={{ inputProps: { min: 0, max: 20 } }}
                                    value={evaluacion.detalles[index]?.puntajeObtenido || ''}
                                    onChange={(e) => handlePuntajeChange(index, e.target.value)}
                                    sx={{ mb: 1.5 }}
                                />
                                <TextField
                                    label="Observaciones"
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={2}
                                    value={evaluacion.detalles[index]?.comentarios || ''}
                                    onChange={(e) => handleComentarioChange(index, e.target.value)}
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registrando...' : `Registrar ${componenteActual}`}
                    </Button>
                </Box>
            </ContentCard>

            {evaluaciones.length > 0 && (
                <ContentCard sx={{ mb: 0 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Historial de registros</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Componente</TableCell>
                                    <TableCell>Evaluador</TableCell>
                                    <TableCell>Detalles</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {evaluaciones.map((ev) => (
                                    <TableRow key={ev.id} hover>
                                        <TableCell>{ev.fechaEvaluacion}</TableCell>
                                        <TableCell><Chip label={ev.componente} size="small" variant="outlined" /></TableCell>
                                        <TableCell>{ev.tipoEvaluador}</TableCell>
                                        <TableCell>
                                            {ev.detalles?.map((d) => (
                                                <Typography key={d.idCriterio} variant="caption" display="block">
                                                    {d.nombreCriterio}: {d.puntajeObtenido}/20
                                                </Typography>
                                            ))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </ContentCard>
            )}
        </ModulePageShell>
    );
};

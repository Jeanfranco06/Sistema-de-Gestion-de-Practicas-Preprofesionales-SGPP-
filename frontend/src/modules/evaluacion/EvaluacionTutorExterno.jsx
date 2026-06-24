import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Chip, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Card, CardContent, List, ListItem, 
    ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton, Alert
} from '@mui/material';
import { Download, Description, Person, Business, AutoGraph, CloudUpload, ArrowBack } from '@mui/icons-material';
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

export const EvaluacionTutorExterno = () => {
    const { user } = useAuth();
    const { id: idExpedienteParams } = useParams();
    const navigate = useNavigate();
    const idExpediente = idExpedienteParams ? parseInt(idExpedienteParams) : 1;

    const [criterios, setCriterios] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [evaluacion, setEvaluacion] = useState({
        idExpediente: idExpediente,
        tipoEvaluador: 'EMPRESA',
        evaluadorId: user?.id || 1,
        componente: 'EMPRESA',
        detalles: [],
        comentarios: '',
        horasRegistradas: 0,
        rutaConstancia: ''
    });
    const [loading, setLoading] = useState(false);
    const [expediente, setExpediente] = useState(null);

    const fetchData = async () => {
        try {
            const expRes = await expedientesApi.getById(idExpediente).catch(() => ({ data: null }));
            const evRes = await evaluacionesApi.obtenerEvaluacionesPorPractica(idExpediente).catch(() => ({ data: [] }));
            const critRes = await evaluacionesApi.obtenerCriteriosPorTipo('EMPRESA').catch(() => ({ data: [] }));
            
            const crit = critRes.data || [];
            
            setExpediente(expRes.data?.data || expRes.data);
            setEvaluaciones(evRes.data || []);
            setCriterios(crit);
            
            setEvaluacion(prev => ({
                ...prev,
                detalles: crit.map(c => ({
                    idCriterio: c.id,
                    puntajeObtenido: 0,
                    comentarios: ''
                }))
            }));
        } catch (error) {
            console.error('❌ Error fetching data:', error);
            MySwal.fire('Error', 'No se pudieron cargar los datos de evaluación.', 'error');
        }
    };

    useEffect(() => {
        fetchData();
    }, [idExpediente]);

    const handlePuntajeChange = (index, value) => {
        const newDetalles = [...evaluacion.detalles];
        const numValue = parseInt(value) || 0;
        newDetalles[index] = {
            ...newDetalles[index],
            puntajeObtenido: Math.min(Math.max(numValue, 0), 20) // Nota 0 a 20
        };
        setEvaluacion(prev => ({ ...prev, detalles: newDetalles }));
    };

    const handleComentarioChange = (index, value) => {
        const newDetalles = [...evaluacion.detalles];
        newDetalles[index] = { ...newDetalles[index], comentarios: value };
        setEvaluacion(prev => ({ ...prev, detalles: newDetalles }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEvaluacion(prev => ({ ...prev, rutaConstancia: file.name }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirmResult = await MySwal.fire({
            title: '¿Confirmar Evaluación?',
            text: `¿Estás seguro de registrar la evaluación de la empresa?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            customClass: { confirmButton: 'wow-btn' }
        });

        if (!confirmResult.isConfirmed) return;

        setLoading(true);
        try {
            MySwal.fire({ title: 'Guardando...', didOpen: () => MySwal.showLoading() });
            await evaluacionesApi.crearEvaluacion(evaluacion);
            
            const evRes = await evaluacionesApi.obtenerEvaluacionesPorPractica(idExpediente);
            setEvaluaciones(evRes.data || []);
            
            MySwal.fire({
                icon: 'success',
                title: 'Evaluación Registrada',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            MySwal.fire('Error', 'No se pudo guardar la evaluación.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadDocument = async (docName) => {
        try {
            MySwal.fire({ title: 'Descargando...', didOpen: () => MySwal.showLoading() });
            const res = await api.get(`/documentos/download/${docName}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', docName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            MySwal.close();
        } catch (error) {
            MySwal.fire('Error', 'No se pudo descargar el archivo.', 'error');
        }
    };

    const ultimaEvaluacion = evaluaciones.length > 0 ? evaluaciones[evaluaciones.length - 1] : null;
    const promedioFinal = ultimaEvaluacion?.promedioFinal || 0;
    const progresoColor = promedioFinal >= 14 ? 'var(--wow-success)' : promedioFinal >= 11 ? 'var(--wow-warning)' : 'var(--wow-danger)';

    return (
        <ModulePageShell>
            <ModulePageHeader
                icon={<Business />}
                title="Desempeño en la empresa (30%)"
                subtitle="Evaluación por competencias — tutor externo"
                action={
                    <IconButton onClick={() => navigate('/tutor/practicantes')} size="small">
                        <ArrowBack fontSize="small" />
                    </IconButton>
                }
            />

            {expediente && (
                <ContentCard>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="caption" color="text.secondary">Practicante a cargo</Typography>
                            <Typography variant="h6" sx={{ mt: 0.5, mb: 1 }}>
                                {expediente.nombreEstudiante} {expediente.apellidoEstudiante}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip icon={<Person />} label={expediente.codigoEstudiantil} size="small" variant="outlined" />
                                <Chip icon={<Business />} label={expediente.nombreEmpresa} size="small" variant="outlined" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" color="text.secondary">Promedio actual</Typography>
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
                                Documentos asignados
                            </Typography>
                            <Grid container spacing={1}>
                                {expediente.documentos.map((doc) => (
                                    <Grid item xs={12} sm={6} md={4} key={doc.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                                            <Description fontSize="small" color="action" />
                                            <Typography variant="body2" noWrap sx={{ flex: 1 }}>{doc.tipoDocumento}</Typography>
                                            <IconButton size="small" onClick={() => handleDownloadDocument(doc.nombreArchivo)}>
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

            <ContentCard>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Rúbrica de evaluación</Typography>

                {criterios.length === 0 ? (
                    <Alert severity="warning">No hay competencias empresariales disponibles.</Alert>
                ) : (
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
                )}

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Constancia y comentarios</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Horas registradas"
                                type="number"
                                fullWidth
                                size="small"
                                value={evaluacion.horasRegistradas || ''}
                                onChange={(e) => setEvaluacion((prev) => ({ ...prev, horasRegistradas: parseInt(e.target.value) || 0 }))}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button variant="outlined" component="label" startIcon={<CloudUpload />} fullWidth sx={{ height: '100%' }}>
                                {evaluacion.rutaConstancia || 'Subir constancia de horas'}
                                <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Resumen de desempeño"
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                value={evaluacion.comentarios}
                                onChange={(e) => setEvaluacion((prev) => ({ ...prev, comentarios: e.target.value }))}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrar calificación'}
                    </Button>
                </Box>
            </ContentCard>

            {evaluaciones.length > 0 && (
                <ContentCard sx={{ mb: 0 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Historial de evaluaciones</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Horas</TableCell>
                                    <TableCell>Evaluador</TableCell>
                                    <TableCell>Detalles</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {evaluaciones.map((ev) => ev.componente === 'EMPRESA' && (
                                    <TableRow key={ev.id} hover>
                                        <TableCell>{ev.fechaEvaluacion}</TableCell>
                                        <TableCell>{ev.horasRegistradas} hrs</TableCell>
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

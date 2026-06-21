import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Chip, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Card, CardContent, List, ListItem, 
    ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton, Alert
} from '@mui/material';
import { Download, Description, Person, Business, AutoGraph, CloudUpload } from '@mui/icons-material';
import { evaluacionesApi } from '../../api/evaluacionesApi';
import { expedientesApi } from '../../api/expedientesApi';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

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
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }} className="wow-animate-in">
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/tutor/practicantes')} sx={{ bgcolor: 'var(--wow-surface-card)', boxShadow: 'var(--wow-shadow-sm)' }}>
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Typography variant="h4" className="wow-text-gradient" gutterBottom>
                        Desempeño en la Empresa (30%)
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Evaluación por competencias - Tutor Externo
                    </Typography>
                </Box>
            </Box>

            {expediente && (
                <div className="wow-card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(to right, rgba(99,102,241,0.05), transparent)' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <Typography variant="overline" color="primary" fontWeight="bold">Practicante a cargo</Typography>
                                <Typography variant="h5" fontWeight="700" sx={{ mt: 1, mb: 1 }}>
                                    {expediente.nombreEstudiante} {expediente.apellidoEstudiante}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Chip icon={<Person />} label={expediente.codigoEstudiantil} size="small" />
                                    <Chip icon={<Business />} label={expediente.nombreEmpresa} size="small" variant="outlined" />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, boxShadow: 'var(--wow-shadow-sm)', textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>Promedio Actual</Typography>
                                    <Typography variant="h3" fontWeight="800" sx={{ color: progresoColor }}>
                                        {promedioFinal}
                                    </Typography>
                                    <Box className="wow-progress-bg" sx={{ mt: 1 }}>
                                        <div className="wow-progress-fill" style={{ width: `${(promedioFinal/20)*100}%`, background: progresoColor }}></div>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>DOCUMENTOS ASIGNADOS</Typography>
                        <Grid container spacing={2}>
                            {expediente.documentos?.map(doc => (
                                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                                    <div className="wow-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Description color="primary" />
                                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                            <Typography variant="body2" noWrap fontWeight="500">{doc.tipoDocumento}</Typography>
                                        </Box>
                                        <IconButton size="small" onClick={() => handleDownloadDocument(doc.nombreArchivo)}>
                                            <Download fontSize="small" />
                                        </IconButton>
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </div>
            )}

            <div className="wow-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Rúbrica de Evaluación</Typography>
                
                {criterios.length === 0 ? (
                    <Alert severity="warning">No hay competencias empresariales disponibles en este momento.</Alert>
                ) : (
                    <Grid container spacing={3}>
                        {criterios.map((criterio, index) => (
                            <Grid item xs={12} md={6} key={criterio.id}>
                                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3, height: '100%', border: '1px solid #e2e8f0', transition: 'all 0.3s', '&:hover': { borderColor: 'var(--wow-primary)', boxShadow: 'var(--wow-shadow-md)' } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                                            {criterio.nombre}
                                        </Typography>
                                        <Chip label={`Peso: ${criterio.puntajeMaximo}%`} size="small" color="primary" variant="outlined" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        {criterio.descripcion}
                                    </Typography>
                                    
                                    <TextField
                                        label="Nota (0-20)"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        className="wow-input"
                                        InputProps={{ inputProps: { min: 0, max: 20 } }}
                                        value={evaluacion.detalles[index]?.puntajeObtenido || ''}
                                        onChange={(e) => handlePuntajeChange(index, e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        label="Observaciones (Opcional)"
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={2}
                                        className="wow-input"
                                        value={evaluacion.detalles[index]?.comentarios || ''}
                                        onChange={(e) => handleComentarioChange(index, e.target.value)}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2 }}>Constancia y Comentarios</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Horas Registradas en el periodo"
                                type="number"
                                fullWidth
                                className="wow-input"
                                value={evaluacion.horasRegistradas || ''}
                                onChange={(e) => setEvaluacion(prev => ({ ...prev, horasRegistradas: parseInt(e.target.value) || 0 }))}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{ height: '100%', borderRadius: 2, borderStyle: 'dashed', borderWidth: '2px', color: 'text.secondary' }}
                            >
                                {evaluacion.rutaConstancia ? evaluacion.rutaConstancia : 'Subir Constancia de Horas'}
                                <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Resumen de Desempeño"
                                fullWidth
                                multiline
                                rows={3}
                                className="wow-input"
                                value={evaluacion.comentarios}
                                onChange={(e) => setEvaluacion(prev => ({ ...prev, comentarios: e.target.value }))}
                            />
                        </Grid>
                    </Grid>
                </Box>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="wow-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registrando...' : `Registrar Calificación`}
                    </button>
                </Box>
            </div>

            {evaluaciones.length > 0 && (
                <div className="wow-card" style={{ padding: '24px' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
                        <AutoGraph sx={{ mr: 1, verticalAlign: 'middle', color: 'var(--wow-primary)' }}/>
                        Historial de Evaluaciones de Empresa
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: '600' }}>Fecha</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Horas Validadas</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Evaluador</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Detalles / Notas</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {evaluaciones.map((ev) => ev.componente === 'EMPRESA' && (
                                    <TableRow key={ev.id} hover>
                                        <TableCell>{ev.fechaEvaluacion}</TableCell>
                                        <TableCell>
                                            <Chip label={`${ev.horasRegistradas} hrs`} size="small" color="primary" variant="outlined"/>
                                        </TableCell>
                                        <TableCell>{ev.tipoEvaluador}</TableCell>
                                        <TableCell>
                                            {ev.detalles?.map(d => (
                                                <Typography key={d.idCriterio} variant="caption" display="block">
                                                    • {d.nombreCriterio}: <strong>{d.puntajeObtenido}/20</strong>
                                                </Typography>
                                            ))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </Box>
    );
};

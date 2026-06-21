import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Chip, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, 
    Card, CardContent, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, 
    IconButton, Tabs, Tab
} from '@mui/material';
import { Download, Description, Person, Business, Assessment, AutoGraph } from '@mui/icons-material';
import { evaluacionesApi } from '../../api/evaluacionesApi';
import { expedientesApi } from '../../api/expedientesApi';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const MySwal = withReactContent(Swal);

export const EvaluacionDocenteAsesor = () => {
    const { user } = useAuth();
    const { id: idExpedienteParams } = useParams();
    const navigate = useNavigate();
    const idExpediente = idExpedienteParams ? parseInt(idExpedienteParams) : 1;
    
    const [criterios, setCriterios] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [componenteActual, setComponenteActual] = useState('DOCENTE');
    
    const [evaluacion, setEvaluacion] = useState({
        idExpediente: idExpediente,
        tipoEvaluador: 'DOCENTE',
        evaluadorId: user?.id || 1,
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
        } catch (error) {
            MySwal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: 'Error al cargar los datos del expediente.'
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [idExpediente]);

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
                <IconButton onClick={() => navigate('/docente/practicantes')} sx={{ bgcolor: 'var(--wow-surface-card)', boxShadow: 'var(--wow-shadow-sm)' }}>
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Typography variant="h4" className="wow-text-gradient" gutterBottom>
                        Evaluación Docente Asesor
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Sistema de Calificación por Competencias UNT
                    </Typography>
                </Box>
            </Box>

            {expediente && (
                <div className="wow-card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(to right, rgba(99,102,241,0.05), transparent)' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <Typography variant="overline" color="primary" fontWeight="bold">Expediente del Estudiante</Typography>
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
                                    <Typography variant="body2" color="text.secondary" gutterBottom>Promedio General</Typography>
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
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>DOCUMENTOS DE REFERENCIA</Typography>
                        <Grid container spacing={2}>
                            {expediente.documentos?.map(doc => (
                                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                                    <div className="wow-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Description color="primary" />
                                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                            <Typography variant="body2" noWrap fontWeight="500">{doc.tipoDocumento}</Typography>
                                        </Box>
                                        <IconButton size="small" onClick={() => handleDownloadDocument(doc.rutaArchivo, doc.nombreArchivo)}>
                                            <Download fontSize="small" />
                                        </IconButton>
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </div>
            )}

            <Tabs 
                value={componenteActual} 
                onChange={handleTabChange} 
                sx={{ mb: 3, '& .MuiTab-root': { fontWeight: '600', fontFamily: 'var(--wow-font-display)' } }}
            >
                <Tab label="1. Seguimiento Docente (30%)" value="DOCENTE" />
                <Tab label="2. Informe Final (30%)" value="INFORME" />
                <Tab label="3. Sustentación (10%)" value="SUSTENTACION" />
            </Tabs>

            <div className="wow-card" style={{ padding: '24px', marginBottom: '24px' }}>
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
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="wow-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registrando...' : `Registrar Calificación de ${componenteActual}`}
                    </button>
                </Box>
            </div>

            {evaluaciones.length > 0 && (
                <div className="wow-card" style={{ padding: '24px' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
                        <AutoGraph sx={{ mr: 1, verticalAlign: 'middle', color: 'var(--wow-primary)' }}/>
                        Historial de Registros
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: '600' }}>Fecha</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Componente</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Evaluador</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Detalles / Notas</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {evaluaciones.map((ev) => (
                                    <TableRow key={ev.id} hover>
                                        <TableCell>{ev.fechaEvaluacion}</TableCell>
                                        <TableCell>
                                            <Chip label={ev.componente} size="small" color="secondary" />
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

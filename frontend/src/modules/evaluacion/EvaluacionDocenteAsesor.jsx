import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { evaluacionesApi } from '../../api/evaluacionesApi';
import { useAuth } from '../../auth/AuthContext';

export const EvaluacionDocenteAsesor = () => {
    const { user } = useAuth();
    const [criterios, setCriterios] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [evaluacion, setEvaluacion] = useState({
        idPractica: 1, // TODO: Obtener la práctica real del usuario
        tipoEvaluador: 'DOCENTE',
        evaluadorId: user?.id || 1,
        unidad: 'U1',
        detalles: [],
        comentarios: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError('');
                const [criteriosRes, evaluacionesRes] = await Promise.all([
                    evaluacionesApi.obtenerCriteriosPorTipo('DOCENTE'),
                    evaluacionesApi.obtenerEvaluacionesPorPractica(1)
                ]);
                setCriterios(criteriosRes.data);
                setEvaluaciones(evaluacionesRes.data);
                setEvaluacion(prev => ({
                    ...prev,
                    evaluadorId: user?.id || 1,
                    detalles: criteriosRes.data.map(c => ({
                        idCriterio: c.id,
                        puntajeObtenido: 0,
                        comentarios: ''
                    }))
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar los datos: ' + (error.response?.data?.message || error.message));
            }
        };

        fetchData();
    }, [user]);

    const handlePuntajeChange = (index, value) => {
        const newDetalles = [...evaluacion.detalles];
        const numValue = parseInt(value) || 0;
        const criterio = criterios[index];
        const maxValue = criterio?.puntajeMaximo || 100;
        newDetalles[index] = {
            ...newDetalles[index],
            puntajeObtenido: Math.min(Math.max(numValue, 0), maxValue)
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
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            await evaluacionesApi.crearEvaluacion(evaluacion);
            setSuccess(true);
            // Refresh evaluations list
            const response = await evaluacionesApi.obtenerEvaluacionesPorPractica(1);
            setEvaluaciones(response.data);
            // Reset form
            setEvaluacion(prev => ({
                ...prev,
                detalles: criterios.map(c => ({
                    idCriterio: c.id,
                    puntajeObtenido: 0,
                    comentarios: ''
                })),
                comentarios: ''
            }));
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            setError('Error al guardar la evaluación: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const totalPuntaje = evaluacion.detalles.reduce((sum, d) => sum + d.puntajeObtenido, 0);
    const ultimaEvaluacion = evaluaciones.length > 0 ? evaluaciones[evaluaciones.length - 1] : null;
    const promedioFinal = ultimaEvaluacion?.promedioFinal || 0;
    const calificacionCualitativa = ultimaEvaluacion?.calificacionCualitativa || '';

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="600" color="text.primary" gutterBottom>
                    Registro de Calificaciones - Docente
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Complete la evaluación del estudiante y gestione el historial académico.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setSuccess(false)}>
                    Evaluación guardada exitosamente.
                </Alert>
            )}

            {evaluaciones.length > 0 && (
                <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                        <Typography variant="h6" fontWeight="500">
                            Historial y Promedio Final:
                        </Typography>
                        <Chip label={`${promedioFinal}/20`} color="primary" sx={{ fontWeight: 'bold' }} />
                        {calificacionCualitativa && (
                            <Chip label={calificacionCualitativa} color="default" variant="outlined" />
                        )}
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                    <TableCell sx={{ fontWeight: '600' }}>Fecha</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Unidad</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Tipo</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Puntaje</TableCell>
                                    <TableCell sx={{ fontWeight: '600' }}>Comentarios</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {evaluaciones.map((evalItem) => (
                                    <TableRow key={evalItem.id} hover>
                                        <TableCell>{evalItem.fechaEvaluacion}</TableCell>
                                        <TableCell>
                                            <Chip label={evalItem.unidad || 'N/A'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>{evalItem.tipoEvaluador}</TableCell>
                                        <TableCell fontWeight="500">{evalItem.puntajeTotal}</TableCell>
                                        <TableCell>{evalItem.comentarios || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 4 }}>
                    Nueva Evaluación
                </Typography>

                <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel>Unidad a Evaluar</InputLabel>
                    <Select
                        value={evaluacion.unidad}
                        label="Unidad a Evaluar"
                        onChange={(e) => setEvaluacion(prev => ({ ...prev, unidad: e.target.value }))}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="U1">U1 - Plan 20% + Informe 80% (30% del ciclo)</MenuItem>
                        <MenuItem value="U2">U2 - Informe Parcial (30% del ciclo)</MenuItem>
                        <MenuItem value="U3">U3 - Informe Final (40% del ciclo)</MenuItem>
                    </Select>
                </FormControl>

                <Grid container spacing={3}>
                    {criterios.map((criterio, index) => (
                        <Grid item xs={12} md={6} key={criterio.id}>
                            <Paper elevation={0} sx={{ p: 3, border: '1px solid #f0f0f0', borderRadius: 2, height: '100%', backgroundColor: '#fafafa' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                        {criterio.nombre}
                                    </Typography>
                                    <Chip label={`Max: ${criterio.puntajeMaximo}`} size="small" sx={{ backgroundColor: '#fff' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: '40px' }}>
                                    {criterio.descripcion}
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Puntaje Obtenido"
                                            type="number"
                                            fullWidth
                                            size="small"
                                            InputProps={{ inputProps: { min: 0, max: criterio.puntajeMaximo } }}
                                            value={evaluacion.detalles[index]?.puntajeObtenido || ''}
                                            onChange={(e) => handlePuntajeChange(index, e.target.value)}
                                            sx={{ backgroundColor: '#fff' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Observación específica"
                                            fullWidth
                                            size="small"
                                            multiline
                                            rows={2}
                                            value={evaluacion.detalles[index]?.comentarios || ''}
                                            onChange={(e) => handleComentarioChange(index, e.target.value)}
                                            sx={{ backgroundColor: '#fff' }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 4 }}>
                    <TextField
                        label="Comentarios Generales de la Evaluación"
                        fullWidth
                        multiline
                        rows={3}
                        value={evaluacion.comentarios}
                        onChange={(e) => setEvaluacion(prev => ({
                            ...prev,
                            comentarios: e.target.value
                        }))}
                        sx={{ backgroundColor: '#fafafa' }}
                    />
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, backgroundColor: '#f8f9fc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary">Total acumulado</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {totalPuntaje} <Typography component="span" variant="body1" color="text.secondary">puntos</Typography>
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    disableElevation
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: '600' }}
                >
                    {loading ? 'Guardando...' : 'Confirmar Evaluación'}
                </Button>
            </Box>
        </Box>
    );
};


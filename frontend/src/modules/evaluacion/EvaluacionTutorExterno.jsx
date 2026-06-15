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
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { CloudUpload, ReportProblem } from '@mui/icons-material';
import { evaluacionesApi } from '../../api/evaluacionesApi';
import { useAuth } from '../../auth/AuthContext';

export const EvaluacionTutorExterno = () => {
    const { user } = useAuth();
    const [criterios, setCriterios] = useState([]);
    const [evaluacion, setEvaluacion] = useState({
        idPractica: 1, // TODO: Obtener la práctica real del usuario
        tipoEvaluador: 'EMPRESA',
        evaluadorId: user?.id || 1,
        unidad: 'U1',
        detalles: [],
        comentarios: '',
        horasRegistradas: 0,
        rutaConstancia: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError('');
                console.log('🔍 Llamando a API de criterios para tipo: EMPRESA');
                const response = await evaluacionesApi.obtenerCriteriosPorTipo('EMPRESA');
                console.log('📥 Respuesta del API:', response);
                console.log('📦 Datos de criterios:', response.data);
                setCriterios(response.data);
                setEvaluacion(prev => ({
                    ...prev,
                    evaluadorId: user?.id || 1,
                    detalles: response.data.map(c => ({
                        idCriterio: c.id,
                        puntajeObtenido: 0,
                        comentarios: ''
                    }))
                }));
            } catch (error) {
                console.error('❌ Error fetching criteria:', error);
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

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // TODO: Implement actual file upload to backend
            setEvaluacion(prev => ({ ...prev, rutaConstancia: file.name }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            await evaluacionesApi.crearEvaluacion(evaluacion);
            setSuccess(true);
            // Reset form
            setEvaluacion(prev => ({
                ...prev,
                detalles: criterios.map(c => ({
                    idCriterio: c.id,
                    puntajeObtenido: 0,
                    comentarios: ''
                })),
                comentarios: '',
                horasRegistradas: 0,
                rutaConstancia: ''
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

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="600" color="text.primary" gutterBottom>
                    Evaluación del Tutor Externo
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Complete la evaluación del estudiante en prácticas de manera objetiva.
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

            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                    Fase de Evaluación
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Unidad de avance</InputLabel>
                    <Select
                        value={evaluacion.unidad}
                        label="Unidad de avance"
                        onChange={(e) => setEvaluacion(prev => ({ ...prev, unidad: e.target.value }))}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="U1">U1 - Planificación inicial (30% del ciclo)</MenuItem>
                        <MenuItem value="U2">U2 - Desarrollo intermedio (30% del ciclo)</MenuItem>
                        <MenuItem value="U3">U3 - Cierre final (40% del ciclo)</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                    Rúbrica de Competencias
                </Typography>

                {criterios.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                        ⚠️ No hay competencias disponibles. Es posible que las migraciones de la base de datos no se hayan ejecutado.
                    </Alert>
                ) : (
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
                )}
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                    Documentación y Comentarios Adicionales
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Total Horas Registradas"
                            type="number"
                            fullWidth
                            InputProps={{ inputProps: { min: 0 } }}
                            value={evaluacion.horasRegistradas || ''}
                            onChange={(e) => setEvaluacion(prev => ({
                                ...prev,
                                horasRegistradas: parseInt(e.target.value) || 0
                            }))}
                            sx={{ backgroundColor: '#fafafa' }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                            fullWidth
                            sx={{ height: '100%', borderRadius: 2, textTransform: 'none', borderStyle: 'dashed', borderWidth: '1.5px', color: 'text.secondary', borderColor: 'grey.400' }}
                        >
                            {evaluacion.rutaConstancia ? 'Cambiar Constancia' : 'Subir Constancia'}
                            <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                        </Button>
                        {evaluacion.rutaConstancia && (
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'success.main', fontWeight: '500' }}>
                                ✓ Archivo adjunto: {evaluacion.rutaConstancia}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Desempeño general"
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Resuma el desempeño del practicante..."
                            value={evaluacion.comentarios}
                            onChange={(e) => setEvaluacion(prev => ({
                                ...prev,
                                comentarios: e.target.value
                            }))}
                            sx={{ backgroundColor: '#fafafa' }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Reportar Incidencia"
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Describa cualquier incidencia o problema durante la práctica"
                            value={evaluacion.incidencia || ''}
                            onChange={(e) => setEvaluacion(prev => ({
                                ...prev,
                                incidencia: e.target.value
                            }))}
                            InputProps={{
                                startAdornment: <ReportProblem sx={{ mr: 1, color: 'warning.main', mt: -3 }} />
                            }}
                            sx={{ backgroundColor: '#fafafa' }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, backgroundColor: '#f8f9fc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary">Puntaje total asignado</Typography>
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


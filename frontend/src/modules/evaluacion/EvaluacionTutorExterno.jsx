import { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, LinearProgress, Divider
} from '@mui/material';
import { Person, Business, CloudUpload, ArrowBack } from '@mui/icons-material';
import { evaluacionesApi } from '../../api/evaluacionesApi';
import { expedientesApi } from '../../api/expedientesApi';
import { useAuth } from '../../auth/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ModulePageShell, ModulePageHeader,
} from '../../shared/components/module/ModulePageShell';
import ContentCard from '../../shared/components/ContentCard';

const MySwal = withReactContent(Swal);

const CRITERIOS_POR_DEFECTO = [
    { categoria: 'A. ASPECTOS ACTITUDINALES', puntajeMaximo: 20, criterios: [
        { codigo: 'ASISTENCIA', nombre: 'Asistencia y puntualidad', puntajeMaximo: 5 },
        { codigo: 'RESPONSABILIDAD', nombre: 'Responsabilidad para el cumplimiento de sus obligaciones', puntajeMaximo: 5 },
        { codigo: 'ESFUERZO', nombre: 'Esfuerzo y empeño en la ejecución de sus tareas', puntajeMaximo: 5 },
        { codigo: 'RESPETO_COLABORACION', nombre: 'Respeto y colaboración con sus superiores jerárquicos', puntajeMaximo: 5 },
    ]},
    { categoria: 'B. ASPECTOS COGNITIVOS', puntajeMaximo: 10, criterios: [
        { codigo: 'CULTURA_GENERAL', nombre: 'Demostración de cultura y conocimientos generales propios de un estudiante o egresado universitario', puntajeMaximo: 4 },
        { codigo: 'CONOCIMIENTOS_TECNICOS', nombre: 'Demostración de conocimientos técnicos propios de la carrera de Ingeniería Industrial', puntajeMaximo: 4 },
    ]},
    { categoria: 'C. ASPECTOS DE PROYECCIÓN Y DESARROLLO PROFESIONAL', puntajeMaximo: 20, criterios: [
        { codigo: 'CREATIVIDAD', nombre: 'Creatividad e ingenio en la solución de problemas', puntajeMaximo: 4 },
        { codigo: 'INTERACCION_PERSONAS', nombre: 'Interacción con personas, superiores y subordinados', puntajeMaximo: 4 },
        { codigo: 'COMUNICACION', nombre: 'Fluidez en la comunicación verbal y escrita', puntajeMaximo: 4 },
        { codigo: 'APRENDIZAJE', nombre: 'Grado de aprendizaje y asimilación de experiencias nuevas', puntajeMaximo: 4 },
    ]},
];

export const EvaluacionTutorExterno = () => {
    const { user } = useAuth();
    const { id: idExpedienteParams } = useParams();
    const navigate = useNavigate();
    const idExpediente = idExpedienteParams ? parseInt(idExpedienteParams) : 1;

    const [evaluaciones, setEvaluaciones] = useState([]);
    const [detalles, setDetalles] = useState({});
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

            setExpediente(expRes.data?.data || expRes.data);
            setEvaluaciones(evRes.data || []);

            const initialDetalles = {};
            CRITERIOS_POR_DEFECTO.forEach(cat => {
                cat.criterios.forEach(c => {
                    initialDetalles[c.codigo] = { puntajeObtenido: 0, comentarios: '' };
                });
            });
            setDetalles(initialDetalles);
        } catch {
            MySwal.fire('Error', 'No se pudieron cargar los datos de evaluación.', 'error');
        }
    };

    useEffect(() => {
        fetchData();
    }, [idExpediente]);

    const handlePuntajeChange = (codigo, value) => {
        const numValue = parseInt(value) || 0;
        const criterio = CRITERIOS_POR_DEFECTO.flatMap(c => c.criterios).find(cr => cr.codigo === codigo);
        const max = criterio?.puntajeMaximo || 5;
        setDetalles(prev => ({
            ...prev,
            [codigo]: { ...prev[codigo], puntajeObtenido: Math.min(Math.max(numValue, 0), max) }
        }));
    };

    const handleComentarioChange = (codigo, value) => {
        setDetalles(prev => ({
            ...prev,
            [codigo]: { ...prev[codigo], comentarios: value }
        }));
    };

    const calcularTotalCategoria = (categoria) => {
        return categoria.criterios.reduce((sum, c) => sum + (detalles[c.codigo]?.puntajeObtenido || 0), 0);
    };

    const calcularTotalGeneral = () => {
        return CRITERIOS_POR_DEFECTO.reduce((sum, cat) => sum + calcularTotalCategoria(cat), 0);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEvaluacion(prev => ({ ...prev, rutaConstancia: file.name }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const total = calcularTotalGeneral();
        if (total === 0) {
            MySwal.fire('Advertencia', 'Debe ingresar al menos un puntaje.', 'warning');
            return;
        }

        const confirmResult = await MySwal.fire({
            title: '¿Confirmar Evaluación?',
            text: `Puntaje total: ${total} puntos. ¿Estás seguro de registrar la evaluación?`,
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

            const payload = {
                ...evaluacion,
                detalles: CRITERIOS_POR_DEFECTO.flatMap(cat =>
                    cat.criterios.map(c => ({
                        idCriterio: c.codigo,
                        puntajeObtenido: detalles[c.codigo]?.puntajeObtenido || 0,
                        comentarios: detalles[c.codigo]?.comentarios || ''
                    }))
                )
            };

            await evaluacionesApi.crearEvaluacion(payload);

            const evRes = await evaluacionesApi.obtenerEvaluacionesPorPractica(idExpediente);
            setEvaluaciones(evRes.data || []);

            MySwal.fire({
                icon: 'success',
                title: 'Evaluación Registrada',
                text: `Puntaje total: ${total} puntos`,
                timer: 2000,
                showConfirmButton: false
            });
        } catch {
            MySwal.fire('Error', 'No se pudo guardar la evaluación.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalGeneral = calcularTotalGeneral();
    const totalMaximo = 50;

    return (
        <ModulePageShell>
            <ModulePageHeader
                icon={<Business />}
                title="Evaluación de Prácticas Pre-Profesionales"
                subtitle="Anexo 2 — Evaluación por la Empresa Receptora"
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
                            <Typography variant="caption" color="text.secondary">1. DEL PRACTICANTE</Typography>
                            <Typography variant="h6" sx={{ mt: 0.5, mb: 1 }}>
                                {expediente.nombreEstudiante} {expediente.apellidoEstudiante}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip icon={<Person />} label={`DNI: ${expediente.numeroDocumento || '—'}`} size="small" variant="outlined" />
                                <Chip icon={<Business />} label={expediente.nombreEmpresa} size="small" variant="outlined" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" color="text.secondary">Puntaje Total</Typography>
                            <Typography variant="h4" fontWeight={600} sx={{ color: totalGeneral >= 40 ? 'var(--wow-success)' : totalGeneral >= 25 ? 'var(--wow-warning)' : 'var(--wow-danger)' }}>
                                {totalGeneral} <Typography component="span" variant="body2" color="text.secondary">/ {totalMaximo}</Typography>
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(totalGeneral / totalMaximo) * 100}
                                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                                color={totalGeneral >= 40 ? 'success' : totalGeneral >= 25 ? 'warning' : 'error'}
                            />
                        </Grid>
                    </Grid>
                </ContentCard>
            )}

            <ContentCard>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>4. EVALUACIÓN</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    (En la columna de puntaje, para cada criterio, sírvase marcar un número de 1 a 5 según corresponda al practicante que está evaluando. El número 1 corresponde al peor desempeño y el número 5 corresponde al mejor desempeño)
                </Typography>

                {CRITERIOS_POR_DEFECTO.map((cat, catIndex) => (
                    <Box key={cat.categoria} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1a365d' }}>
                                {cat.categoria}
                            </Typography>
                            <Chip
                                label={`${calcularTotalCategoria(cat)} / ${cat.puntajeMaximo} pts`}
                                size="small"
                                color={calcularTotalCategoria(cat) >= cat.puntajeMaximo * 0.7 ? 'success' : 'default'}
                                variant="outlined"
                            />
                        </Box>

                        <TableContainer sx={{ mb: 1 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 600, width: '50%' }}>Criterio de Evaluación</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: '25%' }} align="center">Puntaje (1-5)</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: '25%' }} align="center">Observaciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cat.criterios.map((criterio) => (
                                        <TableRow key={criterio.codigo} hover>
                                            <TableCell>
                                                <Typography variant="body2">{criterio.nombre}</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    InputProps={{ inputProps: { min: 1, max: 5, style: { textAlign: 'center' } } }}
                                                    value={detalles[criterio.codigo]?.puntajeObtenido || ''}
                                                    onChange={(e) => handlePuntajeChange(criterio.codigo, e.target.value)}
                                                    sx={{ width: 70 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    multiline
                                                    rows={1}
                                                    value={detalles[criterio.codigo]?.comentarios || ''}
                                                    onChange={(e) => handleComentarioChange(criterio.codigo, e.target.value)}
                                                    placeholder="Opcional"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {catIndex < CRITERIOS_POR_DEFECTO.length - 1 && <Divider sx={{ my: 2 }} />}
                    </Box>
                ))}

                <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid', borderColor: 'primary.light' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Horas registradas"
                                type="number"
                                fullWidth
                                size="small"
                                value={evaluacion.horasRegistradas || ''}
                                onChange={(e) => setEvaluacion((prev) => ({ ...prev, horasRegistradas: parseInt(e.target.value) || 0 }))}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button variant="outlined" component="label" startIcon={<CloudUpload />} fullWidth sx={{ height: '100%' }}>
                                {evaluacion.rutaConstancia || 'Subir constancia de horas'}
                                <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center', py: 1 }}>
                                <Typography variant="caption" color="text.secondary">Puntaje Total Obtenido</Typography>
                                <Typography variant="h5" fontWeight={700} sx={{ color: totalGeneral >= 40 ? '#16a34a' : totalGeneral >= 25 ? '#d97706' : '#dc2626' }}>
                                    {totalGeneral} / {totalMaximo}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Observaciones generales del evaluador"
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

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Lugar y fecha: _______________, {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Typography>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading} size="large">
                        {loading ? 'Registrando...' : 'Firma y Sello del Funcionario a Cargo'}
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
                                    <TableCell>Puntaje</TableCell>
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
                                            <Typography variant="body2" fontWeight={600}>
                                                {ev.puntajeTotal || ev.promedioFinal || '—'}/50
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {ev.detalles?.map((d) => (
                                                <Typography key={d.idCriterio} variant="caption" display="block">
                                                    {d.nombreCriterio}: {d.puntajeObtenido}/5
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

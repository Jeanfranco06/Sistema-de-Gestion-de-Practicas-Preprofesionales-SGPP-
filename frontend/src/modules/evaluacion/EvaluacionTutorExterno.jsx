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
import { useTheme } from '@mui/material/styles';

const MySwal = withReactContent(Swal);

const agruparCriterios = (criterios) => {
    const grupos = {};
    criterios.forEach((c) => {
        const categoria = c.componente || c.categoria || 'GENERAL';
        if (!grupos[categoria]) {
            grupos[categoria] = { categoria, puntajeMaximo: 0, criterios: [] };
        }
        grupos[categoria].criterios.push(c);
        grupos[categoria].puntajeMaximo += c.puntajeMaximo || 5;
    });
    return Object.values(grupos);
};

export const EvaluacionTutorExterno = () => {
    const { user } = useAuth();
    const { id: idExpedienteParams } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const idExpediente = Number(idExpedienteParams);
    const expedienteIdValido = Number.isSafeInteger(idExpediente) && idExpediente > 0;

    const [evaluaciones, setEvaluaciones] = useState([]);
    const [detalles, setDetalles] = useState({});
    const [criterios, setCriterios] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [evaluacion, setEvaluacion] = useState({
        idExpediente: idExpediente,
        tipoEvaluador: 'EMPRESA',
        evaluadorId: null,
        componente: 'EMPRESA',
        detalles: [],
        comentarios: '',
        horasRegistradas: 0,
        rutaConstancia: ''
    });
    const [loading, setLoading] = useState(false);
    const [expediente, setExpediente] = useState(null);
    const [file, setFile] = useState(null);

    const fetchData = async () => {
        try {
            const [expRes, evRes, critRes] = await Promise.all([
                expedientesApi.getById(idExpediente).catch(() => ({ data: null })),
                evaluacionesApi.obtenerEvaluacionesPorPractica(idExpediente).catch(() => ({ data: [] })),
                evaluacionesApi.obtenerCriteriosPorTipo('EMPRESA').catch(() => ({ data: [] }))
            ]);

            setExpediente(expRes.data?.data || expRes.data);
            setEvaluaciones(evRes.data?.data || evRes.data || []);

            const criteriosBackend = critRes.data?.data || critRes.data || [];
            setCriterios(criteriosBackend);
            setGrupos(agruparCriterios(criteriosBackend));

            const initialDetalles = {};
            criteriosBackend.forEach((c) => {
                initialDetalles[c.id] = { puntajeObtenido: 0, comentarios: '' };
            });
            setDetalles(initialDetalles);
        } catch {
            MySwal.fire('Error', 'No se pudieron cargar los datos de evaluación.', 'error');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 0);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idExpediente]);

    const handlePuntajeChange = (idCriterio, value, puntajeMaximo) => {
        const numValue = parseInt(value, 10) || 0;
        const max = puntajeMaximo || 5;
        setDetalles((prev) => ({
            ...prev,
            [idCriterio]: {
                ...prev[idCriterio],
                puntajeObtenido: Math.min(Math.max(numValue, 0), max)
            }
        }));
    };

    const handleComentarioChange = (idCriterio, value) => {
        setDetalles((prev) => ({
            ...prev,
            [idCriterio]: { ...prev[idCriterio], comentarios: value }
        }));
    };

    const calcularTotalCategoria = (categoria) => {
        return categoria.criterios.reduce((sum, c) => sum + (detalles[c.id]?.puntajeObtenido || 0), 0);
    };

    const calcularTotalGeneral = () => {
        return grupos.reduce((sum, cat) => sum + calcularTotalCategoria(cat), 0);
    };

    const totalMaximo = grupos.reduce((sum, g) => sum + g.puntajeMaximo, 0) || 50;

    const handleFileUpload = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setEvaluacion((prev) => ({ ...prev, rutaConstancia: selected.name }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const total = calcularTotalGeneral();
        if (!user?.id || !expedienteIdValido) {
            MySwal.fire('Sesión o expediente no válido', 'Vuelve a la lista de practicantes e inténtalo nuevamente.', 'error');
            return;
        }
        if (criterios.some((criterio) => !detalles[criterio.id]?.puntajeObtenido)) {
            MySwal.fire('Evaluación incompleta', 'Debe registrar un puntaje para cada criterio.', 'warning');
            return;
        }

        const confirmResult = await MySwal.fire({
            title: '¿Confirmar Evaluación?',
            text: `Puntaje total: ${total} puntos. ¿Estás seguro de registrar la evaluación?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: theme.palette.primary.main,
            cancelButtonColor: theme.palette.secondary.main
        });

        if (!confirmResult.isConfirmed) return;

        setLoading(true);
        try {
            MySwal.fire({ title: 'Guardando...', didOpen: () => MySwal.showLoading() });

            let rutaConstancia = evaluacion.rutaConstancia;
            if (file) {
                const uploadRes = await expedientesApi.uploadFile(file);
                rutaConstancia = uploadRes.data?.data || uploadRes.data || file.name;
            }

            const payload = {
                ...evaluacion,
                idExpediente,
                evaluadorId: user.id,
                rutaConstancia,
                detalles: criterios.map((c) => ({
                    idCriterio: c.id,
                    puntajeObtenido: detalles[c.id]?.puntajeObtenido || 0,
                    comentarios: detalles[c.id]?.comentarios || ''
                }))
            };

            await evaluacionesApi.crearEvaluacion(payload);

            const evRes = await evaluacionesApi.obtenerEvaluacionesPorPractica(idExpediente);
            setEvaluaciones(evRes.data?.data || evRes.data || []);
            setFile(null);

            MySwal.fire({
                icon: 'success',
                title: 'Evaluación Registrada',
                text: `Puntaje total: ${total} puntos`,
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            MySwal.fire('Error', err?.response?.data?.mensaje || 'No se pudo guardar la evaluación.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalGeneral = calcularTotalGeneral();
    const porcentaje = totalMaximo > 0 ? (totalGeneral / totalMaximo) * 100 : 0;
    const colorTotal = totalGeneral >= totalMaximo * 0.7 ? 'success' : totalGeneral >= totalMaximo * 0.4 ? 'warning' : 'error';

    if (!expedienteIdValido) {
        return (
            <ModulePageShell>
                <ContentCard>
                    <Typography color="error">No se indicó un expediente válido para evaluar.</Typography>
                    <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/tutor/practicantes')}>
                        Volver a practicantes
                    </Button>
                </ContentCard>
            </ModulePageShell>
        );
    }

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
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Typography variant="caption" color="text.secondary">1. DEL PRACTICANTE</Typography>
                            <Typography variant="h6" sx={{ mt: 0.5, mb: 1 }}>
                                {expediente.nombreEstudiante} {expediente.apellidoEstudiante}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip icon={<Person />} label={`DNI: ${expediente.numeroDocumento || '—'}`} size="small" variant="outlined" />
                                <Chip icon={<Business />} label={expediente.nombreEmpresa} size="small" variant="outlined" />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="caption" color="text.secondary">Puntaje Total</Typography>
                            <Typography sx={{ fontWeight: 600 }} variant="h4" color={theme.palette[colorTotal].main}>
                                {totalGeneral} <Typography component="span" variant="body2" color="text.secondary">/ {totalMaximo}</Typography>
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={porcentaje}
                                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                                color={colorTotal}
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

                {grupos.map((cat, catIndex) => (
                    <Box key={cat.categoria} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.dark, fontWeight: 700 }}>
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
                                    <TableRow sx={{ bgcolor: theme.palette.secondary.light + '20' }}>
                                        <TableCell sx={{ fontWeight: 600, width: '50%' }}>Criterio de Evaluación</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: '25%' }} align="center">Puntaje (1-{Math.max(...cat.criterios.map((c) => c.puntajeMaximo || 5), 5)})</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: '25%' }} align="center">Observaciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cat.criterios.map((criterio) => (
                                        <TableRow key={criterio.id} hover>
                                            <TableCell>
                                                <Typography variant="body2">{criterio.nombre}</Typography>
                                                {criterio.descripcion && (
                                                    <Typography variant="caption" color="text.secondary">{criterio.descripcion}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    slotProps={{ htmlInput: { min: 0, max: criterio.puntajeMaximo || 5, style: { textAlign: 'center' } } }}
                                                    value={detalles[criterio.id]?.puntajeObtenido || ''}
                                                    onChange={(e) => handlePuntajeChange(criterio.id, e.target.value, criterio.puntajeMaximo)}
                                                    sx={{ width: 70 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    multiline
                                                    rows={1}
                                                    value={detalles[criterio.id]?.comentarios || ''}
                                                    onChange={(e) => handleComentarioChange(criterio.id, e.target.value)}
                                                    placeholder="Opcional"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {catIndex < grupos.length - 1 && <Divider sx={{ my: 2 }} />}
                    </Box>
                ))}

                <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid', borderColor: 'primary.light' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                label="Horas registradas"
                                type="number"
                                fullWidth
                                size="small"
                                value={evaluacion.horasRegistradas || ''}
                                onChange={(e) => setEvaluacion((prev) => ({ ...prev, horasRegistradas: parseInt(e.target.value, 10) || 0 }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{ height: '100%' }}
                                color={file ? 'success' : 'primary'}
                            >
                                {evaluacion.rutaConstancia || 'Subir constancia de horas'}
                                <input type="file" hidden accept="application/pdf,.pdf" onChange={handleFileUpload} />
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ textAlign: 'center', py: 1 }}>
                                <Typography variant="caption" color="text.secondary">Puntaje Total Obtenido</Typography>
                                <Typography sx={{ fontWeight: 700 }} variant="h5" color={theme.palette[colorTotal].main}>
                                    {totalGeneral} / {totalMaximo}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12 }}>
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
                                {evaluaciones.filter((ev) => ev.componente === 'EMPRESA').map((ev) => (
                                    <TableRow key={ev.id} hover>
                                        <TableCell>{ev.fechaEvaluacion}</TableCell>
                                        <TableCell>{ev.horasRegistradas} hrs</TableCell>
                                        <TableCell>{ev.tipoEvaluador}</TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 600 }} variant="body2">
                                                {ev.puntajeTotal || ev.promedioFinal || '—'}/{totalMaximo}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {ev.detalles?.map((d) => (
                                                <Typography sx={{ display: 'block' }} key={d.idCriterio || d.id} variant="caption">
                                                    {d.nombreCriterio || d.criterio}: {d.puntajeObtenido}
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

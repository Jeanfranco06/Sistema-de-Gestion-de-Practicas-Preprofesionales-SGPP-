import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Tooltip,
    TablePagination, MenuItem, FormControl, InputLabel, Select, Alert, CircularProgress, TableSortLabel,
    Stack, LinearProgress, Card, CardContent, Collapse, Avatar, Fade
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import GavelIcon from '@mui/icons-material/Gavel';
import RuleIcon from '@mui/icons-material/Rule';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { secretariaApi } from '../../../api/secretariaApi';
import { academicoApi } from '../../../api/validacionesApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const TIPO_PRACTICA_OPTS = ['INICIAL', 'FINAL', 'PROFESIONAL'];

const ESTADOS_ACADEMICOS = ['MATRICULADO', 'ACTIVO', 'REGULAR', 'SUSPENDIDO', 'EGRESADO', 'GRADUADO'];

const ESTADO_ACADEMICO_DOT = {
    MATRICULADO: { dot: '#3b82f6', bg: '#eff6ff' },
    ACTIVO: { dot: '#10b981', bg: '#ecfdf5' },
    REGULAR: { dot: '#F5C518', bg: '#fffbeb' },
    SUSPENDIDO: { dot: '#f59e0b', bg: '#fffbeb' },
    EGRESADO: { dot: '#64748b', bg: '#f1f5f9' },
    GRADUADO: { dot: '#8b5cf6', bg: '#f5f3ff' }
};

const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0).toUpperCase() : '';
    const a = apellido ? apellido.charAt(0).toUpperCase() : '';
    return n + a || '?';
};

const DashboardCard = ({ title, action, children, sx }) => (
    <Paper
        elevation={0}
        sx={{
            p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider',
            bgcolor: 'background.paper', boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', ...sx
        }}
    >
        {(title || action) && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
                {title && <Typography variant="h6" fontWeight={700} color="text.primary">{title}</Typography>}
                {action && <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>{action}</Box>}
            </Box>
        )}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Paper>
);

const StatCard = ({ label, value, icon, accent }) => {
    const accentColors = {
        blue: { bg: '#eff6ff', text: '#1e40af', icon: '#3b82f6' },
        emerald: { bg: '#ecfdf5', text: '#065f46', icon: '#10b981' },
        violet: { bg: '#f5f3ff', text: '#5b21b6', icon: '#8b5cf6' },
        orange: { bg: '#fff7ed', text: '#9a3412', icon: '#f97316' }
    };
    const colors = accentColors[accent] || accentColors.blue;
    return (
        <Paper elevation={0} sx={{ flex: 1, minWidth: 140, p: 2.5, borderRadius: 3, bgcolor: colors.bg, border: '1px solid', borderColor: `${colors.icon}20` }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ color: colors.icon }}>{icon}</Box>
                <Box>
                    <Typography variant="h5" fontWeight={800} color={colors.text}>{value}</Typography>
                    <Typography variant="caption" fontWeight={600} color={colors.text} sx={{ opacity: 0.8 }}>{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    );
};

export const ValidarRequisitos = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('codigoEstudiantil');

    const [filtroEstadoAc, setFiltroEstadoAc] = useState('todos');

    const [openValidarDialog, setOpenValidarDialog] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [tipoPracticaValidar, setTipoPracticaValidar] = useState('FINAL');
    const [validando, setValidando] = useState(false);
    const [resultadoValidacion, setResultadoValidacion] = useState(null);

    const [openHistorialDialog, setOpenHistorialDialog] = useState(false);
    const [historialValidaciones, setHistorialValidaciones] = useState([]);
    const [historialLoading, setHistorialLoading] = useState(false);

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editForm, setEditForm] = useState({
        semestreActual: '', creditosAprobados: '', creditosRequeridosPractica: '',
        promedioPonderado: '', estadoAcademico: ''
    });
    const [editSaving, setEditSaving] = useState(false);

    const [detalleExpandido, setDetalleExpandido] = useState(null);

    const [ultimoResultado, setUltimoResultado] = useState(null);

    const loadEstudiantes = async () => {
        try {
            setLoading(true);
            const res = await secretariaApi.getAllEstudiantes();
            setEstudiantes(res.data?.data || res.data || []);
        } catch (error) {
            console.error("Error loading estudiantes:", error);
            MySwal.fire('Error', 'No se pudieron cargar los estudiantes.', 'error');
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        loadEstudiantes();
    }, []);

    const handleOpenValidar = async (estudiante) => {
        setSelectedEstudiante(estudiante);
        setTipoPracticaValidar('FINAL');
        setResultadoValidacion(null);
        setUltimoResultado(null);

        try {
            const res = await academicoApi.getUltimoResultado(estudiante.id, 'FINAL');
            const ultimo = res.data?.data;
            if (ultimo) {
                setUltimoResultado(ultimo);
            }
        } catch { /* ignore */ }

        setOpenValidarDialog(true);
    };

    const handleEjecutarValidacion = async () => {
        if (!selectedEstudiante) return;
        try {
            setValidando(true);
            setResultadoValidacion(null);
            const res = await academicoApi.validar({
                estudianteId: selectedEstudiante.id,
                codigoTipoPractica: tipoPracticaValidar,
                periodoAcademico: new Date().getFullYear() + '-II'
            });
            setResultadoValidacion(res.data?.data);
            MySwal.fire({
                icon: res.data?.data?.apto ? 'success' : 'warning',
                title: res.data?.data?.apto ? 'ESTUDIANTE HABILITADO' : 'ESTUDIANTE NO HABILITADO',
                text: res.data?.data?.observacionesGenerales || '',
                timer: 3000,
                showConfirmButton: true
            });
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Error al ejecutar la validación';
            MySwal.fire('Error', msg, 'error');
        } finally {
            setValidando(false);
        }
    };

    const handleOpenHistorial = async (estudiante) => {
        setSelectedEstudiante(estudiante);
        setHistorialLoading(true);
        setOpenHistorialDialog(true);
        try {
            const res = await academicoApi.getResultadosByEstudiante(estudiante.id);
            setHistorialValidaciones(res.data?.data || []);
        } catch (error) {
            console.error("Error loading historial:", error);
            setHistorialValidaciones([]);
        } finally {
            setHistorialLoading(false);
        }
    };

    const handleEdit = (estudiante) => {
        setSelectedEstudiante(estudiante);
        setEditForm({
            semestreActual: estudiante.semestreActual ?? '',
            creditosAprobados: estudiante.creditosAprobados ?? '',
            creditosRequeridosPractica: estudiante.creditosRequeridosPractica ?? '',
            promedioPonderado: estudiante.promedioPonderado ?? '',
            estadoAcademico: estudiante.estadoAcademico || ''
        });
        setOpenEditDialog(true);
    };

    const handleSaveEdit = async () => {
        try {
            setEditSaving(true);
            await secretariaApi.updateDatosAcademicos(selectedEstudiante.id, editForm);
            MySwal.fire({ icon: 'success', title: 'Datos actualizados', timer: 1500, showConfirmButton: false });
            setOpenEditDialog(false);
            loadEstudiantes();
        } catch (error) {
            MySwal.fire('Error', error.response?.data?.message || 'No se pudo actualizar.', 'error');
        } finally {
            setEditSaving(false);
        }
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedEstudiantes = useMemo(() => {
        let filtered = [...estudiantes];
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                (e.codigoEstudiantil || '').toLowerCase().includes(s) ||
                (e.nombres || '').toLowerCase().includes(s) ||
                (e.apellidoPaterno || '').toLowerCase().includes(s)
            );
        }
        if (filtroEstadoAc !== 'todos') {
            filtered = filtered.filter(e => e.estadoAcademico === filtroEstadoAc);
        }
        filtered.sort((a, b) => {
            let aVal = a[orderBy] ?? '';
            let bVal = b[orderBy] ?? '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [estudiantes, searchTerm, filtroEstadoAc, orderBy, order]);

    const paginated = sortedEstudiantes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const kpis = useMemo(() => {
        return {
            total: estudiantes.length,
            activos: estudiantes.filter(e => e.estadoAcademico === 'ACTIVO').length,
            matriculados: estudiantes.filter(e => e.estadoAcademico === 'MATRICULADO').length,
            egresados: estudiantes.filter(e => ['EGRESADO', 'GRADUADO'].includes(e.estadoAcademico)).length
        };
    }, [estudiantes]);

    const stats = [
        { label: 'Total Estudiantes', value: kpis.total, icon: <SchoolIcon fontSize="small" />, accent: 'blue' },
        { label: 'Activos', value: kpis.activos, icon: <CheckCircleIcon fontSize="small" />, accent: 'emerald' },
        { label: 'Matriculados', value: kpis.matriculados, icon: <AssignmentTurnedInIcon fontSize="small" />, accent: 'violet' },
        { label: 'Egresados/Graduados', value: kpis.egresados, icon: <RuleIcon fontSize="small" />, accent: 'orange' }
    ];

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFiltroEstadoAc('todos');
    };

    const headCells = [
        { id: 'codigoEstudiantil', label: 'Código' },
        { id: 'nombres', label: 'Estudiante' },
        { id: 'semestreActual', label: 'Ciclo' },
        { id: 'creditosAprobados', label: 'Créditos Aprob.' },
        { id: 'promedioPonderado', label: 'Promedio' },
        { id: 'estadoAcademico', label: 'Estado Acad.' },
        { id: 'acciones', label: 'Acciones', sortable: false }
    ];

    if (initialLoad) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 3 }}>
                <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>Cargando estudiantes...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%', pb: 8 }}>
            <Fade in timeout={600}>
                <Box>
                    <Paper elevation={0} sx={{ mb: 4, borderRadius: { xs: 3, md: 4 }, overflow: 'hidden', bgcolor: '#1a365d', color: 'white', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, p: { xs: 3, md: 5 }, gap: { xs: 4, md: 3 }, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', right: { xs: -20, md: 20 }, top: { xs: 10, md: -20 }, opacity: 0.1 }}>
                            <AssignmentTurnedInIcon sx={{ fontSize: { xs: 150, md: 220 } }} />
                        </Box>
                        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5, fontWeight: 600, display: 'block', mb: 0.5 }}>Secretaría Académica</Typography>
                            <Typography variant="h3" fontWeight={800} sx={{ mt: 0, mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, wordBreak: 'break-word' }}>Validación de Requisitos</Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Verificación de requisitos académicos y normativos para inicio de prácticas preprofesionales.</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1, alignSelf: { xs: 'flex-end', md: 'center' } }}>
                            <Tooltip title="Actualizar listado">
                                <IconButton onClick={loadEstudiantes} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                        {stats.map((s, i) => <StatCard key={i} {...s} />)}
                    </Box>

                    <DashboardCard sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                size="small" variant="outlined"
                                placeholder="Buscar por código o nombre del estudiante..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 300 } }}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                                        sx: { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
                                    }
                                }}
                            />
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                                <InputLabel>Estado Académico</InputLabel>
                                <Select value={filtroEstadoAc} label="Estado Académico" onChange={(e) => setFiltroEstadoAc(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                                    <MenuItem value="todos">Todos</MenuItem>
                                    {ESTADOS_ACADEMICOS.map(ea => <MenuItem key={ea} value={ea}>{ea}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <Tooltip title="Limpiar filtros">
                                <IconButton onClick={limpiarFiltros} sx={{ bgcolor: '#f1f5f9', color: '#64748b', borderRadius: 2, '&:hover': { bgcolor: '#e2e8f0' } }}>
                                    <FilterListIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </DashboardCard>

                    <DashboardCard sx={{ p: { xs: 0, sm: 0, md: 0 }, overflow: 'hidden', position: 'relative' }}>
                        {loading && (
                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                                <LinearProgress sx={{ height: 3, '& .MuiLinearProgress-bar': { bgcolor: '#1a365d' }, bgcolor: '#e2e8f0' }} />
                            </Box>
                        )}
                        <Box sx={{ overflowX: 'auto', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s ease-in-out' }}>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <TableRow>
                                        {headCells.map(hc => (
                                            <TableCell key={hc.id} sx={{ fontWeight: 700, color: '#475569', py: 2 }}>
                                                {hc.sortable !== false ? (
                                                    <TableSortLabel active={orderBy === hc.id} direction={orderBy === hc.id ? order : 'asc'}
                                                        onClick={() => handleSort(hc.id)}>
                                                        {hc.label}
                                                    </TableSortLabel>
                                                ) : hc.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginated.map((est) => {
                                        const nombre = `${est.nombres || ''} ${est.apellidoPaterno || ''}${est.apellidoMaterno ? ' ' + est.apellidoMaterno : ''}`;
                                        const sc = ESTADO_ACADEMICO_DOT[est.estadoAcademico] || { dot: '#94a3b8', bg: '#f1f5f9' };
                                        return (
                                            <TableRow key={est.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                                <TableCell>
                                                    <Typography variant="body2" fontFamily="monospace" fontWeight={600} color="text.secondary">{est.codigoEstudiantil}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 36, height: 36, bgcolor: sc.bg, color: sc.dot, fontWeight: 700, fontSize: 13, border: '1px solid', borderColor: `${sc.dot}40` }}>
                                                            {getInitials(est.nombres, est.apellidoPaterno)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={700} color="text.primary">{nombre}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell><Chip label={`${est.semestreActual || '—'}°`} size="small" variant="outlined" /></TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>{est.creditosAprobados ?? '—'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{est.promedioPonderado ?? '—'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sc.dot }} />
                                                            <Typography variant="caption" fontWeight={700} color={sc.dot}>{est.estadoAcademico || '—'}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                                        <Tooltip title="Validar requisitos" arrow>
                                                            <IconButton size="small" onClick={() => handleOpenValidar(est)} sx={{ color: '#10b981', bgcolor: '#ecfdf5', '&:hover': { color: '#059669', bgcolor: '#d1fae5' } }}>
                                                                <AssignmentTurnedInIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Historial de validaciones" arrow>
                                                            <IconButton size="small" onClick={() => handleOpenHistorial(est)} sx={{ color: '#3b82f6', bgcolor: '#eff6ff', '&:hover': { color: '#2563eb', bgcolor: '#dbeafe' } }}>
                                                                <HistoryIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar datos académicos" arrow>
                                                            <IconButton size="small" onClick={() => handleEdit(est)} sx={{ color: '#8b5cf6', bgcolor: '#f5f3ff', '&:hover': { color: '#7c3aed', bgcolor: '#ede9fe' } }}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {sortedEstudiantes.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                                                    <SearchIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                                                    <Typography variant="subtitle1" fontWeight={600}>No se encontraron estudiantes</Typography>
                                                    <Typography variant="body2">Intenta ajustar los filtros o verifica la conexión.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={sortedEstudiantes.length}
                            rowsPerPage={rowsPerPage} page={page} onPageChange={(_, p) => setPage(p)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            labelRowsPerPage="Filas por página:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                            sx={{ borderTop: '1px solid #e2e8f0' }} />
                    </DashboardCard>
                </Box>
            </Fade>

            <Dialog open={openValidarDialog} onClose={() => { if (!validando) setOpenValidarDialog(false); }}
                maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{
                    bgcolor: resultadoValidacion
                        ? (resultadoValidacion.apto ? '#065f46' : '#9a3412')
                        : '#1a365d',
                    color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, px: 4
                }}>
                    <GavelIcon />
                    <Typography variant="h6" fontWeight={700}>
                        Validación Académica: {selectedEstudiante?.codigoEstudiantil || ''}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' } }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Tipo de Práctica</InputLabel>
                                <Select value={tipoPracticaValidar} label="Tipo de Práctica"
                                    onChange={e => { setTipoPracticaValidar(e.target.value); setResultadoValidacion(null); }}
                                    disabled={validando} sx={{ borderRadius: 1.2 }}>
                                    {TIPO_PRACTICA_OPTS.map(tp => {
                                        const label = tp === 'INICIAL' ? 'Práctica Inicial' : tp === 'FINAL' ? 'Práctica Final' : 'Práctica Profesional';
                                        return <MenuItem key={tp} value={tp}>{label}</MenuItem>;
                                    })}
                                </Select>
                            </FormControl>
                            <Button variant="contained" color={resultadoValidacion ? 'warning' : 'primary'}
                                onClick={handleEjecutarValidacion} disabled={validando}
                                startIcon={validando ? <CircularProgress size={18} color="inherit" /> : <AssignmentTurnedInIcon />}
                                sx={{ px: 3, borderRadius: 1.2, height: 40 }}>
                                {validando ? 'Validando...' : resultadoValidacion ? 'Re-validar' : 'Ejecutar Validación'}
                            </Button>
                        </Box>

                        {ultimoResultado && !resultadoValidacion && (
                            <Alert severity="info" icon={<HistoryIcon />} sx={{ borderRadius: 2 }}>
                                Última validación ({ultimoResultado.tipoPractica}): <strong>{ultimoResultado.apto ? 'APTO' : 'NO APTO'}</strong>
                                {' — '} {new Date(ultimoResultado.fechaValidacion).toLocaleDateString()}
                            </Alert>
                        )}

                        {resultadoValidacion && (
                            <>
                                <Alert severity={resultadoValidacion.apto ? 'success' : 'warning'} sx={{ borderRadius: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {resultadoValidacion.apto ? '✓ ESTUDIANTE HABILITADO' : '✗ ESTUDIANTE NO HABILITADO'}
                                    </Typography>
                                    <Typography variant="body2">{resultadoValidacion.observacionesGenerales}</Typography>
                                </Alert>

                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                    <Chip label={`Normas: ${(resultadoValidacion.normasAplicadas || []).join(', ')}`} color="info" variant="outlined" />
                                    <Chip label={`Reglas: ${resultadoValidacion.reglasCumplidas}/${resultadoValidacion.totalReglas}`}
                                        color="success" variant="outlined" />
                                    <Chip label={`Tipo: ${resultadoValidacion.tipoPractica}`} variant="outlined" />
                                    <Chip label={`Periodo: ${resultadoValidacion.periodoAcademico || '—'}`} variant="outlined" />
                                </Box>

                                <LinearProgress variant="determinate"
                                    value={(resultadoValidacion.reglasCumplidas / Math.max(resultadoValidacion.totalReglas, 1)) * 100}
                                    color={resultadoValidacion.apto ? 'success' : 'warning'}
                                    sx={{ height: 8, borderRadius: 4 }} />

                                {resultadoValidacion.requisitosFaltantes?.length > 0 && (
                                    <Alert severity="error" icon={<ErrorIcon />} sx={{ borderRadius: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Requisitos faltantes:</Typography>
                                        <ul style={{ margin: 4, paddingLeft: 20 }}>
                                            {resultadoValidacion.requisitosFaltantes.map((req, i) => (
                                                <li key={i}><Typography variant="body2">{req}</Typography></li>
                                            ))}
                                        </ul>
                                    </Alert>
                                )}

                                <Typography variant="h6" sx={{ borderBottom: '2px solid', borderColor: '#1a365d', pb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#1a365d' }}>
                                    <RuleIcon /> Detalle de Reglas Evaluadas
                                </Typography>

                                {(resultadoValidacion.detalles || []).map((detalle, idx) => {
                                    const isExpanded = detalleExpandido === idx;
                                    return (
                                        <Card key={idx} variant="outlined" sx={{ borderRadius: 2, borderLeft: 4, borderLeftColor: detalle.cumplido ? '#10b981' : '#ef4444' }}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    {detalle.cumplido
                                                        ? <CheckCircleIcon sx={{ color: '#10b981', mt: 0.3 }} fontSize="small" />
                                                        : <CancelIcon sx={{ color: '#ef4444', mt: 0.3 }} fontSize="small" />}
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight="bold">
                                                                    {detalle.nombreRegla}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {detalle.codigoRegla} {detalle.obligatorio ? '(Obligatorio)' : '(No obligatorio)'}
                                                                </Typography>
                                                            </Box>
                                                            <Chip label={detalle.cumplido ? 'CUMPLE' : 'NO CUMPLE'}
                                                                color={detalle.cumplido ? 'success' : 'error'} size="small" />
                                                        </Box>
                                                        <Collapse in={isExpanded}>
                                                            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                                                                {detalle.descripcion && (
                                                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                        <strong>Descripción:</strong> {detalle.descripcion}
                                                    </Typography>
                                                                )}
                                                                <Typography variant="body2">
                                                        <strong>Observación:</strong> {detalle.observaciones || '—'}
                                                    </Typography>
                                                            </Box>
                                                        </Collapse>
                                                    </Box>
                                                    <IconButton size="small" onClick={() => setDetalleExpandido(isExpanded ? null : idx)}>
                                                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                    </IconButton>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })}

                                <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'right' }}>
                                    Validado el {resultadoValidacion.fechaValidacion ? new Date(resultadoValidacion.fechaValidacion).toLocaleString() : '—'}
                                </Typography>
                            </>
                        )}

                        {!resultadoValidacion && !validando && (
                            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                <SchoolIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                    Seleccione el tipo de práctica y ejecute la validación para ver los resultados.
                                </Typography>
                                <Typography variant="caption">
                                    Se evaluarán normas vigentes como Reglamento Específico II y Lineamientos UNT 2025.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenValidarDialog(false)} color="inherit" disabled={validando} sx={{ fontWeight: 600, color: '#64748b' }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openHistorialDialog} onClose={() => setOpenHistorialDialog(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, px: 4 }}>
                    <HistoryIcon /> <Typography variant="h6" fontWeight={700}>Historial de Validaciones: {selectedEstudiante?.codigoEstudiantil}</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    {historialLoading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : historialValidaciones.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <HistoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            <Typography variant="body1" sx={{ mt: 1 }}>El estudiante no tiene validaciones registradas.</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {historialValidaciones.map((h, idx) => (
                                <Card key={h.idResultado || idx} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {h.apto
                                                    ? <CheckCircleIcon sx={{ color: '#10b981' }} fontSize="small" />
                                                    : <CancelIcon sx={{ color: '#ef4444' }} fontSize="small" />}
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {h.apto ? 'APTO' : 'NO APTO'} — {h.tipoPractica}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Chip label={`${h.reglasCumplidas}/${h.totalReglas} reglas`} size="small" color={h.apto ? 'success' : 'error'} variant="outlined" />
                                                <Typography variant="caption" color="textSecondary">
                                                    {h.fechaValidacion ? new Date(h.fechaValidacion).toLocaleDateString() : '—'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {(h.normasAplicadas || []).map((n, ni) => (
                                                <Chip key={ni} label={n} size="small" variant="outlined" color="info" />
                                            ))}
                                        </Box>
                                        {h.observacionesGenerales && (
                                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                                {h.observacionesGenerales}
                                            </Typography>
                                        )}
                                        {h.requisitosFaltantes?.length > 0 && (
                                            <Alert severity="warning" sx={{ mt: 1, borderRadius: 1 }} icon={<WarningIcon />}>
                                                <Typography variant="caption">
                                                    <strong>Faltantes:</strong> {h.requisitosFaltantes.join(', ')}
                                                </Typography>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenHistorialDialog(false)} color="inherit" sx={{ fontWeight: 600, color: '#64748b' }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, px: 4 }}>
                    <EditIcon /> <Typography variant="h6" fontWeight={700}>Editar Datos Académicos</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                            <TextField fullWidth label="Semestre Actual" type="number" value={editForm.semestreActual}
                                onChange={e => setEditForm({ ...editForm, semestreActual: e.target.value })} />
                            <TextField fullWidth label="Créditos Aprobados" type="number" value={editForm.creditosAprobados}
                                onChange={e => setEditForm({ ...editForm, creditosAprobados: e.target.value })} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                            <TextField fullWidth label="Créditos Requeridos" type="number" value={editForm.creditosRequeridosPractica}
                                onChange={e => setEditForm({ ...editForm, creditosRequeridosPractica: e.target.value })} />
                            <TextField fullWidth label="Promedio Ponderado" type="number" slotProps={{ htmlInput: { step: 0.01 } }}
                                value={editForm.promedioPonderado}
                                onChange={e => setEditForm({ ...editForm, promedioPonderado: e.target.value })} />
                        </Box>
                        <FormControl fullWidth>
                            <InputLabel>Estado Académico</InputLabel>
                            <Select value={editForm.estadoAcademico} label="Estado Académico"
                                onChange={e => setEditForm({ ...editForm, estadoAcademico: e.target.value })}>
                                {ESTADOS_ACADEMICOS.map(ea => <MenuItem key={ea} value={ea}>{ea}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenEditDialog(false)} color="inherit" sx={{ fontWeight: 600, color: '#64748b' }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveEdit} disabled={editSaving} startIcon={editSaving ? <CircularProgress size={18} /> : <SaveIcon />} sx={{ px: 4, borderRadius: 2, fontWeight: 700, bgcolor: '#1a365d', '&:hover': { bgcolor: '#1e40af' } }}>
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

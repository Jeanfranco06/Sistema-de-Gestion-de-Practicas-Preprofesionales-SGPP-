import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, InputAdornment, Tooltip,
    TablePagination, MenuItem, FormControl, InputLabel, Select, Divider, Alert, CircularProgress, TableSortLabel,
    Stack, LinearProgress, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Collapse
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
import { motion } from 'framer-motion';
import { secretariaApi } from '../../../api/usuariosApi';
import { academicoApi } from '../../../api/validacionesApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const TIPO_PRACTICA_OPTS = ['INICIAL', 'FINAL'];

const ESTADOS_ACADEMICOS = ['MATRICULADO', 'ACTIVO', 'SUSPENDIDO', 'EGRESADO', 'GRADUADO'];

const ESTADO_ACADEMICO_COLOR = {
    MATRICULADO: 'info', ACTIVO: 'success', SUSPENDIDO: 'warning',
    EGRESADO: 'default', GRADUADO: 'secondary'
};

const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0).toUpperCase() : '';
    const a = apellido ? apellido.charAt(0).toUpperCase() : '';
    return n + a || '?';
};

export const ValidarRequisitos = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        loadEstudiantes();
    }, []);

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
        }
    };

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
        } catch (e) {
            // No tiene último resultado
        }

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

    if (loading && estudiantes.length === 0) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>Cargando estudiantes...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, p: 4, borderRadius: 4, bgcolor: 'primary.main', color: 'white', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AssignmentTurnedInIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Validación Académica y Administrativa</Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                            Verificación de requisitos académicos y normativos para inicio de prácticas pre-profesionales.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Paper component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, bgcolor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">Filtros de Búsqueda</Typography>
                        <Button variant="outlined" size="medium" onClick={loadEstudiantes} startIcon={<RefreshIcon />}
                            sx={{ borderRadius: 1.2, px: 3, fontWeight: 600 }}>Actualizar</Button>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2.5 }}>
                        <TextField size="small" variant="outlined" placeholder="Buscar por código o nombre del estudiante..."
                            value={searchTerm} onChange={handleSearchChange}
                            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>), sx: { bgcolor: '#fff', borderRadius: 1.2 } } }} />
                        <FormControl size="small" fullWidth>
                            <InputLabel>Estado Académico</InputLabel>
                            <Select value={filtroEstadoAc} label="Estado Académico" onChange={(e) => setFiltroEstadoAc(e.target.value)} sx={{ borderRadius: 1.2, bgcolor: '#fff' }}>
                                <MenuItem value="todos">Todos</MenuItem>
                                {ESTADOS_ACADEMICOS.map(ea => <MenuItem key={ea} value={ea}>{ea}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button variant="outlined" size="medium" onClick={limpiarFiltros} startIcon={<FilterListIcon />}
                            sx={{ borderRadius: 1.2, px: 3, fontWeight: 600 }}>Limpiar Filtros</Button>
                    </Box>
                </Box>
            </Paper>

            <TableContainer component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', overflow: 'hidden', bgcolor: '#fff' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            {headCells.map(hc => (
                                <TableCell key={hc.id} sx={{ color: '#fff', fontWeight: 'bold' }}>
                                    {hc.sortable !== false ? (
                                        <TableSortLabel active={orderBy === hc.id} direction={orderBy === hc.id ? order : 'asc'}
                                            onClick={() => handleSort(hc.id)}
                                            sx={{ color: '#fff !important', '& .MuiTableSortLabel-icon': { color: '#fff !important' } }}>
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
                            return (
                                <TableRow key={est.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Typography fontWeight="bold">{est.codigoEstudiantil}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.light', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold' }}>
                                                {getInitials(est.nombres, est.apellidoPaterno)}
                                            </Box>
                                            <Typography variant="body2">{nombre}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={`${est.semestreActual || '—'}°`} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{est.creditosAprobados ?? '—'}</TableCell>
                                    <TableCell>{est.promedioPonderado ?? '—'}</TableCell>
                                    <TableCell>
                                        <Chip label={est.estadoAcademico || '—'} size="small"
                                            color={ESTADO_ACADEMICO_COLOR[est.estadoAcademico] || 'default'} />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.3}>
                                            <Tooltip title="Validar requisitos">
                                                <IconButton size="small" color="success" onClick={() => handleOpenValidar(est)}>
                                                    <AssignmentTurnedInIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Historial de validaciones">
                                                <IconButton size="small" color="info" onClick={() => handleOpenHistorial(est)}>
                                                    <HistoryIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar datos académicos">
                                                <IconButton size="small" color="primary" onClick={() => handleEdit(est)}>
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
                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    <Typography variant="h6" color="textSecondary">No se encontraron estudiantes con los filtros aplicados.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={sortedEstudiantes.length}
                rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                labelRowsPerPage="Filas por página:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`} />

            <Dialog open={openValidarDialog} onClose={() => { if (!validando) setOpenValidarDialog(false); }}
                maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{
                    bgcolor: resultadoValidacion
                        ? (resultadoValidacion.apto ? 'success.main' : 'warning.main')
                        : 'primary.main',
                    color: '#fff', display: 'flex', alignItems: 'center', gap: 1, pb: 2
                }}>
                    <GavelIcon />
                    Validación Académica: {selectedEstudiante?.codigoEstudiantil || ''}
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fbfbfb' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' } }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Tipo de Práctica</InputLabel>
                                <Select value={tipoPracticaValidar} label="Tipo de Práctica"
                                    onChange={e => { setTipoPracticaValidar(e.target.value); setResultadoValidacion(null); }}
                                    disabled={validando} sx={{ borderRadius: 1.2 }}>
                                    {TIPO_PRACTICA_OPTS.map(tp => <MenuItem key={tp} value={tp}>{tp === 'INICIAL' ? 'Práctica Inicial' : 'Práctica Final'}</MenuItem>)}
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

                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Chip label={`Normas aplicadas: ${(resultadoValidacion.normasAplicadas || []).join(', ')}`} color="info" variant="outlined" />
                                    <Chip label={`Reglas cumplidas: ${resultadoValidacion.reglasCumplidas}/${resultadoValidacion.totalReglas}`}
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

                                <Typography variant="h6" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <RuleIcon /> Detalle de Reglas Evaluadas
                                </Typography>

                                {(resultadoValidacion.detalles || []).map((detalle, idx) => {
                                    const isExpanded = detalleExpandido === idx;
                                    return (
                                        <Card key={idx} variant="outlined" sx={{ borderRadius: 2, borderLeft: 4, borderLeftColor: detalle.cumplido ? 'success.main' : 'error.main' }}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    {detalle.cumplido
                                                        ? <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.3 }} />
                                                        : <CancelIcon color="error" fontSize="small" sx={{ mt: 0.3 }} />}
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
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setOpenValidarDialog(false)} color="inherit" disabled={validando} sx={{ fontWeight: 'bold' }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openHistorialDialog} onClose={() => setOpenHistorialDialog(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ bgcolor: 'info.main', color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon /> Historial de Validaciones: {selectedEstudiante?.codigoEstudiantil}
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
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
                                                    ? <CheckCircleIcon color="success" fontSize="small" />
                                                    : <CancelIcon color="error" fontSize="small" />}
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
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setOpenHistorialDialog(false)} color="inherit">Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon /> Editar Datos Académicos
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fbfbfb' }}>
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
                            <TextField fullWidth label="Promedio Ponderado" type="number" inputProps={{ step: 0.01 }}
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
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setOpenEditDialog(false)} color="inherit">Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveEdit} disabled={editSaving} startIcon={editSaving ? <CircularProgress size={18} /> : <SaveIcon />} sx={{ px: 4, borderRadius: 2 }}>
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

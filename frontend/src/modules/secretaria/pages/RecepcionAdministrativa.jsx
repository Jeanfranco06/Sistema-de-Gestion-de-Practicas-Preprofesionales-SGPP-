import { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableHead, TableRow, TablePagination,
    Button, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Stack, InputAdornment, Tooltip, Avatar, Fade, LinearProgress,
    Autocomplete, CircularProgress, FormControlLabel, Checkbox, Divider
} from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import { secretariaApi } from '../../../api/secretariaApi';
import { usuariosApi } from '../../../api/usuariosApi';
import {
    Description, WarningAmber, WorkspacePremium,
    Refresh, Search, ContentPasteSearch, PersonAdd
} from '@mui/icons-material';

const MySwal = withReactContent(Swal);

const estadoColorMap = {
    SOLICITADO: { chip: 'primary', dot: '#3b82f6', bg: '#eff6ff', label: 'Solicitado' },
    EMPRESA_SEDE_ASIGNADA: { chip: 'info', dot: '#06b6d4', bg: '#ecfeff', label: 'Empresa Asignada' },
    VALIDADO_SECRETARIA: { chip: 'success', dot: '#10b981', bg: '#ecfdf5', label: 'Validado (listo para carta)' },
    CARTA_PRESENTACION_EMITIDA: { chip: 'info', dot: '#6366f1', bg: '#eef2ff', label: 'Carta Emitida' },
    ASESOR_ASIGNADO: { chip: 'info', dot: '#8b5cf6', bg: '#f5f3ff', label: 'Asesor Asignado' },
    COMITE_ASIGNADO: { chip: 'info', dot: '#8b5cf6', bg: '#f5f3ff', label: 'Comité Asignado' },
    CARTA_ACEPTACION_PRESENTADA: { chip: 'info', dot: '#6366f1', bg: '#eef2ff', label: 'Carta Acept. Presentada' },
    PLAN_PRESENTADO: { chip: 'default', dot: '#f59e0b', bg: '#fef3c7', label: 'Plan Presentado' },
    EN_REVISION: { chip: 'warning', dot: '#f59e0b', bg: '#fffbeb', label: 'En Revisión' },
    OBSERVADO: { chip: 'error', dot: '#ef4444', bg: '#fef2f2', label: 'Observado' },
    SUBSANADO: { chip: 'info', dot: '#06b6d4', bg: '#ecfeff', label: 'Subsanado' },
    APROBADO: { chip: 'success', dot: '#10b981', bg: '#ecfdf5', label: 'Aprobado' },
    EN_EJECUCION: { chip: 'success', dot: '#10b981', bg: '#ecfdf5', label: 'En Ejecución' },
    EVALUADO: { chip: 'success', dot: '#059669', bg: '#d1fae5', label: 'Evaluado' },
    CERRADO: { chip: 'default', dot: '#64748b', bg: '#f1f5f9', label: 'Cerrado' },
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
                {title && <Typography sx={{ fontWeight: 700 }} variant="h6" color="text.primary">{title}</Typography>}
                {action && <Box>{action}</Box>}
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
                    <Typography sx={{ fontWeight: 800 }} variant="h5" color={colors.text}>{value}</Typography>
                    <Typography variant="caption" color={colors.text} sx={{ opacity: 0.8, fontWeight: 600 }}>{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    );
};

export const RecepcionAdministrativa = () => {
    const [expedientes, setExpedientes] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedExp, setSelectedExp] = useState(null);
    const [incidenciaText, setIncidenciaText] = useState('');

    const [openAsesorDialog, setOpenAsesorDialog] = useState(false);
    const [docentes, setDocentes] = useState([]);
    const [selectedAsesor, setSelectedAsesor] = useState(null);
    const [resolucionAsesor, setResolucionAsesor] = useState('');
    const [asignandoAsesor, setAsignandoAsesor] = useState(false);

    const loadExpedientes = async () => {
        try {
            setLoading(true);
            const resp = await expedientesApi.getAll();
            if (resp.data.success) {
                setExpedientes(resp.data.data);
            }
        } catch (error) {
            console.error("Error", error);
        } finally {
            setLoading(false);
        }
    };

    const loadDocentes = async () => {
        try {
            const resp = await usuariosApi.getAll({ params: { rol: 'DOCENTE_ASESOR' } });
            if (resp.data.success) {
                setDocentes(resp.data.data || []);
            }
        } catch (error) {
            console.error("Error loading docentes:", error);
        }
    };

    useEffect(() => {
        loadExpedientes();
    }, []);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [validarDialog, setValidarDialog] = useState({ open: false, expediente: null });
    const [validarChecks, setValidarChecks] = useState({
        empresaAsignada: false,
        sedeConfirmada: false,
        convenioVigente: false,
        estudianteActivo: false,
        tipoPracticaDefinido: false,
    });
    const [validarObs, setValidarObs] = useState('');

    const handleOpenValidarDialog = (exp) => {
        setValidarChecks({
            empresaAsignada: !!exp.nombreEmpresa,
            sedeConfirmada: !!exp.nombreSede,
            convenioVigente: true,
            estudianteActivo: true,
            tipoPracticaDefinido: !!exp.codigoTipoPractica,
        });
        setValidarObs('');
        setValidarDialog({ open: true, expediente: exp });
    };

    const handleValidarExpediente = async () => {
        const exp = validarDialog.expediente;
        if (!exp) return;

        const allChecked = Object.values(validarChecks).every(Boolean);
        if (!allChecked) {
            MySwal.fire('Incompleto', 'Debe marcar todos los requisitos administrativos antes de validar.', 'warning');
            return;
        }

        const res = await MySwal.fire({
            title: '¿Validar expediente?',
            html: `<div style="text-align:left; font-size:0.9rem;">
                <p>Se marcará el expediente <b>${exp.codigoExpediente}</b> como <b>listo para emisión de Carta de Presentación</b>.</p>
                <p style="color:#666; margin-top:8px;">Estudiante: <b>${exp.nombreEstudiante} ${exp.apellidoEstudiante}</b></p>
                <p style="color:#666;">Empresa: <b>${exp.nombreEmpresa || '—'}</b></p>
            </div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, validar',
            cancelButtonText: 'Cancelar',
            customClass: { confirmButton: 'wow-btn' }
        });

        if (!res.isConfirmed) return;

        try {
            MySwal.fire({ title: 'Validando...', didOpen: () => MySwal.showLoading() });
            await expedientesApi.validarExpediente(exp.id);
            setValidarDialog({ open: false, expediente: null });
            MySwal.fire('Validado', 'Expediente marcado como listo para emisión de Carta de Presentación.', 'success');
            loadExpedientes();
        } catch {
            MySwal.fire('Error', 'No se pudo validar el expediente.', 'error');
        }
    };

    const handleOpenIncidencia = (exp) => {
        setSelectedExp(exp);
        setIncidenciaText('');
        setOpenDialog(true);
    };

    const handleRegistrarIncidencia = async () => {
        if (!incidenciaText.trim()) return;
        try {
            await secretariaApi.registrarIncidencia(selectedExp.id, incidenciaText);
            setOpenDialog(false);
            MySwal.fire('Éxito', 'Incidencia registrada', 'success');
            loadExpedientes();
        } catch {
            MySwal.fire('Error', 'No se pudo registrar la incidencia.', 'error');
        }
    };

    const handleOpenAsesorDialog = async (exp) => {
        setSelectedExp(exp);
        setSelectedAsesor(null);
        setResolucionAsesor('');
        await loadDocentes();
        setOpenAsesorDialog(true);
    };

    const handleAsignarAsesor = async () => {
        if (!selectedAsesor || !resolucionAsesor.trim()) return;
        try {
            setAsignandoAsesor(true);
            await expedientesApi.asignarAsesor(selectedExp.id, {
                idAsesor: selectedAsesor.id,
                resolucion: resolucionAsesor.trim()
            });
            setOpenAsesorDialog(false);
            MySwal.fire('Éxito', 'Asesor asignado correctamente.', 'success');
            loadExpedientes();
        } catch (error) {
            const msg = error.response?.data?.message || 'No se pudo asignar el asesor.';
            MySwal.fire('Error', msg, 'error');
        } finally {
            setAsignandoAsesor(false);
        }
    };

    const filteredExpedientes = expedientes.filter(exp => {
        const q = searchTerm.toLowerCase();
        return (exp.nombreEstudiante + " " + exp.apellidoEstudiante).toLowerCase().includes(q)
            || exp.codigoExpediente.toLowerCase().includes(q)
            || (exp.estado || '').toLowerCase().includes(q)
            || (exp.nombreTipoPractica || '').toLowerCase().includes(q);
    });

    const kpis = useMemo(() => {
        return {
            total: expedientes.length,
            paraCarta: expedientes.filter(e => e.estado === 'VALIDADO_SECRETARIA').length,
            evaluados: expedientes.filter(e => e.estado === 'EVALUADO').length,
            observados: expedientes.filter(e => e.estado === 'OBSERVADO').length,
        };
    }, [expedientes]);

    const stats = [
        { label: 'Total Trámites', value: kpis.total, icon: <ContentPasteSearch fontSize="small" />, accent: 'blue' },
        { label: 'Listas para Carta', value: kpis.paraCarta, icon: <Description fontSize="small" />, accent: 'violet' },
        { label: 'Expedientes Evaluados', value: kpis.evaluados, icon: <WorkspacePremium fontSize="small" />, accent: 'emerald' },
        { label: 'Observados / Alertas', value: kpis.observados, icon: <WarningAmber fontSize="small" />, accent: 'orange' },
    ];

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%', pb: 8 }}>
            <Fade in timeout={600}>
                <Box>
                    <Paper elevation={0} sx={{ mb: 4, borderRadius: { xs: 3, md: 4 }, overflow: 'hidden', bgcolor: '#1a365d', color: 'white', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, p: { xs: 3, md: 5 }, gap: { xs: 4, md: 3 }, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', right: { xs: -20, md: 20 }, top: { xs: 10, md: -20 }, opacity: 0.1 }}>
                            <ContentPasteSearch sx={{ fontSize: { xs: 150, md: 220 } }} />
                        </Box>
                        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5, fontWeight: 600, display: 'block', mb: 0.5 }}>Secretaría Académica</Typography>
                            <Typography variant="h3"  sx={{ fontWeight: 800,  mt: 0, mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, wordBreak: 'break-word' }}>Recepción Administrativa</Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Gestión de documentos, emisión de cartas de presentación y constancias.</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1, alignSelf: { xs: 'flex-end', md: 'center' } }}>
                            <Tooltip title="Actualizar listado">
                                <IconButton onClick={loadExpedientes} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                                    <Refresh />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                        {stats.map((s, i) => <StatCard key={i} {...s} />)}
                    </Box>

                    <DashboardCard sx={{ mb: 4 }}>
                        <TextField
                            size="small" variant="outlined"
                            placeholder="Buscar por estudiante, código, estado o tipo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            sx={{ minWidth: { xs: '100%', md: 400 } }}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
                                    sx: { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
                                }
                            }}
                        />
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
                                        {['Código', 'Estudiante', 'Tipo', 'Empresa/Sede', 'Estado', 'Acciones'].map(h => (
                                            <TableCell key={h} sx={{ fontWeight: 700, color: '#475569', py: 2 }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredExpedientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(exp => {
                                        const sc = estadoColorMap[exp.estado] || { dot: '#94a3b8', bg: '#f1f5f9', label: exp.estado };
                                        return (
                                            <TableRow key={exp.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 600 }} variant="body2" fontFamily="monospace" color="text.secondary">{exp.codigoExpediente}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 36, height: 36, bgcolor: sc.bg, color: sc.dot, fontWeight: 700, fontSize: 13, border: '1px solid', borderColor: `${sc.dot}40` }}>
                                                            {getInitials(exp.nombreEstudiante, exp.apellidoEstudiante)}
                                                        </Avatar>
                                                        <Typography sx={{ fontWeight: 700 }} variant="body2" color="text.primary">{exp.nombreEstudiante} {exp.apellidoEstudiante}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={exp.nombreTipoPractica || (exp.codigoTipoPractica === 'INICIAL' ? 'Práctica Inicial' : exp.codigoTipoPractica === 'FINAL' ? 'Práctica Final' : exp.codigoTipoPractica || '—')} size="small" variant="outlined" color={exp.codigoTipoPractica === 'INICIAL' ? 'primary' : 'secondary'} sx={{ fontWeight: 600 }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>{exp.nombreEmpresa || '—'}</Typography>
                                                    {exp.nombreSede && <Typography variant="caption" color="text.disabled">{exp.nombreSede}</Typography>}
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sc.dot }} />
                                                        <Typography sx={{ fontWeight: 700 }} variant="caption" color={sc.dot}>{sc.label}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" useFlexGap>
                                                        {exp.estado === 'EMPRESA_SEDE_ASIGNADA' && (
                                                            <Tooltip title="Validar requisitos administrativos y marcar como listo para carta" arrow>
                                                                <Button size="small" variant="contained" color="success"
                                                                    onClick={() => handleOpenValidarDialog(exp)}
                                                                    sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap', minWidth: 'auto', px: 1 }}>
                                                                    Validar
                                                                </Button>
                                                            </Tooltip>
                                                        )}
                                                        {exp.estado === 'CARTA_ACEPTACION_PRESENTADA' && exp.codigoTipoPractica === 'INICIAL' && !exp.idAsesor && (
                                                            <Tooltip title="Asignar Docente Asesor" arrow>
                                                                <Button size="small" variant="outlined" color="secondary"
                                                                    onClick={() => handleOpenAsesorDialog(exp)}
                                                                    sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap', minWidth: 'auto', px: 1 }}>
                                                                    + Asesor
                                                                </Button>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip title="Registrar Incidencia / Observación" arrow>
                                                            <span>
                                                                <Button size="small" variant="outlined" color="error"
                                                                    onClick={() => handleOpenIncidencia(exp)}
                                                                    sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap', minWidth: 'auto', px: 1 }}>
                                                                    Incidencia
                                                                </Button>
                                                            </span>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredExpedientes.length === 0 && !loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                                                    <ContentPasteSearch sx={{ fontSize: 48, opacity: 0.5 }} />
                                                    <Typography sx={{ fontWeight: 600 }} variant="subtitle1">No hay trámites documentarios</Typography>
                                                    <Typography variant="body2">Aún no hay expedientes registrados en el sistema.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : null}
                                </TableBody>
                            </Table>
                        </Box>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredExpedientes.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por pág:"
                            sx={{ borderTop: '1px solid #e2e8f0' }}
                        />
                    </DashboardCard>
                </Box>
            </Fade>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, px: 4 }}>
                    <WarningAmber /> <Typography sx={{ fontWeight: 700 }} variant="h6">Registrar Incidencia</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    <Box sx={{ mt: 1, mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Expediente:</strong> {selectedExp?.codigoExpediente}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Estudiante:</strong> {selectedExp?.nombreEstudiante} {selectedExp?.apellidoEstudiante}
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth multiline rows={4}
                        label="Detalle de la Incidencia"
                        placeholder="Describa el problema u observación..."
                        value={incidenciaText}
                        onChange={(e) => setIncidenciaText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 600, color: '#64748b' }}>Cancelar</Button>
                    <Button onClick={handleRegistrarIncidencia} variant="contained" color="error" disabled={!incidenciaText.trim()}>Registrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAsesorDialog} onClose={() => setOpenAsesorDialog(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, px: 4 }}>
                    <PersonAdd /> <Typography sx={{ fontWeight: 700 }} variant="h6">Asignar Docente Asesor</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Expediente:</strong> {selectedExp?.codigoExpediente}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Estudiante:</strong> {selectedExp?.nombreEstudiante} {selectedExp?.apellidoEstudiante}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Tipo:</strong> {selectedExp?.nombreTipoPractica || 'Práctica Inicial'}
                            </Typography>
                        </Box>
                        <Autocomplete
                            value={selectedAsesor}
                            onChange={(_, newValue) => setSelectedAsesor(newValue)}
                            options={docentes}
                            getOptionLabel={(opt) => `${opt.nombres || ''} ${opt.apellidoPaterno || ''} ${opt.apellidoMaterno || ''}`.trim() || opt.username || ''}
                            isOptionEqualToValue={(opt, val) => opt.id === val.id}
                            renderInput={(params) => (
                                <TextField {...params} label="Seleccionar Docente Asesor *" placeholder="Buscar por nombre..." />
                            )}
                            noOptionsText="No se encontraron docentes asesores"
                        />
                        <TextField
                            fullWidth label="Resolución / N° de Designación *"
                            placeholder="Ej: RES-001-2025-UNT/DEII"
                            value={resolucionAsesor}
                            onChange={(e) => setResolucionAsesor(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenAsesorDialog(false)} color="inherit" sx={{ fontWeight: 600, color: '#64748b' }} disabled={asignandoAsesor}>Cancelar</Button>
                    <Button variant="contained" onClick={handleAsignarAsesor} disabled={!selectedAsesor || !resolucionAsesor.trim() || asignandoAsesor}
                        startIcon={asignandoAsesor ? <CircularProgress size={18} /> : null}
                        sx={{ px: 3, borderRadius: 2, fontWeight: 700, bgcolor: '#1a365d', '&:hover': { bgcolor: '#1e40af' } }}>
                        {asignandoAsesor ? 'Asignando...' : 'Asignar Asesor'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={validarDialog.open} onClose={() => setValidarDialog({ open: false, expediente: null })}
                maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: '#1a365d', color: 'white', py: 2.5, px: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Description sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700 }} variant="subtitle1">Validar Requisitos Administrativos</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Marque cada requisito antes de validar</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3, pt: '20px !important' }}>
                    {validarDialog.expediente && (
                        <Box>
                            <Box sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" color="text.secondary">Expediente</Typography>
                                <Typography sx={{ fontWeight: 700 }} variant="body1">{validarDialog.expediente.codigoExpediente}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {validarDialog.expediente.nombreEstudiante} {validarDialog.expediente.apellidoEstudiante}
                                </Typography>
                            </Box>

                            <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#1a365d', fontWeight: 700 }}>
                                Checklist de validación:
                            </Typography>

                            <Stack spacing={1}>
                                <FormControlLabel
                                    control={<Checkbox checked={validarChecks.empresaAsignada}
                                        onChange={(e) => setValidarChecks(prev => ({ ...prev, empresaAsignada: e.target.checked }))}
                                        color="success" size="small" />}
                                    label={<Typography variant="body2">Empresa receptora asignada y confirmada</Typography>}
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={validarChecks.sedeConfirmada}
                                        onChange={(e) => setValidarChecks(prev => ({ ...prev, sedeConfirmada: e.target.checked }))}
                                        color="success" size="small" />}
                                    label={<Typography variant="body2">Sede de práctica confirmada</Typography>}
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={validarChecks.convenioVigente}
                                        onChange={(e) => setValidarChecks(prev => ({ ...prev, convenioVigente: e.target.checked }))}
                                        color="success" size="small" />}
                                    label={<Typography variant="body2">Convenio con la empresa vigente</Typography>}
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={validarChecks.estudianteActivo}
                                        onChange={(e) => setValidarChecks(prev => ({ ...prev, estudianteActivo: e.target.checked }))}
                                        color="success" size="small" />}
                                    label={<Typography variant="body2">Estudiante/egresado activo en sistema</Typography>}
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={validarChecks.tipoPracticaDefinido}
                                        onChange={(e) => setValidarChecks(prev => ({ ...prev, tipoPracticaDefinido: e.target.checked }))}
                                        color="success" size="small" />}
                                    label={<Typography variant="body2">Tipo de práctica definido (Inicial / Final / Profesional)</Typography>}
                                />
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <TextField
                                label="Observaciones (opcional)"
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                value={validarObs}
                                onChange={(e) => setValidarObs(e.target.value)}
                                placeholder="Ej: Todos los documentos administrativos están completos..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setValidarDialog({ open: false, expediente: null })} color="inherit"
                        sx={{ fontWeight: 600, color: '#64748b' }}>
                        Cancelar
                    </Button>
                    <Button onClick={handleValidarExpediente} variant="contained" color="success"
                        disabled={!Object.values(validarChecks).every(Boolean)}
                        sx={{ px: 3, borderRadius: 2, fontWeight: 700, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
                        Validar y Marcar Listo para Carta
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

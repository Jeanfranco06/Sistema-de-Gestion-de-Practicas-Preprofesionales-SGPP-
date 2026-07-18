import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow,
    Chip, IconButton, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
    InputLabel, FormControl, InputAdornment, Tooltip, TablePagination, TableSortLabel,
    Avatar, Stack, CircularProgress, LinearProgress, Fade
} from '@mui/material';
import {
    Edit as EditIcon, Delete as DeleteIcon, NotificationsActive as NotificationsActiveIcon,
    Search as SearchIcon, Add as AddIcon, Handshake as HandshakeIcon,
    FilterList as FilterListIcon, Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Schedule as ScheduleIcon
} from '@mui/icons-material';
import { convenioApi, empresaApi } from '../../../api/sedesApi';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) || '';
    const second = parts.length > 1 ? parts[1]?.charAt(0) || '' : '';
    return (first + second).toUpperCase() || '?';
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
                {title && <Typography sx={{ fontWeight: 700 }} variant="h6" color="text.primary">{title}</Typography>}
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
                    <Typography sx={{ fontWeight: 800 }} variant="h5" color={colors.text}>{value}</Typography>
                    <Typography variant="caption" color={colors.text} sx={{ opacity: 0.8, fontWeight: 600 }}>{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    );
};

export const GestionConvenios = () => {
    const [searchParams] = useSearchParams();
    const empresaIdParam = searchParams.get('empresaId');

    const [convenios, setConvenios] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('fechaInicio');
    const [filterVigencia, setFilterVigencia] = useState('todos');

    const initialFormState = { empresaId: '', numeroConvenio: '', fechaInicio: '', fechaFin: '', objetivo: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadConvenios();
        loadExpiring();
        loadEmpresas();
    }, []);

    useEffect(() => {
        if (empresaIdParam && empresas.length > 0) {
            const exists = empresas.some(e => e.id === Number(empresaIdParam));
            if (exists) {
                setFormData(prev => ({ ...prev, empresaId: Number(empresaIdParam) }));
                setOpenDialog(true);
            }
        }
    }, [empresaIdParam, empresas]);

    const loadConvenios = async () => {
        try {
            setLoading(true);
            const res = await convenioApi.getAllActive();
            setConvenios(res.data);
        } catch (error) {
            console.error("Error loading convenios:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    const loadExpiring = async () => {
        try {
            const res = await convenioApi.getExpiring(30);
            setExpiring(res.data);
        } catch (error) {
            console.error("Error loading expiring convenios:", error);
        }
    };

    const loadEmpresas = async () => {
        try {
            const res = await empresaApi.getAll();
            setEmpresas(res.data.filter(emp => emp.activo && emp.validado));
        } catch (error) {
            console.error("Error loading empresas:", error);
        }
    };

    const handleOpenDialog = (convenio = null) => {
        if (convenio) {
            setIsEditing(true);
            setCurrentId(convenio.id);
            setFormData({
                empresaId: convenio.empresaId || '',
                numeroConvenio: convenio.numeroConvenio || '',
                fechaInicio: convenio.fechaInicio || '',
                fechaFin: convenio.fechaFin || '',
                objetivo: convenio.objetivo || ''
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData(initialFormState);
        }
        setErrors({});
        setOpenDialog(true);
    };

    const handleCloseDialog = async () => {
        if (formData.numeroConvenio || formData.objetivo) {
            const result = await MySwal.fire({
                title: '¿Descartar cambios?',
                text: 'Si cierras ahora perderás los datos ingresados.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, descartar',
                cancelButtonText: 'Continuar',
                confirmButtonColor: '#dc2626'
            });
            if (!result.isConfirmed) return;
        }
        setOpenDialog(false);
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.empresaId) tempErrors.empresaId = "Debe seleccionar una empresa";
        if (!formData.numeroConvenio) tempErrors.numeroConvenio = "El número es requerido";
        if (!formData.fechaInicio) tempErrors.fechaInicio = "Fecha de inicio requerida";
        if (!formData.fechaFin) tempErrors.fechaFin = "Fecha de fin requerida";
        if (formData.fechaInicio && formData.fechaFin && new Date(formData.fechaInicio) > new Date(formData.fechaFin)) {
            tempErrors.fechaFin = "La fecha fin debe ser posterior a la fecha inicio";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            setSubmitting(true);
            if (isEditing) {
                await convenioApi.update(currentId, formData);
            } else {
                await convenioApi.create(formData);
            }
            setOpenDialog(false);
            loadConvenios();
            loadExpiring();
            MySwal.fire({
                icon: 'success',
                title: isEditing ? '¡Convenio Actualizado!' : '¡Convenio Registrado!',
                text: 'El convenio se guardó correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error saving convenio:", error);
            const msg = error.response?.data?.message || error.response?.data?.error || "Error al guardar. Verifica que el número de convenio no esté duplicado.";
            MySwal.fire('Error al guardar', msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDisable = async (id) => {
        const result = await MySwal.fire({
            title: '¿Anular Convenio?',
            text: "Esta acción marcará el convenio como inactivo y no podrá utilizarse.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await convenioApi.disable(id);
                loadConvenios();
                loadExpiring();
                MySwal.fire('¡Anulado!', 'El convenio ha sido anulado correctamente.', 'success');
            } catch (error) {
                console.error("Error disabling convenio:", error);
                MySwal.fire('Error', 'No se pudo anular el convenio.', 'error');
            }
        }
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);

    const filteredConvenios = useMemo(() => {
        let filtered = convenios.filter(conv => {
            const matchesSearch = conv.numeroConvenio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  conv.razonSocialEmpresa?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterVigencia === 'todos' ||
                                  (filterVigencia === 'vigentes' && conv.vigente) ||
                                  (filterVigencia === 'vencidos' && !conv.vigente);
            return matchesSearch && matchesFilter;
        });

        filtered.sort((a, b) => {
            let aVal = a[orderBy] || '';
            let bVal = b[orderBy] || '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [convenios, searchTerm, filterVigencia, orderBy, order]);

    const paginatedConvenios = filteredConvenios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const kpis = useMemo(() => ({
        total: convenios.length,
        vigentes: convenios.filter(c => c.vigente).length,
        porVencer: expiring.length,
        vencidos: convenios.filter(c => !c.vigente).length,
    }), [convenios, expiring]);

    const stats = [
        { label: 'Total Convenios', value: kpis.total, icon: <HandshakeIcon fontSize="small" />, accent: 'blue' },
        { label: 'Vigentes', value: kpis.vigentes, icon: <CheckCircleIcon fontSize="small" />, accent: 'emerald' },
        { label: 'Por vencer (30d)', value: kpis.porVencer, icon: <ScheduleIcon fontSize="small" />, accent: 'orange' },
        { label: 'Vencidos', value: kpis.vencidos, icon: <CancelIcon fontSize="small" />, accent: 'violet' },
    ];

    const headCells = [
        { id: 'numeroConvenio', label: 'N° Convenio' },
        { id: 'razonSocialEmpresa', label: 'Empresa' },
        { id: 'fechaInicio', label: 'Vigencia' },
        { id: 'vigente', label: 'Estado' },
        { id: 'acciones', label: 'Acciones', sortable: false }
    ];

    if (initialLoad) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 3 }}>
                <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
                <Typography sx={{ fontWeight: 500 }} variant="body1" color="text.secondary">Cargando convenios...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%', pb: 8 }}>
            <Fade in timeout={600}>
                <Box>
                    <Paper elevation={0} sx={{ mb: 4, borderRadius: { xs: 3, md: 4 }, overflow: 'hidden', bgcolor: '#1a365d', color: 'white', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, p: { xs: 3, md: 5 }, gap: { xs: 4, md: 3 }, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', right: { xs: -20, md: 20 }, top: { xs: 10, md: -20 }, opacity: 0.1 }}>
                            <HandshakeIcon sx={{ fontSize: { xs: 150, md: 220 } }} />
                        </Box>
                        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5, fontWeight: 600, display: 'block', mb: 0.5 }}>Entidades Externas</Typography>
                            <Typography variant="h3"  sx={{ fontWeight: 800,  mt: 0, mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, wordBreak: 'break-word' }}>Gestión de Convenios</Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Registra y monitorea los convenios activos con las empresas aliadas.</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1, alignSelf: { xs: 'flex-end', md: 'center' } }}>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: 'white', color: '#1a365d', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 700, borderRadius: 2, px: 3, py: 1.5, whiteSpace: 'nowrap' }}>Nuevo Convenio</Button>
                            <Tooltip title="Actualizar Directorio">
                                <IconButton onClick={() => { loadConvenios(); loadExpiring(); }} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>

                    {expiring.length > 0 && (
                        <Alert
                            severity="warning"
                            icon={<NotificationsActiveIcon fontSize="inherit" />}
                            sx={{ mb: 4, borderRadius: 2, boxShadow: 1, border: '1px solid #ffcc80' }}
                        >
                            <strong>¡Atención!</strong> Hay {expiring.length} convenio(s) próximo(s) a vencer en los siguientes 30 días. Por favor, revise las renovaciones para no afectar las prácticas de los estudiantes.
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                        {stats.map((s, i) => <StatCard key={i} {...s} />)}
                    </Box>

                    <DashboardCard sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                size="small" variant="outlined"
                                placeholder="Buscar por número o empresa..."
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
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel sx={{ bgcolor: '#f8fafc', px: 0.5 }}>Estado de Convenio</InputLabel>
                                <Select
                                    value={filterVigencia}
                                    label="Estado de Convenio"
                                    onChange={(e) => setFilterVigencia(e.target.value)}
                                    sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
                                >
                                    <MenuItem value="todos">Todos los Estados</MenuItem>
                                    <MenuItem value="vigentes">Convenios Vigentes</MenuItem>
                                    <MenuItem value="vencidos">Convenios Vencidos</MenuItem>
                                </Select>
                            </FormControl>
                            <Tooltip title="Limpiar filtros">
                                <IconButton onClick={() => { setSearchTerm(''); setFilterVigencia('todos'); }} sx={{ bgcolor: '#f1f5f9', color: '#64748b', borderRadius: 2, '&:hover': { bgcolor: '#e2e8f0' } }}>
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
                            <Table sx={{ minWidth: 700 }}>
                                <TableHead sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <TableRow>
                                        {headCells.map((hc) => (
                                            <TableCell key={hc.id} sx={{ fontWeight: 700, color: '#475569', py: 2 }}>
                                                {hc.sortable !== false
                                                    ? <TableSortLabel active={orderBy === hc.id} direction={orderBy === hc.id ? order : 'asc'} onClick={() => handleSort(hc.id)}>{hc.label}</TableSortLabel>
                                                    : hc.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedConvenios.map((conv) => {
                                        const isExpiring = expiring.some(e => e.id === conv.id);
                                        return (
                                            <TableRow key={conv.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 40, height: 40, bgcolor: conv.vigente ? '#eff6ff' : '#fef3c7', color: conv.vigente ? '#1e40af' : '#92400e', fontWeight: 700, fontSize: 14, border: '1px solid', borderColor: conv.vigente ? '#bfdbfe' : '#fde68a' }}>
                                                            {getInitials(conv.numeroConvenio)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700 }} variant="body2" color="text.primary">{conv.numeroConvenio}</Typography>
                                                            {conv.objetivo && (
                                                                <Typography variant="caption" color="text.secondary" sx={{
                                                                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 250
                                                                }}>{conv.objetivo}</Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 600 }} variant="body2" color="primary">{conv.razonSocialEmpresa}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 500 }} variant="body2">{conv.fechaInicio} al {conv.fechaFin}</Typography>
                                                        {isExpiring && (
                                                            <Chip label="Por vencer" color="warning" size="small" sx={{ mt: 0.5, fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: conv.vigente ? '#10b981' : '#ef4444', boxShadow: `0 0 0 2px ${conv.vigente ? '#d1fae5' : '#fee2e2'}` }} />
                                                            <Typography sx={{ fontWeight: 700 }} variant="caption" color={conv.vigente ? '#10b981' : '#ef4444'}>{conv.vigente ? 'Vigente' : 'Vencido'}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                                        <Tooltip title="Editar Convenio" arrow>
                                                            <IconButton size="small" onClick={() => handleOpenDialog(conv)} sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {conv.activo && (
                                                            <Tooltip title="Anular Convenio" arrow>
                                                                <IconButton size="small" onClick={() => handleDisable(conv.id)} sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { color: '#dc2626', bgcolor: '#fee2e2' } }}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredConvenios.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                                                    <SearchIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                                                    <Typography sx={{ fontWeight: 600 }} variant="subtitle1">No se encontraron convenios</Typography>
                                                    <Typography variant="body2">Intenta ajustar los filtros o registra un nuevo convenio.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredConvenios.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Convenios por pág:"
                            sx={{ borderTop: '1px solid #e2e8f0' }}
                        />
                    </DashboardCard>
                </Box>
            </Fade>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', py: 2.5, px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <HandshakeIcon /> <Typography sx={{ fontWeight: 700 }} variant="h6">{isEditing ? 'Editar Convenio' : 'Registrar Nuevo Convenio'}</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField
                                select sx={{ flex: 2 }}
                                label="Empresa Aliada (Validada) *"
                                value={formData.empresaId}
                                onChange={e => setFormData({...formData, empresaId: e.target.value})}
                                disabled={isEditing}
                                error={!!errors.empresaId}
                                helperText={errors.empresaId || ' '}
                            >
                                {empresas.map(emp => (
                                    <MenuItem key={emp.id} value={emp.id}>{emp.razonSocial}</MenuItem>
                                ))}
                                {empresas.length === 0 && (
                                    <MenuItem disabled value="">No hay empresas validadas disponibles</MenuItem>
                                )}
                            </TextField>
                            <TextField
                                sx={{ flex: 1 }} label="Número de Convenio *" value={formData.numeroConvenio}
                                onChange={e => setFormData({...formData, numeroConvenio: e.target.value})}
                                error={!!errors.numeroConvenio} helperText={errors.numeroConvenio || ' '}
                                slotProps={{ htmlInput: { maxLength: 50 } }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField
                                sx={{ flex: 1 }} label="Fecha Inicio *" type="date"
                                slotProps={{ inputLabel: { shrink: true } }}
                                value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})}
                                error={!!errors.fechaInicio} helperText={errors.fechaInicio || ' '}
                            />
                            <TextField
                                sx={{ flex: 1 }} label="Fecha Fin *" type="date"
                                slotProps={{ inputLabel: { shrink: true } }}
                                value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})}
                                error={!!errors.fechaFin} helperText={errors.fechaFin || ' '}
                            />
                        </Box>

                        <TextField
                            fullWidth label="Objetivo / Descripción" multiline rows={4}
                            value={formData.objetivo} onChange={e => setFormData({...formData, objetivo: e.target.value})}
                            slotProps={{ htmlInput: { maxLength: 500 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 600, color: '#64748b' }} disabled={submitting}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} disabled={submitting} startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null} sx={{ px: 4, borderRadius: 2, fontWeight: 700, bgcolor: '#1a365d', '&:hover': { bgcolor: '#1e40af' } }}>
                        {submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

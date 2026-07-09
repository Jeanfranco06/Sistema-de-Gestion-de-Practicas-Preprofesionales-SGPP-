import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Tooltip,
    TablePagination, MenuItem, TableSortLabel, Avatar, Stack, CircularProgress, LinearProgress, Fade
} from '@mui/material';
import {
    BusinessCenter as BusinessIcon, Edit as EditIcon, Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon, Search as SearchIcon, Add as AddIcon,
    FilterList as FilterListIcon, Block as BlockIcon, Refresh as RefreshIcon,
    Badge as BadgeIcon, Business as BusinessIconAlt, Language as WebIcon,
    Phone as PhoneIcon, Email as EmailIcon, Handshake as HandshakeIcon
} from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import { empresaApi } from '../../../api/sedesApi';
import { useNavigate } from 'react-router-dom';
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

const statusColorMap = {
    validada: { chip: 'success', dot: '#10b981', shadow: '#d1fae5', label: 'Validada' },
    pendiente: { chip: 'warning', dot: '#f59e0b', shadow: '#fef3c7', label: 'Pendiente' },
    inactiva: { chip: 'error', dot: '#ef4444', shadow: '#fee2e2', label: 'Inactiva' }
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

export const GestionEmpresas = () => {
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('razonSocial');
    const [filterEstado, setFilterEstado] = useState('todos');

    const asyncTimers = useRef({});

    const initialFormState = {
        ruc: '', razonSocial: '', nombreComercial: '', direccion: '',
        distrito: '', provincia: '', departamento: '', pais: 'Perú',
        telefono: '', email: '', paginaWeb: '', sectorEconomico: '', tamanoEmpresa: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const scheduleRucCheck = (ruc) => {
        if (asyncTimers.current.ruc) {
            clearTimeout(asyncTimers.current.ruc);
        }
        if (!ruc || ruc.length !== 11) return;
        asyncTimers.current.ruc = setTimeout(async () => {
            if (formData.ruc !== ruc) return;
            try {
                const res = await empresaApi.checkRuc(ruc, isEditing ? currentId : undefined);
                const available = res.data?.available;
                setErrors(prev => {
                    const next = { ...prev };
                    if (!available && !next.ruc) {
                        next.ruc = 'El RUC ya está registrado por otra empresa';
                    } else if (available && prev.ruc === 'El RUC ya está registrado por otra empresa') {
                        delete next.ruc;
                    }
                    return next;
                });
            } catch (e) {
                // Silently ignore
            }
        }, 600);
    };

    useEffect(() => {
        loadEmpresas();
        return () => {
            Object.values(asyncTimers.current).forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { loadEmpresas(); }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filterEstado]);

    const loadEmpresas = async () => {
        try {
            setLoading(true);
            const res = await empresaApi.getAll();
            setEmpresas(res.data);
        } catch (error) {
            console.error("Error loading empresas:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    const handleOpenDialog = (empresa = null) => {
        if (empresa) {
            setIsEditing(true);
            setCurrentId(empresa.id);
            setFormData({
                ruc: empresa.ruc || '',
                razonSocial: empresa.razonSocial || '',
                nombreComercial: empresa.nombreComercial || '',
                direccion: empresa.direccion || '',
                distrito: empresa.distrito || '',
                provincia: empresa.provincia || '',
                departamento: empresa.departamento || '',
                pais: empresa.pais || 'Perú',
                telefono: empresa.telefono || '',
                email: empresa.email || '',
                paginaWeb: empresa.paginaWeb || '',
                sectorEconomico: empresa.sectorEconomico || '',
                tamanoEmpresa: empresa.tamanoEmpresa || ''
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData(initialFormState);
        }
        setErrors({});
        setTouched({});
        setOpenDialog(true);
    };

    const handleCloseDialog = async () => {
        if (formData.ruc || formData.razonSocial) {
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

    const validateField = (field, data) => {
        switch (field) {
            case 'ruc':
                if (!data.ruc) return 'El RUC es requerido';
                if (!/^\d{11}$/.test(data.ruc)) return 'El RUC debe tener exactamente 11 dígitos numéricos';
                return null;
            case 'razonSocial':
                if (!data.razonSocial?.trim()) return 'La razón social es requerida';
                return null;
            case 'sectorEconomico':
                if (!data.sectorEconomico?.trim()) return 'El sector económico es requerido';
                return null;
            case 'email':
                if (!data.email) return null;
                return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? 'Formato de correo inválido' : null;
            case 'telefono':
                if (!data.telefono) return null;
                if (!/^\d{9}$/.test(data.telefono.replace(/\D/g, ''))) return 'Debe tener al menos 9 dígitos';
                return null;
            case 'paginaWeb':
                if (!data.paginaWeb) return null;
                return !/^https?:\/\/.+/.test(data.paginaWeb) ? 'Debe comenzar con http:// o https://' : null;
            default:
                return null;
        }
    };

    const handleChange = (field, value) => {
        if (field === 'ruc' && asyncTimers.current.ruc) {
            clearTimeout(asyncTimers.current.ruc);
        }
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        if (touched[field] || errors[field]) {
            const error = validateField(field, newData);
            setErrors(prev => {
                const next = { ...prev };
                if (error) {
                    next[field] = error;
                } else {
                    delete next[field];
                }
                return next;
            });
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, formData);
        setErrors(prev => {
            const next = { ...prev };
            if (error) {
                next[field] = error;
            } else {
                delete next[field];
            }
            return next;
        });
        if (field === 'ruc' && formData.ruc?.length === 11 && !error) {
            scheduleRucCheck(formData.ruc);
        }
    };

    const validate = () => {
        const fields = ['ruc', 'razonSocial', 'sectorEconomico', 'email', 'telefono', 'paginaWeb'];
        let tempErrors = {};
        for (const f of fields) {
            const error = validateField(f, formData);
            if (error) tempErrors[f] = error;
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            setSubmitting(true);
            if (isEditing) {
                await empresaApi.update(currentId, formData);
            } else {
                await empresaApi.create(formData);
            }
            setOpenDialog(false);
            loadEmpresas();
            MySwal.fire({
                icon: 'success',
                title: isEditing ? '¡Empresa Actualizada!' : '¡Empresa Creada!',
                text: 'Los datos se guardaron correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || "Ya existe una empresa con ese RUC o hubo un error en el servidor.";
            MySwal.fire('Error al guardar', msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDisable = async (id) => {
        const result = await MySwal.fire({
            title: '¿Deshabilitar Empresa?',
            text: "Esta acción evitará que la empresa pueda participar en nuevos convenios.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, deshabilitar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                await empresaApi.disable(id);
                loadEmpresas();
                MySwal.fire('¡Deshabilitada!', 'La empresa ha sido deshabilitada correctamente.', 'success');
            } catch (error) {
                MySwal.fire('Error', 'No se pudo deshabilitar la empresa.', 'error');
            }
        }
    };

    const handleValidate = async (id) => {
        const result = await MySwal.fire({
            title: '¿Validar Empresa?',
            text: "Al validar esta empresa, confirmas que su perfil es legítimo.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#2e7d32',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, validar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                await empresaApi.validate(id);
                loadEmpresas();
                MySwal.fire('¡Validada!', 'La empresa ha sido validada exitosamente.', 'success');
            } catch (error) {
                MySwal.fire('Error', 'No se pudo validar la empresa.', 'error');
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
    const limpiarFiltros = () => { setSearchTerm(''); setFilterEstado('todos'); };

    const filteredEmpresas = useMemo(() => {
        let filtered = empresas.filter(emp => {
            const q = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                emp.razonSocial?.toLowerCase().includes(q) ||
                emp.ruc?.includes(q) ||
                emp.nombreComercial?.toLowerCase().includes(q);
            const matchesFilter = filterEstado === 'todos' ||
                (filterEstado === 'validadas' && emp.validado && emp.activo) ||
                (filterEstado === 'pendientes' && !emp.validado && emp.activo) ||
                (filterEstado === 'inactivas' && !emp.activo);
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
    }, [empresas, searchTerm, filterEstado, orderBy, order]);

    const paginatedEmpresas = filteredEmpresas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const kpis = useMemo(() => ({
        total: empresas.length,
        validadas: empresas.filter(e => e.validado && e.activo).length,
        pendientes: empresas.filter(e => !e.validado && e.activo).length,
        inactivas: empresas.filter(e => !e.activo).length,
    }), [empresas]);

    const stats = [
        { label: 'Total Empresas', value: kpis.total, icon: <BusinessIcon fontSize="small" />, accent: 'blue' },
        { label: 'Validadas', value: kpis.validadas, icon: <CheckCircleIcon fontSize="small" />, accent: 'emerald' },
        { label: 'Pendientes', value: kpis.pendientes, icon: <FilterListIcon fontSize="small" />, accent: 'violet' },
        { label: 'Inactivas', value: kpis.inactivas, icon: <BlockIcon fontSize="small" />, accent: 'orange' },
    ];

    const headCells = [
        { id: 'razonSocial', label: 'Empresa' },
        { id: 'ruc', label: 'RUC' },
        { id: 'sectorEconomico', label: 'Sector' },
        { id: 'email', label: 'Contacto' },
        { id: 'validado', label: 'Estado' },
        { id: 'acciones', label: 'Acciones', sortable: false }
    ];

    if (initialLoad) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 3 }}>
                <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>Cargando directorio de empresas...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%', pb: 8 }}>
            <Fade in timeout={600}>
                <Box>
                    <Paper elevation={0} sx={{ mb: 4, borderRadius: { xs: 3, md: 4 }, overflow: 'hidden', bgcolor: '#1a365d', color: 'white', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, p: { xs: 3, md: 5 }, gap: { xs: 4, md: 3 }, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', right: { xs: -20, md: 20 }, top: { xs: 10, md: -20 }, opacity: 0.1 }}>
                            <BusinessIconAlt sx={{ fontSize: { xs: 150, md: 220 } }} />
                        </Box>
                        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5, fontWeight: 600, display: 'block', mb: 0.5 }}>Entidades Externas</Typography>
                            <Typography variant="h3" fontWeight={800} sx={{ mt: 0, mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, wordBreak: 'break-word' }}>Gestión de Empresas</Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Administra el catálogo de empresas aliadas y valida sus perfiles.</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1, alignSelf: { xs: 'flex-end', md: 'center' } }}>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: 'white', color: '#1a365d', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 700, borderRadius: 2, px: 3, py: 1.5, whiteSpace: 'nowrap' }}>Nueva Empresa</Button>
                            <Tooltip title="Actualizar Directorio">
                                <IconButton onClick={loadEmpresas} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
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
                                placeholder="Buscar por razón social, RUC o nombre comercial..."
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
                            <TextField
                                select size="small"
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                sx={{ minWidth: { xs: '100%', sm: 180 } }}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><FilterListIcon color="action" fontSize="small" /></InputAdornment>,
                                        sx: { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
                                    }
                                }}
                            >
                                <MenuItem value="todos">Todos los estados</MenuItem>
                                <MenuItem value="validadas">Validadas</MenuItem>
                                <MenuItem value="pendientes">Pendientes</MenuItem>
                                <MenuItem value="inactivas">Inactivas</MenuItem>
                            </TextField>
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
                                    {paginatedEmpresas.map((emp) => {
                                        const statusKey = !emp.activo ? 'inactiva' : emp.validado ? 'validada' : 'pendiente';
                                        const sc = statusColorMap[statusKey];
                                        return (
                                            <TableRow key={emp.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 40, height: 40, bgcolor: emp.validado ? '#eff6ff' : '#fef3c7', color: emp.validado ? '#1e40af' : '#92400e', fontWeight: 700, fontSize: 14, border: '1px solid', borderColor: emp.validado ? '#bfdbfe' : '#fde68a' }}>
                                                            {getInitials(emp.razonSocial)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={700} color="text.primary">{emp.razonSocial}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{emp.nombreComercial || emp.sectorEconomico || '—'}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontFamily="monospace" fontWeight={600} color="text.secondary">{emp.ruc}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={emp.sectorEconomico || '—'} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#475569' }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">{emp.email || '—'}</Typography>
                                                    <Typography variant="caption" color="text.disabled">{emp.telefono || ''}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sc.dot, boxShadow: `0 0 0 2px ${sc.shadow}` }} />
                                                            <Typography variant="caption" fontWeight={700} color={sc.dot}>{sc.label}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                                        {!emp.validado && emp.activo && (
                                                            <Tooltip title="Validar Perfil" arrow>
                                                                <IconButton size="small" onClick={() => handleValidate(emp.id)} sx={{ color: '#10b981', bgcolor: '#ecfdf5', '&:hover': { color: '#059669', bgcolor: '#d1fae5' } }}>
                                                                    <CheckCircleIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip title="Editar Empresa" arrow>
                                                            <IconButton size="small" onClick={() => handleOpenDialog(emp)} sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {emp.activo && (
                                                            <Tooltip title="Deshabilitar Empresa" arrow>
                                                                <IconButton size="small" onClick={() => handleDisable(emp.id)} sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { color: '#dc2626', bgcolor: '#fee2e2' } }}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip title="Registrar Convenio" arrow>
                                                            <IconButton size="small" onClick={() => navigate(`/admin/convenios?empresaId=${emp.id}`)} sx={{ color: '#8b5cf6', bgcolor: '#f5f3ff', '&:hover': { color: '#7c3aed', bgcolor: '#ede9fe' } }}>
                                                                <HandshakeIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredEmpresas.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                                                    <SearchIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                                                    <Typography variant="subtitle1" fontWeight={600}>No se encontraron empresas</Typography>
                                                    <Typography variant="body2">Intenta ajustar los filtros o agrega una nueva empresa.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredEmpresas.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Empresas por pág:"
                            sx={{ borderTop: '1px solid #e2e8f0' }}
                        />
                    </DashboardCard>
                </Box>
            </Fade>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', py: 2.5, px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BadgeIcon /> <Typography variant="h6" fontWeight={700}>{isEditing ? 'Editar Empresa' : 'Registrar Nueva Empresa'}</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField
                                sx={{ flex: 1 }} label="RUC *" value={formData.ruc}
                                onChange={e => handleChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                onBlur={() => handleBlur('ruc')}
                                error={!!errors.ruc} helperText={errors.ruc || "11 dígitos numéricos"}
                                slotProps={{ htmlInput: { maxLength: 11 } }}
                            />
                            <TextField
                                sx={{ flex: 2 }} label="Razón Social *" value={formData.razonSocial}
                                onChange={e => handleChange('razonSocial', e.target.value)}
                                onBlur={() => handleBlur('razonSocial')}
                                error={!!errors.razonSocial} helperText={errors.razonSocial || ' '}
                                slotProps={{ htmlInput: { maxLength: 200 } }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Nombre Comercial" value={formData.nombreComercial} onChange={e => handleChange('nombreComercial', e.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
                            <TextField sx={{ flex: 1 }} label="Sector Económico *" value={formData.sectorEconomico} onChange={e => handleChange('sectorEconomico', e.target.value)} onBlur={() => handleBlur('sectorEconomico')} error={!!errors.sectorEconomico} helperText={errors.sectorEconomico || ' '} slotProps={{ htmlInput: { maxLength: 100 } }} />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5, mt: 1 }}>
                            Contacto y Ubicación
                        </Typography>

                        <TextField fullWidth label="Dirección" value={formData.direccion} onChange={e => handleChange('direccion', e.target.value)} slotProps={{ htmlInput: { maxLength: 300 } }} sx={{ mb: 1 }} helperText=" " />

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Distrito" value={formData.distrito} onChange={e => handleChange('distrito', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
                            <TextField sx={{ flex: 1 }} label="Provincia" value={formData.provincia} onChange={e => handleChange('provincia', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
                            <TextField sx={{ flex: 1 }} label="Departamento" value={formData.departamento} onChange={e => handleChange('departamento', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Teléfono" value={formData.telefono} onChange={e => handleChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))} onBlur={() => handleBlur('telefono')} error={!!errors.telefono} helperText={errors.telefono || '9 dígitos'} slotProps={{ htmlInput: { maxLength: 9 } }} />
                            <TextField sx={{ flex: 1 }} label="Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} error={!!errors.email} helperText={errors.email || ' '} slotProps={{ htmlInput: { maxLength: 100 } }} />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Página Web" value={formData.paginaWeb} onChange={e => handleChange('paginaWeb', e.target.value)} onBlur={() => handleBlur('paginaWeb')} error={!!errors.paginaWeb} helperText={errors.paginaWeb || 'Ej: https://ejemplo.com'} slotProps={{ htmlInput: { maxLength: 200 } }} />
                            <TextField sx={{ flex: 1 }} label="Tamaño Empresa" value={formData.tamanoEmpresa} onChange={e => handleChange('tamanoEmpresa', e.target.value)} placeholder="Ej: Grande, Pyme" slotProps={{ htmlInput: { maxLength: 50 } }} helperText=" " />
                        </Box>
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
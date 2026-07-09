import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel,
    FormControl, InputAdornment, Tooltip, TablePagination, TableSortLabel, Drawer, Divider, Alert, CircularProgress,
    Checkbox, Stack, Avatar, LinearProgress, Fade
} from '@mui/material';
import {
    Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
    Add as AddIcon, FilterList as FilterListIcon, Refresh as RefreshIcon,
    LocationCity as LocationCityIcon, Visibility as VisibilityIcon,
    Assignment as AssignmentIcon, People as PeopleIcon, School as SchoolIcon,
    CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Warning as WarningIcon,
    Business as BusinessIconAlt, Map as MapIcon
} from '@mui/icons-material';
import { sedeApi, empresaApi } from '../../../api/sedesApi';
import { validacionApi } from '../../../api/validacionesApi';
import { useAuth } from '../../../auth/AuthContext';
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
    ACTIVA: { chip: 'success', dot: '#10b981', shadow: '#d1fae5', label: 'Activa' },
    INACTIVA: { chip: 'error', dot: '#ef4444', shadow: '#fee2e2', label: 'Inactiva' }
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

export const GestionSedes = () => {
    const { user } = useAuth();
    const [sedes, setSedes] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [selectedSede, setSelectedSede] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [filtroEstadoSede, setFiltroEstadoSede] = useState('todos');
    const [filtroValidacion, setFiltroValidacion] = useState('todos');
    const [filtroConvenio, setFiltroConvenio] = useState('todos');
    const [filtroTutor, setFiltroTutor] = useState('todos');
    const [filtroElegible, setFiltroElegible] = useState('todos');

    const [validacionDialogOpen, setValidacionDialogOpen] = useState(false);
    const [validacionSede, setValidacionSede] = useState(null);
    const [validacionActual, setValidacionActual] = useState(null);
    const [historialValidaciones, setHistorialValidaciones] = useState([]);
    const [validacionForm, setValidacionForm] = useState({
        sedeId: '', criterioInfraestructuraCumple: false, criterioInfraestructuraObservaciones: '',
        criterioSeguridadSaludCumple: false, criterioSeguridadSaludObservaciones: '',
        criterioAfinidadCarreraCumple: false, criterioAfinidadCarreraObservaciones: '',
        criterioTutorDesignadoCumple: false, criterioTutorDesignadoObservaciones: '',
        criterioConvenioAcuerdoCumple: false, criterioConvenioAcuerdoObservaciones: '',
        resultadoValidacion: 'OBSERVADA', observacionesGenerales: '',
        fechaVigenciaDesde: '', fechaVigenciaHasta: ''
    });
    const [loadingValidacion, setLoadingValidacion] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('nombreSede');

    const [formData, setFormData] = useState({
        empresaId: '', nombreSede: '', direccion: '', distrito: '',
        provincia: '', departamento: '', telefono: '', email: '',
        nombreContacto: '', cargoContacto: '', telefonoContacto: '',
        emailContacto: '', capacidadMaxima: '',
        tipoEntidad: '', areaUnidad: '', descripcionGeneral: '',
        actividadesPrincipales: '', riesgosRelevantes: '',
        nombreTutorEmpresa: '', cargoTutorEmpresa: '', correoTutorEmpresa: '',
        telefonoTutorEmpresa: '', estadoSede: 'ACTIVA'
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const asyncTimers = useRef({});

    const clearNombreTimer = () => {
        if (asyncTimers.current.nombre) {
            clearTimeout(asyncTimers.current.nombre);
            asyncTimers.current.nombre = null;
        }
    };

    const scheduleNombreCheck = (nombre) => {
        clearNombreTimer();
        if (!nombre || nombre.length < 2 || !formData.empresaId) return;
        asyncTimers.current.nombre = setTimeout(async () => {
            if (formData.nombreSede !== nombre) return;
            try {
                const res = await sedeApi.checkNombre(nombre, formData.empresaId, isEditing ? currentId : undefined);
                const available = res.data?.available;
                setErrors(prev => {
                    const next = { ...prev };
                    if (!available) {
                        next.nombreSede = 'Ya existe una sede con ese nombre en esta empresa';
                    } else if (prev.nombreSede === 'Ya existe una sede con ese nombre en esta empresa') {
                        delete next.nombreSede;
                    }
                    return next;
                });
            } catch (e) {
                // Silently ignore
            }
        }, 600);
    };

    useEffect(() => {
        loadSedes();
        loadEmpresas();
        return () => {
            Object.values(asyncTimers.current).forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { loadSedes(); }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filtroEstadoSede, filtroValidacion, filtroConvenio, filtroTutor, filtroElegible]);

    const loadSedes = async () => {
        try {
            setLoading(true);
            const res = await sedeApi.getCatalogo();
            setSedes(res.data);
        } catch (error) {
            console.error("Error loading sedes:", error);
            MySwal.fire('Error', 'No se pudieron cargar las sedes.', 'error');
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    const loadEmpresas = async () => {
        try {
            const res = await empresaApi.getAll();
            setEmpresas(res.data.filter(emp => emp.activo));
        } catch (error) {
            console.error("Error loading empresas:", error);
        }
    };

    const loadSedeById = async (id) => {
        try {
            const res = await sedeApi.getDetalle(id);
            const s = res.data;
            setFormData({
                empresaId: s.empresaId || '',
                nombreSede: s.nombreSede || '',
                direccion: s.direccion || '',
                distrito: s.distrito || '',
                provincia: s.provincia || '',
                departamento: s.departamento || '',
                telefono: s.telefono || '',
                email: s.email || '',
                nombreContacto: s.nombreContacto || '',
                cargoContacto: s.cargoContacto || '',
                telefonoContacto: s.telefonoContacto || '',
                emailContacto: s.emailContacto || '',
                capacidadMaxima: s.capacidadMaxima || '',
                tipoEntidad: s.tipoEntidad || '',
                areaUnidad: s.areaDisponible || '',
                descripcionGeneral: s.descripcion || '',
                actividadesPrincipales: s.actividadesPrincipales || '',
                riesgosRelevantes: s.riesgosRelevantes || '',
                nombreTutorEmpresa: s.nombreTutorEmpresa || '',
                cargoTutorEmpresa: s.cargoTutorEmpresa || '',
                correoTutorEmpresa: s.correoTutorEmpresa || '',
                telefonoTutorEmpresa: s.telefonoTutorEmpresa || '',
                estadoSede: s.estadoSede || 'ACTIVA'
            });
        } catch (error) {
            console.error("Error loading sede details:", error);
        }
    };

    const validateField = (field, data) => {
        switch (field) {
            case 'empresaId':
                return !data.empresaId ? 'Debe seleccionar una empresa' : null;
            case 'nombreSede':
                if (!data.nombreSede?.trim()) return 'El nombre de sede es requerido';
                if (data.nombreSede.length > 200) return 'No debe exceder 200 caracteres';
                return null;
            case 'direccion':
                if (!data.direccion?.trim()) return 'La dirección es requerida';
                return null;
            case 'distrito':
                if (!data.distrito?.trim()) return 'El distrito es requerido';
                return null;
            case 'email':
            case 'emailContacto':
            case 'correoTutorEmpresa':
                if (!data[field]) return null;
                return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field]) ? 'Formato de correo inválido' : null;
            default:
                return null;
        }
    };

    const handleChange = (field, value) => {
        if (field === 'nombreSede' && asyncTimers.current.nombre) {
            clearNombreTimer();
        }
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        if (touched[field] || errors[field]) {
            const error = validateField(field, newData);
            setErrors(prev => {
                const next = { ...prev };
                if (error) next[field] = error;
                else delete next[field];
                return next;
            });
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, formData);
        setErrors(prev => {
            const next = { ...prev };
            if (error) next[field] = error;
            else delete next[field];
            return next;
        });
        if (field === 'nombreSede' && formData.nombreSede?.trim().length >= 2 && !error) {
            scheduleNombreCheck(formData.nombreSede);
        }
    };

    const handleOpenDialog = (sede = null) => {
        if (sede) {
            setIsEditing(true);
            setCurrentId(sede.id);
            loadSedeById(sede.id);
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                empresaId: '', nombreSede: '', direccion: '', distrito: '',
                provincia: '', departamento: '', telefono: '', email: '',
                nombreContacto: '', cargoContacto: '', telefonoContacto: '',
                emailContacto: '', capacidadMaxima: '',
                tipoEntidad: '', areaUnidad: '', descripcionGeneral: '',
                actividadesPrincipales: '', riesgosRelevantes: '',
                nombreTutorEmpresa: '', cargoTutorEmpresa: '', correoTutorEmpresa: '',
                telefonoTutorEmpresa: '', estadoSede: 'ACTIVA'
            });
        }
        setErrors({});
        setTouched({});
        setOpenDialog(true);
    };

    const handleCloseDialog = async () => {
        if (formData.nombreSede || formData.direccion || formData.distrito) {
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
        const fields = ['empresaId', 'nombreSede', 'direccion', 'distrito', 'email', 'emailContacto', 'correoTutorEmpresa'];
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
                await sedeApi.update(currentId, formData);
            } else {
                await sedeApi.create(formData);
            }
            setOpenDialog(false);
            loadSedes();
            MySwal.fire({
                icon: 'success',
                title: isEditing ? '¡Sede Actualizada!' : '¡Sede Creada!',
                text: 'Los datos se guardaron correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error saving sede:", error);
            const msg = error.response?.data?.message || error.response?.data?.error || "Ya existe una sede con ese nombre en esta empresa o hubo un error en el servidor.";
            MySwal.fire('Error al guardar', msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDisable = async (id) => {
        const result = await MySwal.fire({
            title: '¿Deshabilitar Sede?',
            text: "Esta sede ya no estará disponible para futuros convenios.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, deshabilitar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                await sedeApi.disable(id);
                loadSedes();
                MySwal.fire('¡Deshabilitada!', 'La sede ha sido deshabilitada correctamente.', 'success');
            } catch (error) {
                console.error("Error disabling sede:", error);
                MySwal.fire('Error', 'No se pudo deshabilitar la sede.', 'error');
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

    const handleVerDetalle = async (sede) => {
        try {
            setLoading(true);
            const response = await sedeApi.getDetalle(sede.id);
            setSelectedSede(response.data);
            setDrawerOpen(true);
        } catch (error) {
            console.error("Error cargando detalle:", error);
            MySwal.fire('Error', 'No se pudo cargar el detalle de la sede.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerExpedientes = (sede) => {
        MySwal.fire({
            title: 'Expedientes de la Sede',
            text: `Funcionalidad para ver expedientes de ${sede.nombreSede} pendiente de implementar.`,
            icon: 'info'
        });
    };

    const handleGestionarTutores = (sede) => {
        MySwal.fire({
            title: 'Gestión de Tutores',
            text: `Funcionalidad para gestionar tutores de ${sede.nombreSede} pendiente de implementar.`,
            icon: 'info'
        });
    };

    const handleGestionarValidacion = async (sede) => {
        setValidacionSede(sede);
        setValidacionForm(prev => ({ ...prev, sedeId: sede.id }));
        setLoadingValidacion(true);
        setValidacionDialogOpen(true);

        try {
            const [vigenteRes, historialRes] = await Promise.all([
                validacionApi.getVigente(sede.id).catch(() => null),
                validacionApi.getHistorial(sede.id).catch(() => [])
            ]);
            const vigente = vigenteRes?.data || null;
            const historial = Array.isArray(historialRes?.data) ? historialRes.data : [];
            setValidacionActual(vigente);
            setHistorialValidaciones(historial);

            if (vigente) {
                setValidacionForm({
                    sedeId: sede.id,
                    criterioInfraestructuraCumple: vigente.criterioInfraestructuraCumple || false,
                    criterioInfraestructuraObservaciones: vigente.criterioInfraestructuraObservaciones || '',
                    criterioSeguridadSaludCumple: vigente.criterioSeguridadSaludCumple || false,
                    criterioSeguridadSaludObservaciones: vigente.criterioSeguridadSaludObservaciones || '',
                    criterioAfinidadCarreraCumple: vigente.criterioAfinidadCarreraCumple || false,
                    criterioAfinidadCarreraObservaciones: vigente.criterioAfinidadCarreraObservaciones || '',
                    criterioTutorDesignadoCumple: vigente.criterioTutorDesignadoCumple || false,
                    criterioTutorDesignadoObservaciones: vigente.criterioTutorDesignadoObservaciones || '',
                    criterioConvenioAcuerdoCumple: vigente.criterioConvenioAcuerdoCumple || false,
                    criterioConvenioAcuerdoObservaciones: vigente.criterioConvenioAcuerdoObservaciones || '',
                    resultadoValidacion: vigente.resultadoValidacion || 'OBSERVADA',
                    observacionesGenerales: vigente.observacionesGenerales || '',
                    fechaVigenciaDesde: vigente.fechaVigenciaDesde || '',
                    fechaVigenciaHasta: vigente.fechaVigenciaHasta || ''
                });
            }
        } catch (err) {
            console.error("Error cargando validación:", err);
        } finally {
            setLoadingValidacion(false);
        }
    };

    const handleValidacionSave = async () => {
        try {
            const payload = {
                ...validacionForm,
                usuarioValidadorId: user?.id || null
            };

            if (validacionActual?.id) {
                await validacionApi.update(validacionActual.id, payload);
            } else {
                await validacionApi.create(payload);
            }

            MySwal.fire({ icon: 'success', title: '¡Validación guardada!', timer: 2000, showConfirmButton: false });
            setValidacionDialogOpen(false);
            loadSedes();
        } catch (err) {
            console.error("Error guardando validación:", err);
            MySwal.fire('Error', err.response?.data?.message || 'No se pudo guardar la validación.', 'error');
        }
    };

    const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFiltroEstadoSede('todos');
        setFiltroValidacion('todos');
        setFiltroConvenio('todos');
        setFiltroTutor('todos');
        setFiltroElegible('todos');
    };

    const filteredSedes = useMemo(() => {
        let filtered = sedes.filter(sede => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                sede.nombreSede?.toLowerCase().includes(searchLower) ||
                sede.razonSocialEmpresa?.toLowerCase().includes(searchLower) ||
                sede.distrito?.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            if (filtroEstadoSede !== 'todos' && sede.estadoSede !== filtroEstadoSede) return false;

            if (filtroValidacion === 'aprobada' && sede.resultadoValidacion !== 'APROBADA') return false;
            if (filtroValidacion === 'observada' && sede.resultadoValidacion !== 'OBSERVADA') return false;
            if (filtroValidacion === 'rechazada' && sede.resultadoValidacion !== 'RECHAZADA') return false;
            if (filtroValidacion === 'no_validada' && sede.tieneValidacionVigente) return false;

            if (filtroConvenio === 'vigente' && !sede.tieneConvenioVigente) return false;
            if (filtroConvenio === 'no_vigente' && sede.tieneConvenioVigente) return false;

            if (filtroTutor === 'con_tutor' && !sede.tieneTutorActivo) return false;
            if (filtroTutor === 'sin_tutor' && sede.tieneTutorActivo) return false;

            if (filtroElegible === 'elegible' && !sede.esElegible) return false;
            if (filtroElegible === 'no_elegible' && sede.esElegible) return false;

            return true;
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
    }, [sedes, searchTerm, filtroEstadoSede, filtroValidacion, filtroConvenio, filtroTutor, filtroElegible, orderBy, order]);

    const paginatedSedes = filteredSedes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const kpis = useMemo(() => ({
        total: sedes.length,
        activas: sedes.filter(s => s.estadoSede === 'ACTIVA').length,
        validadas: sedes.filter(s => s.resultadoValidacion === 'APROBADA').length,
        conConvenio: sedes.filter(s => s.tieneConvenioVigente).length,
    }), [sedes]);

    const stats = [
        { label: 'Total Sedes', value: kpis.total, icon: <LocationCityIcon fontSize="small" />, accent: 'blue' },
        { label: 'Sedes Activas', value: kpis.activas, icon: <CheckCircleIcon fontSize="small" />, accent: 'emerald' },
        { label: 'Validadas', value: kpis.validadas, icon: <AssignmentIcon fontSize="small" />, accent: 'violet' },
        { label: 'Con Convenio', value: kpis.conConvenio, icon: <BusinessIconAlt fontSize="small" />, accent: 'orange' },
    ];

    const getValidacionBadgeColor = (sede) => {
        if (!sede.tieneValidacionVigente) return 'default';
        switch (sede.resultadoValidacion) {
            case 'APROBADA': return 'success';
            case 'OBSERVADA': return 'warning';
            case 'RECHAZADA': return 'error';
            default: return 'default';
        }
    };

    const getValidacionIcon = (sede) => {
        if (!sede.tieneValidacionVigente) return <CancelIcon fontSize="small" />;
        switch (sede.resultadoValidacion) {
            case 'APROBADA': return <CheckCircleIcon fontSize="small" />;
            case 'OBSERVADA': return <WarningIcon fontSize="small" />;
            case 'RECHAZADA': return <CancelIcon fontSize="small" />;
            default: return <CancelIcon fontSize="small" />;
        }
    };

    const headCells = [
        { id: 'nombreSede', label: 'Sede' },
        { id: 'razonSocialEmpresa', label: 'Empresa' },
        { id: 'distrito', label: 'Ubicación' },
        { id: 'estadoSede', label: 'Estado' },
        { id: 'resultadoValidacion', label: 'Validación' },
        { id: 'tieneConvenioVigente', label: 'Convenio' },
        { id: 'esElegible', label: 'Elegible' },
        { id: 'capacidadMaxima', label: 'Capacidad' },
        { id: 'acciones', label: 'Acciones', sortable: false }
    ];

    if (initialLoad) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 3 }}>
                <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>Cargando catálogo de sedes...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%', pb: 8 }}>
            <Fade in timeout={600}>
                <Box>
                    <Paper elevation={0} sx={{ mb: 4, borderRadius: { xs: 3, md: 4 }, overflow: 'hidden', bgcolor: '#1a365d', color: 'white', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, p: { xs: 3, md: 5 }, gap: { xs: 4, md: 3 }, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', right: { xs: -20, md: 20 }, top: { xs: 10, md: -20 }, opacity: 0.1 }}>
                            <LocationCityIcon sx={{ fontSize: { xs: 150, md: 220 } }} />
                        </Box>
                        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5, fontWeight: 600, display: 'block', mb: 0.5 }}>Módulo de Sedes</Typography>
                            <Typography variant="h3" fontWeight={800} sx={{ mt: 0, mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, wordBreak: 'break-word' }}>Gestión de Sedes</Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Administra las sedes operativas vinculadas a las empresas aliadas.</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1, alignSelf: { xs: 'flex-end', md: 'center' } }}>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: 'white', color: '#1a365d', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 700, borderRadius: 2, px: 3, py: 1.5, whiteSpace: 'nowrap' }}>Nueva Sede</Button>
                            <Tooltip title="Actualizar Catálogo">
                                <IconButton onClick={loadSedes} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
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
                                placeholder="Buscar sede, empresa o distrito..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 250 } }}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                                        sx: { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
                                    }
                                }}
                            />
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel sx={{ bgcolor: '#f8fafc', px: 0.5 }}>Estado</InputLabel>
                                <Select value={filtroEstadoSede} label="Estado" onChange={(e) => setFiltroEstadoSede(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                                    <MenuItem value="todos">Todos</MenuItem>
                                    <MenuItem value="ACTIVA">Activa</MenuItem>
                                    <MenuItem value="INACTIVA">Inactiva</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel sx={{ bgcolor: '#f8fafc', px: 0.5 }}>Validación</InputLabel>
                                <Select value={filtroValidacion} label="Validación" onChange={(e) => setFiltroValidacion(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                                    <MenuItem value="todos">Todos</MenuItem>
                                    <MenuItem value="aprobada">Aprobada</MenuItem>
                                    <MenuItem value="observada">Observada</MenuItem>
                                    <MenuItem value="rechazada">Rechazada</MenuItem>
                                    <MenuItem value="no_validada">No validada</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel sx={{ bgcolor: '#f8fafc', px: 0.5 }}>Convenio</InputLabel>
                                <Select value={filtroConvenio} label="Convenio" onChange={(e) => setFiltroConvenio(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                                    <MenuItem value="todos">Todos</MenuItem>
                                    <MenuItem value="vigente">Vigente</MenuItem>
                                    <MenuItem value="no_vigente">No vigente</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 110 }}>
                                <InputLabel sx={{ bgcolor: '#f8fafc', px: 0.5 }}>Tutor</InputLabel>
                                <Select value={filtroTutor} label="Tutor" onChange={(e) => setFiltroTutor(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                                    <MenuItem value="todos">Todos</MenuItem>
                                    <MenuItem value="con_tutor">Con tutor</MenuItem>
                                    <MenuItem value="sin_tutor">Sin tutor</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 110 }}>
                                <InputLabel sx={{ bgcolor: '#f8fafc', px: 0.5 }}>Elegible</InputLabel>
                                <Select value={filtroElegible} label="Elegible" onChange={(e) => setFiltroElegible(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                                    <MenuItem value="todos">Todos</MenuItem>
                                    <MenuItem value="elegible">Elegible</MenuItem>
                                    <MenuItem value="no_elegible">No elegible</MenuItem>
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
                            <Table sx={{ minWidth: 900 }}>
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
                                    {paginatedSedes.map((sede) => {
                                        const sc = statusColorMap[sede.estadoSede] || statusColorMap.INACTIVA;
                                        return (
                                            <TableRow key={sede.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 40, height: 40, bgcolor: sede.estadoSede === 'ACTIVA' ? '#eff6ff' : '#fef3c7', color: sede.estadoSede === 'ACTIVA' ? '#1e40af' : '#92400e', fontWeight: 700, fontSize: 14, border: '1px solid', borderColor: sede.estadoSede === 'ACTIVA' ? '#bfdbfe' : '#fde68a' }}>
                                                            {getInitials(sede.nombreSede)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={700} color="text.primary">{sede.nombreSede}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{sede.direccion || '—'}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600} color="primary">{sede.razonSocialEmpresa || '—'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <MapIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                                                        <Typography variant="body2" color="text.secondary">{sede.distrito || '—'}</Typography>
                                                    </Box>
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
                                                    <Chip
                                                        label={sede.resultadoValidacion || 'No validada'}
                                                        size="small"
                                                        color={getValidacionBadgeColor(sede)}
                                                        icon={getValidacionIcon(sede)}
                                                        sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: 1.5 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={sede.tieneConvenioVigente ? 'Vigente' : 'No vigente'}
                                                        size="small"
                                                        color={sede.tieneConvenioVigente ? 'success' : 'warning'}
                                                        sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: 1.5, bgcolor: sede.tieneConvenioVigente ? '#d1fae5' : '#fef3c7', color: sede.tieneConvenioVigente ? '#065f46' : '#92400e' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {sede.esElegible ? (
                                                        <Chip label="Elegible" size="small" color="success" sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: 1.5 }} />
                                                    ) : (
                                                        <Tooltip title={sede.motivoNoElegible || 'No cumple requisitos'} arrow>
                                                            <Chip label="No elegible" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: 1.5, borderColor: '#fca5a5', color: '#dc2626' }} />
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={sede.capacidadMaxima || 0} size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: 1.5, minWidth: 40 }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                                        <Tooltip title="Ver Detalle" arrow>
                                                            <IconButton size="small" onClick={() => handleVerDetalle(sede)} sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }}>
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar Sede" arrow>
                                                            <IconButton size="small" onClick={() => handleOpenDialog(sede)} sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Gestionar Validación" arrow>
                                                            <IconButton size="small" onClick={() => handleGestionarValidacion(sede)} sx={{ color: '#8b5cf6', bgcolor: '#f5f3ff', '&:hover': { color: '#7c3aed', bgcolor: '#ede9fe' } }}>
                                                                <AssignmentIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Gestionar Tutores" arrow>
                                                            <IconButton size="small" onClick={() => handleGestionarTutores(sede)} sx={{ color: '#0891b2', bgcolor: '#ecfeff', '&:hover': { color: '#0e7490', bgcolor: '#cffafe' } }}>
                                                                <PeopleIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Ver Expedientes" arrow>
                                                            <IconButton size="small" onClick={() => handleVerExpedientes(sede)} sx={{ color: '#d97706', bgcolor: '#fffbeb', '&:hover': { color: '#b45309', bgcolor: '#fef3c7' } }}>
                                                                <SchoolIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {sede.activo && (
                                                            <Tooltip title="Deshabilitar Sede" arrow>
                                                                <IconButton size="small" onClick={() => handleDisable(sede.id)} sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { color: '#dc2626', bgcolor: '#fee2e2' } }}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredSedes.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                                                    <SearchIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                                                    <Typography variant="subtitle1" fontWeight={600}>No se encontraron sedes</Typography>
                                                    <Typography variant="body2">Intenta ajustar los filtros o agrega una nueva sede.</Typography>
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
                            count={filteredSedes.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Sedes por pág:"
                            sx={{ borderTop: '1px solid #e2e8f0' }}
                        />
                    </DashboardCard>
                </Box>
            </Fade>

            {/* Dialog de crear/editar */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', py: 2.5, px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LocationCityIcon /> <Typography variant="h6" fontWeight={700}>{isEditing ? 'Editar Sede' : 'Registrar Nueva Sede'}</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField
                            select fullWidth label="Empresa Aliada *"
                            value={formData.empresaId}
                            onChange={e => handleChange('empresaId', e.target.value)}
                            onBlur={() => handleBlur('empresaId')}
                            disabled={isEditing}
                            error={!!errors.empresaId}
                            helperText={errors.empresaId || ' '}
                        >
                            {empresas.map(emp => (
                                <MenuItem key={emp.id} value={emp.id}>{emp.razonSocial} (RUC: {emp.ruc})</MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField
                                sx={{ flex: 2 }} label="Nombre de la Sede *" value={formData.nombreSede}
                                onChange={e => handleChange('nombreSede', e.target.value)}
                                onBlur={() => handleBlur('nombreSede')}
                                error={!!errors.nombreSede} helperText={errors.nombreSede || 'Nombre único dentro de la empresa'}
                                slotProps={{ htmlInput: { maxLength: 200 } }}
                            />
                            <TextField
                                sx={{ flex: 1 }} label="Capacidad Máxima" type="number"
                                value={formData.capacidadMaxima}
                                onChange={e => handleChange('capacidadMaxima', e.target.value)}
                                helperText="Estudiantes"
                            />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5, mt: 1 }}>
                            Ubicación
                        </Typography>

                        <TextField fullWidth label="Dirección *" value={formData.direccion}
                            onChange={e => handleChange('direccion', e.target.value)}
                            onBlur={() => handleBlur('direccion')}
                            error={!!errors.direccion} helperText={errors.direccion || ' '}
                            slotProps={{ htmlInput: { maxLength: 300 } }}
                        />

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Distrito *" value={formData.distrito}
                                onChange={e => handleChange('distrito', e.target.value)}
                                onBlur={() => handleBlur('distrito')}
                                error={!!errors.distrito} helperText={errors.distrito || ' '}
                            />
                            <TextField sx={{ flex: 1 }} label="Provincia" value={formData.provincia}
                                onChange={e => handleChange('provincia', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Departamento" value={formData.departamento}
                                onChange={e => handleChange('departamento', e.target.value)}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Teléfono" value={formData.telefono}
                                onChange={e => handleChange('telefono', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Email" type="email" value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                error={!!errors.email} helperText={errors.email || ' '}
                            />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Contacto en Sede
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Nombre del Contacto" value={formData.nombreContacto}
                                onChange={e => handleChange('nombreContacto', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Cargo del Contacto" value={formData.cargoContacto}
                                onChange={e => handleChange('cargoContacto', e.target.value)}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Teléfono de Contacto" value={formData.telefonoContacto}
                                onChange={e => handleChange('telefonoContacto', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Email de Contacto" type="email" value={formData.emailContacto}
                                onChange={e => handleChange('emailContacto', e.target.value)}
                                onBlur={() => handleBlur('emailContacto')}
                                error={!!errors.emailContacto} helperText={errors.emailContacto || ' '}
                            />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Perfil de Sede
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField
                                select fullWidth label="Tipo de Entidad"
                                value={formData.tipoEntidad}
                                onChange={e => handleChange('tipoEntidad', e.target.value)}
                            >
                                <MenuItem value="">Seleccione...</MenuItem>
                                <MenuItem value="PÚBLICA">Pública</MenuItem>
                                <MenuItem value="PRIVADA">Privada</MenuItem>
                                <MenuItem value="MIXTA">Mixta</MenuItem>
                            </TextField>
                            <TextField sx={{ flex: 1 }} label="Área / Unidad" value={formData.areaUnidad}
                                onChange={e => handleChange('areaUnidad', e.target.value)}
                                placeholder="Ej: Producción, Logística"
                            />
                        </Box>

                        <TextField fullWidth label="Descripción General" multiline rows={3}
                            value={formData.descripcionGeneral}
                            onChange={e => handleChange('descripcionGeneral', e.target.value)}
                            placeholder="Describir las actividades y funciones de la sede"
                        />
                        <TextField fullWidth label="Actividades Principales" multiline rows={2}
                            value={formData.actividadesPrincipales}
                            onChange={e => handleChange('actividadesPrincipales', e.target.value)}
                        />
                        <TextField fullWidth label="Riesgos Relevantes" multiline rows={2}
                            value={formData.riesgosRelevantes}
                            onChange={e => handleChange('riesgosRelevantes', e.target.value)}
                        />

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Tutor de Empresa (designado por la entidad)
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 2 }} label="Nombre del Tutor" value={formData.nombreTutorEmpresa}
                                onChange={e => handleChange('nombreTutorEmpresa', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Cargo del Tutor" value={formData.cargoTutorEmpresa}
                                onChange={e => handleChange('cargoTutorEmpresa', e.target.value)}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 2 }} label="Correo del Tutor" type="email" value={formData.correoTutorEmpresa}
                                onChange={e => handleChange('correoTutorEmpresa', e.target.value)}
                                onBlur={() => handleBlur('correoTutorEmpresa')}
                                error={!!errors.correoTutorEmpresa} helperText={errors.correoTutorEmpresa || ' '}
                            />
                            <TextField sx={{ flex: 1 }} label="Teléfono del Tutor" value={formData.telefonoTutorEmpresa}
                                onChange={e => handleChange('telefonoTutorEmpresa', e.target.value)}
                            />
                        </Box>

                        <TextField select fullWidth label="Estado de la Sede"
                            value={formData.estadoSede}
                            onChange={e => handleChange('estadoSede', e.target.value)}
                        >
                            <MenuItem value="ACTIVA">Activa</MenuItem>
                            <MenuItem value="INACTIVA">Inactiva</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 600, color: '#64748b' }} disabled={submitting}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} disabled={submitting} startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null} sx={{ px: 4, borderRadius: 2, fontWeight: 700, bgcolor: '#1a365d', '&:hover': { bgcolor: '#1e40af' } }}>
                        {submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Drawer de detalle */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 2,
                    '& .MuiDrawer-paper': { width: 700 }
                }}
            >
                <Box sx={{ bgcolor: '#1a365d', color: '#fff', p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocationCityIcon />
                    <Typography variant="h6" fontWeight={700}>Detalle de Sede</Typography>
                </Box>
                {selectedSede && (
                    <Box sx={{ p: { xs: 2, md: 3 }, overflow: 'auto' }}>
                        <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 0.5 }}>
                            {selectedSede.nombreSede}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                            {selectedSede.razonSocialEmpresa}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* Estado de Habilitación */}
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>Estado de Habilitación</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            <Chip
                                label={selectedSede.esElegible ? 'ELEGIBLE' : 'NO ELEGIBLE'}
                                color={selectedSede.esElegible ? 'success' : 'warning'}
                                sx={{ fontWeight: 'bold' }}
                            />
                            <Chip
                                label={selectedSede.estadoSede || 'ACTIVA'}
                                color={selectedSede.estadoSede === 'ACTIVA' ? 'success' : 'error'}
                                sx={{ fontWeight: 'bold' }}
                            />
                            {!selectedSede.esElegible && selectedSede.motivoNoElegible && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', width: '100%', mt: 0.5 }}>
                                    {selectedSede.motivoNoElegible}
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>Datos de la Sede</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
                            <Box><Typography variant="caption" color="text.secondary">Dirección</Typography><Typography variant="body2">{selectedSede.direccion || '—'}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Ubicación</Typography><Typography variant="body2">{selectedSede.departamento ? `${selectedSede.departamento}, ${selectedSede.provincia}, ${selectedSede.distrito}` : (selectedSede.distrito || '—')}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Tipo de entidad</Typography><Typography variant="body2">{selectedSede.tipoEntidad || '—'}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Área disponible</Typography><Typography variant="body2">{selectedSede.areaDisponible || 'No especificada'}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Capacidad máxima</Typography><Typography variant="body2">{selectedSede.capacidadMaxima || 'No especificada'}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Vacantes disponibles</Typography><Typography variant="body2">{selectedSede.vacantesDisponibles ?? 0}</Typography></Box>
                        </Box>
                        {selectedSede.descripcion && (
                            <Box sx={{ mt: 1.5 }}><Typography variant="caption" color="text.secondary">Descripción</Typography><Typography variant="body2">{selectedSede.descripcion}</Typography></Box>
                        )}

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>Información de Habilitación</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                            <Chip
                                label={selectedSede.tieneConvenioVigente ? 'Convenio Vigente' : 'Sin Convenio'}
                                color={selectedSede.tieneConvenioVigente ? 'success' : 'error'}
                            />
                            <Chip
                                label={`Validación: ${selectedSede.resultadoValidacion || 'No validada'}`}
                                color={getValidacionBadgeColor(selectedSede)}
                            />
                        </Box>
                        {selectedSede.fechaVigenciaConvenio && (
                            <Typography variant="caption" color="text.secondary">Convenio vence: {new Date(selectedSede.fechaVigenciaConvenio).toLocaleDateString()}</Typography>
                        )}
                        {selectedSede.fechaVigenciaValidacion && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Validación vigente hasta: {new Date(selectedSede.fechaVigenciaValidacion).toLocaleDateString()}</Typography>
                        )}

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>Tutores Activos ({selectedSede.cantidadTutoresActivos || 0})</Typography>
                        {selectedSede.tutoresActivos && selectedSede.tutoresActivos.length > 0 ? (
                            <Stack spacing={1} sx={{ mb: 2 }}>
                                {selectedSede.tutoresActivos.map((tutor, index) => (
                                    <Paper key={tutor.id} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <Typography variant="body2" fontWeight={700}>{tutor.nombres} {tutor.apellidoPaterno} {tutor.apellidoMaterno}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">Cargo: {tutor.cargo}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">Correo: {tutor.correo}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">Teléfono: {tutor.telefono || 'No especificado'}</Typography>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No hay tutores activos asignados</Typography>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <Button variant="outlined" color="warning" onClick={() => { setDrawerOpen(false); handleGestionarValidacion(selectedSede); }} fullWidth sx={{ borderRadius: 2 }}>Gestionar Validación</Button>
                            <Button variant="outlined" color="secondary" onClick={() => { setDrawerOpen(false); handleGestionarTutores(selectedSede); }} fullWidth sx={{ borderRadius: 2 }}>Gestionar Tutores</Button>
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <Button variant="outlined" color="success" onClick={() => { setDrawerOpen(false); handleVerExpedientes(selectedSede); }} fullWidth sx={{ borderRadius: 2 }}>Ver Expedientes</Button>
                            <Button variant="contained" onClick={() => setDrawerOpen(false)} fullWidth sx={{ borderRadius: 2, bgcolor: '#1a365d', '&:hover': { bgcolor: '#1e40af' } }}>Cerrar</Button>
                        </Box>
                    </Box>
                )}
            </Drawer>

            {/* Validación Dialog */}
            <Dialog open={validacionDialogOpen} onClose={() => setValidacionDialogOpen(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: validacionActual?.resultadoValidacion === 'APROBADA' ? '#065f46' : validacionActual?.resultadoValidacion === 'RECHAZADA' ? '#991b1b' : '#92400e', color: '#fff', py: 2.5, px: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AssignmentIcon />
                    <Typography variant="h6" fontWeight={700}>Validación de Sede: {validacionSede?.nombreSede}</Typography>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    {loadingValidacion ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                            {validacionActual && (
                                <Alert severity={validacionActual.resultadoValidacion === 'APROBADA' ? 'success' : validacionActual.resultadoValidacion === 'RECHAZADA' ? 'error' : 'warning'} sx={{ borderRadius: 2 }}>
                                    Validación vigente: <strong>{validacionActual.resultadoValidacion}</strong>
                                    {validacionActual.fechaVigenciaHasta && ` — Vigente hasta: ${new Date(validacionActual.fechaVigenciaHasta).toLocaleDateString()}`}
                                </Alert>
                            )}

                            {historialValidaciones.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>Historial de validaciones:</Typography>
                                    <Stack spacing={1}>
                                        {historialValidaciones.map(v => (
                                            <Paper key={v.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Chip label={v.resultadoValidacion} size="small" color={v.resultadoValidacion === 'APROBADA' ? 'success' : v.resultadoValidacion === 'RECHAZADA' ? 'error' : 'warning'} sx={{ fontWeight: 600 }} />
                                                    <Typography variant="caption" color="text.secondary">{v.nombreValidador} — {v.fechaValidacion ? new Date(v.fechaValidacion).toLocaleDateString() : ''}</Typography>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            <Typography variant="h6" fontWeight={700} sx={{ borderBottom: '2px solid #1a365d', pb: 1, color: '#1a365d' }}>Criterios de Validación</Typography>

                            {[
                                { key: 'criterioInfraestructuraCumple', obsKey: 'criterioInfraestructuraObservaciones', label: 'Infraestructura adecuada', desc: 'La sede cuenta con espacios físicos adecuados para el desarrollo de prácticas.' },
                                { key: 'criterioSeguridadSaludCumple', obsKey: 'criterioSeguridadSaludObservaciones', label: 'Seguridad y salud ocupacional', desc: 'Cumple con condiciones de seguridad y salud en el trabajo.' },
                                { key: 'criterioAfinidadCarreraCumple', obsKey: 'criterioAfinidadCarreraObservaciones', label: 'Afinidad con la carrera', desc: 'Las actividades se relacionan con el perfil profesional de Ingeniería Industrial.' },
                                { key: 'criterioTutorDesignadoCumple', obsKey: 'criterioTutorDesignadoObservaciones', label: 'Tutor designado', desc: 'La sede ha designado un tutor externo para acompañar al estudiante.' },
                                { key: 'criterioConvenioAcuerdoCumple', obsKey: 'criterioConvenioAcuerdoObservaciones', label: 'Convenio o acuerdo vigente', desc: 'Existe un convenio o acuerdo formal vigente con la universidad.' }
                            ].map(criterio => (
                                <Paper key={criterio.key} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Checkbox
                                            checked={validacionForm[criterio.key]}
                                            onChange={e => setValidacionForm({ ...validacionForm, [criterio.key]: e.target.checked })}
                                            color={validacionForm[criterio.key] ? 'success' : 'default'}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{criterio.label}</Typography>
                                            <Typography variant="caption" color="text.secondary">{criterio.desc}</Typography>
                                        </Box>
                                    </Box>
                                    <TextField
                                        fullWidth size="small" placeholder="Observaciones (opcional)"
                                        value={validacionForm[criterio.obsKey]}
                                        onChange={e => setValidacionForm({ ...validacionForm, [criterio.obsKey]: e.target.value })}
                                        sx={{ ml: 5 }}
                                    />
                                </Paper>
                            ))}

                            <Typography variant="h6" fontWeight={700} sx={{ borderBottom: '2px solid #1a365d', pb: 1, color: '#1a365d' }}>Resultado</Typography>

                            <FormControl fullWidth>
                                <InputLabel>Resultado de Validación</InputLabel>
                                <Select
                                    value={validacionForm.resultadoValidacion}
                                    label="Resultado de Validación"
                                    onChange={e => setValidacionForm({ ...validacionForm, resultadoValidacion: e.target.value })}
                                    sx={{ borderRadius: 1.2 }}
                                >
                                    <MenuItem value="APROBADA"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircleIcon fontSize="small" color="success" /> Aprobada</Box></MenuItem>
                                    <MenuItem value="OBSERVADA"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarningIcon fontSize="small" color="warning" /> Observada</Box></MenuItem>
                                    <MenuItem value="RECHAZADA"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CancelIcon fontSize="small" color="error" /> Rechazada</Box></MenuItem>
                                </Select>
                            </FormControl>

                            <TextField fullWidth multiline rows={2} label="Observaciones Generales"
                                value={validacionForm.observacionesGenerales}
                                onChange={e => setValidacionForm({ ...validacionForm, observacionesGenerales: e.target.value })}
                            />

                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                                <TextField fullWidth type="date" label="Vigencia desde" InputLabelProps={{ shrink: true }}
                                    value={validacionForm.fechaVigenciaDesde}
                                    onChange={e => setValidacionForm({ ...validacionForm, fechaVigenciaDesde: e.target.value })}
                                />
                                <TextField fullWidth type="date" label="Vigencia hasta" InputLabelProps={{ shrink: true }}
                                    value={validacionForm.fechaVigenciaHasta}
                                    onChange={e => setValidacionForm({ ...validacionForm, fechaVigenciaHasta: e.target.value })}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setValidacionDialogOpen(false)} color="inherit" sx={{ fontWeight: 600, color: '#64748b' }} disabled={loadingValidacion}>Cancelar</Button>
                    <Button variant="contained" onClick={handleValidacionSave} disabled={loadingValidacion} sx={{ px: 4, borderRadius: 2, fontWeight: 700, bgcolor: '#1a365d', '&:hover': { bgcolor: '#1e40af' } }}>
                        {validacionActual?.id ? 'Actualizar Validación' : 'Guardar Validación'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

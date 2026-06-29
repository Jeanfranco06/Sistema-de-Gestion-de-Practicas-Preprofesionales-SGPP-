import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, 
    FormControl, Grid, InputAdornment, Tooltip, TablePagination, TableSortLabel, Drawer, Divider, Alert, CircularProgress, Checkbox, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import { sedeApi, empresaApi } from '../../../api/sedesApi';
import {
    ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';
import StatStrip from '../../../shared/components/StatStrip';
import { validacionApi } from '../../../api/validacionesApi';
import { useAuth } from '../../../auth/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const GestionSedes = () => {
    const { user } = useAuth();
    const [sedes, setSedes] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSede, setSelectedSede] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Filtros administrativos
    const [filtroEstadoSede, setFiltroEstadoSede] = useState('todos');
    const [filtroValidacion, setFiltroValidacion] = useState('todos');
    const [filtroConvenio, setFiltroConvenio] = useState('todos');
    const [filtroTutor, setFiltroTutor] = useState('todos');
    const [filtroElegible, setFiltroElegible] = useState('todos');

    // Validation dialog states
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

    // Pagination and Sorting states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('nombreSede');

    const initialFormState = { 
        empresaId: '', nombreSede: '', direccion: '', distrito: '', 
        provincia: '', departamento: '', telefono: '', email: '', 
        nombreContacto: '', cargoContacto: '', telefonoContacto: '', 
        emailContacto: '', capacidadMaxima: '',
        tipoEntidad: '', areaUnidad: '', descripcionGeneral: '',
        actividadesPrincipales: '', riesgosRelevantes: '',
        nombreTutorEmpresa: '', cargoTutorEmpresa: '', correoTutorEmpresa: '',
        telefonoTutorEmpresa: '', estadoSede: 'ACTIVA'
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadSedes();
        loadEmpresas();
    }, []);

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

    const handleOpenDialog = (sede = null) => {
        if (sede) {
            setIsEditing(true);
            setCurrentId(sede.id);
            loadSedeById(sede.id);
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData(initialFormState);
        }
        setErrors({});
        setOpenDialog(true);
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.empresaId) tempErrors.empresaId = "Debe seleccionar una empresa";
        if (!formData.nombreSede) tempErrors.nombreSede = "El nombre de sede es requerido";
        if (!formData.distrito) tempErrors.distrito = "El distrito es requerido";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
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
            const msg = error.response?.data?.message || error.response?.data?.error || "Ocurrió un error al guardar la sede.";
            MySwal.fire('Error al guardar', msg, 'error');
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

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
            // Búsqueda por texto
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                sede.nombreSede?.toLowerCase().includes(searchLower) || 
                sede.razonSocialEmpresa?.toLowerCase().includes(searchLower) ||
                sede.distrito?.toLowerCase().includes(searchLower);
            
            if (!matchesSearch) return false;

            // Filtro por estado de sede
            if (filtroEstadoSede !== 'todos' && sede.estadoSede !== filtroEstadoSede) return false;

            // Filtro por validación
            if (filtroValidacion === 'aprobada' && sede.resultadoValidacion !== 'APROBADA') return false;
            if (filtroValidacion === 'observada' && sede.resultadoValidacion !== 'OBSERVADA') return false;
            if (filtroValidacion === 'rechazada' && sede.resultadoValidacion !== 'RECHAZADA') return false;
            if (filtroValidacion === 'no_validada' && sede.tieneValidacionVigente) return false;

            // Filtro por convenio
            if (filtroConvenio === 'vigente' && !sede.tieneConvenioVigente) return false;
            if (filtroConvenio === 'no_vigente' && sede.tieneConvenioVigente) return false;

            // Filtro por tutor
            if (filtroTutor === 'con_tutor' && !sede.tieneTutorActivo) return false;
            if (filtroTutor === 'sin_tutor' && sede.tieneTutorActivo) return false;

            // Filtro por elegibilidad
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

    const kpis = useMemo(() => {
        return {
            total: sedes.length,
            activas: sedes.filter(s => s.estadoSede === 'ACTIVA').length,
            validadas: sedes.filter(s => s.resultadoValidacion === 'APROBADA').length,
            conConvenio: sedes.filter(s => s.tieneConvenioVigente).length,
        };
    }, [sedes]);

    const stats = [
        { label: 'Total Sedes', value: kpis.total, icon: <LocationCityIcon fontSize="small" />, accent: 'blue' },
        { label: 'Sedes Activas', value: kpis.activas, icon: <CheckCircleIcon fontSize="small" />, accent: 'emerald' },
        { label: 'Sedes Validadas', value: kpis.validadas, icon: <AssignmentIcon fontSize="small" />, accent: 'violet' },
        { label: 'Con Convenio', value: kpis.conConvenio, icon: <AssignmentIcon fontSize="small" />, accent: 'orange' },
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

    if (loading && sedes.length === 0) {
        return (
            <ModulePageShell sx={{ textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>Cargando sedes...</Typography>
            </ModulePageShell>
        );
    }

    return (
        <ModulePageShell>
            <ModulePageHeader
                icon={<LocationCityIcon />}
                title="Gestión de Sedes"
                subtitle="Administra las sedes operativas vinculadas a las empresas."
            />

            <StatStrip items={stats} />

            <ContentCard accent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Directorio de Sedes</Typography>

                <Box sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Buscar sede, empresa o distrito..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                        sx={{ minWidth: { xs: '100%', sm: 280 } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select value={filtroEstadoSede} label="Estado" onChange={(e) => setFiltroEstadoSede(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="ACTIVA">Activa</MenuItem>
                            <MenuItem value="INACTIVA">Inactiva</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Validación</InputLabel>
                        <Select value={filtroValidacion} label="Validación" onChange={(e) => setFiltroValidacion(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="aprobada">Aprobada</MenuItem>
                            <MenuItem value="observada">Observada</MenuItem>
                            <MenuItem value="rechazada">Rechazada</MenuItem>
                            <MenuItem value="no_validada">No validada</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Convenio</InputLabel>
                        <Select value={filtroConvenio} label="Convenio" onChange={(e) => setFiltroConvenio(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="vigente">Vigente</MenuItem>
                            <MenuItem value="no_vigente">No vigente</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                        <InputLabel>Tutor</InputLabel>
                        <Select value={filtroTutor} label="Tutor" onChange={(e) => setFiltroTutor(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="con_tutor">Con tutor</MenuItem>
                            <MenuItem value="sin_tutor">Sin tutor</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                        <InputLabel>Elegible</InputLabel>
                        <Select value={filtroElegible} label="Elegible" onChange={(e) => setFiltroElegible(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="elegible">Elegible</MenuItem>
                            <MenuItem value="no_elegible">No elegible</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: 2, whiteSpace: 'nowrap' }}
                    >
                        Nueva Sede
                    </Button>
                    <Button variant="outlined" size="small" onClick={limpiarFiltros} startIcon={<FilterListIcon />}>
                        Limpiar filtros
                    </Button>
                </Box>

                <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    <TableSortLabel
                                        active={orderBy === 'nombreSede'} direction={orderBy === 'nombreSede' ? order : 'asc'}
                                        onClick={() => handleSort('nombreSede')}
                                    >
                                        Sede
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    <TableSortLabel
                                        active={orderBy === 'razonSocialEmpresa'} direction={orderBy === 'razonSocialEmpresa' ? order : 'asc'}
                                        onClick={() => handleSort('razonSocialEmpresa')}
                                    >
                                        Empresa
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Validación</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Convenio</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Tutor</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Elegible</TableCell>
                                <TableCell sx={{ fontWeight: 600, width: '100px' }}>Capacidad</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedSedes.map((sede) => (
                                <TableRow key={sede.id} hover>
                                    <TableCell fontWeight="medium">{sede.nombreSede}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold" color="primary">
                                            {sede.razonSocialEmpresa}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{sede.direccion}</Typography>
                                        <Chip label={sede.distrito} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={sede.estadoSede || 'ACTIVA'}
                                            size="small"
                                            color={sede.estadoSede === 'ACTIVA' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={sede.resultadoValidacion || 'No validada'}
                                            size="small"
                                            color={getValidacionBadgeColor(sede)}
                                            icon={getValidacionIcon(sede)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={sede.tieneConvenioVigente ? 'Vigente' : 'No vigente'}
                                            size="small"
                                            color={sede.tieneConvenioVigente ? 'success' : 'warning'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={sede.tieneTutorActivo ? `Sí (${sede.cantidadTutoresActivos})` : 'No'}
                                            size="small"
                                            color={sede.tieneTutorActivo ? 'success' : 'default'}
                                            variant={sede.tieneTutorActivo ? 'filled' : 'outlined'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {sede.esElegible ? (
                                            <Chip label="Sí" size="small" color="success" />
                                        ) : (
                                            <Tooltip title={sede.motivoNoElegible || 'No cumple requisitos'} arrow>
                                                <Chip label="No" size="small" color="warning" variant="outlined" />
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={sede.capacidadMaxima || 0} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Ver Detalle">
                                            <IconButton color="primary" onClick={() => handleVerDetalle(sede)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Editar Sede">
                                            <IconButton color="primary" onClick={() => handleOpenDialog(sede)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Gestionar Validación">
                                            <IconButton color="primary" onClick={() => handleGestionarValidacion(sede)}>
                                                <AssignmentIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Gestionar Tutores">
                                            <IconButton color="primary" onClick={() => handleGestionarTutores(sede)}>
                                                <PeopleIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Ver Expedientes">
                                            <IconButton color="primary" onClick={() => handleVerExpedientes(sede)}>
                                                <SchoolIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {sede.activo && (
                                            <Tooltip title="Deshabilitar Sede">
                                                <IconButton color="error" onClick={() => handleDisable(sede.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredSedes.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>No se encontraron sedes</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredSedes.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                    />
                </TableContainer>
            </ContentCard>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: '#fff', pb: 2 }}>
                    {isEditing ? 'Editar Sede' : 'Registrar Nueva Sede'}
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fbfbfb' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            select
                            fullWidth
                            label="Empresa Aliada *"
                            value={formData.empresaId}
                            onChange={e => setFormData({...formData, empresaId: e.target.value})}
                            disabled={isEditing}
                            error={!!errors.empresaId}
                            helperText={errors.empresaId}
                        >
                            {empresas.map(emp => (
                                <MenuItem key={emp.id} value={emp.id}>{emp.razonSocial} (RUC: {emp.ruc})</MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField 
                                sx={{ flex: 2 }} label="Nombre de la Sede *" value={formData.nombreSede} 
                                onChange={e => setFormData({...formData, nombreSede: e.target.value})} 
                                error={!!errors.nombreSede} helperText={errors.nombreSede}
                            />
                            <TextField 
                                sx={{ flex: 1 }} label="Capacidad Máxima (Estudiantes)" type="number" 
                                value={formData.capacidadMaxima} 
                                onChange={e => setFormData({...formData, capacidadMaxima: e.target.value})} 
                            />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Ubicación
                        </Typography>

                        <TextField fullWidth label="Dirección" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Distrito *" value={formData.distrito} onChange={e => setFormData({...formData, distrito: e.target.value})} error={!!errors.distrito} helperText={errors.distrito} />
                            <TextField sx={{ flex: 1 }} label="Provincia" value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value})} />
                            <TextField sx={{ flex: 1 }} label="Departamento" value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})} />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Contacto en Sede
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Nombre del Contacto" value={formData.nombreContacto} onChange={e => setFormData({...formData, nombreContacto: e.target.value})} />
                            <TextField sx={{ flex: 1 }} label="Cargo del Contacto" value={formData.cargoContacto} onChange={e => setFormData({...formData, cargoContacto: e.target.value})} />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Teléfono de Contacto" value={formData.telefonoContacto} onChange={e => setFormData({...formData, telefonoContacto: e.target.value})} />
                            <TextField sx={{ flex: 1 }} label="Email de Contacto" type="email" value={formData.emailContacto} onChange={e => setFormData({...formData, emailContacto: e.target.value})} />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Perfil de Sede
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField
                                select fullWidth label="Tipo de Entidad *"
                                value={formData.tipoEntidad}
                                onChange={e => setFormData({...formData, tipoEntidad: e.target.value})}
                            >
                                <MenuItem value="">Seleccione...</MenuItem>
                                <MenuItem value="PÚBLICA">Pública</MenuItem>
                                <MenuItem value="PRIVADA">Privada</MenuItem>
                                <MenuItem value="MIXTA">Mixta</MenuItem>
                            </TextField>
                            <TextField sx={{ flex: 1 }} label="Área / Unidad" value={formData.areaUnidad}
                                onChange={e => setFormData({...formData, areaUnidad: e.target.value})}
                                placeholder="Ej: Producción, Logística, Administración"
                            />
                        </Box>

                        <TextField fullWidth label="Descripción General" multiline rows={3}
                            value={formData.descripcionGeneral}
                            onChange={e => setFormData({...formData, descripcionGeneral: e.target.value})}
                            placeholder="Describir las actividades y funciones de la sede"
                        />
                        <TextField fullWidth label="Actividades Principales" multiline rows={2}
                            value={formData.actividadesPrincipales}
                            onChange={e => setFormData({...formData, actividadesPrincipales: e.target.value})}
                        />
                        <TextField fullWidth label="Riesgos Relevantes" multiline rows={2}
                            value={formData.riesgosRelevantes}
                            onChange={e => setFormData({...formData, riesgosRelevantes: e.target.value})}
                        />

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Tutor de Empresa (designado por la entidad)
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 2 }} label="Nombre del Tutor" value={formData.nombreTutorEmpresa}
                                onChange={e => setFormData({...formData, nombreTutorEmpresa: e.target.value})}
                            />
                            <TextField sx={{ flex: 1 }} label="Cargo del Tutor" value={formData.cargoTutorEmpresa}
                                onChange={e => setFormData({...formData, cargoTutorEmpresa: e.target.value})}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 2 }} label="Correo del Tutor" type="email" value={formData.correoTutorEmpresa}
                                onChange={e => setFormData({...formData, correoTutorEmpresa: e.target.value})}
                            />
                            <TextField sx={{ flex: 1 }} label="Teléfono del Tutor" value={formData.telefonoTutorEmpresa}
                                onChange={e => setFormData({...formData, telefonoTutorEmpresa: e.target.value})}
                            />
                        </Box>

                        <TextField select fullWidth label="Estado de la Sede"
                            value={formData.estadoSede}
                            onChange={e => setFormData({...formData, estadoSede: e.target.value})}
                        >
                            <MenuItem value="ACTIVA">Activa</MenuItem>
                            <MenuItem value="INACTIVA">Inactiva</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} sx={{ px: 4, borderRadius: 2 }}>{isEditing ? 'Actualizar' : 'Guardar'}</Button>
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
                {selectedSede && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Detalle de Sede
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom color="primary">
                            {selectedSede.razonSocialEmpresa}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            {selectedSede.nombreSede}
                        </Typography>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Estado de Habilitación
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Chip 
                                label={selectedSede.esElegible ? 'ELEGIBLE' : 'NO ELEGIBLE'} 
                                color={selectedSede.esElegible ? 'success' : 'warning'}
                                sx={{ mr: 1, fontWeight: 'bold' }}
                            />
                            {!selectedSede.esElegible && selectedSede.motivoNoElegible && (
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                    ({selectedSede.motivoNoElegible})
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Datos de la Sede
                        </Typography>
                        <Typography variant="body2" paragraph>
                            <strong>Dirección:</strong> {selectedSede.direccion}
                        </Typography>
                        <Typography variant="body2" paragraph>
                            <strong>Ubicación:</strong> {selectedSede.departamento}, {selectedSede.provincia}, {selectedSede.distrito}
                        </Typography>
                        <Typography variant="body2" paragraph>
                            <strong>Tipo de entidad:</strong> {selectedSede.tipoEntidad}
                        </Typography>
                        <Typography variant="body2" paragraph>
                            <strong>Área disponible:</strong> {selectedSede.areaDisponible || 'No especificada'}
                        </Typography>
                        <Typography variant="body2" paragraph>
                            <strong>Descripción:</strong> {selectedSede.descripcion || 'No especificada'}
                        </Typography>
                        <Typography variant="body2" paragraph>
                            <strong>Capacidad máxima:</strong> {selectedSede.capacidadMaxima || 'No especificada'}
                        </Typography>
                        <Typography variant="body2" paragraph>
                            <strong>Vacantes disponibles:</strong> {selectedSede.vacantesDisponibles || 0}
                        </Typography>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Información de Habilitación
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Chip 
                                label={selectedSede.tieneConvenioVigente ? 'Convenio Vigente' : 'Sin Convenio'} 
                                color={selectedSede.tieneConvenioVigente ? 'success' : 'error'}
                                sx={{ mr: 1 }}
                            />
                            {selectedSede.fechaVigenciaConvenio && (
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                    (Vence: {new Date(selectedSede.fechaVigenciaConvenio).toLocaleDateString()})
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Chip 
                                label={`Validación: ${selectedSede.resultadoValidacion || 'No validada'}`} 
                                color={getValidacionBadgeColor(selectedSede)}
                                sx={{ mr: 1 }}
                            />
                            {selectedSede.fechaVigenciaValidacion && (
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                    (Vigencia hasta: {new Date(selectedSede.fechaVigenciaValidacion).toLocaleDateString()})
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Tutores Activos
                        </Typography>
                        {selectedSede.tutoresActivos && selectedSede.tutoresActivos.length > 0 ? (
                            selectedSede.tutoresActivos.map((tutor, index) => (
                                <Box key={tutor.id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">
                                        {tutor.nombres} {tutor.apellidoPaterno} {tutor.apellidoMaterno}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Cargo: {tutor.cargo}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Correo: {tutor.correo}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Teléfono: {tutor.telefono || 'No especificado'}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No hay tutores activos asignados
                            </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button 
                                variant="outlined" 
                                color="warning"
                                onClick={() => {
                                    setDrawerOpen(false);
                                    handleGestionarValidacion(selectedSede);
                                }}
                                fullWidth
                            >
                                Gestionar Validación
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="secondary"
                                onClick={() => {
                                    setDrawerOpen(false);
                                    handleGestionarTutores(selectedSede);
                                }}
                                fullWidth
                            >
                                Gestionar Tutores
                            </Button>
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button 
                                variant="outlined" 
                                color="success"
                                onClick={() => {
                                    setDrawerOpen(false);
                                    handleVerExpedientes(selectedSede);
                                }}
                                fullWidth
                            >
                                Ver Expedientes
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={() => setDrawerOpen(false)}
                                fullWidth
                            >
                                Cerrar
                            </Button>
                        </Box>
                    </Box>
                )}
            </Drawer>

            {/* Validación Dialog */}
            <Dialog open={validacionDialogOpen} onClose={() => setValidacionDialogOpen(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ bgcolor: validacionActual?.resultadoValidacion === 'APROBADA' ? 'success.main' : validacionActual?.resultadoValidacion === 'RECHAZADA' ? 'error.main' : 'warning.main', color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    Validación de Sede: {validacionSede?.nombreSede}
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fbfbfb' }}>
                    {loadingValidacion ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {validacionActual && (
                                <Alert severity={validacionActual.resultadoValidacion === 'APROBADA' ? 'success' : validacionActual.resultadoValidacion === 'RECHAZADA' ? 'error' : 'warning'} sx={{ borderRadius: 2 }}>
                                    Validación vigente: <strong>{validacionActual.resultadoValidacion}</strong>
                                    {validacionActual.fechaVigenciaHasta && ` — Vigente hasta: ${new Date(validacionActual.fechaVigenciaHasta).toLocaleDateString()}`}
                                </Alert>
                            )}

                            {historialValidaciones.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Historial de validaciones:</Typography>
                                    <Stack spacing={1}>
                                        {historialValidaciones.map(v => (
                                            <Paper key={v.id} sx={{ p: 1.5, borderRadius: 1, bgcolor: 'grey.50' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Chip label={v.resultadoValidacion} size="small" color={v.resultadoValidacion === 'APROBADA' ? 'success' : v.resultadoValidacion === 'RECHAZADA' ? 'error' : 'warning'} />
                                                    <Typography variant="caption">{v.nombreValidador} — {v.fechaValidacion ? new Date(v.fechaValidacion).toLocaleDateString() : ''}</Typography>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            <Typography variant="h6" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>Criterios de Validación</Typography>

                            {[
                                { key: 'criterioInfraestructuraCumple', obsKey: 'criterioInfraestructuraObservaciones', label: 'Infraestructura adecuada', desc: 'La sede cuenta con espacios físicos adecuados para el desarrollo de prácticas.' },
                                { key: 'criterioSeguridadSaludCumple', obsKey: 'criterioSeguridadSaludObservaciones', label: 'Seguridad y salud ocupacional', desc: 'Cumple con condiciones de seguridad y salud en el trabajo.' },
                                { key: 'criterioAfinidadCarreraCumple', obsKey: 'criterioAfinidadCarreraObservaciones', label: 'Afinidad con la carrera', desc: 'Las actividades se relacionan con el perfil profesional de Ingeniería Industrial.' },
                                { key: 'criterioTutorDesignadoCumple', obsKey: 'criterioTutorDesignadoObservaciones', label: 'Tutor designado', desc: 'La sede ha designado un tutor externo para acompañar al estudiante.' },
                                { key: 'criterioConvenioAcuerdoCumple', obsKey: 'criterioConvenioAcuerdoObservaciones', label: 'Convenio o acuerdo vigente', desc: 'Existe un convenio o acuerdo formal vigente con la universidad.' }
                            ].map(criterio => (
                                <Paper key={criterio.key} sx={{ p: 2, borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Checkbox
                                            checked={validacionForm[criterio.key]}
                                            onChange={e => setValidacionForm({ ...validacionForm, [criterio.key]: e.target.checked })}
                                            color={validacionForm[criterio.key] ? 'success' : 'default'}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">{criterio.label}</Typography>
                                            <Typography variant="caption" color="textSecondary">{criterio.desc}</Typography>
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

                            <Typography variant="h6" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>Resultado</Typography>

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
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setValidacionDialogOpen(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleValidacionSave} disabled={loadingValidacion} sx={{ px: 4, borderRadius: 2 }}>
                        {validacionActual?.id ? 'Actualizar Validación' : 'Guardar Validación'}
                    </Button>
                </DialogActions>
            </Dialog>
        </ModulePageShell>
    );
};

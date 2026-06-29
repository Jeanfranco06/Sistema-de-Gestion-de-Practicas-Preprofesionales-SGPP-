import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Tooltip,
    TablePagination, MenuItem, FormControl, InputLabel, Select, Drawer, Divider, Alert, CircularProgress, TableSortLabel,
    Avatar, Stack
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DomainIcon from '@mui/icons-material/Domain';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import {
    ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';
import { tutoresApi, usuariosApi } from '../../../api/usuariosApi';
import { empresaApi } from '../../../api/sedesApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ESTADO_TUTOR_OPTS = ['ACTIVO', 'INACTIVO'];
const ESTADOS_FILTRO = ['todos', 'ACTIVO', 'INACTIVO'];

export const GestionTutores = () => {
    const [tutores, setTutores] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('empresaNombre');

    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroEmpresa, setFiltroEmpresa] = useState('todos');

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        idUsuario: '', cargo: '', area: '', empresaNombre: '',
        idEmpresa: '', idSede: '', estadoTutor: 'ACTIVO'
    });
    const [errors, setErrors] = useState({});

    const [selectedTutor, setSelectedTutor] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [detalleLoading, setDetalleLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tutoresRes, empresasRes, usuariosRes] = await Promise.all([
                tutoresApi.getAll().catch(() => ({ data: { data: [] } })),
                empresaApi.getAll().catch(() => ({ data: [] })),
                usuariosApi.getAll().catch(() => ({ data: { data: [] } }))
            ]);
            setTutores(tutoresRes.data?.data || tutoresRes.data || []);
            const empData = empresasRes.data?.data || empresasRes.data || [];
            setEmpresas(empData.filter(e => e.activo !== false));
            const allUsers = usuariosRes.data?.data || usuariosRes.data || [];
            setUsuariosDisponibles(allUsers.filter(u => u.activo !== false));
        } catch (error) {
            console.error("Error loading data:", error);
            MySwal.fire('Error', 'No se pudieron cargar los datos.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadTutorDetalle = async (id) => {
        try {
            setDetalleLoading(true);
            const res = await tutoresApi.getById(id);
            setSelectedTutor(res.data?.data || res.data);
            setDrawerOpen(true);
        } catch (error) {
            console.error("Error loading tutor detalle:", error);
            MySwal.fire('Error', 'No se pudo cargar el detalle del tutor.', 'error');
        } finally {
            setDetalleLoading(false);
        }
    };

    const handleOpenDialog = (tutor = null) => {
        if (tutor) {
            setIsEditing(true);
            setCurrentId(tutor.id);
            setFormData({
                idUsuario: tutor.idUsuario || '',
                cargo: tutor.cargo || '',
                area: tutor.area || '',
                empresaNombre: tutor.empresaNombre || '',
                idEmpresa: tutor.idEmpresa || '',
                idSede: tutor.idSede || '',
                estadoTutor: tutor.estadoTutor || 'ACTIVO'
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({ idUsuario: '', cargo: '', area: '', empresaNombre: '', idEmpresa: '', idSede: '', estadoTutor: 'ACTIVO' });
        }
        setErrors({});
        setOpenDialog(true);
    };

    const validate = () => {
        const temp = {};
        if (!formData.idUsuario) temp.idUsuario = "Seleccione un usuario";
        if (!formData.cargo?.trim()) temp.cargo = "El cargo es requerido";
        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            if (isEditing) {
                await tutoresApi.update(currentId, formData);
                MySwal.fire({ icon: 'success', title: '¡Tutor Actualizado!', timer: 2000, showConfirmButton: false });
            } else {
                await tutoresApi.create(formData);
                MySwal.fire({ icon: 'success', title: '¡Tutor Registrado!', timer: 2000, showConfirmButton: false });
            }
            setOpenDialog(false);
            loadData();
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Error al procesar la solicitud';
            MySwal.fire('Error', msg, 'error');
        }
    };

    const handleToggleEstado = async (tutor) => {
        const accion = tutor.activo ? 'deshabilitar' : 'habilitar';
        const result = await MySwal.fire({
            title: `¿${tutor.activo ? 'Deshabilitar' : 'Habilitar'} Tutor?`,
            text: `Se ${tutor.activo ? 'deshabilitará' : 'habilitará'} el perfil de ${tutor.nombres || ''} ${tutor.apellidoPaterno || ''}.`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: tutor.activo ? '#d33' : '#3085d6',
            confirmButtonText: `Sí, ${accion}`, cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                await tutoresApi.disable(tutor.id);
                MySwal.fire({ icon: 'success', title: `Tutor ${tutor.activo ? 'deshabilitado' : 'habilitado'}`, timer: 1500, showConfirmButton: false });
                loadData();
            } catch (error) {
                MySwal.fire('Error', 'No se pudo cambiar el estado.', 'error');
            }
        }
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFiltroEstado('todos');
        setFiltroEmpresa('todos');
    };

    const getNombreUsuario = (tutor) => {
        const { nombres, apellidoPaterno, apellidoMaterno } = tutor;
        if (nombres) return `${nombres} ${apellidoPaterno || ''}${apellidoMaterno ? ' ' + apellidoMaterno : ''}`;
        const user = usuariosDisponibles.find(u => u.id === tutor.idUsuario);
        return user ? `${user.nombres} ${user.apellidoPaterno}` : '—';
    };

    const getEmailUsuario = (tutor) => {
        if (tutor.correo) return tutor.correo;
        if (tutor.email) return tutor.email;
        return '—';
    };

    const sortedTutores = useMemo(() => {
        let filtered = [...tutores];
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                (t.empresaNombre || '').toLowerCase().includes(s) ||
                (t.cargo || '').toLowerCase().includes(s) ||
                ((t.nombres || '') + ' ' + (t.apellidoPaterno || '')).toLowerCase().includes(s)
            );
        }
        if (filtroEstado !== 'todos') {
            filtered = filtered.filter(t => (t.estadoTutor || (t.activo ? 'ACTIVO' : 'INACTIVO')) === filtroEstado);
        }
        if (filtroEmpresa !== 'todos') {
            filtered = filtered.filter(t => t.idEmpresa === parseInt(filtroEmpresa));
        }
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
    }, [tutores, searchTerm, filtroEstado, filtroEmpresa, orderBy, order]);

    const paginatedTutores = sortedTutores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getEstado = (t) => t.estadoTutor || (t.activo ? 'ACTIVO' : 'INACTIVO');

    if (loading && tutores.length === 0) {
        return (
            <ModulePageShell sx={{ textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>Cargando tutores externos...</Typography>
            </ModulePageShell>
        );
    }

    return (
        <ModulePageShell>
            <ModulePageHeader
                icon={<BusinessIcon />}
                title="Gestión de Tutores Externos"
                subtitle="Registro y control de tutores designados por las entidades receptoras."
            />

            <ContentCard accent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Directorio de Tutores Externos</Typography>

                <Box sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <TextField size="small" variant="outlined" placeholder="Buscar por nombre, empresa o cargo..."
                        value={searchTerm} onChange={handleSearchChange}
                        slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>), sx: { bgcolor: '#fff', borderRadius: 2, minWidth: { xs: '100%', sm: 280 } } } }} />
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                        <InputLabel>Estado</InputLabel>
                        <Select value={filtroEstado} label="Estado" onChange={(e) => setFiltroEstado(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                            {ESTADOS_FILTRO.map(e => <MenuItem key={e} value={e}>{e === 'todos' ? 'Todos' : e.charAt(0) + e.slice(1).toLowerCase()}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select value={filtroEmpresa} label="Empresa" onChange={(e) => setFiltroEmpresa(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                            <MenuItem value="todos">Todas</MenuItem>
                            {empresas.map(emp => <MenuItem key={emp.id} value={emp.id}>{emp.razonSocial}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
                        sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: 2, whiteSpace: 'nowrap' }}>
                        Nuevo Perfil Tutor
                    </Button>
                    <Button variant="outlined" size="small" onClick={limpiarFiltros} startIcon={<FilterListIcon />}>
                        Limpiar Filtros
                    </Button>
                </Box>

                <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                {[
                                    { id: 'nombres', label: 'Tutor' },
                                    { id: 'empresaNombre', label: 'Empresa' },
                                    { id: 'nombreSede', label: 'Sede' },
                                    { id: 'cargo', label: 'Cargo / Área' },
                                    { id: 'correo', label: 'Contacto' },
                                    { id: 'estado', label: 'Estado', sortable: false },
                                    { id: 'acciones', label: 'Acciones', sortable: false }
                                ].map(hc => (
                                    <TableCell key={hc.id} sx={{ fontWeight: 600 }}>
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
                        {paginatedTutores.map((tutor) => {
                            const estado = getEstado(tutor);
                            return (
                                <TableRow key={tutor.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 14, fontWeight: 'bold' }}>
                                                <PersonIcon fontSize="small" />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{getNombreUsuario(tutor)}</Typography>
                                                <Typography variant="caption" color="textSecondary">@{tutor.username || '—'}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <DomainIcon fontSize="small" color="action" />
                                            <Typography variant="body2">{tutor.empresaNombre || tutor.razonSocialEmpresa || '—'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{tutor.nombreSede || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <WorkIcon fontSize="small" color="action" />
                                            <Box>
                                                <Typography variant="body2">{tutor.cargo || '—'}</Typography>
                                                <Typography variant="caption" color="textSecondary">{tutor.area || ''}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{getEmailUsuario(tutor)}</Typography>
                                        <Typography variant="caption" color="textSecondary">{tutor.telefono || ''}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={estado} color={estado === 'ACTIVO' ? 'success' : 'error'} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.3}>
                                            <Tooltip title="Ver Detalle">
                                                <IconButton size="small" color="info" onClick={() => loadTutorDetalle(tutor.id)}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar">
                                                <IconButton size="small" color="primary" onClick={() => handleOpenDialog(tutor)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={estado === 'ACTIVO' ? 'Deshabilitar' : 'Habilitar'}>
                                                <IconButton size="small" color={estado === 'ACTIVO' ? 'error' : 'success'} onClick={() => handleToggleEstado(tutor)}>
                                                    {estado === 'ACTIVO' ? <DeleteIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {sortedTutores.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    <Typography variant="h6" color="textSecondary">No se encontraron tutores con los filtros aplicados.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={sortedTutores.length}
                    rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Filas por página:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`} />
            </Box>
        </ContentCard>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: '#fff', pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon /> {isEditing ? 'Editar Perfil Tutor' : 'Registrar Nuevo Tutor Externo'}
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fbfbfb' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Vinculación al Sistema
                        </Typography>
                        <FormControl fullWidth error={!!errors.idUsuario}>
                            <InputLabel>Usuario (debe tener rol TUTOR_EXTERNO)</InputLabel>
                            <Select value={formData.idUsuario} label="Usuario (debe tener rol TUTOR_EXTERNO)"
                                onChange={e => setFormData({ ...formData, idUsuario: e.target.value })} disabled={isEditing}>
                                {usuariosDisponibles
                                    .filter(u => !isEditing || u.id === formData.idUsuario)
                                    .map(u => (
                                        <MenuItem key={u.id} value={u.id}>
                                            {`${u.nombres} ${u.apellidoPaterno} (${u.username})`}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Empresa y Sede
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <FormControl sx={{ flex: 1 }}>
                                <InputLabel>Empresa</InputLabel>
                                <Select value={formData.idEmpresa} label="Empresa"
                                    onChange={e => {
                                        const emp = empresas.find(ep => ep.id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            idEmpresa: e.target.value,
                                            empresaNombre: emp ? emp.razonSocial : ''
                                        });
                                    }}>
                                    <MenuItem value=""><em>Seleccione</em></MenuItem>
                                    {empresas.map(emp => (
                                        <MenuItem key={emp.id} value={emp.id}>
                                            {emp.razonSocial}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField sx={{ flex: 1 }} label="Nombre de Empresa (manual)" value={formData.empresaNombre}
                                onChange={e => setFormData({ ...formData, empresaNombre: e.target.value })} />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Datos del Cargo
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Cargo *" value={formData.cargo}
                                onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                                error={!!errors.cargo} helperText={errors.cargo} />
                            <TextField sx={{ flex: 1 }} label="Área" value={formData.area}
                                onChange={e => setFormData({ ...formData, area: e.target.value })} />
                        </Box>
                        <FormControl fullWidth>
                            <InputLabel>Estado del Tutor</InputLabel>
                            <Select value={formData.estadoTutor} label="Estado del Tutor"
                                onChange={e => setFormData({ ...formData, estadoTutor: e.target.value })}>
                                {ESTADO_TUTOR_OPTS.map(et => <MenuItem key={et} value={et}>{et}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Cancelar</Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={<SaveIcon />} sx={{ px: 4, borderRadius: 2 }}>
                        {isEditing ? 'Actualizar' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 2, '& .MuiDrawer-paper': { width: 620 } }}>
                {detalleLoading ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
                ) : selectedTutor ? (
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <IconButton onClick={() => setDrawerOpen(false)}><ArrowBackIcon /></IconButton>
                            <Typography variant="h5" fontWeight="bold">Detalle del Tutor</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3, p: 2.5, bgcolor: '#f8fafc', borderRadius: 3 }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22 }}>
                                <PersonIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">{getNombreUsuario(selectedTutor)}</Typography>
                                <Typography variant="body2" color="textSecondary">{selectedTutor.username || ''}</Typography>
                                <Chip label={getEstado(selectedTutor)} size="small"
                                    color={getEstado(selectedTutor) === 'ACTIVO' ? 'success' : 'error'}
                                    sx={{ mt: 0.5 }} />
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Información de Contacto</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Correo:</strong> {getEmailUsuario(selectedTutor)}</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Teléfono:</strong> {selectedTutor.telefono || '—'}</Typography>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Empresa y Cargo</Typography>
                        <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                            <Typography variant="body2"><strong>Empresa:</strong> {selectedTutor.empresaNombre || selectedTutor.razonSocialEmpresa || '—'}</Typography>
                            <Typography variant="body2"><strong>Sede:</strong> {selectedTutor.nombreSede || '—'}</Typography>
                            <Typography variant="body2"><strong>Cargo:</strong> {selectedTutor.cargo || '—'}</Typography>
                            <Typography variant="body2"><strong>Área:</strong> {selectedTutor.area || '—'}</Typography>
                        </Alert>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Auditoría</Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                            <strong>Registro creado:</strong> {selectedTutor.fechaCreacion ? new Date(selectedTutor.fechaCreacion).toLocaleString() : '—'}
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                            <strong>Última actualización:</strong> {selectedTutor.fechaActualizacion ? new Date(selectedTutor.fechaActualizacion).toLocaleString() : '—'}
                        </Typography>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Button variant="outlined" color="primary" onClick={() => { setDrawerOpen(false); handleOpenDialog(selectedTutor); }} fullWidth startIcon={<EditIcon />}>
                                Editar Perfil de Tutor
                            </Button>
                            <Button variant="contained" color={getEstado(selectedTutor) === 'ACTIVO' ? 'error' : 'success'}
                                onClick={() => { setDrawerOpen(false); handleToggleEstado(selectedTutor); }} fullWidth
                                startIcon={getEstado(selectedTutor) === 'ACTIVO' ? <CancelIcon /> : <CheckCircleIcon />}>
                                {getEstado(selectedTutor) === 'ACTIVO' ? 'Deshabilitar Tutor' : 'Habilitar Tutor'}
                            </Button>
                        </Box>
                    </Box>
                ) : null}
            </Drawer>
        </ModulePageShell>
    );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Tooltip,
    TablePagination, MenuItem, Checkbox, ListItemText, OutlinedInput, Select, FormControl, InputLabel,
    Drawer, Divider, Alert, CircularProgress, TableSortLabel, Avatar, Stack
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import LockIcon from '@mui/icons-material/Lock';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import {
    ModulePageShell, ModulePageHeader, ModuleToolbar, ModuleTableContainer, moduleHeadCellSx, moduleSortLabelSx,
} from '../../../shared/components/module/ModulePageShell';
import { usuariosApi } from '../../../api/usuariosApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ROLES_DISPONIBLES = [
    'ESTUDIANTE', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'SECRETARIA',
    'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'ADMIN_SISTEMA'
];

const TIPO_USUARIO_OPTS = ['INTERNO', 'EXTERNO'];

const TIPO_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE', 'CARNET_EXTRANJERIA'];

const ESTADOS_FILTRO = ['todos', 'ACTIVO', 'INACTIVO', 'BLOQUEADO'];

const TIPO_USUARIO_FILTRO = ['todos', 'INTERNO', 'EXTERNO'];

const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0).toUpperCase() : '';
    const a = apellido ? apellido.charAt(0).toUpperCase() : '';
    return n + a || '?';
};

const roleColorMap = {
    ESTUDIANTE: 'primary',
    DOCENTE_ASESOR: 'secondary',
    TUTOR_EXTERNO: 'success',
    SECRETARIA: 'warning',
    COMITE_PRACTICAS: 'info',
    COORDINADOR: 'secondary',
    DIRECTOR: 'error',
    ADMIN_SISTEMA: 'error'
};

export const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('username');

    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroRol, setFiltroRol] = useState('todos');
    const [filtroTipoUsuario, setFiltroTipoUsuario] = useState('todos');

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        username: '', password: '', email: '', nombres: '',
        apellidoPaterno: '', apellidoMaterno: '', numeroDocumento: '',
        tipoDocumento: 'DNI', telefono: '', roles: [], tipoUsuario: 'INTERNO'
    });
    const [errors, setErrors] = useState({});

    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [detalleLoading, setDetalleLoading] = useState(false);

    const [openRolDialog, setOpenRolDialog] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState([]);

    useEffect(() => {
        loadUsuarios();
    }, []);

    const buildFilterParams = () => {
        const params = {};
        if (searchTerm) params.nombre = searchTerm;
        if (filtroEstado !== 'todos') params.estado = filtroEstado;
        if (filtroRol !== 'todos') params.rol = filtroRol;
        if (filtroTipoUsuario !== 'todos') params.tipoUsuario = filtroTipoUsuario;
        return params;
    };

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const params = buildFilterParams();
            const res = await usuariosApi.getAll({ params });
            setUsuarios(res.data.data || []);
        } catch (error) {
            console.error("Error loading usuarios:", error);
            MySwal.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsuarios();
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filtroEstado, filtroRol, filtroTipoUsuario]);

    const loadDetalle = async (id) => {
        try {
            setDetalleLoading(true);
            const res = await usuariosApi.getDetalle(id);
            setSelectedUsuario(res.data.data);
            setDrawerOpen(true);
        } catch (error) {
            console.error("Error loading detalle:", error);
            MySwal.fire('Error', 'No se pudo cargar el detalle del usuario.', 'error');
        } finally {
            setDetalleLoading(false);
        }
    };

    const handleOpenDialog = (usuario = null) => {
        if (usuario) {
            setIsEditing(true);
            setCurrentId(usuario.id);
            setFormData({
                username: usuario.username || '',
                password: '',
                email: usuario.email || '',
                nombres: usuario.nombres || '',
                apellidoPaterno: usuario.apellidoPaterno || '',
                apellidoMaterno: usuario.apellidoMaterno || '',
                numeroDocumento: usuario.numeroDocumento || '',
                tipoDocumento: usuario.tipoDocumento || 'DNI',
                telefono: usuario.telefono || '',
                roles: usuario.roles || [],
                tipoUsuario: usuario.tipoUsuario || 'INTERNO'
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                username: '', password: '', email: '', nombres: '',
                apellidoPaterno: '', apellidoMaterno: '', numeroDocumento: '',
                tipoDocumento: 'DNI', telefono: '', roles: [], tipoUsuario: 'INTERNO'
            });
        }
        setErrors({});
        setOpenDialog(true);
    };

    const validate = () => {
        const temp = {};
        if (!formData.username?.trim()) temp.username = "Nombre de usuario requerido";
        if (!isEditing && !formData.password) temp.password = "Contraseña requerida";
        if (!formData.email?.trim()) temp.email = "Correo electrónico requerido";
        if (!formData.nombres?.trim()) temp.nombres = "Nombres requeridos";
        if (!formData.apellidoPaterno?.trim()) temp.apellidoPaterno = "Apellido paterno requerido";
        if (!formData.numeroDocumento?.trim()) temp.numeroDocumento = "Número de documento requerido";
        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            if (isEditing) {
                const { roles, ...dataToSend } = formData;
                await usuariosApi.update(currentId, dataToSend);
                if (roles && roles.length > 0) {
                    await usuariosApi.assignRoles(currentId, roles);
                }
                MySwal.fire({ icon: 'success', title: '¡Usuario Actualizado!', text: 'Los datos se guardaron correctamente.', timer: 2000, showConfirmButton: false });
            } else {
                await usuariosApi.create(formData);
                MySwal.fire({ icon: 'success', title: '¡Usuario Creado!', text: 'El usuario se registró correctamente.', timer: 2000, showConfirmButton: false });
            }
            setOpenDialog(false);
            loadUsuarios();
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Error al procesar la solicitud';
            MySwal.fire('Error', msg, 'error');
        }
    };

    const handleToggleEstado = async (usuario) => {
        const accion = usuario.activo ? 'deshabilitar' : 'habilitar';
        const result = await MySwal.fire({
            title: `¿${usuario.activo ? 'Deshabilitar' : 'Habilitar'} Usuario?`,
            text: `Se ${usuario.activo ? 'deshabilitará el acceso' : 'restablecerá el acceso'} de ${usuario.nombres} ${usuario.apellidoPaterno}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: usuario.activo ? '#d33' : '#3085d6',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const nuevoEstado = usuario.activo ? 'INACTIVO' : 'ACTIVO';
                await usuariosApi.cambiarEstado(usuario.id, { estado: nuevoEstado });
                MySwal.fire({ icon: 'success', title: `Usuario ${usuario.activo ? 'deshabilitado' : 'habilitado'}`, timer: 1500, showConfirmButton: false });
                loadUsuarios();
            } catch (error) {
                MySwal.fire('Error', error.response?.data?.message || 'No se pudo cambiar el estado.', 'error');
            }
        }
    };

    const handleUnlock = async (id) => {
        try {
            await usuariosApi.unlock(id);
            MySwal.fire({ icon: 'success', title: 'Cuenta desbloqueada', timer: 1500, showConfirmButton: false });
            loadUsuarios();
        } catch (error) {
            MySwal.fire('Error', 'No se pudo desbloquear la cuenta.', 'error');
        }
    };

    const handleOpenRoles = async (usuario) => {
        setCurrentId(usuario.id);
        setSelectedRoles(usuario.roles || []);
        setOpenRolDialog(true);
    };

    const handleSaveRoles = async () => {
        try {
            await usuariosApi.assignRoles(currentId, selectedRoles);
            MySwal.fire({ icon: 'success', title: 'Roles actualizados', timer: 1500, showConfirmButton: false });
            setOpenRolDialog(false);
            loadUsuarios();
        } catch (error) {
            MySwal.fire('Error', error.response?.data?.message || 'No se pudieron actualizar los roles.', 'error');
        }
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFiltroEstado('todos');
        setFiltroRol('todos');
        setFiltroTipoUsuario('todos');
    };

    const sortedUsuarios = useMemo(() => {
        const list = [...usuarios];
        list.sort((a, b) => {
            let aVal = a[orderBy] || '';
            let bVal = b[orderBy] || '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [usuarios, orderBy, order]);

    const paginatedUsuarios = sortedUsuarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const headCells = [
        { id: 'username', label: 'Usuario' },
        { id: 'nombres', label: 'Nombre Completo' },
        { id: 'email', label: 'Correo' },
        { id: 'numeroDocumento', label: 'Documento' },
        { id: 'tipoUsuario', label: 'Tipo' },
        { id: 'roles', label: 'Roles' },
        { id: 'activo', label: 'Estado' },
        { id: 'acciones', label: 'Acciones', sortable: false }
    ];

    if (loading && usuarios.length === 0) {
        return (
            <ModulePageShell sx={{ textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>Cargando usuarios...</Typography>
            </ModulePageShell>
        );
    }

    return (
        <ModulePageShell>
            <ModulePageHeader
                icon={<AdminPanelSettingsIcon />}
                title="Gestión de Usuarios"
                subtitle="Administración de cuentas, roles y acceso al sistema SGPP."
            />

            <ModuleToolbar>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' }, alignItems: { lg: 'center' }, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
                            <TextField size="small" variant="outlined" placeholder="Buscar por nombre, correo o documento..."
                                value={searchTerm} onChange={handleSearchChange}
                                slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>), sx: { bgcolor: '#fff', borderRadius: 2, minWidth: { xs: '100%', sm: 280 } } } }} />
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                                <InputLabel>Estado</InputLabel>
                                <Select value={filtroEstado} label="Estado" onChange={(e) => setFiltroEstado(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                                    {ESTADOS_FILTRO.map(e => <MenuItem key={e} value={e}>{e === 'todos' ? 'Todos' : e.charAt(0) + e.slice(1).toLowerCase()}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                                <InputLabel>Rol</InputLabel>
                                <Select value={filtroRol} label="Rol" onChange={(e) => setFiltroRol(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                                    <MenuItem value="todos">Todos</MenuItem>
                                    {ROLES_DISPONIBLES.map(r => <MenuItem key={r} value={r}>{r.replace(/_/g, ' ')}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                                <InputLabel>Tipo Usuario</InputLabel>
                                <Select value={filtroTipoUsuario} label="Tipo Usuario" onChange={(e) => setFiltroTipoUsuario(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                                    {TIPO_USUARIO_FILTRO.map(t => <MenuItem key={t} value={t}>{t === 'todos' ? 'Todos' : t}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>
                        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
                            sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: 2, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' }, minHeight: '40px' }}>
                            Nuevo Usuario
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outlined" size="medium" onClick={limpiarFiltros} startIcon={<FilterListIcon />}
                            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}>Limpiar Filtros</Button>
                    </Box>
                </Box>
            </ModuleToolbar>

            <ModuleTableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            {headCells.map((hc) => (
                                <TableCell key={hc.id} sx={moduleHeadCellSx}>
                                    {hc.sortable !== false ? (
                                        <TableSortLabel active={orderBy === hc.id} direction={orderBy === hc.id ? order : 'asc'}
                                            onClick={() => handleSort(hc.id)} sx={moduleSortLabelSx}>
                                            {hc.label}
                                        </TableSortLabel>
                                    ) : hc.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsuarios.map((usuario) => (
                            <TableRow key={usuario.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 14, fontWeight: 'bold' }}>
                                            {getInitials(usuario.nombres, usuario.apellidoPaterno)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{usuario.username}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {usuario.tipoUsuario || '—'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{`${usuario.nombres} ${usuario.apellidoPaterno}${usuario.apellidoMaterno ? ' ' + usuario.apellidoMaterno : ''}`}</TableCell>
                                <TableCell>{usuario.email}</TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="textSecondary">
                                        {usuario.tipoDocumento}
                                    </Typography>
                                    <Typography variant="body2">{usuario.numeroDocumento}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={usuario.tipoUsuario || '—'} size="small"
                                        color={usuario.tipoUsuario === 'INTERNO' ? 'info' : 'default'} variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                                        {(usuario.roles || []).slice(0, 2).map(rol => (
                                            <Chip key={rol} label={rol.replace(/_/g, ' ')} size="small"
                                                color={roleColorMap[rol] || 'default'} variant="outlined" sx={{ fontSize: 11 }} />
                                        ))}
                                        {(usuario.roles || []).length > 2 && (
                                            <Chip label={`+${usuario.roles.length - 2}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={0.5}>
                                        <Chip label={usuario.activo ? 'Activo' : 'Inactivo'}
                                            color={usuario.activo ? 'success' : 'error'} size="small" />
                                        {usuario.cuentaBloqueada && (
                                            <Chip label="Bloqueado" color="warning" size="small" icon={<LockIcon fontSize="small" />} />
                                        )}
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={0.3}>
                                        <Tooltip title="Ver Detalle">
                                            <IconButton size="small" color="info" onClick={() => loadDetalle(usuario.id)}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Editar">
                                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(usuario)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Gestionar Roles">
                                            <IconButton size="small" color="secondary" onClick={() => handleOpenRoles(usuario)}>
                                                <AdminPanelSettingsIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {usuario.cuentaBloqueada && (
                                            <Tooltip title="Desbloquear">
                                                <IconButton size="small" color="warning" onClick={() => handleUnlock(usuario.id)}>
                                                    <LockOpenIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title={usuario.activo ? 'Deshabilitar' : 'Habilitar'}>
                                            <IconButton size="small" color={usuario.activo ? 'error' : 'success'} onClick={() => handleToggleEstado(usuario)}>
                                                {usuario.activo ? <DeleteIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {sortedUsuarios.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    <Typography variant="h6" color="textSecondary">No se encontraron usuarios con los filtros aplicados.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ModuleTableContainer>

            <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={sortedUsuarios.length}
                rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                labelRowsPerPage="Filas por página:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`} />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: '#fff', pb: 2 }}>
                    {isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fbfbfb' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Credenciales
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Nombre de Usuario *" value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                error={!!errors.username} helperText={errors.username} disabled={isEditing} />
                            {!isEditing && (
                                <TextField sx={{ flex: 1 }} label="Contraseña *" type="password" value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    error={!!errors.password} helperText={errors.password} />
                            )}
                            {isEditing && (
                                <TextField sx={{ flex: 1 }} label="Nueva Contraseña (dejar vacío si no cambia)" type="password" value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            )}
                        </Box>
                        <TextField fullWidth label="Correo Electrónico *" type="email" value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            error={!!errors.email} helperText={errors.email} />

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Datos Personales
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Nombres *" value={formData.nombres}
                                onChange={e => setFormData({ ...formData, nombres: e.target.value })}
                                error={!!errors.nombres} helperText={errors.nombres} />
                            <TextField sx={{ flex: 1 }} label="Apellido Paterno *" value={formData.apellidoPaterno}
                                onChange={e => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                                error={!!errors.apellidoPaterno} helperText={errors.apellidoPaterno} />
                            <TextField sx={{ flex: 1 }} label="Apellido Materno" value={formData.apellidoMaterno}
                                onChange={e => setFormData({ ...formData, apellidoMaterno: e.target.value })} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <FormControl sx={{ flex: 1 }}>
                                <InputLabel>Tipo Documento</InputLabel>
                                <Select value={formData.tipoDocumento} label="Tipo Documento"
                                    onChange={e => setFormData({ ...formData, tipoDocumento: e.target.value })}>
                                    {TIPO_DOCUMENTO.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField sx={{ flex: 2 }} label="Número Documento *" value={formData.numeroDocumento}
                                onChange={e => setFormData({ ...formData, numeroDocumento: e.target.value })}
                                error={!!errors.numeroDocumento} helperText={errors.numeroDocumento} />
                            <TextField sx={{ flex: 1 }} label="Teléfono" value={formData.telefono}
                                onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            Clasificación y Roles
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <FormControl sx={{ flex: 1 }}>
                                <InputLabel>Tipo de Usuario</InputLabel>
                                <Select value={formData.tipoUsuario} label="Tipo de Usuario"
                                    onChange={e => setFormData({ ...formData, tipoUsuario: e.target.value })}>
                                    {TIPO_USUARIO_OPTS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ flex: 2 }}>
                                <InputLabel>Roles</InputLabel>
                                <Select multiple value={formData.roles}
                                    onChange={e => setFormData({ ...formData, roles: e.target.value })}
                                    input={<OutlinedInput label="Roles" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map(v => <Chip key={v} label={v.replace(/_/g, ' ')} size="small" />)}
                                        </Box>
                                    )}>
                                    {ROLES_DISPONIBLES.map(r => (
                                        <MenuItem key={r} value={r}>
                                            <Checkbox checked={formData.roles.indexOf(r) > -1} />
                                            <ListItemText primary={r.replace(/_/g, ' ')} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSubmit} startIcon={<SaveIcon />} sx={{ px: 4, borderRadius: 2 }}>
                        {isEditing ? 'Actualizar' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openRolDialog} onClose={() => setOpenRolDialog(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ bgcolor: 'secondary.main', color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminPanelSettingsIcon /> Gestionar Roles
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 3 }, mt: 1 }}>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Roles del Usuario</InputLabel>
                        <Select multiple value={selectedRoles}
                            onChange={e => setSelectedRoles(e.target.value)}
                            input={<OutlinedInput label="Roles del Usuario" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map(v => <Chip key={v} label={v.replace(/_/g, ' ')} size="small" />)}
                                </Box>
                            )}>
                            {ROLES_DISPONIBLES.map(r => (
                                <MenuItem key={r} value={r}>
                                    <Checkbox checked={selectedRoles.indexOf(r) > -1} />
                                    <ListItemText primary={r.replace(/_/g, ' ')} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setOpenRolDialog(false)} color="inherit">Cancelar</Button>
                    <Button variant="contained" color="secondary" onClick={handleSaveRoles}>Guardar Roles</Button>
                </DialogActions>
            </Dialog>

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 2, '& .MuiDrawer-paper': { width: 680 } }}>
                {detalleLoading ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
                ) : selectedUsuario ? (
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <IconButton onClick={() => setDrawerOpen(false)}><ArrowBackIcon /></IconButton>
                            <Typography variant="h5" fontWeight="bold">Detalle del Usuario</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3, p: 2.5, bgcolor: '#f8fafc', borderRadius: 3 }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22, fontWeight: 'bold' }}>
                                {getInitials(selectedUsuario.nombres, selectedUsuario.apellidoPaterno)}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">
                                    {selectedUsuario.nombres} {selectedUsuario.apellidoPaterno} {selectedUsuario.apellidoMaterno || ''}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">@{selectedUsuario.username}</Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                    <Chip label={selectedUsuario.activo ? 'Activo' : 'Inactivo'} size="small"
                                        color={selectedUsuario.activo ? 'success' : 'error'} />
                                    {selectedUsuario.cuentaBloqueada && <Chip label="Bloqueado" size="small" color="warning" />}
                                    <Chip label={selectedUsuario.tipoUsuario || '—'} size="small" variant="outlined" />
                                </Stack>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Información de Contacto</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Correo:</strong> {selectedUsuario.email}</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Teléfono:</strong> {selectedUsuario.telefono || '—'}</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Documento:</strong> {selectedUsuario.tipoDocumento}: {selectedUsuario.numeroDocumento}
                        </Typography>
                        {selectedUsuario.codigoInstitucional && (
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Código Institucional:</strong> {selectedUsuario.codigoInstitucional}
                            </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Roles Asignados</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selectedUsuario.roles || []).map(r => (
                                <Chip key={r.id || r} label={(r.nombre || r).replace(/_/g, ' ')}
                                    color={roleColorMap[r.nombre || r] || 'default'} />
                            ))}
                            {(!selectedUsuario.roles || selectedUsuario.roles.length === 0) && (
                                <Typography variant="body2" color="textSecondary">Sin roles asignados</Typography>
                            )}
                        </Box>

                        {selectedUsuario.tipoUsuario === 'INTERNO' && (selectedUsuario.docente || selectedUsuario.estudiante) && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Perfil Asociado</Typography>
                                {selectedUsuario.docente && (
                                    <Alert icon={<PersonIcon />} severity="info" sx={{ borderRadius: 2, mb: 1 }}>
                                        <Typography variant="body2"><strong>Docente:</strong> {selectedUsuario.docente.codigoDocente}</Typography>
                                        <Typography variant="body2"><strong>Categoría:</strong> {selectedUsuario.docente.categoria || '—'}</Typography>
                                        <Typography variant="body2"><strong>Especialidad:</strong> {selectedUsuario.docente.especialidad || '—'}</Typography>
                                    </Alert>
                                )}
                                {selectedUsuario.estudiante && (
                                    <Alert icon={<PersonIcon />} severity="info" sx={{ borderRadius: 2 }}>
                                        <Typography variant="body2"><strong>Estudiante:</strong> {selectedUsuario.estudiante.codigoEstudiantil}</Typography>
                                        <Typography variant="body2"><strong>Semestre:</strong> {selectedUsuario.estudiante.semestreActual}</Typography>
                                        <Typography variant="body2"><strong>Créditos Aprobados:</strong> {selectedUsuario.estudiante.creditosAprobados}</Typography>
                                    </Alert>
                                )}
                            </>
                        )}

                        {selectedUsuario.tutorExterno && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Perfil Tutor Externo</Typography>
                                <Alert icon={<PersonIcon />} severity="success" sx={{ borderRadius: 2 }}>
                                    <Typography variant="body2"><strong>Empresa:</strong> {selectedUsuario.tutorExterno.empresaNombre}</Typography>
                                    <Typography variant="body2"><strong>Cargo:</strong> {selectedUsuario.tutorExterno.cargo}</Typography>
                                    <Typography variant="body2"><strong>Área:</strong> {selectedUsuario.tutorExterno.area || '—'}</Typography>
                                </Alert>
                            </>
                        )}

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Auditoría</Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                            <strong>Creado:</strong> {selectedUsuario.fechaRegistro ? new Date(selectedUsuario.fechaRegistro).toLocaleString() : '—'}
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                            <strong>Última actualización:</strong> {selectedUsuario.fechaActualizacion ? new Date(selectedUsuario.fechaActualizacion).toLocaleString() : '—'}
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                            <strong>Último acceso:</strong> {selectedUsuario.fechaUltimoAcceso ? new Date(selectedUsuario.fechaUltimoAcceso).toLocaleString() : '—'}
                        </Typography>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button variant="outlined" color="primary" onClick={() => { setDrawerOpen(false); handleOpenRoles(selectedUsuario); }} fullWidth startIcon={<AdminPanelSettingsIcon />}>
                                Gestionar Roles
                            </Button>
                            <Button variant="outlined" color="primary" onClick={() => { setDrawerOpen(false); handleOpenDialog(selectedUsuario); }} fullWidth startIcon={<EditIcon />}>
                                Editar Usuario
                            </Button>
                        </Box>
                        <Box sx={{ mt: 1.5, display: 'flex', gap: 2 }}>
                            {selectedUsuario.cuentaBloqueada && (
                                <Button variant="contained" color="warning" onClick={() => { setDrawerOpen(false); handleUnlock(selectedUsuario.id); }} fullWidth startIcon={<LockOpenIcon />}>
                                    Desbloquear Cuenta
                                </Button>
                            )}
                            <Button variant="contained" color={selectedUsuario.activo ? 'error' : 'success'}
                                onClick={() => { setDrawerOpen(false); handleToggleEstado(selectedUsuario); }} fullWidth
                                startIcon={selectedUsuario.activo ? <BlockIcon /> : <CheckCircleIcon />}>
                                {selectedUsuario.activo ? 'Deshabilitar Usuario' : 'Habilitar Usuario'}
                            </Button>
                        </Box>
                    </Box>
                ) : null}
            </Drawer>
        </ModulePageShell>
    );
};

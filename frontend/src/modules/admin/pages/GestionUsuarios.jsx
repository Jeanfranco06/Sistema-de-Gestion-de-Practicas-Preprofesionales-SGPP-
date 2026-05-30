import React, { useState, useEffect, useMemo } from 'react';
import { 
    Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, InputAdornment, Tooltip,
    TablePagination, MenuItem, Checkbox, ListItemText, OutlinedInput, Select, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import { usuariosApi } from '../../../api/usuariosApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ROLES_DISPONIBLES = [
    'ESTUDIANTE', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'SECRETARIA', 
    'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR'
];

const TIPO_DOCUMENTO = ['DNI', 'PASAPORTE', 'CARNET_EXTRANJERIA'];

export const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const initialFormState = {
        username: '', password: '', email: '', nombres: '', 
        apellidoPaterno: '', apellidoMaterno: '', numeroDocumento: '', 
        tipoDocumento: 'DNI', telefono: '', roles: []
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            const res = await usuariosApi.getAll();
            setUsuarios(res.data.data);
        } catch (error) {
            console.error("Error loading usuarios:", error);
        }
    };

    const handleOpenDialog = (usuario = null) => {
        if (usuario) {
            setIsEditing(true);
            setCurrentId(usuario.id);
            setFormData({
                username: usuario.username || '',
                password: '', // No mostrar contraseña al editar
                email: usuario.email || '',
                nombres: usuario.nombres || '',
                apellidoPaterno: usuario.apellidoPaterno || '',
                apellidoMaterno: usuario.apellidoMaterno || '',
                numeroDocumento: usuario.numeroDocumento || '',
                tipoDocumento: usuario.tipoDocumento || 'DNI',
                telefono: usuario.telefono || '',
                roles: usuario.roles || []
            });
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
        if (!formData.username) tempErrors.username = "Usuario requerido";
        if (!isEditing && !formData.password) tempErrors.password = "Contraseña requerida";
        if (!formData.email) tempErrors.email = "Email requerido";
        if (!formData.nombres) tempErrors.nombres = "Nombres requeridos";
        if (!formData.apellidoPaterno) tempErrors.apellidoPaterno = "Apellido paterno requerido";
        if (!formData.numeroDocumento) tempErrors.numeroDocumento = "Documento requerido";
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            if (isEditing) {
                await usuariosApi.update(currentId, formData);
                await usuariosApi.assignRoles(currentId, formData.roles);
                MySwal.fire('¡Éxito!', 'Usuario actualizado correctamente', 'success');
            } else {
                await usuariosApi.create(formData);
                MySwal.fire('¡Éxito!', 'Usuario creado correctamente', 'success');
            }
            setOpenDialog(false);
            loadUsuarios();
        } catch (error) {
            MySwal.fire('Error', error.response?.data?.message || 'Error al procesar la solicitud', 'error');
        }
    };

    const handleDisable = async (id) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "Se deshabilitará el acceso al usuario",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, deshabilitar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await usuariosApi.disable(id);
                MySwal.fire('Deshabilitado', 'El usuario ha sido deshabilitado', 'success');
                loadUsuarios();
            } catch (error) {
                MySwal.fire('Error', 'No se pudo deshabilitar el usuario', 'error');
            }
        }
    };

    const handleUnlock = async (id) => {
        try {
            await usuariosApi.unlock(id);
            MySwal.fire('¡Éxito!', 'Cuenta desbloqueada', 'success');
            loadUsuarios();
        } catch (error) {
            MySwal.fire('Error', 'No se pudo desbloquear la cuenta', 'error');
        }
    };

    const filteredUsuarios = useMemo(() => {
        return usuarios.filter(u => 
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.numeroDocumento.includes(searchTerm)
        );
    }, [usuarios, searchTerm]);

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Gestión de Usuarios
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Nuevo Usuario
                    </Button>
                </Box>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar por usuario, nombre o documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Paper>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'primary.main' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white' }}>Usuario</TableCell>
                                <TableCell sx={{ color: 'white' }}>Nombre Completo</TableCell>
                                <TableCell sx={{ color: 'white' }}>Documento</TableCell>
                                <TableCell sx={{ color: 'white' }}>Roles</TableCell>
                                <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                                <TableCell sx={{ color: 'white' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsuarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((usuario) => (
                                <TableRow key={usuario.id}>
                                    <TableCell>{usuario.username}</TableCell>
                                    <TableCell>{`${usuario.nombres} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno || ''}`}</TableCell>
                                    <TableCell>{`${usuario.tipoDocumento}: ${usuario.numeroDocumento}`}</TableCell>
                                    <TableCell>
                                        {usuario.roles.map(rol => (
                                            <Chip key={rol} label={rol} size="small" sx={{ m: 0.5 }} />
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={usuario.activo ? 'Activo' : 'Inactivo'} 
                                            color={usuario.activo ? 'success' : 'error'}
                                            size="small"
                                        />
                                        {usuario.cuentaBloqueada && (
                                            <Chip label="Bloqueado" color="warning" size="small" sx={{ ml: 1 }} />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Editar">
                                            <IconButton onClick={() => handleOpenDialog(usuario)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {usuario.cuentaBloqueada && (
                                            <Tooltip title="Desbloquear">
                                                <IconButton onClick={() => handleUnlock(usuario.id)} color="warning">
                                                    <LockOpenIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Deshabilitar">
                                            <IconButton onClick={() => handleDisable(usuario.id)} color="error" disabled={!usuario.activo}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredUsuarios.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(page)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>
            </Box>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                error={!!errors.username} helperText={errors.username}
                                disabled={isEditing}
                            />
                        </Grid>
                        {!isEditing && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Contraseña" type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    error={!!errors.password} helperText={errors.password}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Email" type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                error={!!errors.email} helperText={errors.email}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Nombres"
                                value={formData.nombres}
                                onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                                error={!!errors.nombres} helperText={errors.nombres}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Apellido Paterno"
                                value={formData.apellidoPaterno}
                                onChange={(e) => setFormData({...formData, apellidoPaterno: e.target.value})}
                                error={!!errors.apellidoPaterno} helperText={errors.apellidoPaterno}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Apellido Materno"
                                value={formData.apellidoMaterno}
                                onChange={(e) => setFormData({...formData, apellidoMaterno: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo Documento</InputLabel>
                                <Select
                                    value={formData.tipoDocumento}
                                    label="Tipo Documento"
                                    onChange={(e) => setFormData({...formData, tipoDocumento: e.target.value})}
                                >
                                    {TIPO_DOCUMENTO.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Número Documento"
                                value={formData.numeroDocumento}
                                onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})}
                                error={!!errors.numeroDocumento} helperText={errors.numeroDocumento}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Roles</InputLabel>
                                <Select
                                    multiple
                                    value={formData.roles}
                                    onChange={(e) => setFormData({...formData, roles: e.target.value})}
                                    input={<OutlinedInput label="Roles" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {ROLES_DISPONIBLES.map((rol) => (
                                        <MenuItem key={rol} value={rol}>
                                            <Checkbox checked={formData.roles.indexOf(rol) > -1} />
                                            <ListItemText primary={rol} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

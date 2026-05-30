import React, { useState, useEffect, useMemo } from 'react';
import { 
    Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, InputAdornment, Tooltip,
    TablePagination, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import { tutoresApi, usuariosApi } from '../../../api/usuariosApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const GestionTutores = () => {
    const [tutores, setTutores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const initialFormState = {
        idUsuario: '', cargo: '', area: '', empresaNombre: '', activo: true
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadTutores();
        loadUsuarios();
    }, []);

    const loadTutores = async () => {
        try {
            const res = await tutoresApi.getAll();
            setTutores(res.data.data);
        } catch (error) {
            console.error("Error loading tutores:", error);
        }
    };

    const loadUsuarios = async () => {
        try {
            const res = await usuariosApi.getAll();
            // Filtrar usuarios que tienen rol TUTOR_EXTERNO
            const tutoresUsers = res.data.data.filter(u => u.roles.includes('TUTOR_EXTERNO'));
            setUsuarios(tutoresUsers);
        } catch (error) {
            console.error("Error loading usuarios:", error);
        }
    };

    const handleOpenDialog = (tutor = null) => {
        if (tutor) {
            setIsEditing(true);
            setCurrentId(tutor.id);
            setFormData({
                idUsuario: tutor.idUsuario,
                cargo: tutor.cargo || '',
                area: tutor.area || '',
                empresaNombre: tutor.empresaNombre || '',
                activo: tutor.activo
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
        if (!formData.idUsuario) tempErrors.idUsuario = "Usuario requerido";
        if (!formData.cargo) tempErrors.cargo = "Cargo requerido";
        if (!formData.empresaNombre) tempErrors.empresaNombre = "Empresa requerida";
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            if (isEditing) {
                await tutoresApi.update(currentId, formData);
                MySwal.fire('¡Éxito!', 'Perfil de tutor actualizado', 'success');
            } else {
                await tutoresApi.create(formData);
                MySwal.fire('¡Éxito!', 'Perfil de tutor creado', 'success');
            }
            setOpenDialog(false);
            loadTutores();
        } catch (error) {
            MySwal.fire('Error', error.response?.data?.message || 'Error al procesar la solicitud', 'error');
        }
    };

    const handleDisable = async (id) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "Se deshabilitará el perfil del tutor",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, deshabilitar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await tutoresApi.disable(id);
                MySwal.fire('Deshabilitado', 'El tutor ha sido deshabilitado', 'success');
                loadTutores();
            } catch (error) {
                MySwal.fire('Error', 'No se pudo deshabilitar el tutor', 'error');
            }
        }
    };

    const filteredTutores = useMemo(() => {
        return tutores.filter(t => 
            t.empresaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.cargo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tutores, searchTerm]);

    const getUsuarioNombre = (idUsuario) => {
        const user = usuarios.find(u => u.id === idUsuario);
        return user ? `${user.nombres} ${user.apellidoPaterno}` : 'Desconocido';
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Gestión de Tutores Externos
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Nuevo Perfil Tutor
                    </Button>
                </Box>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar por empresa o cargo..."
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
                        <TableHead sx={{ bgcolor: 'secondary.main' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white' }}>Usuario</TableCell>
                                <TableCell sx={{ color: 'white' }}>Empresa</TableCell>
                                <TableCell sx={{ color: 'white' }}>Cargo / Área</TableCell>
                                <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                                <TableCell sx={{ color: 'white' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTutores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tutor) => (
                                <TableRow key={tutor.id}>
                                    <TableCell>{getUsuarioNombre(tutor.idUsuario)}</TableCell>
                                    <TableCell>{tutor.empresaNombre}</TableCell>
                                    <TableCell>{`${tutor.cargo} - ${tutor.area || 'N/A'}`}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={tutor.activo ? 'Activo' : 'Inactivo'} 
                                            color={tutor.activo ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Editar">
                                            <IconButton onClick={() => handleOpenDialog(tutor)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Deshabilitar">
                                            <IconButton onClick={() => handleDisable(tutor.id)} color="error" disabled={!tutor.activo}>
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
                        count={filteredTutores.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>
            </Box>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Editar Perfil Tutor' : 'Nuevo Perfil Tutor'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.idUsuario}>
                                <InputLabel>Usuario (con rol TUTOR_EXTERNO)</InputLabel>
                                <Select
                                    value={formData.idUsuario}
                                    label="Usuario (con rol TUTOR_EXTERNO)"
                                    onChange={(e) => setFormData({...formData, idUsuario: e.target.value})}
                                    disabled={isEditing}
                                >
                                    {usuarios.map(u => (
                                        <MenuItem key={u.id} value={u.id}>
                                            {`${u.nombres} ${u.apellidoPaterno} (${u.username})`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Empresa"
                                value={formData.empresaNombre}
                                onChange={(e) => setFormData({...formData, empresaNombre: e.target.value})}
                                error={!!errors.empresaNombre} helperText={errors.empresaNombre}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Cargo"
                                value={formData.cargo}
                                onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                                error={!!errors.cargo} helperText={errors.cargo}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Área"
                                value={formData.area}
                                onChange={(e) => setFormData({...formData, area: e.target.value})}
                            />
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

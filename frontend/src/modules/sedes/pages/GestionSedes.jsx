import React, { useState, useEffect, useMemo } from 'react';
import { 
    Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, 
    FormControl, Grid, InputAdornment, Tooltip, TablePagination, TableSortLabel 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import FilterListIcon from '@mui/icons-material/FilterList';
import { sedeApi, empresaApi } from '../../../api/sedesApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const GestionSedes = () => {
    const [sedes, setSedes] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Pagination and Sorting states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('nombreSede');

    const initialFormState = { 
        empresaId: '', nombreSede: '', direccion: '', distrito: '', 
        provincia: '', departamento: '', telefono: '', email: '', 
        nombreContacto: '', cargoContacto: '', telefonoContacto: '', 
        emailContacto: '', capacidadMaxima: '' 
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadSedes();
        loadEmpresas();
    }, []);

    const loadSedes = async () => {
        try {
            const res = await sedeApi.getAllActive();
            setSedes(res.data);
        } catch (error) {
            console.error("Error loading sedes:", error);
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

    const handleOpenDialog = (sede = null) => {
        if (sede) {
            setIsEditing(true);
            setCurrentId(sede.id);
            setFormData({
                empresaId: sede.empresaId || '',
                nombreSede: sede.nombreSede || '',
                direccion: sede.direccion || '',
                distrito: sede.distrito || '',
                provincia: sede.provincia || '',
                departamento: sede.departamento || '',
                telefono: sede.telefono || '',
                email: sede.email || '',
                nombreContacto: sede.nombreContacto || '',
                cargoContacto: sede.cargoContacto || '',
                telefonoContacto: sede.telefonoContacto || '',
                emailContacto: sede.emailContacto || '',
                capacidadMaxima: sede.capacidadMaxima || ''
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

    const filteredSedes = useMemo(() => {
        let filtered = sedes.filter(sede => {
            return sede.nombreSede?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   sede.razonSocialEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   sede.distrito?.toLowerCase().includes(searchTerm.toLowerCase());
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
    }, [sedes, searchTerm, orderBy, order]);

    const paginatedSedes = filteredSedes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <LocationCityIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        Gestión de Sedes
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        Administra las sedes operativas vinculadas a las empresas.
                    </Typography>
                </Box>
            </Box>

            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' }, flex: 1 }}>
                        <TextField 
                            size="small"
                            variant="outlined" 
                            placeholder="Buscar sede, empresa o distrito..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                                sx: { bgcolor: '#fff', borderRadius: 2, minWidth: { xs: '100%', sm: '400px' } }
                            }}
                        />
                    </Box>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenDialog()}
                        sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: 2, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' }, minHeight: '40px' }}
                    >
                        Nueva Sede
                    </Button>
                </Box>
            </Paper>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                                <TableSortLabel 
                                    active={orderBy === 'nombreSede'} direction={orderBy === 'nombreSede' ? order : 'asc'} 
                                    onClick={() => handleSort('nombreSede')} sx={{ color: '#fff !important', '& .MuiTableSortLabel-icon': { color: '#fff !important' } }}
                                >Sede</TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                                <TableSortLabel 
                                    active={orderBy === 'razonSocialEmpresa'} direction={orderBy === 'razonSocialEmpresa' ? order : 'asc'} 
                                    onClick={() => handleSort('razonSocialEmpresa')} sx={{ color: '#fff !important', '& .MuiTableSortLabel-icon': { color: '#fff !important' } }}
                                >Empresa</TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Ubicación</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Contacto Principal</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold', width: '100px' }}>Capacidad</TableCell>
                            <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedSedes.map((sede) => (
                            <TableRow key={sede.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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
                                    {sede.nombreContacto ? (
                                        <>
                                            <Typography variant="body2">{sede.nombreContacto}</Typography>
                                            <Typography variant="caption" color="textSecondary">{sede.telefonoContacto || sede.emailContacto}</Typography>
                                        </>
                                    ) : (
                                        <Typography variant="caption" color="textSecondary">Sin contacto asignado</Typography>
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip label={sede.capacidadMaxima || 0} color="secondary" size="small" />
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Editar Sede">
                                        <IconButton color="primary" onClick={() => handleOpenDialog(sede)}>
                                            <EditIcon />
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
                        {filteredSedes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <Typography variant="h6" color="textSecondary">No se encontraron sedes.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} sx={{ px: 4, borderRadius: 2 }}>{isEditing ? 'Actualizar' : 'Guardar'}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, InputAdornment, Tooltip,
    TablePagination, TableSortLabel, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  ModulePageShell, ModulePageHeader, ModuleToolbar, ModuleTableContainer, moduleHeadCellSx, moduleSortLabelSx,
} from '../../../shared/components/module/ModulePageShell';
import { empresaApi } from '../../../api/sedesApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const GestionEmpresas = () => {
    const [empresas, setEmpresas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    // Pagination and Sorting states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('razonSocial');
    const [filterEstado, setFilterEstado] = useState('todos'); // 'todos', 'activos', 'inactivos'

    const initialFormState = {
        ruc: '', razonSocial: '', nombreComercial: '', direccion: '', 
        distrito: '', provincia: '', departamento: '', pais: 'Perú', 
        telefono: '', email: '', paginaWeb: '', sectorEconomico: '', tamanoEmpresa: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadEmpresas();
    }, []);

    const loadEmpresas = async () => {
        try {
            const res = await empresaApi.getAll();
            setEmpresas(res.data);
        } catch (error) {
            console.error("Error loading empresas:", error);
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
        setOpenDialog(true);
    };

    const validate = (data = formData) => {
        let tempErrors = {};
        if (!data.ruc) {
            tempErrors.ruc = "El RUC es requerido";
        } else if (!/^\d{11}$/.test(data.ruc)) {
            tempErrors.ruc = "El RUC debe tener exactamente 11 dígitos";
        }
        
        if (!data.razonSocial) tempErrors.razonSocial = "La Razón Social es requerida";
        if (!data.sectorEconomico) tempErrors.sectorEconomico = "El Sector es requerido";
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        if (Object.keys(errors).length > 0) {
            validate(newData);
        }
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
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
            console.error("Error saving empresa:", error);
            const msg = error.response?.data?.message || error.response?.data?.error || "Ya existe una empresa con ese RUC o hubo un error en el servidor.";
            MySwal.fire('Error al guardar', msg, 'error');
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
                console.error("Error disabling empresa:", error);
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
                console.error("Error validating empresa:", error);
                MySwal.fire('Error', 'No se pudo validar la empresa.', 'error');
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

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const filteredEmpresas = useMemo(() => {
        let filtered = empresas.filter(emp => {
            const matchesSearch = emp.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  emp.ruc?.includes(searchTerm);
            const matchesFilter = filterEstado === 'todos' || 
                                  (filterEstado === 'validadas' && emp.validado) || 
                                  (filterEstado === 'pendientes' && !emp.validado);
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

    return (
        <ModulePageShell>
            <ModulePageHeader
                icon={<BusinessCenterIcon />}
                title="Gestión de Empresas"
                subtitle="Administra el catálogo de empresas aliadas y valida sus perfiles."
            />

            <ModuleToolbar>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' }, flex: 1 }}>
                        <TextField 
                            size="small"
                            variant="outlined" 
                            placeholder="Buscar empresa (Nombre o RUC)..." 
                            value={searchTerm}
                             onChange={handleSearchChange}
                            slotProps={{ input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                                sx: { bgcolor: '#fff', borderRadius: 2, minWidth: { xs: '100%', sm: '400px' } }
                            }}}
                        />
                        <TextField
                            select
                            size="small"
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            slotProps={{ input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FilterListIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                                sx: { bgcolor: '#fff', borderRadius: 2 }
                            }}}
                        >
                            <MenuItem value="todos">Todos los Estados</MenuItem>
                            <MenuItem value="validadas">Empresas Validadas</MenuItem>
                            <MenuItem value="pendientes">Pendientes de Validación</MenuItem>
                        </TextField>
                    </Box>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenDialog()}
                        sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: 2, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' }, minHeight: '40px' }}
                    >
                        Nueva Empresa
                    </Button>
                </Box>
            </ModuleToolbar>

            <ModuleTableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={moduleHeadCellSx}>
                                <TableSortLabel 
                                    active={orderBy === 'ruc'} direction={orderBy === 'ruc' ? order : 'asc'} 
                                    onClick={() => handleSort('ruc')} sx={moduleSortLabelSx}
                                >RUC</TableSortLabel>
                            </TableCell>
                            <TableCell sx={moduleHeadCellSx}>
                                <TableSortLabel 
                                    active={orderBy === 'razonSocial'} direction={orderBy === 'razonSocial' ? order : 'asc'} 
                                    onClick={() => handleSort('razonSocial')} sx={moduleSortLabelSx}
                                >Razón Social</TableSortLabel>
                            </TableCell>
                            <TableCell sx={moduleHeadCellSx}>Sector</TableCell>
                            <TableCell sx={moduleHeadCellSx}>Contacto</TableCell>
                            <TableCell sx={moduleHeadCellSx}>Estado</TableCell>
                            <TableCell align="center" sx={moduleHeadCellSx}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedEmpresas.map((emp) => (
                            <TableRow key={emp.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell fontWeight="medium">{emp.ruc}</TableCell>
                                <TableCell>{emp.razonSocial}</TableCell>
                                <TableCell>
                                    <Chip label={emp.sectorEconomico || 'N/A'} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{emp.email || 'Sin correo'}</Typography>
                                    <Typography variant="caption" color="textSecondary">{emp.telefono || 'Sin teléfono'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={emp.validado ? "Validada" : "Pendiente"} 
                                        color={emp.validado ? "success" : "warning"} 
                                        size="small" 
                                        sx={{ mr: 1, fontWeight: 'bold' }}
                                    />
                                    {!emp.activo && <Chip label="Inactiva" color="error" size="small" />}
                                </TableCell>
                                <TableCell align="center">
                                    {!emp.validado && emp.activo && (
                                        <Tooltip title="Validar Perfil">
                                            <IconButton color="success" onClick={() => handleValidate(emp.id)}>
                                                <CheckCircleIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Editar Empresa">
                                        <IconButton color="primary" onClick={() => handleOpenDialog(emp)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {emp.activo && (
                                        <Tooltip title="Deshabilitar Empresa">
                                            <IconButton color="error" onClick={() => handleDisable(emp.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredEmpresas.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <Typography variant="h6" color="textSecondary">No se encontraron empresas.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ModuleTableContainer>
            
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredEmpresas.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
            />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: '#fff', pb: 2 }}>
                    {isEditing ? 'Editar Empresa' : 'Registrar Nueva Empresa'}
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fbfbfb' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField 
                                sx={{ flex: 1 }} label="RUC *" value={formData.ruc} 
                                onChange={e => handleChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))} 
                                error={!!errors.ruc || (formData.ruc.length > 0 && formData.ruc.length < 11)} 
                                helperText={errors.ruc || (formData.ruc.length > 0 && formData.ruc.length < 11 ? "El RUC debe tener 11 dígitos" : "Ingrese el RUC (11 dígitos)")}
                                slotProps={{ htmlInput: { maxLength: 11 } }}
                            />
                            <TextField 
                                sx={{ flex: 2 }} label="Razón Social *" value={formData.razonSocial} 
                                onChange={e => handleChange('razonSocial', e.target.value)} 
                                error={!!errors.razonSocial} helperText={errors.razonSocial}
                                slotProps={{ htmlInput: { maxLength: 200 } }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Nombre Comercial" value={formData.nombreComercial} onChange={e => handleChange('nombreComercial', e.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
                            <TextField sx={{ flex: 1 }} label="Sector Económico *" value={formData.sectorEconomico} onChange={e => handleChange('sectorEconomico', e.target.value)} error={!!errors.sectorEconomico} helperText={errors.sectorEconomico} slotProps={{ htmlInput: { maxLength: 100 } }} />
                        </Box>

                        <Typography variant="subtitle2" color="primary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5, mt: 1 }}>
                            Contacto y Ubicación
                        </Typography>

                        <TextField fullWidth label="Dirección" value={formData.direccion} onChange={e => handleChange('direccion', e.target.value)} slotProps={{ htmlInput: { maxLength: 300 } }} sx={{ mb: 1 }} />
                        
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Distrito" value={formData.distrito} onChange={e => handleChange('distrito', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
                            <TextField sx={{ flex: 1 }} label="Provincia" value={formData.provincia} onChange={e => handleChange('provincia', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
                            <TextField sx={{ flex: 1 }} label="Departamento" value={formData.departamento} onChange={e => handleChange('departamento', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Teléfono" value={formData.telefono} onChange={e => handleChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 20))} slotProps={{ htmlInput: { maxLength: 20 } }} />
                            <TextField sx={{ flex: 1 }} label="Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField sx={{ flex: 1 }} label="Página Web" value={formData.paginaWeb} onChange={e => handleChange('paginaWeb', e.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
                            <TextField sx={{ flex: 1 }} label="Tamaño Empresa (Ej. Grande, Pyme)" value={formData.tamanoEmpresa} onChange={e => handleChange('tamanoEmpresa', e.target.value)} slotProps={{ htmlInput: { maxLength: 50 } }} />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f4f6f8' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} sx={{ px: 4, borderRadius: 2 }}>{isEditing ? 'Actualizar' : 'Guardar'}</Button>
                </DialogActions>
            </Dialog>
        </ModulePageShell>
    );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, IconButton, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, 
    InputLabel, FormControl, Grid, InputAdornment, Tooltip, TablePagination, TableSortLabel 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import HandshakeIcon from '@mui/icons-material/Handshake';
import FilterListIcon from '@mui/icons-material/FilterList';
import { convenioApi, empresaApi } from '../../../api/sedesApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
    ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';

const MySwal = withReactContent(Swal);

export const GestionConvenios = () => {
    const [convenios, setConvenios] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Pagination and Sorting states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('fechaInicio');
    const [filterVigencia, setFilterVigencia] = useState('todos');

    const initialFormState = { empresaId: '', numeroConvenio: '', fechaInicio: '', fechaFin: '', objetivo: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadConvenios();
        loadExpiring();
        loadEmpresas();
    }, []);

    const loadConvenios = async () => {
        try {
            const res = await convenioApi.getAllActive();
            setConvenios(res.data);
        } catch (error) {
            console.error("Error loading convenios:", error);
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
            // Solo empresas activas y validadas pueden tener convenios nuevos
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

    return (
        <ModulePageShell>
            <ModulePageHeader
                icon={<HandshakeIcon />}
                title="Gestión de Convenios"
                subtitle="Registra y monitorea los convenios activos con las empresas aliadas."
            />

            {expiring.length > 0 && (
                <Alert 
                    severity="warning" 
                    icon={<NotificationsActiveIcon fontSize="inherit" />} 
                    sx={{ mb: 4, borderRadius: 2, boxShadow: 1, border: '1px solid #ffcc80' }}
                >
                    <strong>¡Atención!</strong> Hay {expiring.length} convenio(s) próximo(s) a vencer en los siguientes 30 días. Por favor, revise las renovaciones para no afectar las prácticas de los estudiantes.
                </Alert>
            )}

            <ContentCard accent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Directorio de Convenios</Typography>
                
                <Box sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <TextField 
                        size="small"
                        variant="outlined" 
                        placeholder="Buscar por número o empresa..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        slotProps={{ input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { bgcolor: '#fff', borderRadius: 2, minWidth: { xs: '100%', sm: '320px' } }
                        }}}
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Estado de Convenio</InputLabel>
                        <Select
                            value={filterVigencia}
                            label="Estado de Convenio"
                            onChange={(e) => setFilterVigencia(e.target.value)}
                            sx={{ borderRadius: 2, bgcolor: '#fff' }}
                        >
                            <MenuItem value="todos">Todos los Estados</MenuItem>
                            <MenuItem value="vigentes">Convenios Vigentes</MenuItem>
                            <MenuItem value="vencidos">Convenios Vencidos</MenuItem>
                        </Select>
                    </FormControl>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenDialog()}
                        sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: 2, whiteSpace: 'nowrap' }}
                    >
                        Nuevo Convenio
                    </Button>
                </Box>

                <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    <TableSortLabel 
                                        active={orderBy === 'numeroConvenio'} direction={orderBy === 'numeroConvenio' ? order : 'asc'} 
                                        onClick={() => handleSort('numeroConvenio')}
                                    >N° Convenio</TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    <TableSortLabel 
                                        active={orderBy === 'razonSocialEmpresa'} direction={orderBy === 'razonSocialEmpresa' ? order : 'asc'} 
                                        onClick={() => handleSort('razonSocialEmpresa')}
                                    >Empresa</TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    <TableSortLabel 
                                        active={orderBy === 'fechaInicio'} direction={orderBy === 'fechaInicio' ? order : 'asc'} 
                                        onClick={() => handleSort('fechaInicio')}
                                    >Vigencia</TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                    <TableBody>
                        {paginatedConvenios.map((conv) => {
                            const isExpiring = expiring.some(e => e.id === conv.id);
                            return (
                                <TableRow key={conv.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell fontWeight="medium">{conv.numeroConvenio}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold" color="primary">
                                            {conv.razonSocialEmpresa}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{conv.fechaInicio} al {conv.fechaFin}</Typography>
                                        {isExpiring && (
                                            <Chip label="Por vencer" color="warning" size="small" sx={{ mt: 0.5, fontWeight: 'bold' }} />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={conv.vigente ? "Vigente" : "Vencido"} 
                                            color={conv.vigente ? "success" : "error"} 
                                            size="small" 
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Editar Convenio">
                                            <IconButton color="primary" onClick={() => handleOpenDialog(conv)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {conv.activo && (
                                            <Tooltip title="Deshabilitar Convenio">
                                                <IconButton color="error" onClick={() => handleDisable(conv.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filteredConvenios.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <Typography variant="h6" color="textSecondary">No se encontraron convenios.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredConvenios.length}
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
                    {isEditing ? 'Editar Convenio' : 'Registrar Nuevo Convenio'}
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fbfbfb' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField
                                select
                                sx={{ flex: 2 }}
                                label="Empresa Aliada (Validada) *"
                                value={formData.empresaId}
                                onChange={e => setFormData({...formData, empresaId: e.target.value})}
                                disabled={isEditing}
                                error={!!errors.empresaId}
                                helperText={errors.empresaId}
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
                                error={!!errors.numeroConvenio} helperText={errors.numeroConvenio}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <TextField 
                                sx={{ flex: 1 }} label="Fecha Inicio *" type="date"
                                InputLabelProps={{ shrink: true }} 
                                value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} 
                                error={!!errors.fechaInicio} helperText={errors.fechaInicio}
                            />
                            <TextField 
                                sx={{ flex: 1 }} label="Fecha Fin *" type="date"
                                InputLabelProps={{ shrink: true }} 
                                value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} 
                                error={!!errors.fechaFin} helperText={errors.fechaFin}
                            />
                        </Box>

                        <TextField 
                            fullWidth label="Objetivo / Descripción" multiline rows={4} 
                            value={formData.objetivo} onChange={e => setFormData({...formData, objetivo: e.target.value})} 
                        />
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

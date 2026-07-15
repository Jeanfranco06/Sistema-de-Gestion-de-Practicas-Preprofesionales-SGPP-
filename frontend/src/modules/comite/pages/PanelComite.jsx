import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TablePagination, 
    Button, Chip, TextField, MenuItem, Select, FormControl, InputLabel,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import VisibilityIcon from '@mui/icons-material/Visibility';

const MySwal = withReactContent(Swal);

export const PanelComite = () => {
    const navigate = useNavigate();
    const [expedientes, setExpedientes] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedExp, setSelectedExp] = useState(null);
    const [dictamenText, setDictamenText] = useState('');

    useEffect(() => {
        loadExpedientes();
    }, []);

    const loadExpedientes = async () => {
        try {
            const resp = await expedientesApi.getAll();
            if (resp.data.success) {
                setExpedientes(resp.data.data);
            }
        } catch (error) {
            console.error("Error al cargar expedientes", error);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleAprobarPlan = async (id) => {
        try {
            const result = await MySwal.fire({
                title: '¿Aprobar Plan?',
                text: "Estás a punto de aprobar el plan de este expediente.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, aprobar'
            });
            if (result.isConfirmed) {
                await expedientesApi.aprobarPlan(id);
                MySwal.fire('Aprobado', 'El plan ha sido aprobado.', 'success');
                loadExpedientes();
            }
        } catch (error) {
            MySwal.fire('Error', 'No se pudo aprobar el plan.', 'error');
        }
    };

    const handleAprobarInformeFinal = async (id) => {
        try {
            const result = await MySwal.fire({
                title: '¿Aprobar Informe Final?',
                text: "Estás a punto de aprobar el informe final.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, aprobar'
            });
            if (result.isConfirmed) {
                await expedientesApi.aprobarInformeFinal(id);
                MySwal.fire('Aprobado', 'El informe final ha sido aprobado.', 'success');
                loadExpedientes();
            }
        } catch (error) {
            MySwal.fire('Error', 'No se pudo aprobar el informe.', 'error');
        }
    };

    const handleOpenDictamen = (exp) => {
        setSelectedExp(exp);
        setDictamenText('');
        setOpenDialog(true);
    };

    const handleEmitirDictamen = async () => {
        if (!dictamenText.trim()) return;
        try {
            await expedientesApi.emitirDictamen(selectedExp.id, dictamenText);
            setOpenDialog(false);
            MySwal.fire('Éxito', 'Dictamen emitido exitosamente', 'success');
            loadExpedientes();
        } catch (error) {
            MySwal.fire('Error', 'No se pudo emitir el dictamen.', 'error');
        }
    };

    const filteredExpedientes = expedientes.filter(exp => {
        const matchesSearch = (exp.nombreEstudiante + " " + exp.apellidoEstudiante).toLowerCase().includes(searchTerm.toLowerCase()) || exp.codigoExpediente.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = filtroTipo === 'TODOS' || exp.codigoTipoPractica === filtroTipo;
        const matchesEstado = filtroEstado === 'TODOS' || exp.estado === filtroEstado;
        return matchesSearch && matchesTipo && matchesEstado;
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Gestión de Expedientes</Typography>
            
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    label="Buscar Estudiante o Expediente"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 300 }}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Tipo de Práctica</InputLabel>
                    <Select
                        value={filtroTipo}
                        label="Tipo de Práctica"
                        onChange={e => setFiltroTipo(e.target.value)}
                    >
                        <MenuItem value="TODOS">Todos</MenuItem>
                        <MenuItem value="INICIAL">Inicial</MenuItem>
                        <MenuItem value="FINAL">Final</MenuItem>
                        <MenuItem value="PROFESIONAL">Profesional</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                        value={filtroEstado}
                        label="Estado"
                        onChange={e => setFiltroEstado(e.target.value)}
                    >
                        <MenuItem value="TODOS">Todos</MenuItem>
                        <MenuItem value="REGISTRADO">Registrado</MenuItem>
                        <MenuItem value="PLAN_PRESENTADO">Plan Presentado</MenuItem>
                        <MenuItem value="PLAN_APROBADO">Plan Aprobado</MenuItem>
                        <MenuItem value="EN_EJECUCION">En Ejecución</MenuItem>
                        <MenuItem value="INFORME_FINAL_PRESENTADO">Informe Final Presentado</MenuItem>
                        <MenuItem value="INFORME_FINAL_APROBADO">Informe Final Aprobado</MenuItem>
                        <MenuItem value="EVALUADO">Evaluado</MenuItem>
                        <MenuItem value="CERRADO">Cerrado</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Estudiante</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredExpedientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(exp => (
                            <TableRow key={exp.id}>
                                <TableCell>{exp.codigoExpediente}</TableCell>
                                <TableCell>{exp.nombreEstudiante} {exp.apellidoEstudiante}</TableCell>
                                <TableCell><Chip label={exp.nombreTipoPractica} size="small" color="primary" variant="outlined" /></TableCell>
                                <TableCell><Chip label={exp.estado} size="small" color={exp.estado === 'APROBADO' ? 'success' : 'default'} /></TableCell>
                                <TableCell align="center">
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        color="primary" 
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => navigate(`/coordinacion/expedientes/${exp.id}`)}
                                        sx={{ mr: 1 }}
                                    >
                                        Ver
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="success" 
                                        startIcon={<CheckCircleIcon />}
                                        onClick={() => handleAprobarPlan(exp.id)}
                                        sx={{ mr: 1 }}
                                        disabled={exp.planTrabajoAprobado || exp.estado !== 'PLAN_PRESENTADO'}
                                    >
                                        Aprobar Plan
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="info" 
                                        startIcon={<CheckCircleIcon />}
                                        onClick={() => handleAprobarInformeFinal(exp.id)}
                                        sx={{ mr: 1 }}
                                        disabled={exp.estado !== 'INFORME_FINAL_PRESENTADO'}
                                    >
                                        Aprobar Inf. Final
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="secondary"  
                                        startIcon={<GavelIcon />}
                                        onClick={() => handleOpenDictamen(exp)}
                                    >
                                        Emitir Dictamen
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredExpedientes.length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center">No hay expedientes</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredExpedientes.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Emitir Dictamen Final</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Expediente: {selectedExp?.codigoExpediente} - {selectedExp?.nombreEstudiante} {selectedExp?.apellidoEstudiante}
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Detalle del Dictamen"
                        value={dictamenText}
                        onChange={(e) => setDictamenText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleEmitirDictamen} variant="contained" color="primary" disabled={!dictamenText.trim()}>Emitir</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

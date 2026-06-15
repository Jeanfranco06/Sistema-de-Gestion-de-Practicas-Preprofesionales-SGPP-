import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TablePagination, 
    Button, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import { secretariaApi } from '../../../api/secretariaApi';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const MySwal = withReactContent(Swal);

export const RecepcionAdministrativa = () => {
    const [expedientes, setExpedientes] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedExp, setSelectedExp] = useState(null);
    const [incidenciaText, setIncidenciaText] = useState('');

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
            console.error("Error", error);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleEmitirCarta = async (id) => {
        try {
            const res = await MySwal.fire({
                title: 'Emitir Carta de Presentación',
                text: "¿Estás seguro de emitir este documento?",
                icon: 'question',
                showCancelButton: true
            });
            if (res.isConfirmed) {
                await secretariaApi.emitirCartaPresentacion(id);
                MySwal.fire('Éxito', 'Carta emitida correctamente.', 'success');
                loadExpedientes();
            }
        } catch (error) {
            MySwal.fire('Error', 'No se pudo emitir la carta.', 'error');
        }
    };

    const handleEmitirConstancia = async (id) => {
        try {
            const res = await MySwal.fire({
                title: 'Emitir Constancia de Culminación',
                text: "¿Estás seguro de emitir la constancia?",
                icon: 'question',
                showCancelButton: true
            });
            if (res.isConfirmed) {
                await secretariaApi.emitirConstancia(id);
                MySwal.fire('Éxito', 'Constancia emitida correctamente.', 'success');
                loadExpedientes();
            }
        } catch (error) {
            MySwal.fire('Error', 'No se pudo emitir la constancia.', 'error');
        }
    };

    const handleOpenIncidencia = (exp) => {
        setSelectedExp(exp);
        setIncidenciaText('');
        setOpenDialog(true);
    };

    const handleRegistrarIncidencia = async () => {
        if (!incidenciaText.trim()) return;
        try {
            await secretariaApi.registrarIncidencia(selectedExp.id, incidenciaText);
            setOpenDialog(false);
            MySwal.fire('Éxito', 'Incidencia registrada', 'success');
            loadExpedientes();
        } catch (error) {
            MySwal.fire('Error', 'No se pudo registrar la incidencia.', 'error');
        }
    };

    const filteredExpedientes = expedientes.filter(exp => {
        return (exp.nombreEstudiante + " " + exp.apellidoEstudiante).toLowerCase().includes(searchTerm.toLowerCase()) || exp.codigoExpediente.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Recepción Administrativa (Secretaría)</Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    label="Buscar Estudiante o Expediente"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 300 }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Estudiante</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="center">Acciones Documentales</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredExpedientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(exp => (
                            <TableRow key={exp.id}>
                                <TableCell>{exp.codigoExpediente}</TableCell>
                                <TableCell>{exp.nombreEstudiante} {exp.apellidoEstudiante}</TableCell>
                                <TableCell><Chip label={exp.estado} size="small" /></TableCell>
                                <TableCell align="center">
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        color="primary" 
                                        startIcon={<DescriptionIcon />}
                                        onClick={() => handleEmitirCarta(exp.id)}
                                        sx={{ mr: 1 }}
                                    >
                                        Carta Pres.
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        color="success" 
                                        startIcon={<WorkspacePremiumIcon />}
                                        onClick={() => handleEmitirConstancia(exp.id)}
                                        sx={{ mr: 1 }}
                                    >
                                        Constancia
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        color="error" 
                                        startIcon={<WarningAmberIcon />}
                                        onClick={() => handleOpenIncidencia(exp)}
                                    >
                                        Incidencia
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredExpedientes.length === 0 && (
                            <TableRow><TableCell colSpan={4} align="center">No hay expedientes</TableCell></TableRow>
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
                <DialogTitle>Registrar Incidencia</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Expediente: {selectedExp?.codigoExpediente} - {selectedExp?.nombreEstudiante}
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Detalle de la Incidencia"
                        value={incidenciaText}
                        onChange={(e) => setIncidenciaText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleRegistrarIncidencia} variant="contained" color="error" disabled={!incidenciaText.trim()}>Registrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

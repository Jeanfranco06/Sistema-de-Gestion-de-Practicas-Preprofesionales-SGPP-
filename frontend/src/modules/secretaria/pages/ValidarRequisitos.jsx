import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Button, Tooltip,
    Card, CardContent, Divider, List, ListItem, ListItemIcon, ListItemText, InputAdornment,
    MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { secretariaApi } from '../../../api/usuariosApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const ValidarRequisitos = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [validacion, setValidacion] = useState(null);
    
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editForm, setEditForm] = useState({
        semestreActual: '', creditosAprobados: '', creditosRequeridosPractica: '',
        promedioPonderado: '', estadoAcademico: ''
    });

    useEffect(() => {
        loadEstudiantes();
    }, []);

    const loadEstudiantes = async () => {
        try {
            const res = await secretariaApi.getAllEstudiantes();
            setEstudiantes(res.data.data);
        } catch (error) {
            console.error("Error loading estudiantes:", error);
        }
    };

    const handleValidar = async (estudiante) => {
        try {
            const res = await secretariaApi.validarRequisitos(estudiante.id);
            setValidacion(res.data.data);
            setSelectedEstudiante(estudiante);
            setOpenDialog(true);
        } catch (error) {
            MySwal.fire('Error', 'No se pudo realizar la validación', 'error');
        }
    };

    const handleEdit = (estudiante) => {
        setSelectedEstudiante(estudiante);
        setEditForm({
            semestreActual: estudiante.semestreActual,
            creditosAprobados: estudiante.creditosAprobados,
            creditosRequeridosPractica: estudiante.creditosRequeridosPractica,
            promedioPonderado: estudiante.promedioPonderado,
            estadoAcademico: estudiante.estadoAcademico
        });
        setOpenEditDialog(true);
    };

    const handleSaveEdit = async () => {
        try {
            await secretariaApi.updateDatosAcademicos(selectedEstudiante.id, editForm);
            MySwal.fire('¡Éxito!', 'Datos actualizados correctamente', 'success');
            setOpenEditDialog(false);
            loadEstudiantes();
        } catch (error) {
            MySwal.fire('Error', 'No se pudo actualizar los datos', 'error');
        }
    };

    const filteredEstudiantes = estudiantes.filter(e => 
        e.codigoEstudiantil.includes(searchTerm) ||
        (e.idUsuario && e.idUsuario.toString().includes(searchTerm))
    );

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    <AssignmentTurnedInIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Validación de Requisitos Académicos
                </Typography>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar por código estudiantil..."
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
                        <TableHead sx={{ bgcolor: 'info.main' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white' }}>Código</TableCell>
                                <TableCell sx={{ color: 'white' }}>Ciclo</TableCell>
                                <TableCell sx={{ color: 'white' }}>Créditos Aprob.</TableCell>
                                <TableCell sx={{ color: 'white' }}>Créditos Requer.</TableCell>
                                <TableCell sx={{ color: 'white' }}>Promedio</TableCell>
                                <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                                <TableCell sx={{ color: 'white' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEstudiantes.map((estudiante) => (
                                <TableRow key={estudiante.id}>
                                    <TableCell>{estudiante.codigoEstudiantil}</TableCell>
                                    <TableCell>{estudiante.semestreActual}</TableCell>
                                    <TableCell>{estudiante.creditosAprobados}</TableCell>
                                    <TableCell>{estudiante.creditosRequeridosPractica}</TableCell>
                                    <TableCell>{estudiante.promedioPonderado}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={estudiante.estadoAcademico} 
                                            color={estudiante.estadoAcademico === 'ACTIVO' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Ver Validación">
                                            <IconButton onClick={() => handleValidar(estudiante)} color="info">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Editar Datos">
                                            <IconButton onClick={() => handleEdit(estudiante)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Diálogo de Validación */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Resultado de Validación</DialogTitle>
                <DialogContent>
                    {validacion && (
                        <Card variant="outlined" sx={{ mt: 1 }}>
                            <CardContent>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    Estudiante: {selectedEstudiante?.codigoEstudiantil}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            {validacion.cumpleCreditos ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Créditos Aprobados" 
                                            secondary={`${validacion.creditosActuales} de ${validacion.creditosRequeridos} requeridos`} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            {validacion.cumpleSemestre ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Ciclo Académico" 
                                            secondary={`Ciclo actual: ${validacion.semestreActual} (Min: ${validacion.semestreRequerido})`} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            {validacion.matriculaActiva ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Estado de Matrícula" 
                                            secondary={`Estado: ${validacion.estadoAcademico}`} 
                                        />
                                    </ListItem>
                                </List>
                                <Box sx={{ mt: 2, p: 2, bgcolor: validacion.aptoParaPracticas ? 'success.light' : 'error.light', borderRadius: 1, textAlign: 'center' }}>
                                    <Typography variant="h6" color="white">
                                        {validacion.aptoParaPracticas ? 'APTO PARA PRÁCTICAS' : 'NO APTO'}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de Edición */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Datos Académicos</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Semestre Actual" type="number"
                                value={editForm.semestreActual}
                                onChange={(e) => setEditForm({...editForm, semestreActual: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Créditos Aprobados" type="number"
                                value={editForm.creditosAprobados}
                                onChange={(e) => setEditForm({...editForm, creditosAprobados: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Créditos Requeridos" type="number"
                                value={editForm.creditosRequeridosPractica}
                                onChange={(e) => setEditForm({...editForm, creditosRequeridosPractica: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth label="Promedio Ponderado" type="number"
                                value={editForm.promedioPonderado}
                                onChange={(e) => setEditForm({...editForm, promedioPonderado: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Estado Académico</InputLabel>
                                <Select
                                    value={editForm.estadoAcademico}
                                    label="Estado Académico"
                                    onChange={(e) => setEditForm({...editForm, estadoAcademico: e.target.value})}
                                >
                                    <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                    <MenuItem value="SUSPENDIDO">SUSPENDIDO</MenuItem>
                                    <MenuItem value="EGRESADO">EGRESADO</MenuItem>
                                    <MenuItem value="GRADUADO">GRADUADO</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

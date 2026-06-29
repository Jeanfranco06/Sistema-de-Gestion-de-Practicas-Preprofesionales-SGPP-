import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    Button, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Stack, InputAdornment, Tooltip
} from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import { secretariaApi } from '../../../api/secretariaApi';
import {
    Description, WarningAmber, WorkspacePremium,
    Refresh, Search, ContentPasteSearch
} from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import {
    ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';
import StatStrip from '../../../shared/components/StatStrip';

const MySwal = withReactContent(Swal);

export const RecepcionAdministrativa = () => {
    const [expedientes, setExpedientes] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedExp, setSelectedExp] = useState(null);
    const [incidenciaText, setIncidenciaText] = useState('');

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

    useEffect(() => {
        loadExpedientes();
    }, []);

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
        const q = searchTerm.toLowerCase();
        return (exp.nombreEstudiante + " " + exp.apellidoEstudiante).toLowerCase().includes(q)
            || exp.codigoExpediente.toLowerCase().includes(q)
            || exp.estado.toLowerCase().includes(q);
    });

    const kpis = useMemo(() => {
        return {
            total: expedientes.length,
            paraCarta: expedientes.filter(e => e.estado === 'SOLICITADO' || e.estado === 'EMPRESA_SEDE_ASIGNADA').length,
            paraConstancia: expedientes.filter(e => e.estado === 'EVALUADO').length,
            observados: expedientes.filter(e => e.estado === 'OBSERVADO').length,
        };
    }, [expedientes]);

    const stats = [
        { label: 'Total Trámites', value: kpis.total, icon: <ContentPasteSearch fontSize="small" />, accent: 'blue' },
        { label: 'Cartas por Emitir', value: kpis.paraCarta, icon: <Description fontSize="small" />, accent: 'violet' },
        { label: 'Constancias por Emitir', value: kpis.paraConstancia, icon: <WorkspacePremium fontSize="small" />, accent: 'emerald' },
        { label: 'Observados / Alertas', value: kpis.observados, icon: <WarningAmber fontSize="small" />, accent: 'orange' },
    ];

    return (
        <ModulePageShell>
            <ModulePageHeader
                icon={<ContentPasteSearch />}
                title="Recepción Administrativa"
                subtitle="Gestión de documentos, emisión de cartas de presentación y constancias"
                action={
                    <IconButton onClick={loadExpedientes} size="small" aria-label="Actualizar">
                        <Refresh fontSize="small" />
                    </IconButton>
                }
            />

            <StatStrip items={stats} />

            <ContentCard accent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Trámites Documentarios</Typography>

                <Box sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        label="Buscar por estudiante, código o estado"
                        placeholder="Ej. Juan Pérez"
                        size="small"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                        sx={{ minWidth: 320 }}
                    />
                </Box>

                <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones Documentales</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredExpedientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(exp => (
                                <TableRow key={exp.id} hover>
                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{exp.codigoExpediente}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>{exp.nombreEstudiante} {exp.apellidoEstudiante}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={exp.estado?.replace(/_/g, ' ')}
                                            size="small"
                                            color={exp.estado === 'OBSERVADO' ? 'error' : (exp.estado === 'CERRADO' || exp.estado === 'EVALUADO') ? 'success' : 'primary'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Emitir Carta de Presentación">
                                                <span>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={() => handleEmitirCarta(exp.id)}
                                                    >
                                                        Carta Pres.
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Emitir Constancia de Culminación">
                                                <span>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                        onClick={() => handleEmitirConstancia(exp.id)}
                                                    >
                                                        Constancia
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Registrar Incidencia / Observación">
                                                <span>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleOpenIncidencia(exp)}
                                                    >
                                                        Incidencia
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredExpedientes.length === 0 ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay trámites documentarios encontrados</TableCell></TableRow>
                            ) : null}
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
            </ContentCard>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Registrar Incidencia</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Expediente:</strong> {selectedExp?.codigoExpediente}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Estudiante:</strong> {selectedExp?.nombreEstudiante} {selectedExp?.apellidoEstudiante}
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Detalle de la Incidencia"
                        placeholder="Describa el problema u observación..."
                        value={incidenciaText}
                        onChange={(e) => setIncidenciaText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Cancelar</Button>
                    <Button onClick={handleRegistrarIncidencia} variant="contained" color="error" disabled={!incidenciaText.trim()}>Registrar</Button>
                </DialogActions>
            </Dialog>
        </ModulePageShell>
    );
};

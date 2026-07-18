import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Stepper, Step, StepLabel,
    CircularProgress, Alert, Chip, Avatar, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
    Fade, Tooltip,
} from '@mui/material';
import {
    School, Business, CheckCircle, ArrowBack, ArrowForward,
    Assignment, Star, EmojiEvents, Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tipoPracticaApi, practicaApi } from '../../../api/practicasApi';
import { sedeApi } from '../../../api/sedesApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const STEPS = ['Tipo de Práctica', 'Empresa y Sede', 'Confirmación'];

const tipoIcons = {
    INICIAL: <School sx={{ fontSize: 48 }} />,
    FINAL: <Star sx={{ fontSize: 48 }} />,
    PROFESIONAL: <EmojiEvents sx={{ fontSize: 48 }} />,
};

const tipoColors = {
    INICIAL: { bg: '#e3f2fd', border: '#1976d2', icon: '#1976d2' },
    FINAL: { bg: '#e8f5e9', border: '#2e7d32', icon: '#2e7d32' },
    PROFESIONAL: { bg: '#f3e5f5', border: '#7b1fa2', icon: '#7b1fa2' },
};

export const SolicitarPractica = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [tipos, setTipos] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [selectedTipo, setSelectedTipo] = useState(null);
    const [selectedSede, setSelectedSede] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [tiposRes, sedesRes] = await Promise.all([
                    tipoPracticaApi.listar(),
                    sedeApi.getCatalogo(),
                ]);
                const tiposData = Array.isArray(tiposRes.data) ? tiposRes.data : tiposRes.data?.data || [];
                const sedesData = Array.isArray(sedesRes.data) ? sedesRes.data : sedesRes.data?.data || [];
                setTipos(tiposData);
                setSedes(sedesData);
            } catch (err) {
                console.error('Error cargando datos:', err);
                setError('Error al cargar datos. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectTipo = (tipo) => {
        setSelectedTipo(tipo);
    };

    const handleNext = () => {
        if (activeStep === 0 && !selectedTipo) {
            MySwal.fire('Selecciona un tipo', 'Debes seleccionar un tipo de práctica para continuar.', 'warning');
            return;
        }
        if (activeStep === 1 && !selectedSede) {
            MySwal.fire('Selecciona una sede', 'Debes seleccionar una empresa y sede para continuar.', 'warning');
            return;
        }
        if (activeStep === STEPS.length - 1) {
            setConfirmOpen(true);
            return;
        }
        setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setConfirmOpen(false);
            await practicaApi.solicitarPractica(selectedSede.id, selectedTipo.id);
            await MySwal.fire({
                icon: 'success',
                title: '¡Práctica solicitada!',
                text: `Has solicitado exitosamente tu práctica ${selectedTipo.nombre} en ${selectedSede.nombreSede} de ${selectedSede.razonSocialEmpresa}.`,
                timer: 4000,
                showConfirmButton: false,
            });
            navigate('/estudiante/practica');
        } catch (err) {
            console.error('Error solicitando práctica:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'No se pudo completar la solicitud. Intenta nuevamente.';
            const detalles = err.response?.data?.detalles;
            
            if (detalles && detalles.length > 0) {
                // Mostrar detalles de validación académica
                const detallesHtml = detalles.map(d => 
                    `<li style="text-align: left; margin-bottom: 8px;">${d.descripcion || d.nombreRegla || d}</li>`
                ).join('');
                
                MySwal.fire({
                    icon: 'warning',
                    title: 'Requisitos académicos no cumplidos',
                    html: `<div style="text-align: left; font-size: 0.9rem;">
                        <p style="margin-bottom: 12px;">No cumples con los requisitos académicos para este tipo de práctica:</p>
                        <ul style="padding-left: 20px; margin: 0;">${detallesHtml}</ul>
                        <p style="margin-top: 12px; color: #666;">Por favor, completa los requisitos faltantes antes de solicitar la práctica.</p>
                    </div>`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#f59e0b',
                });
            } else {
                MySwal.fire('Error', msg, 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getEmpresasUnicas = () => {
        const seen = new Set();
        return sedes.filter(s => {
            const key = s.razonSocialEmpresa;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const getSedesPorEmpresa = (razonSocial) => {
        return sedes.filter(s => s.razonSocialEmpresa === razonSocial);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    return (
        <Fade in>
            <Box>
                {/* Banner */}
                <Box sx={{
                    bgcolor: '#1a365d',
                    borderRadius: 3,
                    p: 4,
                    mb: 4,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 56, height: 56 }}>
                        <Assignment />
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontWeight: 700 }} variant="h5">Solicitar Práctica Preprofesional</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                            Completa los pasos para solicitar tu práctica en una empresa o institución.
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Step 1: Tipo de Práctica */}
                {activeStep === 0 && (
                    <Box>
                        <Typography sx={{ fontWeight: 600 }} variant="h6" gutterBottom>
                            Selecciona el tipo de práctica que deseas solicitar
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Cada tipo de práctica tiene un requisito de horas mínimo. Elige según tu avance académico.
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                            {tipos.map((tipo) => {
                                const colors = tipoColors[tipo.codigo] || { bg: '#f5f5f5', border: '#9e9e9e', icon: '#757575' };
                                const selected = selectedTipo?.id === tipo.id;
                                return (
                                    <Card
                                        key={tipo.id}
                                        onClick={() => handleSelectTipo(tipo)}
                                        elevation={selected ? 4 : 1}
                                        sx={{
                                            cursor: 'pointer',
                                            border: selected ? `2px solid ${colors.border}` : '2px solid transparent',
                                            bgcolor: selected ? colors.bg : 'white',
                                            transition: 'all 0.2s',
                                            '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
                                            <Box sx={{ color: colors.icon, mb: 2 }}>
                                                {tipoIcons[tipo.codigo] || <School sx={{ fontSize: 48 }} />}
                                            </Box>
                                            <Typography sx={{ fontWeight: 700 }} variant="h5" gutterBottom>
                                                {tipo.nombre}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                                {tipo.descripcion || `Práctica ${tipo.nombre.toLowerCase()}`}
                                            </Typography>
                                            <Chip
                                                label={`${tipo.horasRequeridas} horas requeridas`}
                                                color={selected ? 'primary' : 'default'}
                                                variant={selected ? 'filled' : 'outlined'}
                                                size="small"
                                            />
                                            {selected && (
                                                <Box sx={{ mt: 2 }}>
                                                    <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    </Box>
                )}

                {/* Step 2: Empresa y Sede */}
                {activeStep === 1 && (
                    <Box>
                        <Typography sx={{ fontWeight: 600 }} variant="h6" gutterBottom>
                            Selecciona la empresa y sede para tu práctica
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" component="div">
                                Las sedes marcadas con <Chip icon={<CheckCircle />} label="Elegible" size="small" color="success" variant="outlined" sx={{ mx: 0.5 }} /> cumplen todos los requisitos y pueden ser seleccionadas.
                            </Typography>
                        </Box>

                        {sedes.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography sx={{ fontWeight: 'bold' }} variant="h6" gutterBottom>
                                    No hay sedes registradas
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Actualmente no hay sedes disponibles en el sistema.
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {getEmpresasUnicas().map((empresa) => {
                                    const sedesEmpresa = getSedesPorEmpresa(empresa.razonSocialEmpresa);
                                    const tieneElegible = sedesEmpresa.some(s => s.esElegible);
                                    return (
                                        <Box key={empresa.razonSocialEmpresa}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                                    <Business sx={{ fontSize: 20 }} />
                                                </Avatar>
                                                <Typography sx={{ fontWeight: 600 }} variant="subtitle1">
                                                    {empresa.razonSocialEmpresa}
                                                </Typography>
                                                {!tieneElegible && (
                                                    <Chip label="Sin sedes elegibles" size="small" color="warning" variant="outlined" />
                                                )}
                                            </Box>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                                                {sedesEmpresa.map((sede) => {
                                                    const selected = selectedSede?.id === sede.id;
                                                    const elegible = sede.esElegible;
                                                    return (
                                                        <Tooltip key={sede.id} title={elegible ? 'Haz clic para seleccionar' : sede.motivoNoElegible || 'No disponible'} arrow>
                                                            <Card
                                                                onClick={() => elegible && setSelectedSede(sede)}
                                                                elevation={selected ? 3 : 1}
                                                                sx={{
                                                                    cursor: elegible ? 'pointer' : 'not-allowed',
                                                                    border: selected ? '2px solid #1976d2' : '1px solid',
                                                                    borderColor: selected ? 'primary.main' : elegible ? 'success.light' : 'error.light',
                                                                    bgcolor: selected ? '#e3f2fd' : elegible ? '#f0fdf4' : '#fef2f2',
                                                                    opacity: elegible ? 1 : 0.75,
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': elegible ? { transform: 'translateY(-2px)', boxShadow: 3 } : {},
                                                                }}
                                                            >
                                                                <CardContent sx={{ py: 2.5, px: 2.5 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                        <Box sx={{ flex: 1 }}>
                                                                            <Typography sx={{ fontWeight: 600 }} variant="subtitle2" gutterBottom>
                                                                                {sede.nombreSede}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                                {sede.direccion}
                                                                            </Typography>
                                                                            <Typography sx={{ display: 'block' }} variant="caption" color="text.secondary">
                                                                                {sede.departamento}, {sede.provincia}, {sede.distrito}
                                                                            </Typography>
                                                                        </Box>
                                                                        {elegible ? (
                                                                            <CheckCircle color="success" sx={{ fontSize: 24 }} />
                                                                        ) : (
                                                                            <Cancel color="error" sx={{ fontSize: 24 }} />
                                                                        )}
                                                                    </Box>
                                                                    <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                                                                        <Chip label={sede.tipoEntidad} size="small" variant="outlined" />
                                                                        {sede.vacantesDisponibles > 0 && (
                                                                            <Chip label={`${sede.vacantesDisponibles} vacantes`} size="small" color="success" variant="outlined" />
                                                                        )}
                                                                    </Stack>
                                                                    {!elegible && sede.motivoNoElegible && (
                                                                        <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }}>
                                                                            <Typography sx={{ fontWeight: 500 }} variant="caption">
                                                                                {sede.motivoNoElegible}
                                                                            </Typography>
                                                                        </Alert>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        </Tooltip>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                )}

                {/* Step 3: Confirmación */}
                {activeStep === 2 && (
                    <Box>
                        <Typography sx={{ fontWeight: 600 }} variant="h6" gutterBottom>
                            Confirma tu solicitud de práctica
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Revisa los datos antes de enviar tu solicitud.
                        </Typography>

                        {selectedTipo && (
                            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 3, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography sx={{ fontWeight: 600 }} variant="subtitle2" color="text.secondary" gutterBottom>
                                    Tipo de Práctica
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: (tipoColors[selectedTipo.codigo]?.icon) || '#1976d2', width: 40, height: 40 }}>
                                        {tipoIcons[selectedTipo.codigo] || <School />}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600 }} variant="h6">
                                            {selectedTipo.nombre}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedTipo.horasRequeridas} horas requeridas
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {selectedSede && (
                            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 3, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography sx={{ fontWeight: 600 }} variant="subtitle2" color="text.secondary" gutterBottom>
                                    Empresa y Sede
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                        <Business />
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600 }} variant="h6">
                                            {selectedSede.razonSocialEmpresa}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedSede.nombreSede}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {selectedSede.direccion} - {selectedSede.distrito}, {selectedSede.departamento}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        <Alert severity="info" sx={{ mt: 2 }}>
                            Al confirmar, se registrará tu solicitud de práctica con estado "REGISTRADA". 
                            Posteriormente deberás completar los documentos requeridos.
                        </Alert>
                    </Box>
                )}

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={activeStep === 0 ? () => navigate('/estudiante/sedes') : handleBack}
                        startIcon={<ArrowBack />}
                        disabled={submitting}
                    >
                        {activeStep === 0 ? 'Ir a Catálogo' : 'Anterior'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={activeStep === STEPS.length - 1 ? <CheckCircle /> : <ArrowForward />}
                        disabled={submitting}
                    >
                        {activeStep === STEPS.length - 1 ? 'Solicitar Práctica' : 'Siguiente'}
                    </Button>
                </Box>

                {/* Confirm Dialog */}
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ bgcolor: '#1a365d', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Assignment /> Confirmar solicitud
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <Typography variant="body1" gutterBottom>
                            ¿Estás seguro de solicitar esta práctica?
                        </Typography>
                        {selectedTipo && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                <strong>Tipo:</strong> {selectedTipo.nombre} ({selectedTipo.horasRequeridas}h)
                            </Typography>
                        )}
                        {selectedSede && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Sede:</strong> {selectedSede.nombreSede} - {selectedSede.razonSocialEmpresa}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                        >
                            {submitting ? 'Solicitando...' : 'Confirmar y Solicitar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade>
    );
};

import React from 'react';
import { Drawer, Box, Typography, IconButton, Divider, Chip, Grid, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export const SedeDetailsDrawer = ({ open, onClose, sede }) => {
    if (!sede) return null;

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: { xs: 300, sm: 400, md: 500 }, p: 3 }} role="presentation">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        Detalles de la Sede
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <BusinessIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="h6">{sede.razonSocialEmpresa}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                                    RUC: {sede.empresaRuc || 'No especificado'}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <LocationOnIcon color="action" sx={{ mr: 1, mt: 0.5 }} />
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">Sede: {sede.nombreSede}</Typography>
                                <Typography variant="body2">{sede.direccion}</Typography>
                                <Typography variant="body2" color="textSecondary">{sede.distrito}</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon color="action" sx={{ mr: 1 }} />
                            <Box>
                                <Typography variant="body2" color="textSecondary">Capacidad Máxima</Typography>
                                <Typography variant="body1" fontWeight="medium">{sede.capacidadMaxima || 'No especificada'}</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <VerifiedUserIcon color="action" sx={{ mr: 1 }} />
                            <Box>
                                <Typography variant="body2" color="textSecondary">Estado</Typography>
                                <Chip 
                                    label={sede.activo ? "Activo" : "Inactivo"} 
                                    color={sede.activo ? "success" : "default"} 
                                    size="small" 
                                />
                            </Box>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Descripción de Actividades
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="body2">
                                {sede.descripcionActividades || 'No hay descripción detallada de actividades para esta sede.'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Drawer>
    );
};

import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, TextField, Box, Chip } from '@mui/material';
import { sedeApi } from '../../../api/sedesApi';
import { SedeDetailsDrawer } from '../components/SedeDetailsDrawer';

export const CatalogoSedes = () => {
    const [sedes, setSedes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSedes = async () => {
            try {
                const response = await sedeApi.getAllActive();
                setSedes(response.data);
            } catch (error) {
                console.error("Error cargando sedes:", error);
            }
        };
        fetchSedes();
    }, []);

    const filteredSedes = sedes.filter(sede => 
        sede.nombreSede.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sede.razonSocialEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sede.distrito.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [selectedSede, setSelectedSede] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleOpenDetails = (sede) => {
        setSelectedSede(sede);
        setDrawerOpen(true);
    };

    const handleCloseDetails = () => {
        setDrawerOpen(false);
        setSelectedSede(null);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Catálogo de Sedes de Práctica
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Explora las empresas e instituciones disponibles para realizar tus prácticas preprofesionales.
            </Typography>

            <Box sx={{ my: 3 }}>
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="Buscar por empresa, sede o distrito..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>

            <Grid container spacing={3}>
                {filteredSedes.map(sede => (
                    <Grid item xs={12} md={6} lg={4} key={sede.id}>
                        <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {sede.razonSocialEmpresa}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    Sede: {sede.nombreSede}
                                </Typography>
                                <Chip label={sede.distrito} size="small" sx={{ mb: 1.5 }} />
                                <Typography variant="body2" component="p">
                                    <strong>Dirección:</strong> {sede.direccion}
                                </Typography>
                                <Typography variant="body2" component="p">
                                    <strong>Capacidad:</strong> {sede.capacidadMaxima || 'No especificada'}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="primary" variant="contained" fullWidth onClick={() => handleOpenDetails(sede)}>
                                    Ver Detalles
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                {filteredSedes.length === 0 && (
                    <Grid item xs={12}>
                        <Typography variant="body1" color="textSecondary" align="center">
                            No se encontraron sedes con esos términos de búsqueda.
                        </Typography>
                    </Grid>
                )}
            </Grid>

            <SedeDetailsDrawer 
                open={drawerOpen} 
                onClose={handleCloseDetails} 
                sede={selectedSede} 
            />
        </Container>
    );
};

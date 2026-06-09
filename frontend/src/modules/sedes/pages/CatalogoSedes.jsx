import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Grid, Card, CardContent, CardActions, Button, 
    TextField, Box, Chip, FormControl, InputLabel, Select, MenuItem, 
    Checkbox, FormControlLabel, CircularProgress, Alert, Drawer, Divider,
    Avatar, IconButton, Fade, Slide, Paper, Stack, Badge, Tooltip
} from '@mui/material';
import { 
    Search, Business, LocationOn, Work, People, CheckCircle, 
    Cancel, Warning, FilterList, Clear, Close, Info, Star,
    Apartment, CorporateFare, School, AccessTime, Phone, Email
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { sedeApi } from '../../../api/sedesApi';
import { practicaApi } from '../../../api/practicasApi';
import { useAuth } from '../../../auth/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const CatalogoSedes = () => {
    const { user } = useAuth();
    const [sedes, setSedes] = useState([]);
    const [filteredSedes, setFilteredSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filtros
    const [tipoEntidad, setTipoEntidad] = useState('');
    const [vigenciaConvenio, setVigenciaConvenio] = useState('todos');
    const [disponibilidad, setDisponibilidad] = useState('todos');
    const [estadoValidacion, setEstadoValidacion] = useState('todos');
    const [tieneTutor, setTieneTutor] = useState('todos');
    const [mostrarSoloElegibles, setMostrarSoloElegibles] = useState(false);

    useEffect(() => {
        const fetchCatalogoSedes = async () => {
            try {
                setLoading(true);
                const response = await sedeApi.getCatalogo();
                setSedes(response.data);
                setFilteredSedes(response.data);
                setError(null);
            } catch (error) {
                console.error("Error cargando catálogo de sedes:", error);
                setError('Error al cargar el catálogo de sedes. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };
        fetchCatalogoSedes();
    }, []);

    useEffect(() => {
        let filtered = sedes.filter(sede => {
            // Búsqueda por texto
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                sede.nombreSede?.toLowerCase().includes(searchLower) || 
                sede.razonSocialEmpresa?.toLowerCase().includes(searchLower) ||
                sede.distrito?.toLowerCase().includes(searchLower) ||
                sede.provincia?.toLowerCase().includes(searchLower) ||
                sede.departamento?.toLowerCase().includes(searchLower);
            
            if (!matchesSearch) return false;

            // Filtro por tipo de entidad
            if (tipoEntidad && sede.tipoEntidad !== tipoEntidad) return false;

            // Filtro por vigencia de convenio
            if (vigenciaConvenio === 'vigente' && !sede.tieneConvenioVigente) return false;
            if (vigenciaConvenio === 'no_vigente' && sede.tieneConvenioVigente) return false;

            // Filtro por disponibilidad
            if (disponibilidad === 'disponible' && sede.vacantesDisponibles <= 0) return false;
            if (disponibilidad === 'no_disponible' && sede.vacantesDisponibles > 0) return false;

            // Filtro por estado de validación
            if (estadoValidacion === 'aprobada' && sede.resultadoValidacion !== 'APROBADA') return false;
            if (estadoValidacion === 'observada' && sede.resultadoValidacion !== 'OBSERVADA') return false;
            if (estadoValidacion === 'rechazada' && sede.resultadoValidacion !== 'RECHAZADA') return false;

            // Filtro por tutor asignado
            if (tieneTutor === 'si' && !sede.tieneTutorActivo) return false;
            if (tieneTutor === 'no' && sede.tieneTutorActivo) return false;

            // Filtro por elegibilidad
            if (mostrarSoloElegibles && !sede.esElegible) return false;

            return true;
        });

        setFilteredSedes(filtered);
    }, [sedes, searchTerm, tipoEntidad, vigenciaConvenio, disponibilidad, estadoValidacion, tieneTutor, mostrarSoloElegibles]);

    const [selectedSede, setSelectedSede] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleOpenDetails = async (sede) => {
        try {
            setLoading(true);
            const response = await sedeApi.getDetalle(sede.id);
            setSelectedSede(response.data);
            setDrawerOpen(true);
        } catch (error) {
            console.error("Error cargando detalle de sede:", error);
            setError('Error al cargar el detalle de la sede.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDetails = () => {
        setDrawerOpen(false);
        setSelectedSede(null);
    };

    const [selectingSedeId, setSelectingSedeId] = useState(null);

    const handleSeleccionarSede = async (sede) => {
        if (!sede.esElegible) {
            MySwal.fire('Sede no elegible', sede.motivoNoElegible || 'La sede no cumple con los requisitos para ser seleccionada.', 'warning');
            return;
        }

        const result = await MySwal.fire({
            title: '¿Seleccionar esta sede?',
            text: `Confirmas que deseas seleccionar "${sede.nombreSede}" en ${sede.razonSocialEmpresa} para tus prácticas preprofesionales.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, seleccionar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!result.isConfirmed) return;

        try {
            setSelectingSedeId(sede.id);
            await practicaApi.seleccionarSede(sede.id);
            await MySwal.fire({
                icon: 'success',
                title: '¡Sede seleccionada!',
                text: `Has seleccionado exitosamente "${sede.nombreSede}". Ahora debes completar tu registro de prácticas.`,
                timer: 3000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error seleccionando sede:", error);
            const msg = error.response?.data?.message || error.response?.data?.error || 'No se pudo completar la selección. Intenta nuevamente.';
            MySwal.fire('Error', msg, 'error');
        } finally {
            setSelectingSedeId(null);
        }
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setTipoEntidad('');
        setVigenciaConvenio('todos');
        setDisponibilidad('todos');
        setEstadoValidacion('todos');
        setTieneTutor('todos');
        setMostrarSoloElegibles(false);
    };

    const getConvenioBadgeColor = (sede) => {
        if (!sede.tieneConvenioVigente) return 'error';
        return 'success';
    };

    const getValidacionBadgeColor = (sede) => {
        if (!sede.tieneValidacionVigente) return 'default';
        switch (sede.resultadoValidacion) {
            case 'APROBADA': return 'success';
            case 'OBSERVADA': return 'warning';
            case 'RECHAZADA': return 'error';
            default: return 'default';
        }
    };

    if (loading && sedes.length === 0) {
        return (
            <Box sx={{ width: '100%', mt: 4, mb: 4, px: 3, textAlign: 'center' }}>
                <Fade in={loading}>
                    <Box>
                        <CircularProgress size={60} thickness={4} />
                        <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
                            Cargando catálogo de sedes...
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Preparando las mejores opciones para tus prácticas
                        </Typography>
                    </Box>
                </Fade>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', mt: 4, mb: 4, px: 3, maxWidth: '100%', mx: 'auto' }}>
            <Box component={motion.div} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} sx={{ 
                mb: 4, 
                p: 5, 
                borderRadius: 4, 
                bgcolor: 'primary.main',
                color: 'white',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            width: 56, 
                            height: 56 
                        }}>
                            <Business sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" fontWeight="bold">
                            Catálogo de Empresas y Sedes
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ opacity: 0.95, maxWidth: 800 }}>
                        Explora las empresas e instituciones disponibles para realizar tus prácticas preprofesionales. 
                        Encuentra la opción perfecta para tu desarrollo profesional.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ fontSize: 20 }} />
                            <Typography variant="body2">Convenios vigentes</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <People sx={{ fontSize: 20 }} />
                            <Typography variant="body2">Tutores asignados</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Star sx={{ fontSize: 20 }} />
                            <Typography variant="body2">Validadas por la universidad</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ my: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper 
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                elevation={0}
                sx={{ 
                    my: 3, 
                    p: 4, 
                    borderRadius: 4,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ 
                        bgcolor: 'primary.main', 
                        borderRadius: 2, 
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FilterList sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            Filtros de Búsqueda
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Encuentra la sede perfecta para tus prácticas
                        </Typography>
                    </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField 
                        fullWidth 
                        variant="outlined" 
                        placeholder="Buscar por empresa, sede, distrito..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="medium"
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />,
                            endAdornment: searchTerm && (
                                <IconButton onClick={() => setSearchTerm('')} size="small">
                                    <Clear />
                                </IconButton>
                            )
                        }}
                        sx={{ 
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1.2,
                                bgcolor: 'white',
                                '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                },
                                '&.Mui-focused': {
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 }
                                }
                            }
                        }}
                    />
                    
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
                        gap: 2.5 
                    }}>
                        <FormControl fullWidth size="medium">
                            <InputLabel sx={{ bgcolor: 'white', px: 0.5, borderRadius: 1, fontSize: '0.875rem' }}>Tipo Entidad</InputLabel>
                            <Select
                                value={tipoEntidad}
                                label="Tipo Entidad"
                                onChange={(e) => setTipoEntidad(e.target.value)}
                                sx={{ borderRadius: 1.2, bgcolor: 'white' }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="PÚBLICA"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Apartment fontSize="small" color="primary" /> Pública</Box></MenuItem>
                                <MenuItem value="PRIVADA"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CorporateFare fontSize="small" color="primary" /> Privada</Box></MenuItem>
                                <MenuItem value="MIXTA"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><School fontSize="small" color="primary" /> Mixta</Box></MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="medium">
                            <InputLabel sx={{ bgcolor: 'white', px: 0.5, borderRadius: 1, fontSize: '0.875rem' }}>Convenio</InputLabel>
                            <Select
                                value={vigenciaConvenio}
                                label="Convenio"
                                onChange={(e) => setVigenciaConvenio(e.target.value)}
                                sx={{ borderRadius: 1.2, bgcolor: 'white' }}
                            >
                                <MenuItem value="todos">Todos</MenuItem>
                                <MenuItem value="vigente"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle fontSize="small" color="success" /> Vigente</Box></MenuItem>
                                <MenuItem value="no_vigente"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Cancel fontSize="small" color="error" /> No vigente</Box></MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="medium">
                            <InputLabel sx={{ bgcolor: 'white', px: 0.5, borderRadius: 1, fontSize: '0.875rem' }}>Validación</InputLabel>
                            <Select
                                value={estadoValidacion}
                                label="Validación"
                                onChange={(e) => setEstadoValidacion(e.target.value)}
                                sx={{ borderRadius: 1.2, bgcolor: 'white' }}
                            >
                                <MenuItem value="todos">Todos</MenuItem>
                                <MenuItem value="aprobada"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle fontSize="small" color="success" /> Aprobada</Box></MenuItem>
                                <MenuItem value="observada"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Warning fontSize="small" color="warning" /> Observada</Box></MenuItem>
                                <MenuItem value="rechazada"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Cancel fontSize="small" color="error" /> Rechazada</Box></MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="medium">
                            <InputLabel sx={{ bgcolor: 'white', px: 0.5, borderRadius: 1, fontSize: '0.875rem' }}>Tutor</InputLabel>
                            <Select
                                value={tieneTutor}
                                label="Tutor"
                                onChange={(e) => setTieneTutor(e.target.value)}
                                sx={{ borderRadius: 1.2, bgcolor: 'white' }}
                            >
                                <MenuItem value="todos">Todos</MenuItem>
                                <MenuItem value="si"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><People fontSize="small" color="success" /> Con tutor</Box></MenuItem>
                                <MenuItem value="no"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><People fontSize="small" color="error" /> Sin tutor</Box></MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                        <Box sx={{ 
                            bgcolor: 'white', 
                            borderRadius: 1.2, 
                            px: 2,
                            py: 1,
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            height: '48px'
                        }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={mostrarSoloElegibles}
                                        onChange={(e) => setMostrarSoloElegibles(e.target.checked)}
                                        sx={{ 
                                            '& .MuiSvgIcon-root': { fontSize: 24 },
                                            color: 'primary.main',
                                            '&.Mui-checked': { color: 'primary.main' }
                                        }}
                                    />
                                }
                                label={<Typography variant="body2" fontWeight={500}>Solo sedes elegibles</Typography>}
                                sx={{ m: 0 }}
                            />
                        </Box>
                        <Button 
                            variant="contained" 
                            size="medium" 
                            onClick={limpiarFiltros}
                            startIcon={<Clear />}
                            sx={{ 
                                borderRadius: 1.2,
                                px: 3,
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: 'none',
                                bgcolor: 'primary.main',
                                height: '48px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                '&:hover': { bgcolor: 'primary.dark' }
                            }}
                        >
                            Limpiar Filtros
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Resultados */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Resultados
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge 
                        badgeContent={filteredSedes.length} 
                        color="primary"
                        sx={{ '& .MuiBadge-badge': { fontSize: '0.9rem', height: 24, minWidth: 24 } }}
                    >
                        <Business color="action" />
                    </Badge>
                    <Typography variant="body2" color="textSecondary">
                        de {sedes.length} sedes totales
                    </Typography>
                    <Box sx={{ height: 24, width: 1, bgcolor: 'divider' }} />
                    <Chip 
                        size="small"
                        label={`${filteredSedes.filter(s => s.esElegible).length} elegibles`}
                        color="success"
                        sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                        size="small"
                        label={`${filteredSedes.filter(s => !s.esElegible).length} no elegibles`}
                        color="warning"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            </Box>

            <Grid container spacing={3}>
                {filteredSedes.map((sede, index) => (
                    <Grid item xs={12} md={6} lg={4} key={sede.id}>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ y: -8 }}
                            style={{ height: '100%' }}
                        >
                            <Card 
                                elevation={0} 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    borderRadius: 4,
                                    border: sede.esElegible ? '2px solid #4caf50' : '1px solid #e2e8f0',
                                    transition: 'box-shadow 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                            <Avatar sx={{ 
                                                bgcolor: sede.esElegible ? 'success.main' : 'grey.400',
                                                width: 48, 
                                                height: 48 
                                            }}>
                                                <Business />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="h6" component="h2" fontWeight="bold" noWrap>
                                                    {sede.razonSocialEmpresa}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" noWrap>
                                                    {sede.nombreSede}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {sede.esElegible && (
                                            <Tooltip title="Sede elegible para selección">
                                                <CheckCircle color="success" sx={{ fontSize: 28 }} />
                                            </Tooltip>
                                        )}
                                    </Box>
                                    
                                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                                        <Chip 
                                            icon={<LocationOn fontSize="small" />}
                                            label={sede.distrito} 
                                            size="small" 
                                            variant="outlined" 
                                            sx={{ borderRadius: 1 }}
                                        />
                                        <Chip 
                                            icon={sede.tipoEntidad === 'PÚBLICA' ? <Apartment fontSize="small" /> : sede.tipoEntidad === 'PRIVADA' ? <CorporateFare fontSize="small" /> : <School fontSize="small" />}
                                            label={sede.tipoEntidad} 
                                            size="small" 
                                            variant="outlined" 
                                            sx={{ borderRadius: 1 }}
                                        />
                                        <Chip 
                                            icon={sede.tieneConvenioVigente ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                                            label={sede.tieneConvenioVigente ? 'Convenio Vigente' : 'Sin Convenio'} 
                                            size="small" 
                                            color={getConvenioBadgeColor(sede)}
                                            sx={{ borderRadius: 1 }}
                                        />
                                        <Chip 
                                            icon={sede.tieneTutorActivo ? <People fontSize="small" /> : <People fontSize="small" />}
                                            label={sede.tieneTutorActivo ? `Tutor (${sede.cantidadTutoresActivos})` : 'Sin tutor'} 
                                            size="small" 
                                            color={sede.tieneTutorActivo ? 'success' : 'error'}
                                            sx={{ borderRadius: 1 }}
                                        />
                                    </Stack>

                                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <LocationOn fontSize="small" color="action" />
                                            <Typography variant="body2" color="textSecondary">
                                                {sede.departamento}, {sede.provincia}, {sede.distrito}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Work fontSize="small" color="action" />
                                            <Typography variant="body2" color="textSecondary">
                                                {sede.areaDisponible || 'Área no especificada'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <People fontSize="small" color="action" />
                                            <Typography variant="body2" color="textSecondary">
                                                {sede.vacantesDisponibles || 0} vacantes disponibles
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip 
                                            label={sede.resultadoValidacion || 'No validada'} 
                                            size="small" 
                                            color={getValidacionBadgeColor(sede)}
                                            sx={{ borderRadius: 1 }}
                                        />
                                    </Box>

                                    {!sede.esElegible && sede.motivoNoElegible && (
                                        <Alert severity="warning" sx={{ mt: 2, py: 0.5, borderRadius: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                {sede.motivoNoElegible}
                                            </Typography>
                                        </Alert>
                                    )}
                                    {sede.esElegible && (
                                        <Alert severity="success" sx={{ mt: 2, py: 0.5, borderRadius: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                Cumple todos los requisitos para prácticas
                                            </Typography>
                                        </Alert>
                                    )}
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                                    <Button 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined" 
                                        onClick={() => handleOpenDetails(sede)}
                                        startIcon={<Info />}
                                        sx={{ flex: 1, borderRadius: 2, py: 1.5 }}
                                    >
                                        Ver Detalle
                                    </Button>
                                    <Button 
                                        size="small" 
                                        color="success" 
                                        variant="contained" 
                                        onClick={() => handleSeleccionarSede(sede)}
                                        disabled={!sede.esElegible || selectingSedeId === sede.id}
                                        startIcon={selectingSedeId === sede.id ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                                        sx={{ flex: 1, borderRadius: 2, py: 1.5 }}
                                    >
                                        {selectingSedeId === sede.id ? 'Seleccionando...' : 'Seleccionar'}
                                    </Button>
                                </CardActions>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
                {filteredSedes.length === 0 && !loading && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                            <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                No se encontraron sedes
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Intenta ajustar los filtros de búsqueda para encontrar más opciones.
                            </Typography>
                            <Button 
                                variant="outlined" 
                                onClick={limpiarFiltros}
                                startIcon={<Clear />}
                                sx={{ mt: 2, borderRadius: 2 }}
                            >
                                Limpiar filtros
                            </Button>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Drawer de detalle */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleCloseDetails}
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 2,
                    '& .MuiDrawer-paper': { width: 600, borderRadius: '16px 0 0 16px' } 
                }}
            >
                <Slide direction="left" in={drawerOpen}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {selectedSede && (
                            <>
                                <Box sx={{ 
                                    p: 3, 
                                    bgcolor: 'primary.main', 
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                                            <Business />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">
                                                Detalle de Sede
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Información completa
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton onClick={handleCloseDetails} sx={{ color: 'white' }}>
                                        <Close />
                                    </IconButton>
                                </Box>
                                <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>

                                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                        <Typography variant="h5" gutterBottom fontWeight="bold">
                                            {selectedSede.razonSocialEmpresa}
                                        </Typography>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {selectedSede.nombreSede}
                                        </Typography>
                                        {selectedSede.esElegible && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                                <CheckCircle />
                                                <Typography variant="body2" fontWeight="bold">
                                                    Sede elegible para selección
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Info color="primary" /> Datos de la Sede
                                    </Typography>
                                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                            <LocationOn fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <strong>Dirección:</strong> {selectedSede.direccion}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                            <LocationOn fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <strong>Ubicación:</strong> {selectedSede.departamento}, {selectedSede.provincia}, {selectedSede.distrito}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                            <Apartment fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <strong>Tipo de entidad:</strong> {selectedSede.tipoEntidad}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                            <Work fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <strong>Área disponible:</strong> {selectedSede.areaDisponible || 'No especificada'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                            <People fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <strong>Capacidad máxima:</strong> {selectedSede.capacidadMaxima || 'No especificada'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTime fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                <strong>Vacantes disponibles:</strong> {selectedSede.vacantesDisponibles || 0}
                                            </Typography>
                                        </Box>
                                    </Paper>

                                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircle color="primary" /> Información de Habilitación
                                    </Typography>
                                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                            <Chip 
                                                icon={selectedSede.tieneConvenioVigente ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                                                label={selectedSede.tieneConvenioVigente ? 'Convenio Vigente' : 'Sin Convenio'} 
                                                color={selectedSede.tieneConvenioVigente ? 'success' : 'error'}
                                                sx={{ borderRadius: 1 }}
                                            />
                                            {selectedSede.fechaVigenciaConvenio && (
                                                <Typography variant="caption" color="textSecondary">
                                                    Vence: {new Date(selectedSede.fechaVigenciaConvenio).toLocaleDateString()}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip 
                                                icon={selectedSede.resultadoValidacion === 'APROBADA' ? <CheckCircle fontSize="small" /> : selectedSede.resultadoValidacion === 'OBSERVADA' ? <Warning fontSize="small" /> : selectedSede.resultadoValidacion === 'RECHAZADA' ? <Cancel fontSize="small" /> : <Info fontSize="small" />}
                                                label={`Validación: ${selectedSede.resultadoValidacion || 'No validada'}`} 
                                                color={getValidacionBadgeColor(selectedSede)}
                                                sx={{ borderRadius: 1 }}
                                            />
                                            {selectedSede.fechaVigenciaValidacion && (
                                                <Typography variant="caption" color="textSecondary">
                                                    Vigencia hasta: {new Date(selectedSede.fechaVigenciaValidacion).toLocaleDateString()}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>

                                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <People color="primary" /> Tutores Activos
                                    </Typography>
                                    {selectedSede.tutoresActivos && selectedSede.tutoresActivos.length > 0 ? (
                                        <Stack spacing={2}>
                                            {selectedSede.tutoresActivos.map((tutor, index) => (
                                                <Paper key={tutor.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                                            {tutor.nombres?.charAt(0) || 'T'}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {tutor.nombres} {tutor.apellidoPaterno} {tutor.apellidoMaterno}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {tutor.cargo}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Email fontSize="small" color="action" />
                                                        <Typography variant="caption" color="textSecondary">
                                                            {tutor.correo}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Phone fontSize="small" color="action" />
                                                        <Typography variant="caption" color="textSecondary">
                                                            {tutor.telefono || 'No especificado'}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: 'grey.50' }}>
                                            <People sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                            <Typography variant="body2" color="textSecondary">
                                                No hay tutores activos asignados
                                            </Typography>
                                        </Paper>
                                    )}

                                    <Box sx={{ mt: 3, display: 'flex', gap: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                        <Button 
                                            variant="contained" 
                                            color="success" 
                                            fullWidth
                                            onClick={() => handleSeleccionarSede(selectedSede)}
                                            disabled={!selectedSede.esElegible}
                                            startIcon={<CheckCircle />}
                                            sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                                        >
                                            Seleccionar Sede
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            onClick={handleCloseDetails}
                                            fullWidth
                                            startIcon={<Close />}
                                            sx={{ borderRadius: 2, py: 1.5 }}
                                        >
                                            Cerrar
                                        </Button>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </Box>
                </Slide>
            </Drawer>
        </Box>
    );
};

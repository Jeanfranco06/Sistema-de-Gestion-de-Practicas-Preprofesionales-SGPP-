import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Chip, Button, 
    TextField, InputAdornment, LinearProgress, Divider
} from '@mui/material';
import { Search, Person, Business, AccessTime, Assessment, ChevronRight, Groups, Description } from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { useNavigate } from 'react-router-dom';

export const ListaPracticantes = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [practicantes, setPracticantes] = useState([]);
    const [filteredPracticantes, setFilteredPracticantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const isTutor = user?.roles?.includes('TUTOR_EXTERNO');

    useEffect(() => {
        const fetchPracticantes = async () => {
            try {
                setLoading(true);
                let res;
                if (isTutor) {
                    res = await expedientesApi.getByTutor(user?.id || 1);
                } else {
                    res = await expedientesApi.getByAsesor(user?.id || 1);
                }
                const data = res?.data?.data || [];
                setPracticantes(data);
                setFilteredPracticantes(data);
            } catch (err) {
                console.error("Error al cargar practicantes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPracticantes();
    }, [user, isTutor]);

    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        setFilteredPracticantes(
            practicantes.filter(p => 
                p.nombreEstudiante?.toLowerCase().includes(lowerSearch) ||
                p.apellidoEstudiante?.toLowerCase().includes(lowerSearch) ||
                p.codigoEstudiantil?.toLowerCase().includes(lowerSearch) ||
                p.nombreEmpresa?.toLowerCase().includes(lowerSearch)
            )
        );
    }, [search, practicantes]);

    const handleEvaluar = (idPractica) => {
        if (isTutor) {
            navigate(`/tutor/evaluaciones/${idPractica}`);
        } else {
            navigate(`/docente/evaluaciones/${idPractica}`);
        }
    };

    const getEstadoChip = (estado) => {
        switch(estado) {
            case 'EN_EJECUCION': return <Chip size="small" label="En Ejecución" sx={{ bgcolor: 'var(--wow-primary)', color: 'white', fontWeight: 'bold' }} />;
            case 'EVALUADO': return <Chip size="small" label="Evaluado" sx={{ bgcolor: 'var(--wow-success)', color: 'white', fontWeight: 'bold' }} />;
            case 'CERRADO': return <Chip size="small" label="Cerrado" sx={{ bgcolor: 'grey.300', color: 'grey.800', fontWeight: 'bold' }} />;
            default: return <Chip size="small" label={estado?.replace(/_/g, ' ') || 'Pendiente'} variant="outlined" />;
        }
    };

    return (
        <Box className="wow-animate-in" sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
            <div className="wow-glass-card" style={{ padding: '32px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(200,100,255,0.05))' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ p: 2, bgcolor: 'var(--wow-surface-card)', borderRadius: 3, boxShadow: 'var(--wow-shadow-sm)' }}>
                        <Groups sx={{ fontSize: 40, color: 'var(--wow-primary)' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight="800" className="wow-text-gradient">
                            Practicantes Asignados
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                            Gestione y evalúe a los estudiantes a su cargo
                        </Typography>
                    </Box>
                </Box>
            </div>

            <div className="wow-card" style={{ padding: '24px', marginBottom: '32px' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            placeholder="Buscar por nombre, código o empresa..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="wow-input"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2, bgcolor: '#f8f9fa' }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        <Chip label={`Mostrando ${filteredPracticantes.length} practicante(s)`} color="primary" variant="outlined" />
                    </Grid>
                </Grid>
            </div>

            {loading ? (
                <LinearProgress sx={{ borderRadius: 1 }} />
            ) : filteredPracticantes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#fff', borderRadius: 3, border: '2px dashed rgba(0,0,0,0.1)' }}>
                    <Person sx={{ fontSize: 60, color: 'rgba(0,0,0,0.1)', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No se encontraron practicantes
                    </Typography>
                    {search && (
                        <button className="wow-btn" style={{ marginTop: '16px' }} onClick={() => setSearch('')}>
                            Limpiar búsqueda
                        </button>
                    )}
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredPracticantes.map(practicante => (
                        <Grid item xs={12} md={6} lg={4} key={practicante.id}>
                            <div className="wow-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <Box sx={{ p: 3, flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2, mb: 0.5, color: 'var(--wow-primary)', wordBreak: 'break-word' }}>
                                                {practicante.nombreEstudiante} {practicante.apellidoEstudiante}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight="600">
                                                {practicante.codigoEstudiantil}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flexShrink: 0 }}>
                                            {getEstadoChip(practicante.estado)}
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.1)', marginRight: '12px' }}>
                                            <Business sx={{ fontSize: 18, color: 'var(--wow-primary)', display: 'block' }} />
                                        </div>
                                        <Box>
                                            <Typography variant="body2" fontWeight="700">
                                                {practicante.nombreEmpresa || 'Empresa No Asignada'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {practicante.nombreSede || 'Sede No Asignada'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(34,197,94,0.1)', marginRight: '12px' }}>
                                            <AccessTime sx={{ fontSize: 18, color: '#22c55e', display: 'block' }} />
                                        </div>
                                        <Typography variant="body2" fontWeight="500">
                                            Duración: {practicante.duracionSemanas || 0} semanas
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(234,179,8,0.1)', marginRight: '12px' }}>
                                            <Assessment sx={{ fontSize: 18, color: '#eab308', display: 'block' }} />
                                        </div>
                                        <Typography variant="body2" fontWeight="500">
                                            Modalidad: {practicante.nombreTipoPractica || 'Práctica'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 2, pt: 0 }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <button 
                                            className="wow-btn" 
                                            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '10px 8px', fontSize: '0.85rem' }}
                                            onClick={() => navigate(`/docente/documentos/${practicante.id}`)}
                                        >
                                            <Description fontSize="small"/> Docs
                                        </button>
                                        <button 
                                            className="wow-btn" 
                                            style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '10px 8px', fontSize: '0.85rem', background: 'linear-gradient(135deg, var(--wow-secondary), var(--wow-accent))' }}
                                            onClick={() => handleEvaluar(practicante.id)}
                                        >
                                            Evaluar <ChevronRight fontSize="small"/>
                                        </button>
                                    </Box>
                                </Box>
                            </div>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

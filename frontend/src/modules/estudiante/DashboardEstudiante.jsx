import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, LinearProgress, Chip,
  List, ListItem, ListItemText, ListItemIcon,
  Avatar, Button, Divider, Alert, CircularProgress, IconButton
} from '@mui/material';
import {
  Assignment, Description, AccessTime, Business, ArrowForward, 
  HourglassEmpty, Visibility, TrendingUp, Refresh, InfoOutlined, CloudUpload
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { useNavigate } from 'react-router-dom';

function getEtapaIndex(estado) {
    const estadoToEtapa = {
        'SOLICITADO': 0, 'EMPRESA_SEDE_ASIGNADA': 1, 'ASESOR_ASIGNADO': 1,
        'COMITE_ASIGNADO': 1, 'PLAN_PRESENTADO': 2, 'EN_REVISION': 2,
        'OBSERVADO': 2, 'SUBSANADO': 2, 'APROBADO': 3, 'EN_EJECUCION': 4,
        'INFORME_PARCIAL_PRESENTADO': 4, 'INFORME_FINAL_PRESENTADO': 4,
        'EVALUADO': 5, 'CERRADO': 6,
    };
    return estadoToEtapa[estado] || 0;
}

export default function DashboardEstudiante() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getByEstudiante(user?.id || 1);
      const expedientes = res.data?.data || [];
      if (expedientes.length > 0) {
        setExpediente(expedientes[0]);
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
              <CircularProgress size={60} thickness={4} sx={{ color: 'var(--wow-primary)' }} />
          </Box>
      );
  }

  if (!expediente) {
      return (
          <Box className="wow-animate-in" sx={{ p: 5, textAlign: 'center', mt: 5, maxWidth: 600, mx: 'auto' }}>
              <div className="wow-card" style={{ padding: '48px' }}>
                  <img src="https://illustrations.popsy.co/amber/student-going-to-school.svg" alt="No data" style={{ width: 200, marginBottom: 24 }} />
                  <Typography variant="h5" fontWeight="700" color="text.primary" gutterBottom>¡Comienza tu aventura profesional!</Typography>
                  <Typography variant="body1" color="text.secondary" mb={4}>Aún no tienes ninguna práctica registrada. Solicita el inicio de tus prácticas para empezar a registrar tu progreso.</Typography>
                  <button className="wow-btn">Solicitar Práctica</button>
              </div>
          </Box>
      );
  }

  const horasTotalesRequeridas = expediente.codigoTipoPractica === 'INICIAL' ? 120 : (expediente.codigoTipoPractica === 'FINAL' ? 180 : 200);
  const horasEjecutadas = expediente.estado === 'CERRADO' || expediente.estado === 'EVALUADO' ? horasTotalesRequeridas : (expediente.estado === 'EN_EJECUCION' ? Math.floor(horasTotalesRequeridas * 0.5) : 0);
  const pct = Math.round((horasEjecutadas / horasTotalesRequeridas) * 100);

  const obsActivas = expediente.observacionesList?.filter(o => !o.subsanado) || [];
  
  const docsObligatorios = ['PLAN_PRACTICA', 'CARTA_ACEPTACION', 'INFORME_FINAL', 'CONSTANCIA_CULMINACION'];
  const docsSubidos = expediente.documentos?.map(d => d.tipoDocumento) || [];
  const docsAprobados = docsObligatorios.filter(d => docsSubidos.includes(d)).length;
  const docsTotales = docsObligatorios.length;

  return (
    <Box className="wow-animate-in" sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
      
      {/* Header Profile */}
      <div className="wow-glass-card" style={{ padding: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(200,100,255,0.05))' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'var(--wow-primary)', fontSize: '2rem', boxShadow: 'var(--wow-shadow-float)' }}>
                {user?.nombres?.charAt(0)}
            </Avatar>
            <Box>
                <Typography variant="h4" fontWeight="800" className="wow-text-gradient">
                    ¡Hola, {user?.nombres?.split(' ')[0]}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {expediente.nombreTipoPractica} en {expediente.nombreEmpresa || 'Empresa No Asignada'}
                </Typography>
            </Box>
        </Box>
        <IconButton onClick={fetchData} sx={{ bgcolor: 'white', boxShadow: 'var(--wow-shadow-sm)' }}>
            <Refresh color="primary" />
        </IconButton>
      </div>

      {obsActivas.length > 0 && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 3, border: '1px solid #fde68a' }}
          action={<Button size="small" onClick={() => navigate('/estudiante/documentos')}>Resolver Ahora</Button>}>
          Tienes <strong>{obsActivas.length}</strong> observación(es) pendiente(s). Por favor corrígelas para continuar.
        </Alert>
      )}

      {/* Grid Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
            <div className="wow-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--wow-primary)', width: 56, height: 56 }}><Assignment /></Avatar>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">Modalidad</Typography>
                    <Typography variant="h6" fontWeight="800">{expediente.codigoTipoPractica}</Typography>
                </Box>
            </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <div className="wow-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#22c55e', width: 56, height: 56 }}><AccessTime /></Avatar>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">Horas Registradas</Typography>
                    <Typography variant="h6" fontWeight="800">{horasEjecutadas} / {horasTotalesRequeridas}</Typography>
                </Box>
            </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <div className="wow-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', width: 56, height: 56 }}><HourglassEmpty /></Avatar>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">Estado Actual</Typography>
                    <Typography variant="h6" fontWeight="800" sx={{ textTransform: 'capitalize' }}>{expediente.estado?.replace(/_/g, ' ').toLowerCase()}</Typography>
                </Box>
            </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <div className="wow-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar sx={{ bgcolor: 'rgba(234,179,8,0.1)', color: '#eab308', width: 56, height: 56 }}><Description /></Avatar>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">Documentos</Typography>
                    <Typography variant="h6" fontWeight="800">{docsAprobados} de {docsTotales}</Typography>
                </Box>
            </div>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Progreso Principal */}
        <Grid item xs={12} lg={8}>
            <div className="wow-card" style={{ padding: '32px', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant="h5" fontWeight="700">Progreso de Práctica</Typography>
                    <Chip label={`${pct}% Completado`} color="primary" sx={{ fontWeight: 'bold' }} />
                </Box>
                
                <Box className="wow-progress-bg" sx={{ height: 16, mb: 2 }}>
                    <div className="wow-progress-fill" style={{ width: `${pct}%` }}></div>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">{horasEjecutadas} hrs. ejecutadas</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">{horasTotalesRequeridas - horasEjecutadas} hrs. restantes</Typography>
                </Box>

                <Divider sx={{ my: 4 }} />
                
                <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Documentos Requeridos</Typography>
                <Grid container spacing={2}>
                    {docsObligatorios.map((docType) => {
                        const isSubido = docsSubidos.includes(docType);
                        const n = { 'PLAN_PRACTICA': 'Plan de Prácticas', 'CARTA_ACEPTACION': 'Carta de Aceptación', 'INFORME_FINAL': 'Informe Final', 'CONSTANCIA_CULMINACION': 'Constancia de Culminación' };
                        return (
                            <Grid item xs={12} sm={6} key={docType}>
                                <div style={{ padding: '16px', borderRadius: '12px', border: isSubido ? '2px solid rgba(34,197,94,0.2)' : '2px solid rgba(0,0,0,0.05)', backgroundColor: isSubido ? 'rgba(34,197,94,0.02)' : '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {isSubido ? <CloudUpload sx={{ color: '#22c55e' }}/> : <Description color="disabled"/>}
                                        <Typography variant="body2" fontWeight="600">{n[docType] || docType}</Typography>
                                    </Box>
                                    {isSubido ? <Chip label="Listo" size="small" sx={{ bgcolor: '#22c55e', color: 'white', fontWeight: 'bold' }}/> : <Chip label="Falta" size="small" variant="outlined"/>}
                                </div>
                            </Grid>
                        );
                    })}
                </Grid>
            </div>
        </Grid>

        {/* Sidebar / Quick Actions */}
        <Grid item xs={12} lg={4}>
            <div className="wow-card" style={{ padding: '32px', marginBottom: '24px' }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Accesos Rápidos</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Visibility />} fullWidth onClick={() => navigate('/estudiante/documentos')} sx={{ py: 1.5, borderRadius: 2, justifyContent: 'flex-start', color: 'text.primary', borderColor: 'rgba(0,0,0,0.1)' }}>
                        Gestionar Documentos
                    </Button>
                    <Button variant="outlined" startIcon={<Business />} fullWidth onClick={() => navigate('/estudiante/sedes')} sx={{ py: 1.5, borderRadius: 2, justifyContent: 'flex-start', color: 'text.primary', borderColor: 'rgba(0,0,0,0.1)' }}>
                        Información de Empresa
                    </Button>
                    <Button variant="outlined" startIcon={<TrendingUp />} fullWidth onClick={() => navigate('/estudiante/evaluacion')} sx={{ py: 1.5, borderRadius: 2, justifyContent: 'flex-start', color: 'text.primary', borderColor: 'rgba(0,0,0,0.1)' }}>
                        Ver mis Evaluaciones
                    </Button>
                </Box>
            </div>

            <div className="wow-card" style={{ padding: '32px' }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Historial Reciente</Typography>
                <List disablePadding>
                    {expediente.estadoHistorial?.slice(-4).reverse().map((h) => (
                        <ListItem key={h.id} disablePadding sx={{ mb: 2, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                <InfoOutlined color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={`${h.estadoNuevo?.replace(/_/g, ' ')}`}
                                secondary={h.observacion || h.fechaCambio}
                                slotProps={{ primary: { fontWeight: 600, fontSize: '0.9rem', sx: { textTransform: 'capitalize' } }, secondary: { fontSize: '0.75rem' } }}
                            />
                        </ListItem>
                    ))}
                    {(!expediente.estadoHistorial || expediente.estadoHistorial.length === 0) && (
                        <Typography variant="body2" color="text.secondary">No hay actualizaciones aún.</Typography>
                    )}
                </List>
            </div>
        </Grid>
      </Grid>
    </Box>
  );
}

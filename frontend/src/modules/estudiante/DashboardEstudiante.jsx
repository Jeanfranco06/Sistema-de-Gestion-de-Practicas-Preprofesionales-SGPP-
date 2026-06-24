import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Chip, List, ListItem, ListItemText, ListItemIcon,
  Button, Divider, Alert, CircularProgress, IconButton, Paper, Stack,
} from '@mui/material';
import {
  Description, Business, Visibility, TrendingUp, Refresh, InfoOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../shared/components/PageHeader';
import ContentCard from '../../shared/components/ContentCard';

export default function DashboardEstudiante() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getMisExpedientes();
      const expedientes = res.data?.data || [];
      if (expedientes.length > 0) setExpediente(expedientes[0]);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!expediente) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', py: 8 }}>
        <ContentCard>
          <Typography variant="h6" gutterBottom>Sin práctica registrada</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Solicita el inicio de tus prácticas para comenzar a registrar tu progreso.
          </Typography>
          <Button variant="contained">Solicitar práctica</Button>
        </ContentCard>
      </Box>
    );
  }

  const horasTotales = expediente.codigoTipoPractica === 'INICIAL' ? 120 : (expediente.codigoTipoPractica === 'FINAL' ? 180 : 200);
  const horasEjecutadas = expediente.estado === 'CERRADO' || expediente.estado === 'EVALUADO'
    ? horasTotales
    : (expediente.estado === 'EN_EJECUCION' ? Math.floor(horasTotales * 0.5) : 0);
  const pct = Math.round((horasEjecutadas / horasTotales) * 100);

  const obsActivas = expediente.observacionesList?.filter((o) => !o.subsanado) || [];
  const docsObligatorios = ['PLAN_PRACTICA', 'CARTA_ACEPTACION', 'INFORME_FINAL', 'CONSTANCIA_CULMINACION'];
  const docsSubidos = expediente.documentos?.map((d) => d.tipoDocumento) || [];
  const docsAprobados = docsObligatorios.filter((d) => docsSubidos.includes(d)).length;
  const docLabels = {
    PLAN_PRACTICA: 'Plan de prácticas',
    CARTA_ACEPTACION: 'Carta de aceptación',
    INFORME_FINAL: 'Informe final',
    CONSTANCIA_CULMINACION: 'Constancia de culminación',
  };

  const stats = [
    { label: 'Modalidad', value: expediente.codigoTipoPractica },
    { label: 'Horas', value: `${horasEjecutadas} / ${horasTotales}` },
    { label: 'Estado', value: expediente.estado?.replace(/_/g, ' ').toLowerCase() },
    { label: 'Documentos', value: `${docsAprobados} / ${docsObligatorios.length}` },
  ];

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <PageHeader
        title={`Hola, ${user?.nombres?.split(' ')[0]}`}
        subtitle={`${expediente.nombreTipoPractica} · ${expediente.nombreEmpresa || 'Empresa no asignada'}`}
        action={
          <IconButton onClick={fetchData} size="small" aria-label="Actualizar">
            <Refresh fontSize="small" />
          </IconButton>
        }
      />

      {obsActivas.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}
          action={<Button size="small" onClick={() => navigate('/estudiante/documentos')}>Resolver</Button>}>
          Tienes {obsActivas.length} observación(es) pendiente(s).
        </Alert>
      )}

      <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2, display: 'flex', flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <Box
            key={s.label}
            sx={{
              flex: '1 1 140px',
              px: 2.5, py: 2,
              borderRight: i < stats.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
              {s.label}
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.25, textTransform: 'capitalize' }}>
              {s.value}
            </Typography>
          </Box>
        ))}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <ContentCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Progreso de práctica</Typography>
              <Chip label={`${pct}%`} size="small" variant="outlined" />
            </Box>
            <Box className="wow-progress-bg" sx={{ mb: 1 }}>
              <div className="wow-progress-fill" style={{ width: `${pct}%` }} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {horasEjecutadas} hrs ejecutadas · {horasTotales - horasEjecutadas} hrs restantes
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Documentos requeridos
            </Typography>
            <Stack spacing={1}>
              {docsObligatorios.map((docType) => {
                const listo = docsSubidos.includes(docType);
                return (
                  <Box
                    key={docType}
                    sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      py: 1.25, px: 1.5, borderRadius: 1,
                      border: '1px solid', borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Description fontSize="small" color={listo ? 'action' : 'disabled'} />
                      <Typography variant="body2">{docLabels[docType] || docType}</Typography>
                    </Box>
                    <Chip label={listo ? 'Listo' : 'Pendiente'} size="small" variant="outlined" />
                  </Box>
                );
              })}
            </Stack>
          </ContentCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ContentCard>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Accesos</Typography>
            <Stack spacing={1}>
              <Button variant="text" startIcon={<Visibility />} onClick={() => navigate('/estudiante/documentos')} sx={{ justifyContent: 'flex-start' }}>
                Gestionar documentos
              </Button>
              <Button variant="text" startIcon={<Business />} onClick={() => navigate('/estudiante/sedes')} sx={{ justifyContent: 'flex-start' }}>
                Información de empresa
              </Button>
              <Button variant="text" startIcon={<TrendingUp />} onClick={() => navigate('/estudiante/evaluacion')} sx={{ justifyContent: 'flex-start' }}>
                Ver evaluaciones
              </Button>
            </Stack>
          </ContentCard>

          <ContentCard sx={{ mb: 0 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Historial reciente</Typography>
            <List disablePadding dense>
              {expediente.estadoHistorial?.slice(-4).reverse().map((h) => (
                <ListItem key={h.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <InfoOutlined fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={h.estadoNuevo?.replace(/_/g, ' ')}
                    secondary={h.observacion || h.fechaCambio}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500, textTransform: 'capitalize' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
              {(!expediente.estadoHistorial || expediente.estadoHistorial.length === 0) && (
                <Typography variant="body2" color="text.secondary">Sin actualizaciones.</Typography>
              )}
            </List>
          </ContentCard>
        </Grid>
      </Grid>
    </Box>
  );
}

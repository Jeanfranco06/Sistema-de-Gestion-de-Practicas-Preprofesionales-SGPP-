import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress, Chip,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Avatar, Button, Divider, Alert, Paper, Stepper, Step, StepLabel,
  Tooltip, CircularProgress,
} from '@mui/material';
import {
  Assignment, Description, Notifications, CheckCircle, Warning,
  AccessTime, Business, ArrowForward, HourglassEmpty, School,
  CalendarToday, InfoOutlined, UploadFile, Visibility, TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';

// ── Datos de prueba realistas (se sustituirán por llamadas a la API) ──────────
const MOCK_PRACTICA = {
  tipo: 'Prácticas Iniciales',
  empresa: 'Empresa Agroindustrial Casa Grande S.A.A.',
  sede: 'Sede Trujillo – Área de Producción',
  fechaInicio: '2025-04-01',
  fechaFin: '2025-06-24',
  horasEjecutadas: 210,
  horasTotales: 320,
  etapaActual: 2,
  estado: 'EN_PROGRESO',
};

const MOCK_EXPEDIENTE = {
  planPracticas: { estado: 'APROBADO', fecha: '2025-04-12' },
  cartaPresentacion: { estado: 'APROBADO', fecha: '2025-03-28' },
  informeParcial1: { estado: 'PENDIENTE', fecha: null },
  informeParcial2: { estado: 'PENDIENTE', fecha: null },
  informeFinal: { estado: 'PENDIENTE', fecha: null },
};

const MOCK_OBSERVACIONES = [
  { id: 1, documento: 'Plan de Prácticas', mensaje: 'Falta completar el cronograma de actividades en la semana 8.', fecha: '2025-04-10', resuelta: true },
  { id: 2, documento: 'Informe Parcial 1', mensaje: 'Los objetivos no están alineados con el plan aprobado.', fecha: '2025-05-18', resuelta: false },
];

const MOCK_TAREAS = [
  { id: 1, tarea: 'Subir Informe Parcial 1', limite: '2025-05-30', urgente: true, icon: <UploadFile fontSize="small" /> },
  { id: 2, tarea: 'Levantar observación – Informe Parcial 1', limite: '2025-05-27', urgente: true, icon: <Warning fontSize="small" color="warning" /> },
  { id: 3, tarea: 'Subir Informe Parcial 2', limite: '2025-06-13', urgente: false, icon: <UploadFile fontSize="small" /> },
  { id: 4, tarea: 'Subir Informe Final', limite: '2025-06-20', urgente: false, icon: <Description fontSize="small" /> },
];

const MOCK_NOTIFICACIONES = [
  { id: 1, tipo: 'warning', texto: 'Tu Informe Parcial 1 tiene una observación activa. Plazo: 27/05/2025.', fecha: 'Hoy' },
  { id: 2, tipo: 'info', texto: 'El docente asesor revisó tu Plan de Prácticas y lo aprobó.', fecha: 'Hace 2 días' },
  { id: 3, tipo: 'success', texto: 'Tu Carta de Presentación fue enviada a la empresa exitosamente.', fecha: 'Hace 5 días' },
];

const ETAPAS = ['Solicitud', 'Plan Aprobado', 'En Ejecución', 'Informes', 'Evaluación', 'Constancia'];

// ── Componentes de tarjeta ────────────────────────────────────────────────────
function StatCard({ icon, label, value, subtext, color = 'primary.main' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          {subtext && <Typography variant="caption" color="text.secondary">{subtext}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

function EstadoChip({ estado }) {
  const map = {
    APROBADO: { label: 'Aprobado', color: 'success' },
    PENDIENTE: { label: 'Pendiente', color: 'default' },
    EN_REVISION: { label: 'En Revisión', color: 'info' },
    OBSERVADO: { label: 'Observado', color: 'warning' },
  };
  const { label, color } = map[estado] || { label: estado, color: 'default' };
  return <Chip label={label} color={color} size="small" />;
}

function diasRestantes(fechaStr) {
  if (!fechaStr) return null;
  const diff = Math.ceil((new Date(fechaStr) - new Date()) / 86400000);
  return diff;
}

// ── Dashboard principal ───────────────────────────────────────────────────────
export default function DashboardEstudiante() {
  const { user } = useAuth();
  const [loading] = useState(false);

  const pct = Math.round((MOCK_PRACTICA.horasEjecutadas / MOCK_PRACTICA.horasTotales) * 100);
  const obsActivas = MOCK_OBSERVACIONES.filter((o) => !o.resuelta);

  const docsAprobados = Object.values(MOCK_EXPEDIENTE).filter((d) => d.estado === 'APROBADO').length;
  const docsTotales = Object.keys(MOCK_EXPEDIENTE).length;

  return (
    <Box>
      {/* Saludo */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Bienvenido, {user?.nombres?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {MOCK_PRACTICA.tipo} · {MOCK_PRACTICA.empresa}
        </Typography>
      </Box>

      {/* Alerta si hay observaciones activas */}
      {obsActivas.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}
          action={<Button size="small" color="inherit">Ver</Button>}>
          Tienes <strong>{obsActivas.length}</strong> observación activa pendiente de levantar. Plazo: <strong>27/05/2025</strong>.
        </Alert>
      )}

      {/* ── Tarjetas de métricas ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<AccessTime />} label="Horas Acumuladas"
            value={MOCK_PRACTICA.horasEjecutadas} subtext={`de ${MOCK_PRACTICA.horasTotales} horas requeridas`} color="primary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<Description />} label="Documentos Aprobados"
            value={`${docsAprobados}/${docsTotales}`} subtext="Plan y Carta aprobados" color="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<Warning />} label="Observaciones Activas"
            value={obsActivas.length} subtext="Requieren atención" color={obsActivas.length > 0 ? 'warning.main' : 'success.main'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<CheckCircle />} label="Avance del Trámite"
            value={`${pct}%`} subtext="Etapa: En Ejecución" color="secondary.main" />
        </Grid>
      </Grid>

      {/* ── Barra de progreso de horas + stepper ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Horas Acumuladas</Typography>
                <Chip label={`${pct}%`} color={pct >= 80 ? 'success' : 'primary'} size="small" />
              </Box>
              <LinearProgress variant="determinate" value={pct} sx={{ height: 12, borderRadius: 6, mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {MOCK_PRACTICA.horasEjecutadas} horas ejecutadas
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {MOCK_PRACTICA.horasTotales - MOCK_PRACTICA.horasEjecutadas} restantes
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip icon={<Business />} label={MOCK_PRACTICA.sede} size="small" variant="outlined" sx={{ maxWidth: '100%' }} />
                <Chip icon={<CalendarToday />} label={`${MOCK_PRACTICA.fechaInicio} → ${MOCK_PRACTICA.fechaFin}`} size="small" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>Progreso del Trámite</Typography>
              <Stepper activeStep={MOCK_PRACTICA.etapaActual} alternativeLabel>
                {ETAPAS.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.7rem' } }}>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Estado del expediente + Tareas ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Expediente */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Estado del Expediente</Typography>
              <List dense disablePadding>
                {[
                  { key: 'Carta de Presentación', data: MOCK_EXPEDIENTE.cartaPresentacion },
                  { key: 'Plan de Prácticas', data: MOCK_EXPEDIENTE.planPracticas },
                  { key: 'Informe Parcial 1', data: MOCK_EXPEDIENTE.informeParcial1 },
                  { key: 'Informe Parcial 2', data: MOCK_EXPEDIENTE.informeParcial2 },
                  { key: 'Informe Final', data: MOCK_EXPEDIENTE.informeFinal },
                ].map(({ key, data }) => (
                  <ListItem key={key} disablePadding sx={{ py: 0.75 }}>
                    <ListItemText
                      primary={key}
                      primaryTypographyProps={{ fontSize: '0.82rem' }}
                    />
                    <EstadoChip estado={data.estado} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de tareas */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Tareas Pendientes</Typography>
              <List dense disablePadding>
                {MOCK_TAREAS.map((t) => {
                  const dias = diasRestantes(t.limite);
                  return (
                    <ListItem key={t.id} disablePadding sx={{ py: 0.75 }}>
                      <ListItemIcon sx={{ minWidth: 32, color: t.urgente ? 'error.main' : 'text.secondary' }}>
                        {t.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={t.tarea}
                        secondary={`${t.limite} · ${dias >= 0 ? `${dias} días` : 'vencido'}`}
                        primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: t.urgente ? 600 : 400 }}
                        secondaryTypographyProps={{ fontSize: '0.72rem', color: dias < 5 ? 'error.main' : 'text.secondary' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notificaciones */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Notificaciones</Typography>
                <Chip label={MOCK_NOTIFICACIONES.length} color="error" size="small" />
              </Box>
              <List dense disablePadding>
                {MOCK_NOTIFICACIONES.map((n) => (
                  <Box key={n.id}>
                    <ListItem disablePadding sx={{ py: 0.75, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 30, mt: 0.5 }}>
                        {n.tipo === 'warning' && <Warning fontSize="small" color="warning" />}
                        {n.tipo === 'info' && <InfoOutlined fontSize="small" color="info" />}
                        {n.tipo === 'success' && <CheckCircle fontSize="small" color="success" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={n.texto}
                        secondary={n.fecha}
                        primaryTypographyProps={{ fontSize: '0.8rem' }}
                        secondaryTypographyProps={{ fontSize: '0.72rem' }}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Accesos rápidos ── */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Accesos Rápidos</Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Subir Informe Parcial', icon: <UploadFile />, color: '#1a3a5c', path: '/estudiante/documentos' },
              { label: 'Ver mis Documentos', icon: <Visibility />, color: '#2e7d32', path: '/estudiante/documentos' },
              { label: 'Registro de Horas', icon: <AccessTime />, color: '#ed6c02', path: '/estudiante/horas' },
              { label: 'Mi Empresa / Sede', icon: <Business />, color: '#0288d1', path: '/estudiante/sedes' },
              { label: 'Ver Evaluación', icon: <TrendingUp />, color: '#c8a951', path: '/estudiante/evaluacion' },
              { label: 'Mi Docente Asesor', icon: <School />, color: '#7b1fa2', path: '/estudiante/practica' },
            ].map((acc) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={acc.label}>
                <Paper
                  sx={{
                    p: 2, textAlign: 'center', cursor: 'pointer', borderRadius: 2,
                    border: '1px solid #e0e0e0', transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', borderColor: acc.color },
                  }}
                  onClick={() => {}}
                >
                  <Avatar sx={{ bgcolor: acc.color, mx: 'auto', mb: 1, width: 42, height: 42 }}>
                    {acc.icon}
                  </Avatar>
                  <Typography variant="caption" fontWeight={600} display="block" sx={{ lineHeight: 1.3 }}>
                    {acc.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

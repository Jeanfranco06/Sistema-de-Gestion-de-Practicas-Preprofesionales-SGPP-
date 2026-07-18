import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Stack, Grid, Chip, CircularProgress,
  Alert, Table, TableBody, TableCell, TableHead, TableRow, Paper, MenuItem, FormControl, InputLabel, Select,
} from '@mui/material';
import { AccessTime, Add, CheckCircle, HourglassEmpty } from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import { horasEstudianteApi } from '../../../api/horasApi';
import { useAuth } from '../../../auth/AuthContext';
import { ModulePageShell, ModulePageHeader } from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';

const MySwal = withReactContent(Swal);

export const RegistroHoras = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState(null);
  const [control, setControl] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [cumplimiento, setCumplimiento] = useState(null);
  const [form, setForm] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    horas: '',
    descripcionActividad: '',
    tipoRegistro: 'PRESENCIAL',
    observaciones: '',
  });

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getMisExpedientes();
      const list = res.data?.data || [];
      const exp = list[0] || null;
      setExpediente(exp);
      if (exp) {
        await fetchHoras(exp.id);
      }
    } catch (err) {
      console.error('Error fetching expediente:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHoras = async (idExpediente) => {
    try {
      const [controlRes, registrosRes, cumplimientoRes] = await Promise.all([
        horasEstudianteApi.getControl(idExpediente).catch(() => null),
        horasEstudianteApi.getRegistros(idExpediente).catch(() => null),
        horasEstudianteApi.getCumplimiento(idExpediente).catch(() => null),
      ]);
      setControl(controlRes?.data?.data || null);
      setRegistros(registrosRes?.data?.data || []);
      setCumplimiento(cumplimientoRes?.data?.data || null);
    } catch (err) {
      console.error('Error fetching horas:', err);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchExpediente(), 0);
    return () => clearTimeout(timeout);
  }, [user]);

  const handleIniciarControl = async () => {
    try {
      await horasEstudianteApi.iniciarControl(expediente.id, user.id);
      await fetchHoras(expediente.id);
      MySwal.fire({ icon: 'success', title: 'Control iniciado', timer: 1500, showConfirmButton: false });
    } catch (error) {
      MySwal.fire({ icon: 'error', title: 'Error', text: error?.response?.data?.message || 'No se pudo iniciar el control de horas' });
    }
  };

  const calcularHoras = (inicio, fin) => {
    if (!inicio || !fin) return '';
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0) diff += 24 * 60;
    return Math.round(diff / 60);
  };

  const handleChangeTime = (campo, valor) => {
    const nuevoForm = { ...form, [campo]: valor };
    if (campo === 'horaInicio' || campo === 'horaFin') {
      const horas = calcularHoras(
        campo === 'horaInicio' ? valor : nuevoForm.horaInicio,
        campo === 'horaFin' ? valor : nuevoForm.horaFin
      );
      nuevoForm.horas = horas !== '' ? String(horas) : nuevoForm.horas;
    }
    setForm(nuevoForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expediente || !control) {
      MySwal.fire({ icon: 'warning', title: 'Control no iniciado', text: 'Primero inicie el control de horas.' });
      return;
    }
    try {
      const payload = {
        ...form,
        horas: Number(form.horas),
      };
      await horasEstudianteApi.registrar(expediente.id, user.id, payload);
      setForm({ fecha: '', horaInicio: '', horaFin: '', horas: '', descripcionActividad: '', tipoRegistro: 'PRESENCIAL', observaciones: '' });
      await fetchHoras(expediente.id);
      MySwal.fire({ icon: 'success', title: 'Horas registradas', timer: 1500, showConfirmButton: false });
    } catch (error) {
      MySwal.fire({ icon: 'error', title: 'Error', text: error?.response?.data?.message || 'No se pudieron registrar las horas' });
    }
  };

  if (loading) {
    return (
      <ModulePageShell>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={32} />
        </Box>
      </ModulePageShell>
    );
  }

  if (!expediente) {
    return (
      <ModulePageShell>
        <ContentCard>
          <AccessTime sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Sin expediente activo</Typography>
          <Typography variant="body2" color="text.secondary">No tienes ninguna práctica registrada para registrar horas.</Typography>
        </ContentCard>
      </ModulePageShell>
    );
  }

  const horasRequeridas = cumplimiento?.horasRequeridas || (expediente.codigoTipoPractica === 'INICIAL' ? 64 : 360);
  const horasValidadas = cumplimiento?.horasValidadas || control?.horasValidadas || 0;
  const progreso = Math.min(100, Math.round((horasValidadas / horasRequeridas) * 100));

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<AccessTime />}
        title="Registro de Horas"
        subtitle={`Registra tu avance semanal de horas para el expediente ${expediente.codigoExpediente}`}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ContentCard>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Resumen</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Horas validadas</Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {horasValidadas} <Typography component="span" variant="body2" color="text.secondary">/ {horasRequeridas}</Typography>
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Progreso</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                    <Box sx={{ width: `${progreso}%`, bgcolor: 'primary.main', height: '100%', borderRadius: 1 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{progreso}%</Typography>
                </Box>
              </Box>
              <Chip
                icon={horasValidadas >= horasRequeridas ? <CheckCircle /> : <HourglassEmpty />}
                label={horasValidadas >= horasRequeridas ? 'Cumplimiento completado' : 'Pendiente de cumplimiento'}
                color={horasValidadas >= horasRequeridas ? 'success' : 'warning'}
                size="small"
              />
              {!control && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  El control de horas será iniciado por Secretaría o Coordinación una vez aprobado tu plan.
                </Alert>
              )}
            </Stack>
          </ContentCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <ContentCard>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Nuevo registro</Typography>
            {!control && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Debe iniciar el control de horas antes de registrar actividades.
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Hora inicio"
                    type="time"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={form.horaInicio}
                    onChange={(e) => handleChangeTime('horaInicio', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Hora fin"
                    type="time"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={form.horaFin}
                    onChange={(e) => handleChangeTime('horaFin', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Horas"
                    type="number"
                    fullWidth
                    size="small"
                    value={form.horas}
                    onChange={(e) => setForm({ ...form, horas: e.target.value })}
                    required
                    inputProps={{ min: 1, max: 24 }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Tipo de registro</InputLabel>
                    <Select
                      value={form.tipoRegistro}
                      label="Tipo de registro"
                      onChange={(e) => setForm({ ...form, tipoRegistro: e.target.value })}
                    >
                      <MenuItem value="PRESENCIAL">Presencial</MenuItem>
                      <MenuItem value="VIRTUAL">Virtual</MenuItem>
                      <MenuItem value="CAMPO">Trabajo de campo</MenuItem>
                      <MenuItem value="EXTRAORDINARIO">Extraordinario</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Descripción de la actividad"
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    value={form.descripcionActividad}
                    onChange={(e) => setForm({ ...form, descripcionActividad: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Observaciones"
                    fullWidth
                    size="small"
                    multiline
                    rows={1}
                    value={form.observaciones}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" startIcon={<Add />} disabled={!control}>
                  Registrar horas
                </Button>
              </Box>
            </Box>
          </ContentCard>
        </Grid>

        <Grid item xs={12}>
          <ContentCard>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Historial de registros</Typography>
            {registros.length === 0 ? (
              <Alert severity="info">No hay registros de horas aún.</Alert>
            ) : (
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Horas</TableCell>
                      <TableCell>Actividad</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {registros.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.fecha}</TableCell>
                        <TableCell>{r.horas}</TableCell>
                        <TableCell>{r.descripcionActividad}</TableCell>
                        <TableCell>{r.tipoRegistro}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.validado ? 'Validado' : 'Pendiente'}
                            color={r.validado ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </ContentCard>
        </Grid>
      </Grid>
    </ModulePageShell>
  );
};

export default RegistroHoras;

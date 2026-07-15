import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Chip, Alert, CircularProgress
} from '@mui/material';
import { Add as AddIcon, AccessTime as TimeIcon } from '@mui/icons-material';
import { expedientesApi } from '../../../api/expedientesApi';
import { horasApi } from '../../../api/coordinacionApi';
import { useAuth } from '../../../auth/AuthContext';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

export const RegistroHoras = () => {
  const { user } = useAuth();
  const [expediente, setExpediente] = useState(null);
  const [horasControl, setHorasControl] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horas: '',
    descripcionActividad: '',
    tipoRegistro: 'DIARIO'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const resExp = await expedientesApi.getMisExpedientes();
      if (resExp.data.success && resExp.data.data.length > 0) {
        const active = resExp.data.data.find(e => e.estado !== 'CERRADO' && e.estado !== 'ANULADO') || resExp.data.data[0];
        setExpediente(active);
        
        try {
           const resControl = await horasApi.getControl(active.id);
           if (resControl.data.success) {
               setHorasControl(resControl.data.data);
           }
        } catch (e) {
           console.log("No hay control de horas iniciado");
        }

        const resReg = await horasApi.getRegistros(active.id);
        if (resReg.data.success) {
          setRegistros(resReg.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expediente) return;
    
    try {
      const payload = {
        ...formData,
        horas: parseInt(formData.horas)
      };
      await horasApi.registrarHora(expediente.id, payload, user.id);
      Swal.fire('Registrado', 'Las horas fueron registradas correctamente', 'success');
      setFormData({ ...formData, horas: '', descripcionActividad: '' });
      cargarDatos();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al registrar', 'error');
    }
  };

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

  if (!expediente) {
    return (
      <Box p={4}>
        <Alert severity="info">No tienes ninguna práctica registrada en este momento.</Alert>
      </Box>
    );
  }

  const horasAcumuladas = horasControl?.horasAcumuladas || expediente.horasAcumuladas || 0;
  const horasRequeridas = horasControl?.horasRequeridas || (expediente.tipoPractica === 'INICIAL' ? 320 : 600);
  const progreso = Math.min((horasAcumuladas / horasRequeridas) * 100, 100);

  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom>
        Registro de Horas
      </Typography>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2} display="flex" alignItems="center">
                 <TimeIcon sx={{ mr: 1, color: 'primary.main' }} /> Resumen de Horas
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Acumuladas:</Typography>
                <Typography variant="body1" fontWeight="bold">{horasAcumuladas} h</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">Requeridas:</Typography>
                <Typography variant="body1" fontWeight="bold">{horasRequeridas} h</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Box width="100%">
                  <LinearProgress variant="determinate" value={progreso} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
                <Typography variant="body2" fontWeight="bold">{Math.round(progreso)}%</Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>Nueva Actividad</Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth size="small" margin="normal"
                  label="Fecha" type="date" name="fecha"
                  value={formData.fecha} onChange={handleInputChange} required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth size="small" margin="normal"
                  label="Horas (Ej. 8)" type="number" name="horas"
                  value={formData.horas} onChange={handleInputChange} required inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth size="small" margin="normal"
                  label="Descripción de la actividad" name="descripcionActividad"
                  value={formData.descripcionActividad} onChange={handleInputChange} required multiline rows={3}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} startIcon={<AddIcon />}>
                  Registrar Horas
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="600" mb={2}>Historial de Registros</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Actividad</strong></TableCell>
                    <TableCell align="center"><strong>Horas</strong></TableCell>
                    <TableCell align="center"><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registros.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Aún no tienes registros de horas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    registros.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.fecha}</TableCell>
                        <TableCell>{row.descripcionActividad}</TableCell>
                        <TableCell align="center">{row.horas}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={row.estado} 
                            size="small"
                            color={row.estado === 'APROBADO' ? 'success' : row.estado === 'OBSERVADO' ? 'error' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegistroHoras;

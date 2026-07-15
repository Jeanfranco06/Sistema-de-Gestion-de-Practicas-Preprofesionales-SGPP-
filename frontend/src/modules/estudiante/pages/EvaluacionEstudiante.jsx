import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress, Alert, Chip, Divider, LinearProgress
} from '@mui/material';
import { Assignment as AssignmentIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import { expedientesApi } from '../../../api/expedientesApi';
import { evaluacionesApi } from '../../../api/evaluacionesApi';
import { motion } from 'framer-motion';

export const EvaluacionEstudiante = () => {
  const [expediente, setExpediente] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const resExp = await expedientesApi.getMisExpedientes();
      if (resExp.data.success && resExp.data.data.length > 0) {
        // Obtenemos la última o activa
        const active = resExp.data.data.find(e => e.estado !== 'CERRADO' && e.estado !== 'ANULADO') || resExp.data.data[0];
        setExpediente(active);
        
        try {
            const resEv = await evaluacionesApi.obtenerEvaluacionesPorPractica(active.id);
            if (resEv.data && resEv.data.success) {
                setEvaluaciones(resEv.data.data);
            } else if (Array.isArray(resEv.data)) {
                setEvaluaciones(resEv.data);
            }
        } catch(e) {
            console.log("No se pudieron cargar evaluaciones", e);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const calcularNotaFinal = () => {
    let notaTutor = 0, notaDocenteInf = 0, notaDocenteSust = 0, notaComite = 0;
    evaluaciones.forEach(ev => {
      if (ev.tipoEvaluador === 'TUTOR_EXTERNO') notaTutor = ev.promedio || ev.puntajeTotal || 0;
      if (ev.tipoEvaluador === 'DOCENTE_ASESOR' && ev.tipoEvaluacion === 'INFORME') notaDocenteInf = ev.promedio || ev.puntajeTotal || 0;
      if (ev.tipoEvaluador === 'DOCENTE_ASESOR' && ev.tipoEvaluacion === 'SUSTENTACION') notaDocenteSust = ev.promedio || ev.puntajeTotal || 0;
      if (ev.tipoEvaluador === 'COMITE_EVALUADOR') notaComite = ev.promedio || ev.puntajeTotal || 0;
    });

    const total = (notaTutor * 0.3) + (notaDocenteInf * 0.3) + (notaDocenteSust * 0.3) + (notaComite * 0.1);
    return Math.round(total * 100) / 100;
  };

  const getNota = (tipoEvaluador, tipoEvaluacion) => {
    const ev = evaluaciones.find(e => e.tipoEvaluador === tipoEvaluador && (!tipoEvaluacion || e.tipoEvaluacion === tipoEvaluacion));
    return ev ? (ev.promedio || ev.puntajeTotal || 0) : null;
  };

  const notaFinal = calcularNotaFinal();
  const estadoClase = notaFinal >= 14 ? 'success' : (notaFinal > 0 ? 'warning' : 'default');

  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom display="flex" alignItems="center">
        <AssessmentIcon sx={{ mr: 2, fontSize: 36 }} /> Resultados de Evaluación
      </Typography>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Nota Promedio Final</Typography>
            <Typography variant="h1" fontWeight="800" color={`${estadoClase}.main`}>
              {notaFinal > 0 ? notaFinal : '--'}
            </Typography>
            <Box mt={2}>
              <Chip 
                label={notaFinal >= 14 ? 'APROBADO' : (notaFinal > 0 ? 'DESAPROBADO' : 'EN PROCESO')} 
                color={estadoClase} 
                variant="outlined" 
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={3} display="flex" alignItems="center">
                 <AssignmentIcon sx={{ mr: 1 }} /> Desglose según Rúbrica
              </Typography>
              
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">1. Tutor Externo (Empresa) - <strong>30%</strong></Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getNota('TUTOR_EXTERNO') !== null ? `${getNota('TUTOR_EXTERNO')} / 20` : 'Pendiente'}
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={(getNota('TUTOR_EXTERNO') || 0) * 5} color={getNota('TUTOR_EXTERNO') >= 14 ? 'success' : 'primary'} />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">2. Docente Asesor (Desempeño) - <strong>30%</strong></Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getNota('DOCENTE_ASESOR', 'INFORME') !== null ? `${getNota('DOCENTE_ASESOR', 'INFORME')} / 20` : 'Pendiente'}
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={(getNota('DOCENTE_ASESOR', 'INFORME') || 0) * 5} color={getNota('DOCENTE_ASESOR', 'INFORME') >= 14 ? 'success' : 'primary'} />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">3. Docente Asesor (Sustentación) - <strong>30%</strong></Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getNota('DOCENTE_ASESOR', 'SUSTENTACION') !== null ? `${getNota('DOCENTE_ASESOR', 'SUSTENTACION')} / 20` : 'Pendiente'}
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={(getNota('DOCENTE_ASESOR', 'SUSTENTACION') || 0) * 5} color={getNota('DOCENTE_ASESOR', 'SUSTENTACION') >= 14 ? 'success' : 'primary'} />
              </Box>

              {expediente.tipoPractica === 'FINAL' && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">4. Comité Evaluador - <strong>10%</strong></Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {getNota('COMITE_EVALUADOR') !== null ? `${getNota('COMITE_EVALUADOR')} / 20` : 'Pendiente'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(getNota('COMITE_EVALUADOR') || 0) * 5} color={getNota('COMITE_EVALUADOR') >= 14 ? 'success' : 'primary'} />
                  </Box>
                </>
              )}

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EvaluacionEstudiante;

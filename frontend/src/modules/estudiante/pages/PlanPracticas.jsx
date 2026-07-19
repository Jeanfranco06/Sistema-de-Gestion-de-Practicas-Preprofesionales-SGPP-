import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Grid, IconButton, Stack,
  TextField, Typography,
} from '@mui/material';
import { Add, Delete, Send } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { expedientesApi } from '../../../api/expedientesApi';
import { planesApi } from '../../../api/planesApi';
import { ModulePageHeader, ModulePageShell } from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';

const today = () => new Date().toISOString().slice(0, 10);

const emptyActivity = () => ({ actividad: '', fechaInicioPrevista: '', fechaFinPrevista: '', duracionSemanas: '', orden: 0 });

const planInitial = (expediente) => ({
  idExpediente: expediente.id,
  caratula: {
    institucion: 'Universidad Nacional de Trujillo - Facultad de Ingeniería',
    nombrePlan: 'Plan de Actividades de Prácticas Preprofesionales',
    autor: expediente.nombreEstudiante || '',
    asesor: expediente.nombreAsesor || '',
    fecha: today(),
  },
  datosEmpresa: {
    razonSocial: expediente.nombreEmpresa || '',
    direccion: '',
    representanteLegal: '',
    telefono: '',
    correo: '',
    celular: '',
    descripcionGeneral: '',
  },
  areaDepartamento: { areaDepartamento: '', funcionarioACargo: '' },
  situacionProblematica: '',
  objetivos: [
    { tipo: 'GENERAL', descripcion: '', orden: 1 },
    { tipo: 'ESPECIFICO', descripcion: '', orden: 2 },
    { tipo: 'ESPECIFICO', descripcion: '', orden: 3 },
  ],
  tecnicasProcedimientos: '',
  teoriasTecnicas: [],
  cronograma: [emptyActivity()],
});

const mapPlan = (plan) => ({
  idExpediente: plan.idExpediente,
  caratula: plan.caratula,
  datosEmpresa: plan.datosEmpresa,
  areaDepartamento: plan.areaDepartamento || { areaDepartamento: '', funcionarioACargo: '' },
  situacionProblematica: plan.situacionProblematica,
  objetivos: plan.objetivos || [],
  tecnicasProcedimientos: plan.tecnicasProcedimientos,
  teoriasTecnicas: plan.teoriasTecnicas || [],
  cronograma: (plan.cronograma || []).map(({ actividad, fechaInicioPrevista, fechaFinPrevista, duracionSemanas, orden }) => ({
    actividad,
    fechaInicioPrevista: fechaInicioPrevista || '',
    fechaFinPrevista: fechaFinPrevista || '',
    duracionSemanas: duracionSemanas || '',
    orden,
  })),
});

export const PlanPracticas = () => {
  const [expediente, setExpediente] = useState(null);
  const [plan, setPlan] = useState(null);
  const [planEstado, setPlanEstado] = useState(null);
  const [existingPlanId, setExistingPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await expedientesApi.getMisExpedientes();
        const expedientes = response.data?.data || [];
        const activo = expedientes[0];
        if (!activo) {
          setLoading(false);
          return;
        }
        setExpediente(activo);
        try {
          const planResponse = await planesApi.getActivoByExpediente(activo.id);
          const existente = planResponse.data?.data;
          if (existente) {
            setExistingPlanId(existente.id);
            setPlanEstado(existente.estado);
            if (existente.estado === 'BORRADOR' && existente.caratula) {
              setPlan(mapPlan(existente));
            } else if (existente.estado === 'BORRADOR' && !existente.caratula) {
              setPlan(planInitial(activo));
            } else {
              setPlan(mapPlan(existente));
            }
          } else {
            setPlan(planInitial(activo));
          }
        } catch {
          setPlan(planInitial(activo));
        }
      } catch (error) {
        console.error('No se pudo cargar el Plan de Prácticas', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = (section, field, value) => {
    setPlan((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));
  };

  const updateList = (section, index, field, value) => {
    setPlan((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  };

  const addObjective = () => {
    setPlan((current) => ({
      ...current,
      objetivos: [...current.objetivos, { tipo: 'ESPECIFICO', descripcion: '', orden: current.objetivos.length + 1 }],
    }));
  };

  const removeObjective = (index) => {
    setPlan((current) => ({
      ...current,
      objetivos: current.objetivos.filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, orden: itemIndex + 1 })),
    }));
  };

  const addActivity = () => setPlan((current) => ({ ...current, cronograma: [...current.cronograma, emptyActivity()] }));

  const removeActivity = (index) => {
    setPlan((current) => ({
      ...current,
      cronograma: current.cronograma.filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, orden: itemIndex + 1 })),
    }));
  };

  const validate = () => {
    const general = plan.objetivos.filter((item) => item.tipo === 'GENERAL').length;
    const specific = plan.objetivos.filter((item) => item.tipo === 'ESPECIFICO').length;
    if (general < 1 || specific < 2) return 'Registra un objetivo general y al menos dos objetivos específicos.';
    if (plan.cronograma.some((item) => !item.actividad || !item.fechaInicioPrevista || !item.fechaFinPrevista)) {
      return 'Completa actividad, fecha de inicio y fecha de fin en todo el cronograma.';
    }
    if (plan.cronograma.some((item) => item.fechaFinPrevista < item.fechaInicioPrevista)) {
      return 'La fecha final de una actividad no puede ser anterior a su fecha inicial.';
    }
    return null;
  };

  const submit = async () => {
    const error = validate();
    if (error) {
      await Swal.fire({ icon: 'warning', title: 'Completa el Plan', text: error });
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...plan,
        objetivos: plan.objetivos.map((item, index) => ({ ...item, orden: index + 1 })),
        cronograma: plan.cronograma.map((item, index) => ({ ...item, orden: index + 1, duracionSemanas: Number(item.duracionSemanas) || null })),
      };
      if (existingPlanId && planEstado === 'BORRADOR') {
        await planesApi.presentar(existingPlanId);
      } else {
        const created = await planesApi.registrar(payload);
        const planId = created.data?.data?.id;
        if (!planId) throw new Error('No se obtuvo el ID del plan creado');
        await planesApi.presentar(planId);
      }
      setPlanEstado('PRESENTADO');
      await Swal.fire({ icon: 'success', title: 'Plan presentado', text: 'El Plan de Prácticas fue enviado para revisión.' });
    } catch (error) {
      const message = error.response?.data?.message || '';
      if (message.includes('Ya existe un plan activo')) {
        try {
          const planResponse = await planesApi.getActivoByExpediente(expediente.id);
          const activo = planResponse.data?.data;
          if (activo && activo.estado === 'BORRADOR') {
            await planesApi.presentar(activo.id);
            setPlanEstado('PRESENTADO');
            await Swal.fire({ icon: 'success', title: 'Plan presentado', text: 'El Plan existente fue presentado correctamente.' });
            return;
          }
        } catch (innerError) {
          console.error('Error al recuperar plan activo', innerError);
        }
        await Swal.fire({ icon: 'error', title: 'Plan duplicado', text: 'Ya existe un Plan activo que no se pudo presentar. Contacta al administrador.' });
      } else {
        await Swal.fire({ icon: 'error', title: 'No se pudo presentar', text: message || 'Revisa los datos obligatorios e intenta nuevamente.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!expediente || !plan) return <ModulePageShell><Alert severity="info">No tienes un expediente activo.</Alert></ModulePageShell>;

  const editable = !planEstado || planEstado === 'BORRADOR' || planEstado === 'OBSERVADO';
  const field = (section, name, label, options = {}) => (
    <TextField fullWidth label={label} value={plan[section][name] || ''} onChange={(event) => update(section, name, event.target.value)} disabled={!editable} {...options} />
  );

  return (
    <ModulePageShell>
      <ModulePageHeader title="Plan de Prácticas" subtitle={`Anexo 1 · ${expediente.codigoExpediente}`} />
      {planEstado && <Alert severity={planEstado === 'APROBADO' ? 'success' : 'info'} sx={{ mb: 2 }}>Estado del Plan: {planEstado}</Alert>}
      <Stack spacing={2}>
        <ContentCard>
          <Typography variant="h6" gutterBottom>1. Del practicante</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>{field('caratula', 'autor', 'Nombre del practicante', { required: true })}</Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label="Fecha del Plan" value={plan.caratula.fecha || ''} onChange={(event) => update('caratula', 'fecha', event.target.value)} disabled={!editable} required slotProps={{ inputLabel: { shrink: true } }} /></Grid>
            <Grid size={{ xs: 12 }}>{field('caratula', 'institucion', 'Institución', { required: true })}</Grid>
            <Grid size={{ xs: 12 }}>{field('caratula', 'nombrePlan', 'Nombre del Plan', { required: true })}</Grid>
            <Grid size={{ xs: 12 }}>{field('caratula', 'asesor', expediente.codigoTipoPractica === 'INICIAL' ? 'Docente asesor' : 'Responsable de revisión')}</Grid>
          </Grid>
        </ContentCard>

        <ContentCard>
          <Typography variant="h6" gutterBottom>2. Empresa o institución receptora</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>{field('datosEmpresa', 'razonSocial', 'Razón social', { required: true })}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{field('datosEmpresa', 'representanteLegal', 'Gerente o representante legal', { required: true })}</Grid>
            <Grid size={{ xs: 12 }}>{field('datosEmpresa', 'direccion', 'Dirección', { required: true })}</Grid>
            <Grid size={{ xs: 12, md: 4 }}>{field('datosEmpresa', 'telefono', 'Teléfono', { required: true })}</Grid>
            <Grid size={{ xs: 12, md: 4 }}>{field('datosEmpresa', 'correo', 'Correo electrónico', { type: 'email' })}</Grid>
            <Grid size={{ xs: 12, md: 4 }}>{field('datosEmpresa', 'celular', 'Celular')}</Grid>
            <Grid size={{ xs: 12 }}>{field('datosEmpresa', 'descripcionGeneral', 'Descripción general de la empresa', { required: true, multiline: true, minRows: 3 })}</Grid>
          </Grid>
        </ContentCard>

        <ContentCard>
          <Typography variant="h6" gutterBottom>3. Área, objetivos y fundamento</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>{field('areaDepartamento', 'areaDepartamento', 'Área, departamento o sección', { required: true })}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{field('areaDepartamento', 'funcionarioACargo', 'Funcionario a cargo')}</Grid>
          </Grid>
          <TextField fullWidth required disabled={!editable} label="Situación problemática" value={plan.situacionProblematica} onChange={(event) => setPlan((current) => ({ ...current, situacionProblematica: event.target.value }))} multiline minRows={4} sx={{ mt: 2 }} />
          <TextField fullWidth required disabled={!editable} label="Técnicas y procedimientos de Ingeniería Industrial" value={plan.tecnicasProcedimientos} onChange={(event) => setPlan((current) => ({ ...current, tecnicasProcedimientos: event.target.value }))} multiline minRows={4} sx={{ mt: 2 }} />
        </ContentCard>

        <ContentCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">4. Objetivos o logros previstos</Typography>
            {editable && <Button startIcon={<Add />} onClick={addObjective}>Agregar objetivo específico</Button>}
          </Box>
          <Stack spacing={1.5}>
            {plan.objetivos.map((objective, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField select disabled={!editable || index === 0} label="Tipo" value={objective.tipo} onChange={(event) => updateList('objetivos', index, 'tipo', event.target.value)} sx={{ width: 150 }} slotProps={{ select: { native: true } }}>
                  <option value="GENERAL">General</option><option value="ESPECIFICO">Específico</option>
                </TextField>
                <TextField fullWidth required disabled={!editable} label={`Objetivo ${index + 1}`} value={objective.descripcion} onChange={(event) => updateList('objetivos', index, 'descripcion', event.target.value)} />
                {editable && index > 2 && <IconButton onClick={() => removeObjective(index)}><Delete /></IconButton>}
              </Box>
            ))}
          </Stack>
        </ContentCard>

        <ContentCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">5. Principales actividades y cronograma</Typography>
            {editable && <Button startIcon={<Add />} onClick={addActivity}>Agregar actividad</Button>}
          </Box>
          <Stack spacing={1.5}>
            {plan.cronograma.map((activity, index) => (
              <Box key={index} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, md: 5 }}><TextField fullWidth required disabled={!editable} label="Actividad" value={activity.actividad} onChange={(event) => updateList('cronograma', index, 'actividad', event.target.value)} /></Grid>
                  <Grid size={{ xs: 6, md: 2 }}><TextField fullWidth required disabled={!editable} type="date" label="Inicio" value={activity.fechaInicioPrevista} onChange={(event) => updateList('cronograma', index, 'fechaInicioPrevista', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 6, md: 2 }}><TextField fullWidth required disabled={!editable} type="date" label="Fin" value={activity.fechaFinPrevista} onChange={(event) => updateList('cronograma', index, 'fechaFinPrevista', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 10, md: 2 }}><TextField fullWidth disabled={!editable} type="number" label="Duración (semanas)" value={activity.duracionSemanas} onChange={(event) => updateList('cronograma', index, 'duracionSemanas', event.target.value)} slotProps={{ htmlInput: { min: 1 } }} /></Grid>
                  <Grid size={{ xs: 2, md: 1 }}>{editable && plan.cronograma.length > 1 && <IconButton onClick={() => removeActivity(index)}><Delete /></IconButton>}</Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </ContentCard>

        {editable && <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="contained" size="large" startIcon={<Send />} disabled={submitting} onClick={submit}>{submitting ? 'Presentando...' : 'Presentar Plan para revisión'}</Button></Box>}
      </Stack>
    </ModulePageShell>
  );
};

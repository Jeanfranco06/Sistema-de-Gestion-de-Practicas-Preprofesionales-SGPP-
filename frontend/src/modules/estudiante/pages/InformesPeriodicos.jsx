import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, LinearProgress, Divider, Grid, Stack, CircularProgress,
} from '@mui/material';
import {
  CloudUpload, Download, AccessTime, CheckCircle, Lock, Article, EventNote,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import api from '../../../api/axios';
import { useAuth } from '../../../auth/AuthContext';
import {
  ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';

const MySwal = withReactContent(Swal);

const HITOS_INICIAL = [
  { id: 1, nombre: 'Informe Parcial Semana 5', semana: 5, descripcion: 'Informe de avance correspondiente a la semana 5', tipo: 'INFORME_PARCIAL_1' },
  { id: 2, nombre: 'Informe Parcial Semana 10', semana: 10, descripcion: 'Informe de avance correspondiente a la semana 10', tipo: 'INFORME_PARCIAL_2' },
  { id: 3, nombre: 'Informe Final Semana 15', semana: 15, descripcion: 'Informe final de prácticas', tipo: 'INFORME_FINAL_INICIAL' },
];

const HITOS_FINAL = [
  { id: 1, nombre: 'Informe Final', semana: 15, descripcion: 'Informe final de prácticas', tipo: 'INFORME_FINAL' },
];

const ESTADOS_EXPEDIENTE_HITO = {
  INFORME_PARCIAL_1: 'INFORME_PARCIAL_1_PRESENTADO',
  INFORME_PARCIAL_2: 'INFORME_PARCIAL_2_PRESENTADO',
  INFORME_FINAL_INICIAL: 'INFORME_FINAL_PRESENTADO',
  INFORME_FINAL: 'INFORME_FINAL_PRESENTADO',
};

export const InformesPeriodicos = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState(null);
  const [hitos, setHitos] = useState([]);
  const [uploadDialog, setUploadDialog] = useState({ open: false, hito: null });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getMisExpedientes();
      const list = res.data?.data || [];
      const exp = list[0] || null;
      setExpediente(exp);
      if (exp) {
        const baseHitos = exp.codigoTipoPractica === 'INICIAL' ? HITOS_INICIAL : HITOS_FINAL;
        const docs = exp.documentos || [];
        const estadoExp = exp.estado;
        const hitosConEstado = baseHitos.map((h) => {
          const doc = docs.find((d) => d.tipoDocumento === h.tipo);
          let estadoHito = 'PENDIENTE';
          if (doc) {
            estadoHito = doc.estado === 'APROBADO' ? 'APROBADO' : 'EN_REVISION';
          }
          // Si el expediente ya avanzó más allá del hito, marcar como completado
          const estadosPosteriores = [
            'EVALUACION_PENDIENTE', 'EVALUACION_EMPRESA_PENDIENTE', 'EVALUACION_COMPLETA',
            'DICTAMEN_EMITIDO', 'EVALUADO', 'CERRADO'
          ];
          if (estadoExp === ESTADOS_EXPEDIENTE_HITO[h.tipo]) {
            estadoHito = doc ? estadoHito : 'EN_REVISION';
          } else if (doc && (doc.estado === 'APROBADO' || estadosPosteriores.includes(estadoExp))) {
            estadoHito = 'APROBADO';
          }
          return {
            ...h,
            estado: estadoHito,
            archivo: doc ? doc.nombreArchivo : null,
            fileName: doc ? doc.rutaArchivo : null,
            bloqueado: false,
          };
        });
        // Bloquear informe parcial 2 si no se cargó el parcial 1
        const idxParcial1 = hitosConEstado.findIndex((h) => h.tipo === 'INFORME_PARCIAL_1');
        const idxParcial2 = hitosConEstado.findIndex((h) => h.tipo === 'INFORME_PARCIAL_2');
        if (idxParcial2 >= 0 && idxParcial1 >= 0 && !hitosConEstado[idxParcial1].archivo) {
          hitosConEstado[idxParcial2].bloqueado = true;
          hitosConEstado[idxParcial2].estado = 'BLOQUEADO';
        }
        setHitos(hitosConEstado);
      }
    } catch (err) {
      console.error('Error fetching expediente:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchExpediente(), 0);
    return () => clearTimeout(timeout);
  }, [user]);

  const handleOpenUpload = (hito) => {
    setUploadDialog({ open: true, hito });
    setSelectedFile(null);
  };

  const handleCloseUpload = () => {
    setUploadDialog({ open: false, hito: null });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.split('.').pop().toLowerCase() !== 'pdf') {
        MySwal.fire({ icon: 'error', title: 'Formato Incorrecto', text: 'Solo se permiten archivos en formato PDF.', confirmButtonColor: '#d33' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        MySwal.fire({ icon: 'warning', title: 'Archivo Demasiado Pesado', text: 'El informe excede el tamaño maximo de 5MB. Por favor comprimalo.', confirmButtonColor: '#f8bb86' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !expediente || !uploadDialog.hito) return;

    try {
      MySwal.fire({
        title: 'Enviando Informe...',
        html: 'Guardando el documento y notificando a su docente asesor.',
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading(),
      });

      const uploadRes = await expedientesApi.uploadFile(selectedFile);
      const { fileName } = uploadRes.data;

      await api.post(`/expedientes/${expediente.id}/documentos`, null, {
        params: { tipoDocumento: uploadDialog.hito.tipo, nombreDoc: selectedFile.name, fileName }
      });

      if (uploadDialog.hito.tipo === 'INFORME_PARCIAL_1' || uploadDialog.hito.tipo === 'INFORME_PARCIAL_2') {
        await expedientesApi.presentarInformeParcial(expediente.id);
      } else {
        await expedientesApi.presentarInformeFinal(expediente.id);
      }

      await fetchExpediente();
      handleCloseUpload();

      MySwal.fire({
        icon: 'success',
        title: 'Informe enviado',
        text: 'Su docente asesor ha sido notificado para la revision.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      MySwal.fire({
        icon: 'error',
        title: 'Error de Conexion',
        text: error?.response?.data?.message || 'Hubo un problema al subir el informe. Intente de nuevo.',
      });
    }
  };

  const handleDownload = async (hito) => {
    if (!hito.fileName) return;
    try {
      MySwal.fire({ title: 'Descargando...', allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
      const res = await api.get(`/documentos/download/${hito.fileName}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', hito.archivo || hito.fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      MySwal.close();
    } catch (error) {
      console.error('Download error:', error);
      MySwal.fire('Error', 'No tienes permisos o el archivo no existe.', 'error');
    }
  };

  const getEstadoChip = (estado) => {
    switch (estado) {
      case 'APROBADO': return <Chip size="small" icon={<CheckCircle />} label="Aprobado" color="success" />;
      case 'EN_REVISION': return <Chip size="small" icon={<AccessTime />} label="En revision" color="warning" />;
      case 'PENDIENTE': return <Chip size="small" label="Pendiente" color="primary" variant="outlined" />;
      case 'BLOQUEADO': return <Chip size="small" icon={<Lock />} label="Bloqueado" color="default" />;
      default: return null;
    }
  };

  const progreso = useMemo(() => {
    if (hitos.length === 0) return 0;
    const completados = hitos.filter((h) => h.estado === 'APROBADO' || h.estado === 'EN_REVISION').length;
    return Math.round((completados / hitos.length) * 100);
  }, [hitos]);

  const enviados = hitos.filter((h) => h.archivo).length;
  const disponibles = hitos.filter((h) => !h.bloqueado).length;

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
          <Article sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Sin expediente activo</Typography>
          <Typography variant="body2" color="text.secondary">No tienes ninguna práctica registrada para gestionar informes.</Typography>
        </ContentCard>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<Article />}
        title="Informes periodicos"
        subtitle={`Carga tus informes en las ventanas de tiempo establecidas para prácticas ${expediente.codigoTipoPractica?.toLowerCase() || ''}.`}
        action={<Chip label={`${enviados} de ${hitos.length} enviados`} size="small" color="primary" variant="outlined" />}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Disponibles', value: disponibles, color: 'primary.main' },
          { label: 'Enviados', value: enviados, color: 'success.main' },
          { label: 'Bloqueados', value: hitos.length - disponibles, color: 'text.secondary' },
        ].map((item) => (
          <Grid item xs={12} sm={4} key={item.label}>
            <ContentCard sx={{ mb: 0, p: 2.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                {item.label}
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: item.color, mt: 0.5 }}>
                {item.value}
              </Typography>
            </ContentCard>
          </Grid>
        ))}
      </Grid>

      <ContentCard accent>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>Progreso del semestre</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={progreso} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${progreso}%`}</Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">Expediente: {expediente.codigoExpediente}</Typography>
      </ContentCard>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
        {hitos.map((hito) => {
          const isProximo = hito.estado === 'PENDIENTE' && !hito.bloqueado;
          return (
            <ContentCard
              key={hito.id}
              sx={{
                height: '100%',
                borderColor: isProximo ? 'primary.main' : 'divider',
                borderWidth: isProximo ? 2 : 1,
                bgcolor: hito.bloqueado ? 'grey.50' : 'background.paper',
                mb: 0,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EventNote fontSize="small" color={hito.bloqueado ? 'disabled' : 'primary'} />
                  <Typography variant="h6" color={hito.bloqueado ? 'text.disabled' : 'text.primary'}>
                    Semana {hito.semana}
                  </Typography>
                </Stack>
                {getEstadoChip(hito.estado)}
              </Box>

              <Typography variant="subtitle2" mb={1}>{hito.nombre}</Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {hito.descripcion}
                </Typography>
                {isProximo && (
                  <Alert severity="warning" sx={{ mt: 1, py: 0, px: 1 }}>
                    Pendiente de envío
                  </Alert>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {hito.archivo ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }} title={hito.archivo}>
                    {hito.archivo}
                  </Typography>
                  <Button size="small" startIcon={<Download />} onClick={() => handleDownload(hito)}>Descargar</Button>
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant={isProximo ? 'contained' : 'outlined'}
                  disabled={hito.bloqueado}
                  startIcon={hito.bloqueado ? <Lock /> : <CloudUpload />}
                  onClick={() => handleOpenUpload(hito)}
                >
                  {hito.bloqueado ? 'No disponible' : 'Cargar informe'}
                </Button>
              )}
            </ContentCard>
          );
        })}
      </Box>

      <Dialog open={uploadDialog.open} onClose={handleCloseUpload} maxWidth="sm" fullWidth>
        <DialogTitle>Cargar {uploadDialog.hito?.nombre}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, textAlign: 'center' }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="informe-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="informe-upload">
              <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                Seleccionar archivo PDF
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 2 }} color="success.main">
                Archivo: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpload}>Cancelar</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!selectedFile}>
            Subir
          </Button>
        </DialogActions>
      </Dialog>
    </ModulePageShell>
  );
};

export default InformesPeriodicos;

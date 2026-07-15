import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, LinearProgress, Divider, CircularProgress
} from '@mui/material';
import { CloudUpload, Download, AccessTime, CheckCircle, Lock } from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import api from '../../../api/axios';

const MySwal = withReactContent(Swal);

export const InformesPeriodicos = () => {
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hitos, setHitos] = useState([]);
  const [uploadDialog, setUploadDialog] = useState({ open: false, hito: null });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getMisExpedientes();
      const list = res.data?.data || [];
      if (list.length > 0) {
        const activeExp = list[0];
        setExpediente(activeExp);
        buildHitos(activeExp);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpediente();
  }, []);

  const buildHitos = (exp) => {
    const docs = exp.documentos || [];
    const parciales = docs.filter(d => d.tipoDocumento === 'INFORME_PARCIAL');
    const finalDoc = docs.find(d => d.tipoDocumento === 'INFORME_FINAL');

    // Build 2 Parciales and 1 Final
    const newHitos = [
      {
        id: 'PARCIAL_1', tipo: 'INFORME_PARCIAL', nombre: 'Informe Parcial 1', semana: 5,
        doc: parciales[0] || null, bloqueado: false, fechaLimite: '2025-10-15'
      },
      {
        id: 'PARCIAL_2', tipo: 'INFORME_PARCIAL', nombre: 'Informe Parcial 2', semana: 10,
        doc: parciales[1] || null, bloqueado: !parciales[0], fechaLimite: '2025-11-20'
      },
      {
        id: 'FINAL', tipo: 'INFORME_FINAL', nombre: 'Informe Final', semana: 15,
        doc: finalDoc || null, bloqueado: !parciales[1], fechaLimite: '2025-12-25'
      }
    ];
    setHitos(newHitos);
  };

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
        MySwal.fire({ icon: 'error', title: 'Formato Incorrecto', text: 'Solo se permiten archivos en formato PDF.' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !expediente) return;
    
    try {
      MySwal.fire({ title: 'Subiendo...', allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
      
      const resUpload = await expedientesApi.uploadFile(selectedFile);
      const { fileName } = resUpload.data;

      await api.post(`/expedientes/${expediente.id}/documentos`, null, {
          params: { tipoDocumento: uploadDialog.hito.tipo, nombreDoc: selectedFile.name, fileName: fileName }
      });

      if (uploadDialog.hito.tipo === 'INFORME_PARCIAL') {
          await expedientesApi.presentarInformeParcial(expediente.id);
      } else {
          await expedientesApi.presentarInformeFinal(expediente.id);
      }

      handleCloseUpload();
      MySwal.fire({ icon: 'success', title: '¡Informe Enviado!', timer: 2000, showConfirmButton: false });
      fetchExpediente();
    } catch (error) {
      MySwal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al subir el informe.' });
    }
  };

  const handleDownload = async (hito) => {
    try {
      MySwal.fire({ title: 'Descargando...', allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
      const res = await api.get(`/documentos/download/${hito.doc.rutaArchivo || hito.doc.nombreArchivo}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', hito.doc.nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      MySwal.close();
    } catch (error) {
      MySwal.fire('Error', 'No tienes permisos o el archivo no existe.', 'error');
    }
  };

  const getEstadoChip = (hito) => {
    if (hito.doc) return <Chip size="small" icon={<CheckCircle />} label="Enviado" color="success" />;
    if (hito.bloqueado) return <Chip size="small" icon={<Lock />} label="Bloqueado" color="default" />;
    return <Chip size="small" label="Pendiente" color="primary" variant="outlined" />;
  };

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  
  if (!expediente) {
    return (
      <Box p={4}>
        <Alert severity="info">No tienes ninguna práctica registrada.</Alert>
      </Box>
    );
  }

  const progreso = Math.round(((hitos.filter(h => h.doc).length) / hitos.length) * 100);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 0.75 }}>
          Seguimiento de Informes Periódicos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          Carga tus informes en las ventanas de tiempo establecidas para prácticas iniciales.
        </Typography>
      </Box>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>Progreso del Semestre</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={progreso} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${progreso}%`}</Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">Semana actual: 10 de 16</Typography>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {hitos.map((hito) => {
          const isProximo = !hito.doc && !hito.bloqueado;
          return (
            <Paper
              key={hito.id}
              variant="outlined"
              sx={{
                p: 3,
                height: '100%',
                borderColor: isProximo ? 'primary.main' : 'divider',
                borderWidth: isProximo ? 2 : 1,
                bgcolor: hito.bloqueado ? '#f5f5f5' : 'white'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                  <Typography variant="h6" color={hito.bloqueado ? 'text.disabled' : 'text.primary'}>
                    Semana {hito.semana}
                  </Typography>
                  {getEstadoChip(hito)}
              </Box>
                
              <Typography variant="subtitle2" mb={1}>{hito.nombre}</Typography>
                
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha límite aproximada: {new Date(hito.fechaLimite).toLocaleDateString()}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {hito.doc ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }} title={hito.doc.nombreArchivo}>
                    {hito.doc.nombreArchivo}
                  </Typography>
                  <Button size="small" startIcon={<Download />} onClick={() => handleDownload(hito)}>Descargar</Button>
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant={isProximo ? "contained" : "outlined"}
                  disabled={hito.bloqueado}
                  startIcon={hito.bloqueado ? <Lock /> : <CloudUpload />}
                  onClick={() => handleOpenUpload(hito)}
                >
                  {hito.bloqueado ? 'No disponible' : 'Cargar Informe'}
                </Button>
              )}
            </Paper>
          );
        })}
      </Box>

      <Dialog open={uploadDialog.open} onClose={handleCloseUpload} maxWidth="sm" fullWidth>
        <DialogTitle>Cargar {uploadDialog.hito?.nombre}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, p: 3, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="informe-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="informe-upload">
              <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                Seleccionar Archivo PDF
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
    </Box>
  );
};

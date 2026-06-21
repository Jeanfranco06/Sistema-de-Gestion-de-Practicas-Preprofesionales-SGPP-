import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, LinearProgress, Divider
} from '@mui/material';
import { CloudUpload, Download, AccessTime, CheckCircle, Lock } from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import api from '../../../api/axios';

const MySwal = withReactContent(Swal);

const HITOS = [
  { id: 1, nombre: 'Informe Parcial 1', semana: 5, estado: 'APROBADO', fechaLimite: '2025-10-15', bloqueado: false, archivo: 'informe_semana5.pdf', fileName: 'mock-file.pdf' },
  { id: 2, nombre: 'Informe Parcial 2', semana: 10, estado: 'PENDIENTE', fechaLimite: '2025-11-20', bloqueado: false, archivo: null, fileName: null },
  { id: 3, nombre: 'Informe Final', semana: 15, estado: 'BLOQUEADO', fechaLimite: '2025-12-25', bloqueado: true, archivo: null, fileName: null }
];

export const InformesPeriodicos = () => {
  const [hitos, setHitos] = useState(HITOS);
  const [uploadDialog, setUploadDialog] = useState({ open: false, hito: null });
  const [selectedFile, setSelectedFile] = useState(null);

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
        MySwal.fire({
          icon: 'error',
          title: 'Formato Incorrecto',
          text: 'Solo se permiten archivos en formato PDF.',
          confirmButtonColor: '#d33'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // Max 5MB for informes
        MySwal.fire({
          icon: 'warning',
          title: 'Archivo Demasiado Pesado',
          text: 'El informe excede el tamaño máximo de 5MB. Por favor comprímalo.',
          confirmButtonColor: '#f8bb86'
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      MySwal.fire({
        title: 'Enviando Informe...',
        html: 'Guardando el documento y notificando a su docente asesor.',
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading();
        }
      });

      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Lógica real en producción:
      const response = await expedientesApi.uploadFile(selectedFile);
      const { fileName } = response.data;

      setHitos(hitos.map(h => {
        if (h.id === uploadDialog.hito.id) {
          return { ...h, estado: 'EN_REVISION', archivo: selectedFile.name, fileName: fileName };
        }
        return h;
      }));

      handleCloseUpload();
      
      MySwal.fire({
        icon: 'success',
        title: '¡Informe Enviado!',
        text: 'Su docente asesor ha sido notificado para la revisión.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'Hubo un problema al subir el informe. Intente de nuevo.'
      });
    }
  };

  const handleDownload = async (hito) => {
    try {
      MySwal.fire({ title: 'Descargando...', allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
      const res = await api.get(`/documentos/download/${hito.fileName}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', hito.archivo);
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
    switch(estado) {
      case 'APROBADO': return <Chip size="small" icon={<CheckCircle />} label="Aprobado" color="success" />;
      case 'EN_REVISION': return <Chip size="small" icon={<AccessTime />} label="En Revisión" color="warning" />;
      case 'PENDIENTE': return <Chip size="small" label="Pendiente" color="primary" variant="outlined" />;
      case 'BLOQUEADO': return <Chip size="small" icon={<Lock />} label="Bloqueado" color="default" />;
      default: return null;
    }
  };

  const progreso = 65;

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
          const isProximo = hito.estado === 'PENDIENTE' && !hito.bloqueado;
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
                  {getEstadoChip(hito.estado)}
              </Box>
                
              <Typography variant="subtitle2" mb={1}>{hito.nombre}</Typography>
                
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha límite: {new Date(hito.fechaLimite).toLocaleDateString()}
                </Typography>
                {isProximo && (
                  <Alert severity="warning" sx={{ mt: 1, py: 0, px: 1 }}>
                    Vence en 5 días
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

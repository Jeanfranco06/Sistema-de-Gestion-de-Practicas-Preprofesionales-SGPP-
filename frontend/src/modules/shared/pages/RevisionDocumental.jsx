import React, { useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemButton, ListItemText, Divider,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, IconButton, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  ArrowBack, Download, Edit, History
} from '@mui/icons-material';

import { useParams, useNavigate } from 'react-router-dom';
import { expedientesApi } from '../../../api/expedientesApi';
import api from '../../../api/axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const OPCIONES_REVISION = {
  PENDIENTE: [{ value: 'EN_REVISION', label: 'Iniciar revisión' }],
  EN_REVISION: [
    { value: 'APROBADO', label: 'Aprobar' },
    { value: 'OBSERVADO', label: 'Observar (requiere corrección)' },
  ],
  OBSERVADO: [{ value: 'EN_REVISION', label: 'Reabrir revisión' }],
  APROBADO: [{ value: 'ARCHIVADO', label: 'Archivar documento' }],
};

export const RevisionDocumental = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expediente, setExpediente] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [estadoReview, setEstadoReview] = useState('');
  const [observacion, setObservacion] = useState('');
  const [historyDialog, setHistoryDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getById(id);
      const data = res.data?.data || res.data;
      setExpediente(data);
      setDocumentos(data.documentos || []);
      if (data.documentos?.length > 0 && !selectedDoc) {
          setSelectedDoc(data.documentos[0]);
      } else if (selectedDoc) {
          const updatedSelected = data.documentos?.find(d => d.id === selectedDoc.id);
          if (updatedSelected) setSelectedDoc(updatedSelected);
      }
    } catch (error) {
      console.error(error);
      MySwal.fire('Error', 'No se pudo cargar el expediente', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (id) {
        fetchExpediente();
    }
  }, [id]);

  const handleOpenReview = (doc) => {
    const opciones = OPCIONES_REVISION[doc.estado || 'PENDIENTE'] || [];
    setSelectedDoc(doc);
    setEstadoReview(opciones[0]?.value || '');
    setObservacion(doc.observaciones || '');
    setReviewDialog(true);
  };

  const handleSaveReview = async () => {
    try {
        MySwal.fire({ title: 'Guardando...', didOpen: () => MySwal.showLoading() });
        await expedientesApi.evaluarDocumento(id, selectedDoc.id, estadoReview, observacion);
        await fetchExpediente();
        setReviewDialog(false);
        MySwal.fire({ icon: 'success', title: 'Evaluación Guardada', timer: 1500, showConfirmButton: false });
    } catch (error) {
        console.error(error);
        MySwal.fire('Error', 'No se pudo guardar la evaluación', 'error');
    }
  };

  const handleDownload = async (fileName, originalName) => {
    if (!fileName) return;
    try {
        MySwal.fire({ title: 'Descargando...', didOpen: () => MySwal.showLoading() });
        const res = await api.get(`/documentos/download/${fileName}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', originalName || fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        MySwal.close();
    } catch {
        MySwal.fire('Error', 'No se pudo descargar el archivo', 'error');
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'APROBADO': return 'success';
      case 'RECHAZADO': return 'error';
      case 'OBSERVADO': return 'warning';
      default: return 'primary';
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando documentos...</Box>;
  if (!expediente) return <Box sx={{ p: 4, textAlign: 'center' }}>Expediente no encontrado.</Box>;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 0.75 }}>
          Revisión Documental
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          Expediente: {expediente.codigoExpediente} | Estudiante: {expediente.nombreEstudiante} {expediente.apellidoEstudiante} | Tipo: {expediente.nombreTipoPractica}
        </Typography>
        <Button sx={{ mt: 1 }} startIcon={<ArrowBack />} onClick={() => navigate('/docente/practicantes')}>
          Volver a practicantes
        </Button>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '34%' }, flexShrink: 0 }}>
          <Paper sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: '4px 4px 0 0' }}>
              <Typography variant="subtitle1" fontWeight="bold">Documentos del Expediente</Typography>
            </Box>
            <List disablePadding>
              {documentos.map((doc, index) => (
                <React.Fragment key={doc.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedDoc?.id === doc.id}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doc.tipoDocumento}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                          <Chip size="small" label={doc.estado || 'PENDIENTE'} color={getEstadoColor(doc.estado)} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(doc.fechaSubida).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < documentos.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '66%' } }}>
          {selectedDoc ? (
            <Paper sx={{ p: { xs: 2.5, md: 3 }, height: '100%', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 1 }}>
                <Typography variant="h6">{selectedDoc.tipoDocumento}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <Button startIcon={<History />} onClick={() => setHistoryDialog(true)}>
                    Historial
                  </Button>
                  {(OPCIONES_REVISION[selectedDoc.estado || 'PENDIENTE'] || []).length > 0 && (
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() => handleOpenReview(selectedDoc)}
                    >
                      Evaluar
                    </Button>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ flex: '1 1 280px' }}>
                  <Typography variant="caption" color="text.secondary">Archivo Actual</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{selectedDoc.nombreArchivo}</Typography>
                    <IconButton size="small" color="primary" title="Descargar documento" onClick={() => handleDownload(selectedDoc.rutaArchivo, selectedDoc.nombreArchivo)}>
                      <Download />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary">Estado Actual</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedDoc.estado || 'PENDIENTE'} color={getEstadoColor(selectedDoc.estado)} />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ bgcolor: '#f8f9fa', p: 3, borderRadius: 2, textAlign: 'center', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  [Visor de PDF Integrado iría aquí]
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Seleccione un documento para revisar</Typography>
            </Paper>
          )}
        </Box>
      </Box>

      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Evaluar Documento</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Estado de Revisión</InputLabel>
            <Select
              value={estadoReview}
              onChange={(e) => setEstadoReview(e.target.value)}
              label="Estado de Revisión"
            >
              {(OPCIONES_REVISION[selectedDoc?.estado || 'PENDIENTE'] || []).map((opcion) => (
                <MenuItem key={opcion.value} value={opcion.value}>{opcion.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Observaciones detalladas"
            variant="outlined"
            margin="normal"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            required={estadoReview === 'OBSERVADO' || estadoReview === 'RECHAZADO'}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveReview} 
            variant="contained" 
            disabled={!estadoReview || ((estadoReview === 'OBSERVADO' || estadoReview === 'RECHAZADO') && !observacion)}
          >
            Guardar Evaluación
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Historial de Trazabilidad - {selectedDoc?.tipoDocumento}</DialogTitle>
        <DialogContent>
          <List>
            {(selectedDoc?.historial || []).length > 0 ? (
                (selectedDoc?.historial || []).map((hist, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            <Typography variant="subtitle2">{hist.accion}</Typography>
                            <Typography variant="caption" color="text.secondary">{hist.fecha}</Typography>
                          </Box>
                        }
                        secondary={`Usuario: ${hist.usuario} | Versión: ${hist.version}`}
                      />
                    </ListItem>
                    {index < (selectedDoc?.historial || []).length - 1 && <Divider />}
                  </React.Fragment>
                ))
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No hay historial disponible para este documento.
                </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

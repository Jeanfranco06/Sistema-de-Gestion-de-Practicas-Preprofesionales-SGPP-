import React, { useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemButton, ListItemText, Divider,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, IconButton, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  Download, Edit, History, FileUpload
} from '@mui/icons-material';

const EXPEDIENTE_MOCK = {
  id: 'EXP-2025-001',
  estudiante: 'Juan Carlos Pérez',
  tipoPractica: 'FINAL',
  estado: 'EN_REVISION'
};

const DOCUMENTOS_MOCK = [
  { 
    id: 1, 
    tipo: 'Plan de Prácticas', 
    archivo: 'plan_v2.pdf', 
    estado: 'PENDIENTE', 
    fecha: '2025-10-10 10:30',
    historial: [
      { version: 'v1', fecha: '2025-10-01', usuario: 'Juan Carlos Pérez', accion: 'Carga inicial' },
      { version: 'v1', fecha: '2025-10-05', usuario: 'Prof. Asesor', accion: 'Observado: Faltan objetivos' },
      { version: 'v2', fecha: '2025-10-10', usuario: 'Juan Carlos Pérez', accion: 'Subsanación' }
    ]
  },
  { 
    id: 2, 
    tipo: 'Carta de Aceptación', 
    archivo: 'carta_empresa.pdf', 
    estado: 'APROBADO', 
    fecha: '2025-09-15 09:00',
    historial: [
      { version: 'v1', fecha: '2025-09-15', usuario: 'Juan Carlos Pérez', accion: 'Carga inicial' },
      { version: 'v1', fecha: '2025-09-16', usuario: 'Comité', accion: 'Aprobado' }
    ]
  }
];

export const RevisionDocumental = () => {
  const [documentos, setDocumentos] = useState(DOCUMENTOS_MOCK);
  const [selectedDoc, setSelectedDoc] = useState(documentos[0]);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [estadoReview, setEstadoReview] = useState('');
  const [observacion, setObservacion] = useState('');
  const [historyDialog, setHistoryDialog] = useState(false);

  const handleOpenReview = (doc) => {
    setSelectedDoc(doc);
    setEstadoReview(doc.estado === 'PENDIENTE' ? '' : doc.estado);
    setObservacion('');
    setReviewDialog(true);
  };

  const handleSaveReview = () => {
    setDocumentos(documentos.map(d => {
      if (d.id === selectedDoc.id) {
        return {
          ...d,
          estado: estadoReview,
          historial: [
            ...d.historial,
            { 
              version: 'Actual', 
              fecha: new Date().toISOString().split('T')[0], 
              usuario: 'Revisor Actual', 
              accion: `${estadoReview}${observacion ? ': ' + observacion : ''}` 
            }
          ]
        };
      }
      return d;
    }));
    setReviewDialog(false);
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'APROBADO': return 'success';
      case 'RECHAZADO': return 'error';
      case 'OBSERVADO': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 0.75 }}>
          Revisión Documental
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          Expediente: {EXPEDIENTE_MOCK.id} | Estudiante: {EXPEDIENTE_MOCK.estudiante} | Tipo: {EXPEDIENTE_MOCK.tipoPractica}
        </Typography>
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
                          {doc.tipo}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                          <Chip size="small" label={doc.estado} color={getEstadoColor(doc.estado)} />
                          <Typography variant="caption" color="text.secondary">
                            {doc.fecha.split(' ')[0]}
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
                <Typography variant="h6">{selectedDoc.tipo}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <Button startIcon={<History />} onClick={() => setHistoryDialog(true)}>
                    Historial
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => handleOpenReview(selectedDoc)}
                  >
                    Evaluar
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ flex: '1 1 280px' }}>
                  <Typography variant="caption" color="text.secondary">Archivo Actual</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{selectedDoc.archivo}</Typography>
                    <IconButton size="small" color="primary" title="Descargar documento">
                      <Download />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary">Estado Actual</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedDoc.estado} color={getEstadoColor(selectedDoc.estado)} />
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
              <MenuItem value="APROBADO">Aprobar</MenuItem>
              <MenuItem value="OBSERVADO">Observar (Pendiente de correcciones)</MenuItem>
              <MenuItem value="RECHAZADO">Rechazar</MenuItem>
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

          <Box sx={{ mt: 2 }}>
            <Button startIcon={<FileUpload />} variant="outlined" component="label">
              Adjuntar archivo complementario
              <input type="file" hidden />
            </Button>
          </Box>
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
        <DialogTitle>Historial de Trazabilidad - {selectedDoc?.tipo}</DialogTitle>
        <DialogContent>
          <List>
            {selectedDoc?.historial.map((hist, index) => (
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
                {index < selectedDoc.historial.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

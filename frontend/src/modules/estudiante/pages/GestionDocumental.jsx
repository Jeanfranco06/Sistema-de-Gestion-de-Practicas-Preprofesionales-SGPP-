import React, { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Divider, List,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, TextField
} from '@mui/material';
import {
  CloudUpload, Delete, Download, CheckCircle, Warning, PendingActions
} from '@mui/icons-material';

const TIPOS_PRACTICA = {
  INICIAL: 'INICIAL',
  FINAL: 'FINAL'
};

const DOCUMENTOS_OBLIGATORIOS_INICIAL = [
  { id: 'plan', nombre: 'Plan de Prácticas', formato: 'PDF', maxMB: 5 },
  { id: 'informe_parcial', nombre: 'Informes Parciales', formato: 'PDF', maxMB: 5 },
  { id: 'informe_final', nombre: 'Informe Final', formato: 'PDF', maxMB: 10 },
  { id: 'constancia', nombre: 'Constancia de Terminación', formato: 'PDF', maxMB: 5 },
  { id: 'visto_bueno', nombre: 'Visto Bueno del Asesor', formato: 'PDF', maxMB: 5 }
];

const DOCUMENTOS_OBLIGATORIOS_FINAL = [
  { id: 'carta_aceptacion', nombre: 'Carta de Aceptación', formato: 'PDF', maxMB: 5 },
  { id: 'plan', nombre: 'Plan de Prácticas', formato: 'PDF', maxMB: 5 },
  { id: 'informe_final', nombre: 'Informe Final', formato: 'PDF', maxMB: 10 },
  { id: 'constancia', nombre: 'Constancia de Terminación', formato: 'PDF', maxMB: 5 },
  { id: 'ficha_evaluacion', nombre: 'Ficha de Evaluación Empresarial', formato: 'PDF', maxMB: 5 }
];

export const GestionDocumental = () => {
  const [tipoPractica, setTipoPractica] = useState(TIPOS_PRACTICA.FINAL);
  const [tabValue, setTabValue] = useState(0);
  const [documentos, setDocumentos] = useState([]);
  const [anexos, setAnexos] = useState([]);
  const [uploadDialog, setUploadDialog] = useState({ open: false, docType: null, isAnexo: false });
  const [selectedFile, setSelectedFile] = useState(null);
  const [anexoNombre, setAnexoNombre] = useState('');

  const docObligatorios = tipoPractica === TIPOS_PRACTICA.INICIAL 
    ? DOCUMENTOS_OBLIGATORIOS_INICIAL 
    : DOCUMENTOS_OBLIGATORIOS_FINAL;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenUpload = (docType, isAnexo = false) => {
    setUploadDialog({ open: true, docType, isAnexo });
    setSelectedFile(null);
    setAnexoNombre('');
  };

  const handleCloseUpload = () => {
    setUploadDialog({ open: false, docType: null, isAnexo: false });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }
      
      const maxMB = uploadDialog.isAnexo ? 10 : uploadDialog.docType.maxMB;
      if (file.size > maxMB * 1024 * 1024) {
        alert(`El archivo excede el tamaño máximo permitido de ${maxMB}MB`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const newDoc = {
      id: Date.now().toString(),
      nombreOriginal: selectedFile.name,
      fechaSubida: new Date().toISOString(),
      estado: 'PENDIENTE',
      tamanio: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'
    };

    if (uploadDialog.isAnexo) {
      if (!anexoNombre.trim()) {
        alert('Ingrese un nombre para el anexo');
        return;
      }
      newDoc.nombreDoc = anexoNombre;
      setAnexos([...anexos, newDoc]);
    } else {
      newDoc.tipoId = uploadDialog.docType.id;
      setDocumentos([...documentos.filter(d => d.tipoId !== uploadDialog.docType.id), newDoc]);
    }

    handleCloseUpload();
  };

  const handleDelete = (id, isAnexo = false) => {
    if (isAnexo) {
      setAnexos(anexos.filter(a => a.id !== id));
    } else {
      setDocumentos(documentos.filter(d => d.id !== id));
    }
  };

  const getEstadoChip = (estado) => {
    switch(estado) {
      case 'APROBADO': return <Chip size="small" icon={<CheckCircle />} label="Aprobado" color="success" />;
      case 'OBSERVADO': return <Chip size="small" icon={<Warning />} label="Observado" color="error" />;
      default: return <Chip size="small" icon={<PendingActions />} label="En Revisión" color="warning" />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 0.75 }}>
          Gestión Documental
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          Administra los documentos obligatorios y anexos de tu práctica {tipoPractica.toLowerCase()}.
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ px: { xs: 1, md: 2 }, pt: 1.5 }}
        >
          <Tab label="Documentos Obligatorios" />
          <Tab label="Anexos Adicionales" />
        </Tabs>
        <Divider />
        
        <Box sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2.5, md: 3 } }}>
          {tabValue === 0 && (
            <List>
              {docObligatorios.map((docType) => {
                const docCargado = documentos.find(d => d.tipoId === docType.id);
                
                return (
                  <Paper key={docType.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ flex: '1 1 260px', minWidth: 220 }}>
                        <Typography variant="subtitle1" fontWeight="bold">{docType.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Formato: {docType.formato} | Máx: {docType.maxMB}MB
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: '1 1 260px', minWidth: 220 }}>
                        {docCargado ? (
                          <Box>
                            <Typography variant="body2" noWrap title={docCargado.nombreOriginal}>
                              {docCargado.nombreOriginal}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(docCargado.fechaSubida).toLocaleDateString()} - {docCargado.tamanio}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="error.main" fontStyle="italic">
                            No cargado
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ flex: '0 0 auto', display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                        {docCargado && getEstadoChip(docCargado.estado)}
                        
                        {docCargado ? (
                          <>
                            <IconButton color="primary" title="Descargar documento">
                              <Download />
                            </IconButton>
                            {docCargado.estado !== 'APROBADO' && (
                              <IconButton color="error" title="Eliminar" onClick={() => handleDelete(docCargado.id)}>
                                <Delete />
                              </IconButton>
                            )}
                          </>
                        ) : (
                          <Button 
                            variant="outlined" 
                            startIcon={<CloudUpload />}
                            onClick={() => handleOpenUpload(docType)}
                          >
                            Cargar
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </List>
          )}

          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="subtitle1">Anexos Institucionales Adicionales</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<CloudUpload />}
                  onClick={() => handleOpenUpload(null, true)}
                >
                  Agregar Anexo
                </Button>
              </Box>

              {anexos.length === 0 ? (
                <Alert severity="info">No hay anexos cargados.</Alert>
              ) : (
                <List>
                  {anexos.map((anexo) => (
                    <Paper key={anexo.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ flex: '1 1 260px', minWidth: 220 }}>
                          <Typography variant="subtitle1" fontWeight="bold">{anexo.nombreDoc}</Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 260px', minWidth: 220 }}>
                          <Typography variant="body2">{anexo.nombreOriginal}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(anexo.fechaSubida).toLocaleDateString()} - {anexo.tamanio}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '0 0 auto', display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, width: { xs: '100%', sm: 'auto' } }}>
                          <IconButton color="primary" title="Descargar documento">
                            <Download />
                          </IconButton>
                          <IconButton color="error" title="Eliminar" onClick={() => handleDelete(anexo.id, true)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog open={uploadDialog.open} onClose={handleCloseUpload} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cargar {uploadDialog.isAnexo ? 'Anexo' : uploadDialog.docType?.nombre}
        </DialogTitle>
        <DialogContent>
          {uploadDialog.isAnexo && (
            <TextField
              fullWidth
              label="Nombre del Anexo"
              variant="outlined"
              margin="normal"
              value={anexoNombre}
              onChange={(e) => setAnexoNombre(e.target.value)}
            />
          )}
          <Box sx={{ mt: 2, p: 3, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                Seleccionar Archivo PDF
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 2 }} color="success.main">
                Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpload}>Cancelar</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!selectedFile || (uploadDialog.isAnexo && !anexoNombre)}>
            Subir Documento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

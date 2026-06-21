import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, List, IconButton, Chip, Dialog, 
  DialogTitle, DialogContent, DialogActions, Alert, TextField, CircularProgress, 
  Grid
} from '@mui/material';
import {
  CloudUpload, Delete, Download, CheckCircle, Warning, PendingActions, 
  Description, FolderZip, Folder
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import api from '../../../api/axios';
import { useAuth } from '../../../auth/AuthContext';

const MySwal = withReactContent(Swal);

const DOCUMENTOS_OBLIGATORIOS_INICIAL = [
  { id: 'PLAN_PRACTICA', nombre: 'Plan de Prácticas', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_PARCIAL', nombre: 'Informes Parciales', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_FINAL', nombre: 'Informe Final', formato: 'PDF', maxMB: 10 },
  { id: 'CONSTANCIA_CULMINACION', nombre: 'Constancia de Terminación', formato: 'PDF', maxMB: 5 },
  { id: 'VISTO_BUENO', nombre: 'Visto Bueno del Asesor', formato: 'PDF', maxMB: 5 }
];

const DOCUMENTOS_OBLIGATORIOS_FINAL = [
  { id: 'CARTA_ACEPTACION', nombre: 'Carta de Aceptación', formato: 'PDF', maxMB: 5 },
  { id: 'PLAN_PRACTICA', nombre: 'Plan de Prácticas', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_FINAL', nombre: 'Informe Final', formato: 'PDF', maxMB: 10 },
  { id: 'CONSTANCIA_CULMINACION', nombre: 'Constancia de Terminación', formato: 'PDF', maxMB: 5 },
  { id: 'FICHA_EVALUACION', nombre: 'Ficha de Evaluación Empresarial', formato: 'PDF', maxMB: 5 }
];

export const GestionDocumental = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState(null);

  const [tabValue, setTabValue] = useState(0);
  const [documentosLocales, setDocumentosLocales] = useState([]);
  const [anexos, setAnexos] = useState([]);
  const [uploadDialog, setUploadDialog] = useState({ open: false, docType: null, isAnexo: false });
  const [selectedFile, setSelectedFile] = useState(null);
  const [anexoNombre, setAnexoNombre] = useState('');

  const fetchExpediente = async () => {
    try {
        setLoading(true);
        const res = await expedientesApi.getByEstudiante(user?.id || 1);
        const list = res.data?.data || [];
        if (list.length > 0) {
            setExpediente(list[0]);
        }
    } catch (err) {
        console.error("Error fetching expediente:", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpediente();
  }, [user]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress size={60} thickness={4} sx={{ color: 'var(--wow-primary)' }} /></Box>;
  }

  if (!expediente) {
    return (
        <Box className="wow-animate-in" sx={{ p: 5, textAlign: 'center', mt: 5, maxWidth: 600, mx: 'auto' }}>
            <div className="wow-card" style={{ padding: '48px' }}>
                <FolderZip sx={{ fontSize: 100, color: 'var(--wow-primary)', mb: 3 }} />
                <Typography variant="h5" fontWeight="700" color="text.primary" gutterBottom>Sin Expediente Activo</Typography>
                <Typography variant="body1" color="text.secondary">No tienes ninguna práctica registrada aún para gestionar documentos.</Typography>
            </div>
        </Box>
    );
  }

  const docObligatorios = expediente.codigoTipoPractica === 'INICIAL' 
    ? DOCUMENTOS_OBLIGATORIOS_INICIAL 
    : DOCUMENTOS_OBLIGATORIOS_FINAL;

  const documentosConsolidados = [
      ...(expediente.documentos || []).map(d => ({
          id: d.id,
          tipoId: d.tipoDocumento,
          nombreOriginal: d.nombreArchivo || d.tipoDocumento,
          fechaSubida: d.fechaSubida,
          estado: 'APROBADO',
          tamanio: 'N/A',
          fileName: d.rutaArchivo || d.nombreArchivo
      }))
  ];
  
  const anexosList = documentosConsolidados.filter(d => d.tipoId === 'ANEXO');

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
        MySwal.fire({
          icon: 'error',
          title: 'Formato Incorrecto',
          text: 'Solo se permiten archivos en formato PDF.',
          confirmButtonColor: '#d33',
          customClass: { popup: 'wow-glass-card' }
        });
        return;
      }
      
      const maxMB = uploadDialog.isAnexo ? 10 : uploadDialog.docType.maxMB;
      if (file.size > maxMB * 1024 * 1024) {
        MySwal.fire({
          icon: 'warning',
          title: 'Archivo Demasiado Pesado',
          text: `El archivo excede el tamaño máximo permitido de ${maxMB}MB.`,
          confirmButtonColor: '#f8bb86',
          customClass: { popup: 'wow-glass-card' }
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (uploadDialog.isAnexo && !anexoNombre.trim()) {
      MySwal.fire({ icon: 'error', title: 'Falta nombre', text: 'Debe ingresar un nombre descriptivo para el anexo.' });
      return;
    }

    try {
      MySwal.fire({
        title: 'Subiendo Documento...',
        html: 'Asegurando y validando archivo...',
        allowOutsideClick: false,
        didOpen: () => { MySwal.showLoading(); },
        customClass: { popup: 'wow-glass-card' }
      });

      const response = await expedientesApi.uploadFile(selectedFile);
      const { fileName } = response.data;

      // Guardar el documento en el Expediente
      const tipoDoc = uploadDialog.isAnexo ? 'ANEXO' : uploadDialog.docType.id;
      const nomDoc = uploadDialog.isAnexo ? anexoNombre : selectedFile.name;
      
      await api.post(`/expedientes/${expediente.id}/documentos`, null, {
          params: { tipoDocumento: tipoDoc, nombreDoc: nomDoc, fileName: fileName }
      });

      // Refrescar expediente
      await fetchExpediente();

      handleCloseUpload();
      MySwal.fire({
        icon: 'success',
        title: '¡Subida Exitosa!',
        text: 'Documento en revisión.',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'wow-glass-card' }
      });
    } catch (error) {
      console.error(error);
      MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir. Intente nuevamente.' });
    }
  };

  const handleDownload = async (doc) => {
    try {
      MySwal.fire({ title: 'Descargando...', allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
      const res = await api.get(`/documentos/download/${doc.fileName}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.nombreOriginal || doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      MySwal.close();
    } catch (error) {
      console.error('Download error:', error);
      MySwal.fire('Error', 'No se pudo descargar el archivo.', 'error');
    }
  };

  const handleDelete = (id, isAnexo = false) => {
    MySwal.fire({
      title: '¿Eliminar documento?',
      text: "Esta acción es irreversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { confirmButton: 'wow-btn' }
    }).then((result) => {
      if (result.isConfirmed) {
        if (isAnexo) setAnexos(anexos.filter(a => a.id !== id));
        else setDocumentosLocales(documentosLocales.filter(d => d.id !== id));
        MySwal.fire({ title: 'Eliminado', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    });
  };

  const getEstadoChip = (estado) => {
    switch(estado) {
      case 'APROBADO': return <Chip size="small" icon={<CheckCircle />} label="Aprobado" sx={{ bgcolor: '#22c55e', color: 'white' }} />;
      case 'OBSERVADO': return <Chip size="small" icon={<Warning />} label="Observado" sx={{ bgcolor: '#ef4444', color: 'white' }} />;
      default: return <Chip size="small" icon={<PendingActions />} label="En Revisión" sx={{ bgcolor: '#f59e0b', color: 'white' }} />;
    }
  };

  const pctCargados = Math.round((documentosConsolidados.length / docObligatorios.length) * 100);

  return (
    <Box className="wow-animate-in" sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
      
      <div className="wow-glass-card" style={{ padding: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(200,100,255,0.05))' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'var(--wow-surface-card)', borderRadius: 3, boxShadow: 'var(--wow-shadow-sm)' }}>
                <Folder sx={{ fontSize: 40, color: 'var(--wow-primary)' }} />
            </Box>
            <Box>
                <Typography variant="h4" fontWeight="800" className="wow-text-gradient">
                    Gestor Documental
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                    Expediente: Práctica {expediente.nombreTipoPractica}
                </Typography>
            </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary" fontWeight="600" gutterBottom>Progreso General</Typography>
            <Chip label={`${pctCargados}% Completado`} color="primary" sx={{ fontWeight: 'bold' }} />
        </Box>
      </div>

      <div className="wow-card" style={{ marginBottom: '32px', overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ px: 2, pt: 2, borderBottom: '1px solid rgba(0,0,0,0.05)', '& .MuiTab-root': { fontWeight: '600', fontFamily: 'var(--wow-font-display)' } }}
        >
          <Tab label="Documentos Obligatorios" />
          <Tab label="Anexos Adicionales" />
        </Tabs>
        
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa' }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {docObligatorios.map((docType) => {
                const docCargado = documentosConsolidados.find(d => d.tipoId === docType.id);
                const esDesdeBD = docCargado && !documentosLocales.some(d => d.id === docCargado.id);
                
                return (
                  <Grid item xs={12} key={docType.id}>
                    <div className="wow-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', transition: 'all 0.3s', border: docCargado ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(0,0,0,0.05)', backgroundColor: docCargado ? 'rgba(34,197,94,0.02)' : '#fff' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '1 1 260px', minWidth: 220 }}>
                          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: docCargado ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.05)' }}>
                              <Description sx={{ color: docCargado ? '#22c55e' : 'grey' }} />
                          </div>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="700">{docType.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">Formato: {docType.formato} | Máx: {docType.maxMB}MB</Typography>
                          </Box>
                      </Box>
                      
                      <Box sx={{ flex: '1 1 260px', minWidth: 220 }}>
                        {docCargado ? (
                          <Box>
                            <Typography variant="body2" fontWeight="600" noWrap title={docCargado.nombreOriginal}>{docCargado.nombreOriginal}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(docCargado.fechaSubida).toLocaleDateString()} {docCargado.tamanio !== 'N/A' && `- ${docCargado.tamanio}`}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="error.main" fontWeight="600" fontStyle="italic">Pendiente de subida</Typography>
                        )}
                      </Box>

                      <Box sx={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                        {docCargado && getEstadoChip(docCargado.estado)}
                        {docCargado ? (
                          <>
                            <IconButton color="primary" onClick={() => handleDownload(docCargado)} sx={{ bgcolor: 'rgba(99,102,241,0.1)' }}><Download /></IconButton>
                            {docCargado.estado !== 'APROBADO' && !esDesdeBD && (
                              <IconButton color="error" onClick={() => handleDelete(docCargado.id)} sx={{ bgcolor: 'rgba(239,68,68,0.1)' }}><Delete /></IconButton>
                            )}
                          </>
                        ) : (
                          <button className="wow-btn" onClick={() => handleOpenUpload(docType)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CloudUpload fontSize="small" /> Subir Archivo
                          </button>
                        )}
                      </Box>
                    </div>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="700">Archivos y Anexos Institucionales</Typography>
                <button className="wow-btn" onClick={() => handleOpenUpload(null, true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CloudUpload fontSize="small" /> Nuevo Anexo
                </button>
              </Box>

              {anexosList.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>No hay documentos anexos cargados en este expediente.</Alert>
              ) : (
                <Grid container spacing={3}>
                  {anexosList.map((anexo) => (
                    <Grid item xs={12} key={anexo.id}>
                        <div className="wow-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '1 1 260px' }}>
                                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(99,102,241,0.1)' }}><Description color="primary" /></div>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="700">{anexo.nombreOriginal}</Typography>
                                    <Typography variant="body2" color="text.secondary">{anexo.fileName}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton color="primary" onClick={() => handleDownload(anexo)} sx={{ bgcolor: 'rgba(99,102,241,0.1)' }}><Download /></IconButton>
                                <IconButton color="error" onClick={() => handleDelete(anexo.id, true)} sx={{ bgcolor: 'rgba(239,68,68,0.1)' }}><Delete /></IconButton>
                            </Box>
                        </div>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </div>

      <Dialog 
        open={uploadDialog.open} 
        onClose={handleCloseUpload} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ className: 'wow-glass-card', sx: { borderRadius: 4, overflow: 'hidden', p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: '800', textAlign: 'center', fontSize: '1.5rem', mb: 1 }}>
          Subir {uploadDialog.isAnexo ? 'Anexo Adicional' : uploadDialog.docType?.nombre}
        </DialogTitle>
        <DialogContent sx={{ overflow: 'visible' }}>
          {uploadDialog.isAnexo && (
            <TextField fullWidth label="Título descriptivo del Anexo" variant="outlined" margin="normal" className="wow-input" value={anexoNombre} onChange={(e) => setAnexoNombre(e.target.value)} />
          )}
          <Box sx={{ mt: 3, p: 4, border: '2px dashed var(--wow-primary)', borderRadius: 3, textAlign: 'center', bgcolor: 'rgba(99,102,241,0.05)', transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}>
            <input accept="application/pdf" style={{ display: 'none' }} id="raised-button-file" type="file" onChange={handleFileChange} />
            <label htmlFor="raised-button-file" style={{ cursor: 'pointer' }}>
                <CloudUpload sx={{ fontSize: 60, color: 'var(--wow-primary)', mb: 2 }} />
                <Typography variant="h6" fontWeight="600" color="primary">Haz clic aquí para seleccionar tu PDF</Typography>
            </label>
            {selectedFile && (
              <Chip icon={<CheckCircle />} label={`${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`} color="success" sx={{ mt: 3, fontWeight: 'bold' }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
          <Button onClick={handleCloseUpload} sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Cancelar</Button>
          <button className="wow-btn" onClick={handleUpload} disabled={!selectedFile || (uploadDialog.isAnexo && !anexoNombre)}>Confirmar y Subir</button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

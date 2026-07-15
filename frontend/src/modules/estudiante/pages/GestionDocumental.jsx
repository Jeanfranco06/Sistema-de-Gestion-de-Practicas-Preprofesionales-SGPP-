import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, TextField, CircularProgress,
  Stack,
} from '@mui/material';
import {
  CloudUpload, Delete, Download, CheckCircle, Warning, PendingActions,
  Description, FolderZip,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import api from '../../../api/axios';
import { useAuth } from '../../../auth/AuthContext';
import PageHeader from '../../../shared/components/PageHeader';
import ContentCard from '../../../shared/components/ContentCard';

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
        const res = await expedientesApi.getMisExpedientes();
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress size={32} /></Box>;
  }

  if (!expediente) {
    return (
        <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', py: 6 }}>
        <ContentCard>
          <FolderZip sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Sin expediente activo</Typography>
          <Typography variant="body2" color="text.secondary">No tienes ninguna práctica registrada para gestionar documentos.</Typography>
        </ContentCard>
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
          estado: d.estado || 'REVISION',
          tamanio: 'N/A',
          fileName: d.rutaArchivo || d.nombreArchivo
      }))
  ];
  
  const anexosList = documentosConsolidados.filter(d => d.tipoId === 'ANEXO');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenUpload = (docType, isAnexo = false) => {
    if (!isAnexo && docType.id === 'PLAN_PRACTICA') {
        const invalidStates = ['SOLICITADO', 'EMPRESA_SEDE_ASIGNADA', 'CARTA_ACEPTACION_PRESENTADA'];
        if (invalidStates.includes(expediente.estado)) {
            MySwal.fire({
                icon: 'warning',
                title: 'No permitido',
                text: 'Debes esperar a que el Comité te asigne un Docente Asesor o un Comité Evaluador para poder presentar tu Plan.',
                confirmButtonColor: '#f8bb86',
                customClass: { popup: 'wow-glass-card' }
            });
            return;
        }
    }

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
      case 'APROBADO': return <Chip size="small" icon={<CheckCircle />} label="Aprobado" variant="outlined" />;
      case 'OBSERVADO': return <Chip size="small" icon={<Warning />} label="Observado" variant="outlined" color="error" />;
      default: return <Chip size="small" icon={<PendingActions />} label="En revisión" variant="outlined" />;
    }
  };

  const pctCargados = Math.round((documentosConsolidados.length / docObligatorios.length) * 100);

  const planSubido = documentosConsolidados.some(d => d.tipoId === 'PLAN_PRACTICA');
  const puedePresentar = planSubido && (expediente.estado === 'ASESOR_ASIGNADO' || expediente.estado === 'COMITE_ASIGNADO');

  const handlePresentarPlan = async () => {
    try {
        await expedientesApi.presentarPlan(expediente.id, { fechaPresentacion: new Date().toISOString() });
        MySwal.fire('Éxito', 'Plan de trabajo presentado para revisión.', 'success');
        fetchExpediente();
    } catch (e) {
        console.error(e);
        MySwal.fire('Error', 'No se pudo presentar el plan', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <PageHeader
        title="Gestor documental"
        subtitle={`Expediente: ${expediente.nombreTipoPractica}`}
        action={
            <Box display="flex" gap={2} alignItems="center">
                {puedePresentar && (
                    <Button variant="contained" color="primary" onClick={handlePresentarPlan}>
                        Presentar Plan
                    </Button>
                )}
                <Chip label={`${pctCargados}% completado`} size="small" variant="outlined" />
            </Box>
        }
      />

      <ContentCard noPadding sx={{ mb: 0 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab label="Documentos obligatorios" />
          <Tab label="Anexos adicionales" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {tabValue === 0 && (
            <Stack spacing={1.5}>
              {docObligatorios.map((docType) => {
                const docCargado = documentosConsolidados.find(d => d.tipoId === docType.id);
                const esDesdeBD = docCargado && !documentosLocales.some(d => d.id === docCargado.id);

                return (
                  <Box
                    key={docType.id}
                    sx={{
                      display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
                      py: 1.5, px: 2, borderRadius: 1,
                      border: '1px solid', borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '1 1 220px' }}>
                      <Description fontSize="small" color={docCargado ? 'action' : 'disabled'} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{docType.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {docType.formato} · máx. {docType.maxMB}MB
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flex: '1 1 200px' }}>
                      {docCargado ? (
                        <>
                          <Typography variant="body2" noWrap title={docCargado.nombreOriginal}>
                            {docCargado.nombreOriginal}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(docCargado.fechaSubida).toLocaleDateString()}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">Pendiente</Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {docCargado && getEstadoChip(docCargado.estado)}
                      {docCargado ? (
                        <>
                          <IconButton size="small" onClick={() => handleDownload(docCargado)}><Download fontSize="small" /></IconButton>
                          {docCargado.estado !== 'APROBADO' && !esDesdeBD && (
                            <IconButton size="small" onClick={() => handleDelete(docCargado.id)}><Delete fontSize="small" /></IconButton>
                          )}
                        </>
                      ) : (
                        <Button size="small" startIcon={<CloudUpload />} onClick={() => handleOpenUpload(docType)}>
                          Subir
                        </Button>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}

          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Archivos adicionales</Typography>
                <Button size="small" startIcon={<CloudUpload />} onClick={() => handleOpenUpload(null, true)}>
                  Nuevo anexo
                </Button>
              </Box>

              {anexosList.length === 0 ? (
                <Alert severity="info">No hay anexos cargados.</Alert>
              ) : (
                <Stack spacing={1.5}>
                  {anexosList.map((anexo) => (
                    <Box
                      key={anexo.id}
                      sx={{
                        display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
                        py: 1.5, px: 2, borderRadius: 1,
                        border: '1px solid', borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <Description fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{anexo.nombreOriginal}</Typography>
                          <Typography variant="caption" color="text.secondary">{anexo.fileName}</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleDownload(anexo)}><Download fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(anexo.id, true)}><Delete fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </ContentCard>

      <Dialog open={uploadDialog.open} onClose={handleCloseUpload} maxWidth="sm" fullWidth>
        <DialogTitle>Subir {uploadDialog.isAnexo ? 'anexo' : uploadDialog.docType?.nombre}</DialogTitle>
        <DialogContent>
          {uploadDialog.isAnexo && (
            <TextField fullWidth label="Título del anexo" margin="normal" value={anexoNombre} onChange={(e) => setAnexoNombre(e.target.value)} />
          )}
          <Box sx={{ mt: 2, p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
            <input accept="application/pdf" style={{ display: 'none' }} id="raised-button-file" type="file" onChange={handleFileChange} />
            <label htmlFor="raised-button-file" style={{ cursor: 'pointer' }}>
              <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Seleccionar PDF</Typography>
            </label>
            {selectedFile && (
              <Chip icon={<CheckCircle />} label={`${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`} size="small" sx={{ mt: 2 }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpload}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpload} disabled={!selectedFile || (uploadDialog.isAnexo && !anexoNombre)}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

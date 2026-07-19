import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Button, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, TextField, CircularProgress,
  Stack, Grid, LinearProgress,
} from '@mui/material';
import {
  CloudUpload, Delete, Download, CheckCircle,
  Description, FolderZip, Folder,
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
import StatusChip from '../../../shared/components/StatusChip';

const MySwal = withReactContent(Swal);

const DOCUMENTOS_OBLIGATORIOS_INICIAL = [
  { id: 'CARTA_PRESENTACION', nombre: 'Carta de Presentación (Escuela)', formato: 'PDF', maxMB: 5 },
  { id: 'CARTA_ACEPTACION', nombre: 'Carta de Aceptación (Empresa)', formato: 'PDF', maxMB: 5 },
  { id: 'PLAN_PRACTICA', nombre: 'Plan de Prácticas (Anexo 1)', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_PARCIAL_1', nombre: 'Informe Parcial Semana 5', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_PARCIAL_2', nombre: 'Informe Parcial Semana 10', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_FINAL_INICIAL', nombre: 'Informe Final Semana 15', formato: 'PDF', maxMB: 10 },
  { id: 'CONSTANCIA_EMPRESA', nombre: 'Constancia de Prácticas (Empresa)', formato: 'PDF', maxMB: 5 }
];

const DOCUMENTOS_OBLIGATORIOS_FINAL = [
  { id: 'CARTA_PRESENTACION', nombre: 'Carta de Presentación (Escuela)', formato: 'PDF', maxMB: 5 },
  { id: 'CARTA_ACEPTACION', nombre: 'Carta de Aceptación (Empresa)', formato: 'PDF', maxMB: 5 },
  { id: 'PLAN_PRACTICA', nombre: 'Plan de Prácticas (Anexo 1)', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_FINAL', nombre: 'Informe Final', formato: 'PDF', maxMB: 10 },
  { id: 'FICHA_EVALUACION', nombre: 'Ficha de Evaluación (Anexo 2)', formato: 'PDF', maxMB: 5 },
  { id: 'CONSTANCIA_EMPRESA', nombre: 'Constancia de Prácticas (Empresa)', formato: 'PDF', maxMB: 5 }
];

const DOCUMENTOS_OBLIGATORIOS_PROFESIONAL = [
  { id: 'CARTA_PRESENTACION', nombre: 'Carta de Presentación (Escuela)', formato: 'PDF', maxMB: 5 },
  { id: 'CARTA_ACEPTACION', nombre: 'Carta de Aceptación (Empresa)', formato: 'PDF', maxMB: 5 },
  { id: 'PLAN_PRACTICA', nombre: 'Plan de Prácticas (Anexo 1)', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_FINAL', nombre: 'Informe Final', formato: 'PDF', maxMB: 10 },
  { id: 'FICHA_EVALUACION', nombre: 'Ficha de Evaluación (Anexo 2)', formato: 'PDF', maxMB: 5 },
  { id: 'CONSTANCIA_EMPRESA', nombre: 'Constancia de Prácticas (Empresa)', formato: 'PDF', maxMB: 5 }
];

export const GestionDocumental = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState(null);

  const [tabValue, setTabValue] = useState(0);
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
    const timeout = setTimeout(() => fetchExpediente(), 0);
    return () => clearTimeout(timeout);
  }, [user]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress size={32} /></Box>;
  }

  if (!expediente) {
    return (
      <ModulePageShell>
        <ContentCard>
          <FolderZip sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Sin expediente activo</Typography>
          <Typography variant="body2" color="text.secondary">No tienes ninguna práctica registrada para gestionar documentos.</Typography>
        </ContentCard>
      </ModulePageShell>
    );
  }

  const docObligatorios = expediente.codigoTipoPractica === 'INICIAL'
    ? DOCUMENTOS_OBLIGATORIOS_INICIAL
    : expediente.codigoTipoPractica === 'FINAL'
    ? DOCUMENTOS_OBLIGATORIOS_FINAL
    : DOCUMENTOS_OBLIGATORIOS_PROFESIONAL;

  const documentosConsolidados = [
    ...(expediente.documentos || []).map(d => ({
      id: d.id,
      tipoId: d.tipoDocumento,
      nombreOriginal: d.nombreArchivo || d.tipoDocumento,
      fechaSubida: d.fechaSubida,
      estado: d.estado || 'PENDIENTE',
      tamanio: 'N/A',
      fileName: d.rutaArchivo || d.nombreArchivo,
      rutaArchivo: d.rutaArchivo,
    }))
  ];

  const anexosList = documentosConsolidados.filter(d => d.tipoId === 'ANEXO');
  const puedeSubirDocumento = (tipoDocumento) => {
    if (tipoDocumento === 'CARTA_PRESENTACION') return false;
    if (['INFORME_PARCIAL_1', 'INFORME_PARCIAL_2', 'INFORME_FINAL', 'INFORME_FINAL_INICIAL'].includes(tipoDocumento)) return false;
    if (tipoDocumento === 'CARTA_ACEPTACION') {
      return ['CARTA_PRESENTACION_EMITIDA', 'CARTA_ACEPTACION_PRESENTADA'].includes(expediente.estado);
    }
    if (tipoDocumento === 'PLAN_PRACTICA') return false;
    if (tipoDocumento === 'FICHA_EVALUACION') return false;
    if (tipoDocumento === 'CONSTANCIA_EMPRESA') {
      return ['EN_EJECUCION', 'INFORME_FINAL_PRESENTADO', 'INFORME_APROBADO',
        'EVALUACION_PENDIENTE', 'EVALUACION_EMPRESA_PENDIENTE', 'EVALUACION_COMPLETA',
        'DICTAMEN_EMITIDO', 'EVALUADO'].includes(expediente.estado);
    }
    return true;
  };

  const mensajeDocumentoBloqueado = (tipoDocumento) => {
    if (tipoDocumento === 'CARTA_PRESENTACION') return 'Generado por Dirección o Coordinación';
    if (['INFORME_PARCIAL_1', 'INFORME_PARCIAL_2', 'INFORME_FINAL', 'INFORME_FINAL_INICIAL'].includes(tipoDocumento)) {
      return 'Gestionar desde Informes';
    }
    if (tipoDocumento === 'PLAN_PRACTICA') {
      return 'Completa el formulario estructurado del Anexo 1.';
    }
    if (tipoDocumento === 'FICHA_EVALUACION') return 'Gestionada por el Tutor Externo.';
    if (tipoDocumento === 'CONSTANCIA_EMPRESA') return 'Disponible cuando la práctica esté en ejecución.';
    return 'Disponible en la etapa correspondiente';
  };

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

      // Si es Carta de Aceptación, notificar al sistema que el estudiante la presentó
      if (tipoDoc === 'CARTA_ACEPTACION') {
        await expedientesApi.presentarCartaAceptacion(expediente.id);
      }

      // Si es Plan de Prácticas, presentar el plan de trabajo
      if (tipoDoc === 'PLAN_PRACTICA') {
        await expedientesApi.presentarPlan(expediente.id, { fechaPresentacion: new Date().toISOString() });
      }

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

      // Si es un documento generado por el servicio de exportación (rutaArchivo o fileName empieza con "registro:")
      const isRegistroDoc = (doc.rutaArchivo && doc.rutaArchivo.startsWith('registro:')) ||
                           (doc.fileName && doc.fileName.startsWith('registro:'));

      if (isRegistroDoc) {
        const registroId = (doc.rutaArchivo || doc.fileName).replace('registro:', '');
        const res = await api.get(`/exportacion/descargar/${registroId}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', doc.nombreOriginal || doc.nombreArchivo || doc.fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        MySwal.close();
      } else {
        // Descarga normal de documentos subidos
        const res = await api.get(`/documentos/expediente/${doc.id}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', doc.nombreOriginal || doc.fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        MySwal.close();
      }
    } catch (error) {
      console.error('Download error:', error);
      const status = error.response?.status;
      let message = 'No se pudo descargar el archivo.';
      if (status === 404) {
        message = 'El archivo no fue encontrado en el servidor.';
      } else if (status === 403 || status === 401) {
        message = 'No tienes permiso para descargar este archivo.';
      } else if (status === 400) {
        message = error.response?.data?.message || 'Solicitud de descarga inválida.';
      } else if (status >= 500) {
        message = 'Error interno del servidor al descargar el archivo.';
      }
      MySwal.fire('Error', message, 'error');
    }
  };

  const handleDelete = async (id, isAnexo = false) => {
    const result = await MySwal.fire({
      title: '¿Eliminar documento?',
      text: "Esta acción es irreversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { confirmButton: 'wow-btn' }
    });
    if (!result.isConfirmed) return;

    try {
      if (isAnexo) {
        setAnexos(anexos.filter(a => a.id !== id));
      } else {
        await expedientesApi.eliminarDocumento(expediente.id, id);
        await fetchExpediente();
      }
      MySwal.fire({ title: 'Eliminado', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error('Delete error:', error);
      MySwal.fire('Error', 'No se pudo eliminar el documento.', 'error');
    }
  };

  const getEstadoChip = (estado, tipoDocumento) => {
    if (tipoDocumento === 'CARTA_PRESENTACION') {
      return <StatusChip status="CARTA_PRESENTACION_EMITIDA" label="Emitida por Dirección" />;
    }
    if (tipoDocumento === 'CARTA_ACEPTACION') {
      return <StatusChip status="CARTA_ACEPTACION_PRESENTADA" label="Presentada" />;
    }
    const map = { APROBADO: 'APROBADO', OBSERVADO: 'OBSERVADO' };
    return <StatusChip status={map[estado] || 'PENDIENTE'} label={estado === 'APROBADO' ? 'Aprobado' : estado === 'OBSERVADO' ? 'Observado' : 'Pendiente de revisión'} />;
  };

  const pctCargados = Math.round((documentosConsolidados.length / docObligatorios.length) * 100);
  const pendientes = Math.max(docObligatorios.length - documentosConsolidados.length, 0);

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<Folder />}
        title="Gestor documental"
        subtitle={`Expediente: ${expediente.nombreTipoPractica}`}
        action={<Chip label={`${pctCargados}% completado`} size="small" color="primary" variant="outlined" />}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Documentos cargados', value: documentosConsolidados.length, color: 'primary.main' },
          { label: 'Pendientes', value: pendientes, color: 'warning.main' },
          { label: 'Anexos', value: anexosList.length, color: 'secondary.main' },
        ].map((stat) => (
          <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
            <ContentCard sx={{ mb: 0, p: 2.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                {stat.label}
              </Typography>
              <Typography variant="h5" sx={{ color: stat.color, mt: 0.5, fontWeight: 700 }}>
                {stat.value}
              </Typography>
            </ContentCard>
          </Grid>
        ))}
      </Grid>

      <ContentCard sx={{ p: 2.25 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
          <Typography sx={{ fontWeight: 600 }} variant="subtitle2">Avance documental</Typography>
          <Typography variant="body2" color="text.secondary">{pctCargados}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={pctCargados} sx={{ height: 9, borderRadius: 999 }} />
      </ContentCard>

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
                return (
                  <Box
                    key={docType.id}
                    sx={{
                      display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
                      py: 1.5, px: 2, borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: docCargado ? 'success.light' : 'divider',
                      bgcolor: docCargado ? 'success.light' : 'background.paper',
                      boxShadow: docCargado ? '0 1px 2px rgba(5, 150, 105, 0.08)' : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '1 1 220px' }}>
                      <Description fontSize="small" sx={{ color: docCargado ? 'success.main' : 'text.disabled' }} />
                      <Box>
                        <Typography sx={{ fontWeight: 500 }} variant="body2">{docType.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {docType.formato} · máx. {docType.maxMB}MB
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flex: '1 1 200px' }}>
                       {docType.id === 'PLAN_PRACTICA' ? (
                         <Button size="small" onClick={() => navigate('/estudiante/plan-practicas')}>
                           Gestionar plan
                         </Button>
                       ) : docCargado ? (
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
                      {docCargado && getEstadoChip(docCargado.estado, docType.id)}
                      {docCargado ? (
                        <>
                          <IconButton size="small" onClick={() => handleDownload(docCargado)}><Download fontSize="small" /></IconButton>
                          {docCargado.estado !== 'APROBADO' && !docCargado.fileName?.startsWith('registro:') && (
                            <IconButton size="small" onClick={() => handleDelete(docCargado.id)}><Delete fontSize="small" /></IconButton>
                          )}
                        </>
                      ) : puedeSubirDocumento(docType.id) ? (
                        <Button size="small" startIcon={<CloudUpload />} onClick={() => handleOpenUpload(docType)}>
                          Subir
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {mensajeDocumentoBloqueado(docType.id)}
                        </Typography>
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
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <Description fontSize="small" color="action" />
                        <Box>
                          <Typography sx={{ fontWeight: 500 }} variant="body2">{anexo.nombreOriginal}</Typography>
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
    </ModulePageShell>
  );
};

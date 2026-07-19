import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudUpload, Trash2, Download, CheckCircle,
  FileText, Folder, FolderArchive, Plus,
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import api from '../../../api/axios';
import { useAuth } from '../../../auth/AuthContext';
import {
  Badge, Button, Card, Input, Progress,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '../../../ui';

const MySwal = withReactContent(Swal);

interface DocType {
  id: string;
  nombre: string;
  formato: string;
  maxMB: number;
}

interface Documento {
  id: string;
  tipoId: string;
  nombreOriginal?: string;
  fechaSubida: string;
  estado: string;
  tamanio: string;
  fileName?: string;
  rutaArchivo?: string;
}

interface Expediente {
  id: string;
  codigoTipoPractica: string;
  nombreTipoPractica: string;
  estado: string;
  documentos?: Array<{
    id: string;
    tipoDocumento: string;
    nombreArchivo?: string;
    fechaSubida: string;
    estado?: string;
    rutaArchivo?: string;
  }>;
}

const DOCUMENTOS_OBLIGATORIOS_INICIAL: DocType[] = [
  { id: 'CARTA_PRESENTACION', nombre: 'Carta de Presentación (Escuela)', formato: 'PDF', maxMB: 5 },
  { id: 'CARTA_ACEPTACION', nombre: 'Carta de Aceptación (Empresa)', formato: 'PDF', maxMB: 5 },
  { id: 'PLAN_PRACTICA', nombre: 'Plan de Prácticas (Anexo 1)', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_PARCIAL_1', nombre: 'Informe Parcial Semana 5', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_PARCIAL_2', nombre: 'Informe Parcial Semana 10', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_FINAL_INICIAL', nombre: 'Informe Final Semana 15', formato: 'PDF', maxMB: 10 },
  { id: 'CONSTANCIA_EMPRESA', nombre: 'Constancia de Prácticas (Empresa)', formato: 'PDF', maxMB: 5 },
];

const DOCUMENTOS_OBLIGATORIOS_FINAL: DocType[] = [
  { id: 'CARTA_PRESENTACION', nombre: 'Carta de Presentación (Escuela)', formato: 'PDF', maxMB: 5 },
  { id: 'CARTA_ACEPTACION', nombre: 'Carta de Aceptación (Empresa)', formato: 'PDF', maxMB: 5 },
  { id: 'PLAN_PRACTICA', nombre: 'Plan de Prácticas (Anexo 1)', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_FINAL', nombre: 'Informe Final', formato: 'PDF', maxMB: 10 },
  { id: 'FICHA_EVALUACION', nombre: 'Ficha de Evaluación (Anexo 2)', formato: 'PDF', maxMB: 5 },
  { id: 'CONSTANCIA_EMPRESA', nombre: 'Constancia de Prácticas (Empresa)', formato: 'PDF', maxMB: 5 },
];

const DOCUMENTOS_OBLIGATORIOS_PROFESIONAL: DocType[] = [
  { id: 'CARTA_PRESENTACION', nombre: 'Carta de Presentación (Escuela)', formato: 'PDF', maxMB: 5 },
  { id: 'CARTA_ACEPTACION', nombre: 'Carta de Aceptación (Empresa)', formato: 'PDF', maxMB: 5 },
  { id: 'PLAN_PRACTICA', nombre: 'Plan de Prácticas (Anexo 1)', formato: 'PDF', maxMB: 5 },
  { id: 'INFORME_FINAL', nombre: 'Informe Final', formato: 'PDF', maxMB: 10 },
  { id: 'FICHA_EVALUACION', nombre: 'Ficha de Evaluación (Anexo 2)', formato: 'PDF', maxMB: 5 },
  { id: 'CONSTANCIA_EMPRESA', nombre: 'Constancia de Prácticas (Empresa)', formato: 'PDF', maxMB: 5 },
];

export const GestionDocumental = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState<Expediente | null>(null);

  const [tabValue, setTabValue] = useState('obligatorios');
  const [anexos, setAnexos] = useState<Documento[]>([]);
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; docType: DocType | null; isAnexo: boolean }>({ open: false, docType: null, isAnexo: false });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [anexoNombre, setAnexoNombre] = useState('');

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getMisExpedientes();
      const list: Expediente[] = res.data?.data || [];
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
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <svg className="animate-spin h-8 w-8" style={{ color: 'var(--color-primary-600)' }} viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <FolderArchive className="h-16 w-16" style={{ color: 'var(--color-muted-foreground)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>Sin expediente activo</h2>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No tienes ninguna práctica registrada para gestionar documentos.</p>
      </div>
    );
  }

  const docObligatorios: DocType[] = expediente.codigoTipoPractica === 'INICIAL'
    ? DOCUMENTOS_OBLIGATORIOS_INICIAL
    : expediente.codigoTipoPractica === 'FINAL'
    ? DOCUMENTOS_OBLIGATORIOS_FINAL
    : DOCUMENTOS_OBLIGATORIOS_PROFESIONAL;

  const documentosConsolidados: Documento[] = [
    ...(expediente.documentos || []).map(d => ({
      id: d.id,
      tipoId: d.tipoDocumento,
      nombreOriginal: d.nombreArchivo || d.tipoDocumento,
      fechaSubida: d.fechaSubida,
      estado: d.estado || 'PENDIENTE',
      tamanio: 'N/A',
      fileName: d.rutaArchivo || d.nombreArchivo,
      rutaArchivo: d.rutaArchivo,
    })),
  ];

  const anexosList = documentosConsolidados.filter(d => d.tipoId === 'ANEXO');

  const puedeSubirDocumento = (tipoDocumento: string): boolean => {
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

  const mensajeDocumentoBloqueado = (tipoDocumento: string): string => {
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

  const handleTabChange = (value: string) => {
    setTabValue(value);
  };

  const handleOpenUpload = (docType: DocType | null, isAnexo: boolean = false) => {
    setUploadDialog({ open: true, docType, isAnexo });
    setSelectedFile(null);
    setAnexoNombre('');
  };

  const handleCloseUpload = () => {
    setUploadDialog({ open: false, docType: null, isAnexo: false });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'pdf') {
        MySwal.fire({
          icon: 'error',
          title: 'Formato Incorrecto',
          text: 'Solo se permiten archivos en formato PDF.',
          confirmButtonColor: '#d33',
          customClass: { popup: 'wow-glass-card' },
        });
        return;
      }

      const maxMB = uploadDialog.isAnexo ? 10 : uploadDialog.docType?.maxMB || 5;
      if (file.size > maxMB * 1024 * 1024) {
        MySwal.fire({
          icon: 'warning',
          title: 'Archivo Demasiado Pesado',
          text: `El archivo excede el tamaño máximo permitido de ${maxMB}MB.`,
          confirmButtonColor: '#f8bb86',
          customClass: { popup: 'wow-glass-card' },
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
        customClass: { popup: 'wow-glass-card' },
      });

      const response = await expedientesApi.uploadFile(selectedFile);
      const { fileName } = response.data;

      const tipoDoc = uploadDialog.isAnexo ? 'ANEXO' : uploadDialog.docType!.id;
      const nomDoc = uploadDialog.isAnexo ? anexoNombre : selectedFile.name;

      await api.post(`/expedientes/${expediente.id}/documentos`, null, {
        params: { tipoDocumento: tipoDoc, nombreDoc: nomDoc, fileName },
      });

      if (tipoDoc === 'CARTA_ACEPTACION') {
        await expedientesApi.presentarCartaAceptacion(expediente.id);
      }

      if (tipoDoc === 'PLAN_PRACTICA') {
        await expedientesApi.presentarPlan(expediente.id, { fechaPresentacion: new Date().toISOString() });
      }

      await fetchExpediente();

      handleCloseUpload();
      MySwal.fire({
        icon: 'success',
        title: '¡Subida Exitosa!',
        text: 'Documento en revisión.',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'wow-glass-card' },
      });
    } catch (error) {
      console.error(error);
      MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir. Intente nuevamente.' });
    }
  };

  const handleDownload = async (doc: Documento) => {
    try {
      MySwal.fire({ title: 'Descargando...', allowOutsideClick: false, didOpen: () => MySwal.showLoading() });

      const isRegistroDoc = (doc.rutaArchivo && doc.rutaArchivo.startsWith('registro:')) ||
                           (doc.fileName && doc.fileName.startsWith('registro:'));

      if (isRegistroDoc) {
        const registroId = (doc.rutaArchivo || doc.fileName || '').replace('registro:', '');
        const res = await api.get(`/exportacion/descargar/${registroId}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', doc.nombreOriginal || doc.fileName || '');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        MySwal.close();
      } else {
        const res = await api.get(`/documentos/expediente/${doc.id}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', doc.nombreOriginal || doc.fileName || '');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        MySwal.close();
      }
    } catch (error: unknown) {
      console.error('Download error:', error);
      const axiosErr = error as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosErr.response?.status;
      let message = 'No se pudo descargar el archivo.';
      if (status === 404) {
        message = 'El archivo no fue encontrado en el servidor.';
      } else if (status === 403 || status === 401) {
        message = 'No tienes permiso para descargar este archivo.';
      } else if (status === 400) {
        message = axiosErr.response?.data?.message || 'Solicitud de descarga inválida.';
      } else if (status && status >= 500) {
        message = 'Error interno del servidor al descargar el archivo.';
      }
      MySwal.fire('Error', message, 'error');
    }
  };

  const handleDelete = async (id: string, isAnexo: boolean = false) => {
    const result = await MySwal.fire({
      title: '¿Eliminar documento?',
      text: 'Esta acción es irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { confirmButton: 'wow-btn' },
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

  const getEstadoChip = (estado: string, tipoDocumento: string) => {
    if (tipoDocumento === 'CARTA_PRESENTACION') {
      return <Badge variant="info">Emitida por Dirección</Badge>;
    }
    if (tipoDocumento === 'CARTA_ACEPTACION') {
      return <Badge variant="info">Presentada</Badge>;
    }
    const variantMap: Record<string, 'success' | 'warning' | 'default'> = { APROBADO: 'success', OBSERVADO: 'warning' };
    const variant = variantMap[estado] || 'default';
    const label = estado === 'APROBADO' ? 'Aprobado' : estado === 'OBSERVADO' ? 'Observado' : 'Pendiente de revisión';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const pctCargados = Math.round((documentosConsolidados.length / docObligatorios.length) * 100);
  const pendientes = Math.max(docObligatorios.length - documentosConsolidados.length, 0);

  const stats = [
    { label: 'Documentos cargados', value: documentosConsolidados.length, color: 'var(--color-primary-600)' },
    { label: 'Pendientes', value: pendientes, color: 'var(--color-amber-500)' },
    { label: 'Anexos', value: anexosList.length, color: 'var(--color-emerald-600)' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 md:py-8 w-full">
      <div className="mb-6">
        <div className="flex justify-between items-start gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <Folder className="h-10 w-10" style={{ color: 'var(--color-primary-600)' }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Gestor documental</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>Expediente: {expediente.nombreTipoPractica}</p>
            </div>
          </div>
          <Badge variant="default" size="md">{pctCargados}% completado</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>{stat.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="p-5 mb-6">
        <div className="flex justify-between items-center gap-2 mb-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Avance documental</p>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{pctCargados}%</p>
        </div>
        <Progress value={pctCargados} size="md" />
      </Card>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
        <Tabs value={tabValue} onValueChange={handleTabChange}>
          <TabsList className="w-full rounded-none border-b px-4 justify-start" style={{ borderColor: 'var(--color-border)' }}>
            <TabsTrigger value="obligatorios">Documentos obligatorios</TabsTrigger>
            <TabsTrigger value="anexos">Anexos adicionales</TabsTrigger>
          </TabsList>

          <div className="p-4 md:p-6">
            <TabsContent value="obligatorios" className="mt-0">
              <div className="flex flex-col gap-1.5">
                {docObligatorios.map((docType) => {
                  const docCargado = documentosConsolidados.find(d => d.tipoId === docType.id);
                  return (
                    <div
                      key={docType.id}
                      className={`flex flex-wrap gap-2 items-center py-3 px-4 rounded-xl border ${docCargado ? 'shadow-sm' : ''}`}
                      style={{
                        borderColor: docCargado ? 'var(--color-emerald-200)' : 'var(--color-border)',
                        backgroundColor: docCargado ? 'var(--color-emerald-50)' : 'var(--color-card)',
                      }}
                    >
                      <div className="flex items-center gap-1.5 flex-[1_1_220px]">
                        <FileText className="h-4 w-4 shrink-0" style={{ color: docCargado ? 'var(--color-emerald-600)' : 'var(--color-muted-foreground)' }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{docType.nombre}</p>
                          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                            {docType.formato} &middot; m&aacute;x. {docType.maxMB}MB
                          </p>
                        </div>
                      </div>

                      <div className="flex-[1_1_200px]">
                        {docType.id === 'PLAN_PRACTICA' ? (
                          <Button variant="secondary" size="sm" onClick={() => navigate('/estudiante/plan-practicas')}>
                            Gestionar plan
                          </Button>
                        ) : docCargado ? (
                          <>
                            <p className="text-sm truncate" title={docCargado.nombreOriginal} style={{ color: 'var(--color-foreground)' }}>
                              {docCargado.nombreOriginal}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                              {new Date(docCargado.fechaSubida).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm italic" style={{ color: 'var(--color-muted-foreground)' }}>Pendiente</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {docCargado && getEstadoChip(docCargado.estado, docType.id)}
                        {docCargado ? (
                          <>
                            <button
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                              onClick={() => handleDownload(docCargado)}
                              title="Descargar"
                            >
                              <Download className="h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
                            </button>
                            {docCargado.estado !== 'APROBADO' && !docCargado.fileName?.startsWith('registro:') && (
                              <button
                                className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                onClick={() => handleDelete(docCargado.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" style={{ color: 'var(--color-red-500)' }} />
                              </button>
                            )}
                          </>
                        ) : puedeSubirDocumento(docType.id) ? (
                          <Button variant="secondary" size="sm" onClick={() => handleOpenUpload(docType)}>
                            <CloudUpload className="h-4 w-4" /> Subir
                          </Button>
                        ) : (
                          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                            {mensajeDocumentoBloqueado(docType.id)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="anexos" className="mt-0">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Archivos adicionales</p>
                <Button variant="secondary" size="sm" onClick={() => handleOpenUpload(null, true)}>
                  <CloudUpload className="h-4 w-4" /> Nuevo anexo
                </Button>
              </div>

              {anexosList.length === 0 ? (
                <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-blue-200)', backgroundColor: 'var(--color-blue-50)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-blue-700)' }}>No hay anexos cargados.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {anexosList.map((anexo) => (
                    <div
                      key={anexo.id}
                      className="flex flex-wrap gap-2 items-center py-3 px-4 rounded-xl border"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                    >
                      <div className="flex items-center gap-1.5 flex-1">
                        <FileText className="h-4 w-4 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{anexo.nombreOriginal}</p>
                          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{anexo.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          onClick={() => handleDownload(anexo)}
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                          onClick={() => handleDelete(anexo.id, true)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" style={{ color: 'var(--color-red-500)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <Dialog open={uploadDialog.open} onOpenChange={() => handleCloseUpload()}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Subir {uploadDialog.isAnexo ? 'anexo' : uploadDialog.docType?.nombre}</DialogTitle>
          </DialogHeader>
          {uploadDialog.isAnexo && (
            <div className="px-6">
              <Input
                label="Título del anexo"
                value={anexoNombre}
                onChange={(e) => setAnexoNombre(e.target.value)}
              />
            </div>
          )}
          <div className="px-6 pb-2">
            <div
              className="mt-2 p-6 rounded-xl border-2 border-dashed text-center"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <input accept="application/pdf" className="hidden" id="raised-button-file" type="file" onChange={handleFileChange} />
              <label htmlFor="raised-button-file" className="cursor-pointer block">
                <CloudUpload className="h-10 w-10 mx-auto mb-2" style={{ color: 'var(--color-muted-foreground)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Seleccionar PDF</p>
              </label>
              {selectedFile && (
                <div className="mt-3 flex items-center justify-center gap-1">
                  <Badge variant="default" size="md">
                    <CheckCircle className="h-3 w-3 me-1" />
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseUpload}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={!selectedFile || (uploadDialog.isAnexo && !anexoNombre.trim())}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

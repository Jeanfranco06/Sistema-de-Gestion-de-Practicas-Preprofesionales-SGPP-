import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudUpload, Trash2, Download, CheckCircle,
  FileText, Folder, FolderArchive, Plus,
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import { planesApi } from '../../../api/planesApi';
import api from '../../../api/axios';
import { useAuth } from '../../../auth/AuthContext';
import { ESTADOS_EXPEDIENTE } from '../../../lib/constants';
import {
  Badge, Button, Card, Input, Progress,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '../../../ui';
import { cn } from '../../../lib/utils';

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-primary-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4 animate-in">
        <Card className="max-w-2xl w-full text-center px-8 py-16 md:px-16 md:py-20">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <FolderArchive className="h-12 w-12 text-slate-500 dark:text-slate-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
            Sin expediente activo
          </h2>
          <p className="text-foreground/70 leading-relaxed mb-8 text-base md:text-lg max-w-lg mx-auto">
            No tienes ninguna práctica registrada o activa en el sistema. Debes solicitar o iniciar una práctica para gestionar tus documentos.
          </p>
          <Button size="lg" onClick={() => navigate('/estudiante/solicitar-practica')}>
            Ir a Solicitar Práctica
          </Button>
        </Card>
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
      return [ESTADOS_EXPEDIENTE.CARTA_PRESENTACION_EMITIDA, ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA].includes(expediente.estado);
    }
    if (tipoDocumento === 'PLAN_PRACTICA') return false;
    if (tipoDocumento === 'FICHA_EVALUACION') return false;
    if (tipoDocumento === 'CONSTANCIA_EMPRESA') {
      return [
        ESTADOS_EXPEDIENTE.EN_EJECUCION,
        ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO,
        ESTADOS_EXPEDIENTE.INFORME_APROBADO,
        'EVALUACION_PENDIENTE',
        ESTADOS_EXPEDIENTE.EVALUACION_EMPRESA_PENDIENTE,
        ESTADOS_EXPEDIENTE.EVALUACION_COMPLETA,
        ESTADOS_EXPEDIENTE.DICTAMEN_EMITIDO,
        ESTADOS_EXPEDIENTE.EVALUADO,
      ].includes(expediente.estado);
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
        const planRes = await planesApi.getActivoByExpediente(expediente.id);
        const planId = planRes.data?.data?.id;
        if (planId) {
          await planesApi.presentar(planId);
        }
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
    { label: 'Documentos cargados', value: documentosConsolidados.length, color: 'bg-primary-500 text-white dark:bg-primary-600', icon: CloudUpload },
    { label: 'Pendientes', value: pendientes, color: 'bg-amber-500 text-white dark:bg-amber-600', icon: FileText },
    { label: 'Anexos subidos', value: anexosList.length, color: 'bg-emerald-500 text-white dark:bg-emerald-600', icon: Plus },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 md:py-8 w-full animate-in fade-in-50 duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Folder className="h-8 w-8 text-primary-600" />
            Gestión Documental
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Administra los documentos obligatorios y anexos de tu expediente: <strong className="text-foreground">{expediente.nombreTipoPractica}</strong>
          </p>
        </div>
        <Badge variant="primary" size="md" className="self-start md:self-auto shrink-0 bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
          Avance: {pctCargados}%
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} variant="hover" className="p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <div className="flex justify-between items-start">
                <span className="text-[0.65rem] uppercase tracking-wider font-bold text-muted-foreground">{stat.label}</span>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 mb-8 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10 border-blue-100 dark:border-blue-900/30">
        <div className="flex justify-between items-center gap-2 mb-3">
          <p className="text-sm font-semibold text-foreground">Avance documental del expediente</p>
          <p className="text-sm font-bold text-primary-700 dark:text-primary-400">{pctCargados}%</p>
        </div>
        <Progress value={pctCargados} size="md" className="h-2.5" />
      </Card>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Tabs value={tabValue} onValueChange={handleTabChange} className="flex-col">
          <TabsList className="w-full flex rounded-none border-b border-border bg-muted/30 px-4 justify-start overflow-x-auto overflow-y-hidden hide-scrollbar">
            <TabsTrigger 
              value="obligatorios" 
              className={cn("py-3", tabValue === "obligatorios" && "border-b-2 border-primary-600")}
              onClick={() => handleTabChange("obligatorios")}
            >
              Documentos obligatorios
            </TabsTrigger>
            <TabsTrigger 
              value="anexos" 
              className={cn("py-3", tabValue === "anexos" && "border-b-2 border-primary-600")}
              onClick={() => handleTabChange("anexos")}
            >
              Anexos adicionales
            </TabsTrigger>
          </TabsList>

          <div className="p-4 md:p-6">
            {tabValue === 'obligatorios' && (
              <TabsContent value="obligatorios" className="mt-0">
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-5 sm:ml-6 pl-6 sm:pl-8 py-2 space-y-6">
                  {docObligatorios.map((docType, index) => {
                    const docCargado = documentosConsolidados.find(d => d.tipoId === docType.id);
                    return (
                      <div key={docType.id} className="relative">
                        {/* Timeline dot */}
                        <div className={cn(
                          "absolute -left-[35px] sm:-left-[43px] top-1/2 -translate-y-1/2 flex h-4 w-4 rounded-full border-2 ring-4 ring-card",
                          docCargado 
                            ? "bg-emerald-500 border-emerald-500" 
                            : index === 0 || documentosConsolidados.find(d => d.tipoId === docObligatorios[index-1]?.id)
                              ? "bg-primary-500 border-primary-500 ring-primary-50 dark:ring-primary-900/20"
                              : "bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                        )} />
                        
                        <div
                          className={cn(
                            "grid grid-cols-1 sm:grid-cols-12 gap-3 items-center py-4 px-5 rounded-xl border transition-all duration-200 group relative bg-card hover:shadow-sm",
                            docCargado 
                              ? "border-emerald-200 hover:border-emerald-300 dark:border-emerald-800/60 dark:hover:border-emerald-700/80" 
                              : "border-border hover:border-primary-300 dark:hover:border-primary-700"
                          )}
                        >
                          {docCargado && (
                             <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20 rounded-xl pointer-events-none" />
                          )}
                          <div className="sm:col-span-5 flex items-center gap-3 min-w-0 relative z-[1]">
                            <div className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              docCargado 
                                ? "bg-emerald-500 text-white dark:bg-emerald-600" 
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600"
                            )}>
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{docType.nombre}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {docType.formato} &middot; m&aacute;x. {docType.maxMB}MB
                              </p>
                            </div>
                          </div>

                          <div className="sm:col-span-4 min-w-0 relative z-[1]">
                            {docType.id === 'PLAN_PRACTICA' ? (
                              <Button variant="secondary" size="sm" onClick={() => navigate('/estudiante/plan-practicas')} className="w-full sm:w-auto">
                                Gestionar plan
                              </Button>
                            ) : docCargado ? (
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate" title={docCargado.nombreOriginal}>
                                  {docCargado.nombreOriginal}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Subido el {new Date(docCargado.fechaSubida).toLocaleDateString()}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm italic text-muted-foreground">Documento pendiente</p>
                            )}
                          </div>

                          <div className="sm:col-span-3 flex items-center sm:justify-end gap-2 shrink-0 mt-2 sm:mt-0 relative z-[1]">
                            {docCargado && getEstadoChip(docCargado.estado, docType.id)}
                            {docCargado ? (
                              <div className="flex gap-1">
                                <button
                                  className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                                  onClick={() => handleDownload(docCargado)}
                                  title="Descargar"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                                {docCargado.estado !== 'APROBADO' && !docCargado.fileName?.startsWith('registro:') && (
                                  <button
                                    className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                                    onClick={() => handleDelete(docCargado.id)}
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ) : puedeSubirDocumento(docType.id) ? (
                              <Button variant="primary" size="sm" onClick={() => handleOpenUpload(docType)} className="shrink-0 bg-primary-600 text-white">
                                <CloudUpload className="h-4 w-4 mr-1.5" /> Subir
                              </Button>
                            ) : (
                              <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                {mensajeDocumentoBloqueado(docType.id)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            )}

            {tabValue === 'anexos' && (
            <TabsContent value="anexos" className="mt-0">
              <div className="flex justify-between items-center mb-5">
                <p className="text-sm text-muted-foreground">Gestiona archivos complementarios a tu práctica.</p>
                <Button variant="secondary" size="sm" onClick={() => handleOpenUpload(null, true)} className="border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-300 dark:hover:bg-primary-900/30">
                  <Plus className="h-4 w-4 mr-1.5" /> Nuevo anexo
                </Button>
              </div>

              {anexosList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-8 text-center">
                  <FolderArchive className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Aún no hay anexos adicionales cargados.</p>
                  <p className="text-xs text-muted-foreground mt-1">Sube archivos complementarios si tu docente o coordinador te lo solicita.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {anexosList.map((anexo) => (
                    <div
                      key={anexo.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center py-3 px-4 rounded-xl border border-border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                    >
                      <div className="sm:col-span-9 md:col-span-10 flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{anexo.nombreOriginal}</p>
                          <p className="text-xs text-muted-foreground truncate">{anexo.fileName}</p>
                        </div>
                      </div>
                      <div className="sm:col-span-3 md:col-span-2 flex items-center sm:justify-end gap-1 shrink-0 mt-2 sm:mt-0">
                        <button
                          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                          onClick={() => handleDownload(anexo)}
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                          onClick={() => handleDelete(anexo.id, true)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      <Dialog open={uploadDialog.open} onOpenChange={() => handleCloseUpload()}>
        <DialogContent size="md" className="p-0 overflow-hidden">
          <DialogHeader className="bg-primary-600 text-white border-b-0 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <CloudUpload className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">Subir Documento</DialogTitle>
                <DialogDescription className="text-primary-100 text-sm mt-0.5">
                  {uploadDialog.isAnexo ? 'anexo adicional' : uploadDialog.docType?.nombre}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4">
            {uploadDialog.isAnexo && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Título del anexo</label>
                <Input
                  placeholder="Ej. Constancia de salud..."
                  value={anexoNombre}
                  onChange={(e) => setAnexoNombre(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Archivo PDF</label>
              <div
                className="mt-1 p-8 rounded-xl border-2 border-dashed border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-center group"
              >
                <input accept="application/pdf" className="hidden" id="raised-button-file" type="file" onChange={handleFileChange} />
                <label htmlFor="raised-button-file" className="cursor-pointer block w-full">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/50 mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Haz clic para seleccionar el documento
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo formato PDF (máx. {uploadDialog.isAnexo ? '10' : uploadDialog.docType?.maxMB || '5'} MB)
                  </p>
                </label>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="bg-muted/30 px-6 py-4 border-t border-border">
            <Button variant="secondary" onClick={handleCloseUpload} className="w-full sm:w-auto">Cancelar</Button>
            <Button 
              variant="primary" 
              onClick={handleUpload} 
              disabled={!selectedFile || (uploadDialog.isAnexo && !anexoNombre.trim())}
              className="w-full sm:w-auto bg-primary-600 text-white hover:bg-primary-700"
            >
              <CloudUpload className="h-4 w-4 mr-2" /> Confirmar subida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudUpload, Trash2, Download, CheckCircle,
  FileText, Folder, FolderArchive, Plus, Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '@/api/expedientesApi';
import { planesApi } from '@/api/planesApi';
import api from '@/api/axios';
import { useAuth } from '@/auth/AuthContext';
import { ESTADOS_EXPEDIENTE } from '@/lib/constants';
import { showError, showSuccess } from '@/lib/toast';
import {
  Badge, Button, Card, Input, Progress,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/ui';
import { cn } from '@/lib/utils';

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
      console.error('Error fetching expediente:', err);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Cargando documentos...</p>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4 animate-in">
        <Card className="max-w-2xl w-full text-center px-8 py-16 md:px-16 md:py-20">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
            <FolderArchive className="h-12 w-12 text-primary-700 dark:text-primary-300" />
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
        const res = await expedientesApi.eliminarDocumento(expediente.id, id);
        const updated = res.data?.data;
        if (updated) {
          setExpediente(updated);
        } else {
          await fetchExpediente();
        }
      }
      showSuccess('Documento eliminado');
    } catch (error: any) {
      console.error('Delete error:', error);
      const msg = error?.response?.data?.message || 'No se pudo eliminar el documento.';
      showError(msg);
    }
  };

  const getEstadoChip = (estado: string, tipoDocumento: string) => {
    if (tipoDocumento === 'CARTA_PRESENTACION') {
      return <Badge variant="info">Emitida por Dirección</Badge>;
    }
    const variantMap: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
      APROBADO: 'success',
      OBSERVADO: 'warning',
      PRESENTADA: 'info',
    };
    const variant = variantMap[estado] || 'default';
    const label = estado === 'APROBADO'
      ? 'Aprobado'
      : estado === 'OBSERVADO'
        ? 'Observado'
        : estado === 'PRESENTADA'
          ? 'Presentada'
          : 'Pendiente de revisión';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const pctCargados = Math.round((documentosConsolidados.length / docObligatorios.length) * 100);
  const pendientes = Math.max(docObligatorios.length - documentosConsolidados.length, 0);

  const stats = [
    { label: 'Documentos cargados', value: documentosConsolidados.length, color: 'bg-primary-600 text-slate-900 dark:bg-primary-700 dark:text-slate-900', icon: CloudUpload },
    { label: 'Pendientes', value: pendientes, color: 'bg-amber-500 text-slate-900 dark:bg-amber-600 dark:text-slate-900', icon: FileText },
    { label: 'Anexos subidos', value: anexosList.length, color: 'bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white', icon: Plus },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 w-full animate-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <Folder className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-full shrink-0 w-14 h-14 bg-white/15">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Gestión Documental</h1>
              <p className="text-sm opacity-90 mt-1">
                Administra los documentos obligatorios y anexos de tu expediente:{' '}
                <strong>{expediente.nombreTipoPractica}</strong>
              </p>
            </div>
          </div>
          <Badge
            variant="default"
            size="md"
            className="self-start md:self-auto shrink-0 bg-white/15 text-white border border-white/20 px-3 py-1.5"
          >
            Avance: {pctCargados}%
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} variant="hover" className="p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <div className="flex justify-between items-start">
                <span className="text-[0.65rem] uppercase tracking-wider font-bold text-muted-foreground">{stat.label}</span>
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Progress */}
      <Card className="p-5 bg-gradient-to-r from-muted/50 to-muted/30">
        <div className="flex justify-between items-center gap-2 mb-3">
          <p className="text-sm font-semibold text-foreground">Avance documental del expediente</p>
          <p className="text-sm font-bold text-primary-700 dark:text-primary-400">{pctCargados}%</p>
        </div>
        <Progress value={pctCargados} size="md" className="h-2.5" />
      </Card>

      {/* Tabs */}
      <Card className="overflow-hidden">
        <Tabs value={tabValue} onValueChange={handleTabChange} className="flex-col">
          <TabsList className="w-full flex rounded-none border-b border-border bg-muted/30 px-4 justify-start overflow-x-auto overflow-y-hidden">
            <TabsTrigger
              value="obligatorios"
              onClick={() => handleTabChange('obligatorios')}
              aria-selected={tabValue === 'obligatorios'}
              className="py-3"
            >
              Documentos obligatorios
            </TabsTrigger>
            <TabsTrigger
              value="anexos"
              onClick={() => handleTabChange('anexos')}
              aria-selected={tabValue === 'anexos'}
              className="py-3"
            >
              Anexos adicionales
            </TabsTrigger>
          </TabsList>

          <div className="p-4 md:p-6">
            {tabValue === 'obligatorios' && (
              <TabsContent value="obligatorios" className="mt-0">
                <ul className="space-y-3">
                  {docObligatorios.map((docType) => {
                    const docCargado = documentosConsolidados.find(d => d.tipoId === docType.id);
                    return (
                      <li
                        key={docType.id}
                        className={cn(
                          'grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-4 rounded-xl border bg-card transition-all duration-200',
                          docCargado
                            ? 'border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80'
                            : 'border-border hover:border-primary-300 dark:hover:border-primary-700'
                        )}
                      >
                        <div className="sm:col-span-5 flex items-center gap-3 min-w-0">
                          <div className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                            docCargado
                              ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                              : 'bg-muted text-muted-foreground'
                          )}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{docType.nombre}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {docType.formato} &middot; máx. {docType.maxMB}MB
                            </p>
                          </div>
                        </div>

                        <div className="sm:col-span-4 min-w-0">
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

                        <div className="sm:col-span-3 flex items-center sm:justify-end gap-2 shrink-0">
                          {docCargado && getEstadoChip(docCargado.estado, docType.id)}
                          {docCargado ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={() => handleDownload(docCargado)}
                                aria-label="Descargar"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {docCargado.estado !== 'APROBADO' && !docCargado.fileName?.startsWith('registro:')
                                && (docType.id !== 'CARTA_ACEPTACION' || expediente.estado === ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                                  onClick={() => handleDelete(docCargado.id)}
                                  aria-label="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ) : puedeSubirDocumento(docType.id) ? (
                            <Button variant="primary" size="sm" onClick={() => handleOpenUpload(docType)} className="shrink-0">
                              <CloudUpload className="h-4 w-4 mr-1.5" /> Subir
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                              {mensajeDocumentoBloqueado(docType.id)}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </TabsContent>
            )}

            {tabValue === 'anexos' && (
              <TabsContent value="anexos" className="mt-0">
                <div className="flex justify-between items-center mb-5">
                  <p className="text-sm text-muted-foreground">Gestiona archivos complementarios a tu práctica.</p>
                  <Button variant="secondary" size="sm" onClick={() => handleOpenUpload(null, true)}>
                    <Plus className="h-4 w-4 mr-1.5" /> Nuevo anexo
                  </Button>
                </div>

                {anexosList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center">
                    <FolderArchive className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Aún no hay anexos adicionales cargados.</p>
                    <p className="text-xs text-muted-foreground mt-1">Sube archivos complementarios si tu docente o coordinador te lo solicita.</p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {anexosList.map((anexo) => (
                      <li
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
                        <div className="sm:col-span-3 md:col-span-2 flex items-center sm:justify-end gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={() => handleDownload(anexo)}
                            aria-label="Descargar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                            onClick={() => handleDelete(anexo.id, true)}
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            )}
          </div>
        </Tabs>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog.open} onOpenChange={() => handleCloseUpload()}>
        <DialogContent size="md" className="p-0 overflow-hidden">
          <div className="bg-[#1A3A6E] dark:bg-[#4A6FA5] text-white px-6 py-5 border-b-4 border-primary-600">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <CloudUpload className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">Subir Documento</DialogTitle>
                <DialogDescription className="text-white/80 text-sm mt-0.5">
                  {uploadDialog.isAnexo ? 'Anexo adicional' : uploadDialog.docType?.nombre}
                </DialogDescription>
              </div>
            </div>
          </div>

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
              className="w-full sm:w-auto"
            >
              <CloudUpload className="h-4 w-4 mr-2" /> Confirmar subida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

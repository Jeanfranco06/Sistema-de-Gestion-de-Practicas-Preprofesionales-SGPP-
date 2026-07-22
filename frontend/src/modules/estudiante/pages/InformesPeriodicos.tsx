import { useState, useRef, useMemo } from 'react';
import {
  CloudUpload, Download, Clock, CheckCircle, Lock, FileText, Calendar,
  FileSpreadsheet, FolderArchive, Trash2,
} from 'lucide-react';
import { exportacionApi } from '@/api/exportacionApi';
import api from '@/api/axios';
import { ESTADOS_EXPEDIENTE } from '@/lib/constants';
import { showSuccess, showError, showWarning, showLoading, closeLoading } from '@/lib/toast';
import { Card, CardContent, Badge, Button, Progress, Separator, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui';
import { cn } from '@/lib/utils';
import { useEliminarDocumento, useMisExpedientes, usePresentarInformeParcial, usePresentarInformeFinal, useUploadFile } from '@/hooks/useExpedientes';
import { CardSkeleton } from '@/ui/SkeletonLoader';
import { EmptyState } from '@/ui/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface HitoBase {
  id: number;
  nombre: string;
  semana: number;
  descripcion: string;
  tipo: string;
}

interface HitoConEstado extends HitoBase {
  estado: 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'BLOQUEADO';
  archivo: string | null;
  fileName: string | null;
  idDocumento: string | null;
  bloqueado: boolean;
}

interface DocumentInfo {
  id: string;
  tipoDocumento: string;
  nombreArchivo: string;
  rutaArchivo: string;
  estado: string;
}

interface Expediente {
  id: string;
  codigoExpediente: string;
  codigoTipoPractica: string;
  estado: string;
  documentos?: DocumentInfo[];
}

const HITOS_INICIAL: HitoBase[] = [
  { id: 1, nombre: 'Informe Parcial Semana 5', semana: 5, descripcion: 'Informe de avance correspondiente a la semana 5', tipo: 'INFORME_PARCIAL_1' },
  { id: 2, nombre: 'Informe Parcial Semana 10', semana: 10, descripcion: 'Informe de avance correspondiente a la semana 10', tipo: 'INFORME_PARCIAL_2' },
  { id: 3, nombre: 'Informe Final Semana 15', semana: 15, descripcion: 'Informe final de prácticas', tipo: 'INFORME_FINAL_INICIAL' },
];

const HITOS_FINAL: HitoBase[] = [
  { id: 1, nombre: 'Informe Final', semana: 15, descripcion: 'Informe final de prácticas', tipo: 'INFORME_FINAL' },
];

const ESTADOS_EXPEDIENTE_HITO: Record<string, string> = {
  INFORME_PARCIAL_1: ESTADOS_EXPEDIENTE.INFORME_PARCIAL_1_PRESENTADO,
  INFORME_PARCIAL_2: ESTADOS_EXPEDIENTE.INFORME_PARCIAL_2_PRESENTADO,
  INFORME_FINAL_INICIAL: ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO,
  INFORME_FINAL: ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO,
};

export const InformesPeriodicos = () => {
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; hito: HitoConEstado | null }>({ open: false, hito: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; hito: HitoConEstado | null }>({ open: false, hito: null });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expedientesQuery = useMisExpedientes();
  const expediente = expedientesQuery.data?.[0] ?? null;
  const loading = expedientesQuery.isLoading;

  const hitos = useMemo<HitoConEstado[]>(() => {
    if (!expediente) return [];
    const baseHitos = expediente.codigoTipoPractica === 'INICIAL' ? HITOS_INICIAL : HITOS_FINAL;
    const docs: DocumentInfo[] = expediente.documentos || [];
    const estadoExp = expediente.estado;
    const hitosConEstado: HitoConEstado[] = baseHitos.map((h) => {
      const doc = docs.find((d) => d.tipoDocumento === h.tipo);
      let estadoHito: HitoConEstado['estado'] = 'PENDIENTE';
      if (doc) {
        estadoHito = doc.estado === 'APROBADO' ? 'APROBADO' : 'EN_REVISION';
      }
      const estadosPosteriores = [
        'EVALUACION_PENDIENTE',
        ESTADOS_EXPEDIENTE.EVALUACION_EMPRESA_PENDIENTE,
        ESTADOS_EXPEDIENTE.EVALUACION_COMPLETA,
        ESTADOS_EXPEDIENTE.DICTAMEN_EMITIDO,
        ESTADOS_EXPEDIENTE.EVALUADO,
        ESTADOS_EXPEDIENTE.CERRADO,
      ];
      if (estadoExp === ESTADOS_EXPEDIENTE_HITO[h.tipo]) {
        estadoHito = doc ? estadoHito : 'EN_REVISION';
      } else if (doc && (doc.estado === 'APROBADO' || estadosPosteriores.includes(estadoExp))) {
        estadoHito = 'APROBADO';
      }
      return {
        ...h,
        estado: estadoHito,
        archivo: doc ? doc.nombreArchivo : null,
        fileName: doc ? doc.rutaArchivo : null,
        idDocumento: doc ? doc.id : null,
        bloqueado: false,
      };
    });
    const idxParcial1 = hitosConEstado.findIndex((h) => h.tipo === 'INFORME_PARCIAL_1');
    const idxParcial2 = hitosConEstado.findIndex((h) => h.tipo === 'INFORME_PARCIAL_2');
    const idxFinal = hitosConEstado.findIndex((h) => h.tipo === 'INFORME_FINAL_INICIAL');
    if (idxParcial2 >= 0 && idxParcial1 >= 0 && !hitosConEstado[idxParcial1].archivo) {
      hitosConEstado[idxParcial2].bloqueado = true;
      hitosConEstado[idxParcial2].estado = 'BLOQUEADO';
    }
    if (idxFinal >= 0 && idxParcial2 >= 0 && !hitosConEstado[idxParcial2].archivo) {
      hitosConEstado[idxFinal].bloqueado = true;
      hitosConEstado[idxFinal].estado = 'BLOQUEADO';
    }
    return hitosConEstado;
  }, [expediente]);

  const uploadFileMutation = useUploadFile();
  const presentarParcialMutation = usePresentarInformeParcial();
  const presentarFinalMutation = usePresentarInformeFinal();
  const eliminarDocumentoMutation = useEliminarDocumento();

  const handleOpenUpload = (hito: HitoConEstado) => {
    setUploadDialog({ open: true, hito });
    setSelectedFile(null);
  };

  const handleCloseUpload = () => {
    setUploadDialog({ open: false, hito: null });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showError('Formato Incorrecto', 'Solo se permiten archivos en formato PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showWarning('Archivo Demasiado Pesado', 'El informe excede el tamaño máximo de 5MB. Por favor comprímalo.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !expediente || !uploadDialog.hito) return;

    try {
      showLoading('Enviando Informe...');

      const uploadRes = await uploadFileMutation.mutateAsync(selectedFile);
      const { fileName } = uploadRes.data as { fileName: string };

      await api.post(`/expedientes/${expediente.id}/documentos`, null, {
        params: { tipoDocumento: uploadDialog.hito.tipo, nombreDoc: selectedFile.name, fileName },
      });

      // Solo cambiar estado si no está ya en el estado correspondiente
      const estadoEsperado = ESTADOS_EXPEDIENTE_HITO[uploadDialog.hito.tipo];
      if (expediente.estado !== estadoEsperado) {
        if (uploadDialog.hito.tipo === 'INFORME_PARCIAL_1' || uploadDialog.hito.tipo === 'INFORME_PARCIAL_2') {
          await presentarParcialMutation.mutateAsync(expediente.id);
        } else {
          await presentarFinalMutation.mutateAsync(expediente.id);
        }
      }
      await expedientesQuery.refetch();

      handleCloseUpload();

      showSuccess('Informe enviado', 'Su docente asesor ha sido notificado para la revisión.');
    } catch (error: unknown) {
      console.error(error);
      const apiError = error as { response?: { data?: { message?: string } } };
      closeLoading();
      showError('Error de Conexión', apiError.response?.data?.message || 'Hubo un problema al subir el informe. Intente de nuevo.');
    }
  };

  const handleDownload = async (hito: HitoConEstado) => {
    if (!hito.idDocumento) {
      showError('Error', 'No se encontró el ID del documento.');
      return;
    }
    try {
      showLoading('Descargando...');
      const res = await api.get(`/documentos/expediente/${hito.idDocumento}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', hito.archivo || hito.fileName || 'informe.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      closeLoading();
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
      closeLoading();
      showError('Error', message);
    }
  };

  const handleDelete = async () => {
    const hito = deleteDialog.hito;
    if (!hito?.idDocumento || !expediente) return;
    try {
      await eliminarDocumentoMutation.mutateAsync({ id: expediente.id, idDocumento: hito.idDocumento });
      await expedientesQuery.refetch();
      setDeleteDialog({ open: false, hito: null });
      showSuccess('Informe eliminado', 'El informe ha sido eliminado correctamente.');
    } catch (error: unknown) {
      console.error('Delete error:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      showError('Error', apiError.response?.data?.message || 'No se pudo eliminar el informe. Intente nuevamente.');
    }
  };

  const handleDownloadPlantilla = async () => {
    if (!expediente) return;
    try {
      showLoading('Descargando plantilla...');
      const res = await exportacionApi.descargarPlantillaInformeFinal(expediente.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_informe_final.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      closeLoading();
    } catch (error) {
      console.error('Download template error:', error);
      closeLoading();
      showError('Error', 'No se pudo descargar la plantilla. Intente de nuevo.');
    }
  };

  const getEstadoBadge = (estado: HitoConEstado['estado']) => {
    switch (estado) {
      case 'APROBADO':
        return <Badge variant="success" size="sm"><CheckCircle className="h-3 w-3" /> Aprobado</Badge>;
      case 'EN_REVISION':
        return <Badge variant="warning" size="sm"><Clock className="h-3 w-3" /> En revisión</Badge>;
      case 'PENDIENTE':
        return <Badge variant="info" size="sm">Pendiente</Badge>;
      case 'BLOQUEADO':
        return <Badge variant="neutral" size="sm"><Lock className="h-3 w-3" /> Bloqueado</Badge>;
      default:
        return null;
    }
  };

  const progreso = useMemo(() => {
    if (hitos.length === 0) return 0;
    const completados = hitos.filter((h) => h.estado === 'APROBADO' || h.estado === 'EN_REVISION').length;
    return Math.round((completados / hitos.length) * 100);
  }, [hitos]);

  const enviados = hitos.filter((h) => h.archivo).length;
  const disponibles = hitos.filter((h) => !h.bloqueado).length;

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 w-full">
        <CardSkeleton className="h-40" lines={2} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} className="h-24" lines={1} />
          ))}
        </div>
        <CardSkeleton className="h-20" lines={1} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} className="h-48" lines={3} />
          ))}
        </div>
      </div>
    );
  }

  if (!expediente) {
    return (
      <EmptyState
        icon={<FolderArchive className="h-12 w-12" />}
        title="Sin expediente activo"
        description="No tienes ninguna práctica registrada para gestionar informes."
        className="min-h-[60vh]"
      />
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 w-full">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <FileText className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-full shrink-0 w-14 h-14 bg-white/15">
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Informes periódicos</h1>
              <p className="text-sm opacity-90 mt-1">
                Carga tus informes en las ventanas de tiempo establecidas para prácticas {expediente.codigoTipoPractica?.toLowerCase() || ''}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <Button variant="secondary" size="sm" onClick={handleDownloadPlantilla}>
              <FileSpreadsheet className="h-4 w-4" /> Plantilla informe final
            </Button>
            <Badge variant="info" size="sm" className="bg-white/15 text-white border border-white/20 px-3 py-1.5">
              {enviados} de {hitos.length} enviados
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Disponibles', value: disponibles, color: 'bg-primary-600 text-slate-900 dark:bg-primary-700' },
          { label: 'Enviados', value: enviados, color: 'bg-emerald-600 text-white dark:bg-emerald-700' },
          { label: 'Bloqueados', value: hitos.length - disponibles, color: 'bg-muted text-muted-foreground dark:bg-muted' },
        ].map((item) => (
          <Card key={item.label} variant="hover" className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-3xl font-extrabold text-foreground">{item.value}</p>
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', item.color)}>
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card className="p-5">
        <CardContent className="p-0">
          <h3 className="text-sm font-bold text-foreground mb-3">Progreso del semestre</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={progreso} />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">{progreso}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Expediente: {expediente.codigoExpediente}</p>
        </CardContent>
      </Card>

      {/* Hitos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hitos.map((hito) => {
          const isProximo = hito.estado === 'PENDIENTE' && !hito.bloqueado;
          return (
            <Card key={hito.id} className="flex flex-col">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className={cn('h-5 w-5', hito.bloqueado ? 'text-muted-foreground' : 'text-primary-700 dark:text-primary-400')} />
                    <h3 className={cn('text-base font-bold', hito.bloqueado ? 'text-muted-foreground' : 'text-foreground')}>
                      Semana {hito.semana}
                    </h3>
                  </div>
                  {getEstadoBadge(hito.estado)}
                </div>

                <p className="text-sm font-semibold text-foreground mb-2">{hito.nombre}</p>

                <div className="mb-4 flex-1">
                  <p className="text-sm text-muted-foreground">{hito.descripcion}</p>
                  {isProximo && (
                    <div className="mt-2 px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      Pendiente de envío
                    </div>
                  )}
                </div>

                <Separator className="mb-4" />

                <div>
                  {hito.archivo ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate max-w-[65%] text-foreground" title={hito.archivo}>
                        {hito.archivo}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="secondary" size="sm" onClick={() => handleDownload(hito)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {hito.estado === 'EN_REVISION' && (
                          <>
                            <Button variant="primary" size="sm" onClick={() => handleOpenUpload(hito)}>
                              <CloudUpload className="h-4 w-4" /> Re-enviar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => setDeleteDialog({ open: true, hito })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isProximo ? 'primary' : 'secondary'}
                      disabled={hito.bloqueado}
                      onClick={() => handleOpenUpload(hito)}
                    >
                      {hito.bloqueado ? <Lock className="h-4 w-4" /> : <CloudUpload className="h-4 w-4" />}
                      {hito.bloqueado ? 'No disponible' : 'Cargar informe'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog.open} onOpenChange={() => handleCloseUpload()}>
        <DialogContent size="sm" className="p-0 overflow-hidden">
          <div className="bg-[#1A3A6E] dark:bg-[#4A6FA5] text-white px-6 py-5 border-b-4 border-primary-600">
            <DialogHeader>
              <DialogTitle className="text-white">Cargar {uploadDialog.hito?.nombre}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <div className="border-2 border-dashed border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors rounded-xl p-6 text-center">
              <input
                ref={fileInputRef}
                accept="application/pdf"
                className="hidden"
                id="informe-upload"
                type="file"
                onChange={handleFileChange}
              />
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <CloudUpload className="h-4 w-4" />
                Seleccionar archivo PDF
              </Button>
              {selectedFile && (
                <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
                  Archivo: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="bg-muted/30 px-6 py-4 border-t border-border">
            <Button variant="secondary" onClick={handleCloseUpload}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={!selectedFile} loading={uploadFileMutation.isPending || presentarParcialMutation.isPending || presentarFinalMutation.isPending}>Subir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((current) => ({ open, hito: open ? current.hito : null }))}
        title="¿Eliminar informe?"
        description="Esta acción es irreversible y el informe dejará de estar disponible para revisión."
        confirmLabel="Sí, eliminar"
        variant="danger"
        onConfirm={handleDelete}
        loading={eliminarDocumentoMutation.isPending}
      />
    </div>
  );
};

export default InformesPeriodicos;

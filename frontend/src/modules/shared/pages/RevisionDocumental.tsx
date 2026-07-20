import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Pencil, History, FileText, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { expedientesApi } from '../../../api/expedientesApi';
import api from '../../../api/axios';
import { ESTADOS_REVISION_DOCUMENTAL } from '../../../lib/constants';
import {
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  Textarea,
  Card,
  CardContent,
} from '../../../ui';
import { cn } from '../../../lib/utils';

const MySwal = withReactContent(Swal);

const OPCIONES_REVISION: Record<string, Array<{ value: string; label: string }>> = {
  [ESTADOS_REVISION_DOCUMENTAL.PENDIENTE]: [{ value: ESTADOS_REVISION_DOCUMENTAL.EN_REVISION, label: 'Iniciar revisión' }],
  [ESTADOS_REVISION_DOCUMENTAL.EN_REVISION]: [
    { value: ESTADOS_REVISION_DOCUMENTAL.APROBADO, label: 'Aprobar' },
    { value: ESTADOS_REVISION_DOCUMENTAL.OBSERVADO, label: 'Observar (requiere corrección)' },
  ],
  [ESTADOS_REVISION_DOCUMENTAL.OBSERVADO]: [{ value: ESTADOS_REVISION_DOCUMENTAL.EN_REVISION, label: 'Reabrir revisión' }],
  [ESTADOS_REVISION_DOCUMENTAL.APROBADO]: [{ value: ESTADOS_REVISION_DOCUMENTAL.ARCHIVADO, label: 'Archivar documento' }],
};

interface HistorialItem {
  accion: string;
  fecha: string;
  usuario: string;
  version: string;
}

interface Documento {
  id: string;
  tipoDocumento: string;
  nombreArchivo: string;
  estado?: string;
  observaciones?: string;
  rutaArchivo?: string;
  fechaSubida: string;
  historial?: HistorialItem[];
}

interface Expediente {
  id: string;
  codigoExpediente: string;
  nombreEstudiante: string;
  apellidoEstudiante: string;
  nombreTipoPractica: string;
  documentos: Documento[];
}

const getEstadoVariant = (estado?: string): 'success' | 'danger' | 'warning' | 'default' => {
  switch (estado) {
    case ESTADOS_REVISION_DOCUMENTAL.APROBADO:
      return 'success';
    case ESTADOS_REVISION_DOCUMENTAL.RECHAZADO:
      return 'danger';
    case ESTADOS_REVISION_DOCUMENTAL.OBSERVADO:
      return 'warning';
    default:
      return 'default';
  }
};

export const RevisionDocumental = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [estadoReview, setEstadoReview] = useState('');
  const [observacion, setObservacion] = useState('');
  const [historyDialog, setHistoryDialog] = useState(false);

  const {
    data: expediente,
    isLoading,
    error,
  } = useQuery<Expediente | null>({
    queryKey: ['expedientes', id],
    queryFn: async () => {
      const res = await expedientesApi.getById(id!);
      return (res.data?.data ?? res.data) as Expediente | null;
    },
    enabled: !!id,
  });

  const documentos = expediente?.documentos ?? [];

  useEffect(() => {
    setSelectedDoc((prev) => {
      if (documentos.length === 0) return null;
      if (!prev) return documentos[0];
      const updated = documentos.find((d) => d.id === prev.id);
      return updated ?? documentos[0];
    });
  }, [documentos]);

  useEffect(() => {
    if (error) {
      console.error(error);
      MySwal.fire('Error', 'No se pudo cargar el expediente', 'error');
    }
  }, [error]);

  const evaluarMutation = useMutation({
    mutationFn: async (variables: {
      idDocumento: string;
      estado: string;
      observaciones: string;
    }) => {
      await expedientesApi.evaluarDocumento(
        id!,
        variables.idDocumento,
        variables.estado,
        variables.observaciones
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes', id] });
      setReviewDialog(false);
      MySwal.fire({
        icon: 'success',
        title: 'Evaluación Guardada',
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      console.error(err);
      MySwal.fire('Error', 'No se pudo guardar la evaluación', 'error');
    },
  });

  const handleOpenReview = (doc: Documento) => {
    const opciones = OPCIONES_REVISION[doc.estado ?? ESTADOS_REVISION_DOCUMENTAL.PENDIENTE] ?? [];
    setSelectedDoc(doc);
    setEstadoReview(opciones[0]?.value ?? '');
    setObservacion(doc.observaciones ?? '');
    setReviewDialog(true);
  };

  const handleSaveReview = () => {
    if (!selectedDoc || !estadoReview) return;
    MySwal.fire({ title: 'Guardando...', didOpen: () => MySwal.showLoading() });
    evaluarMutation.mutate({
      idDocumento: selectedDoc.id,
      estado: estadoReview,
      observaciones: observacion,
    });
  };

  const handleDownload = async (doc: Documento) => {
    if (!doc?.id) return;
    try {
      MySwal.fire({ title: 'Descargando...', didOpen: () => MySwal.showLoading() });
      const isRegistroDoc = doc.rutaArchivo?.startsWith('registro:');
      const urlDescarga = isRegistroDoc
        ? `/exportacion/descargar/${doc.rutaArchivo.replace('registro:', '')}`
        : `/documentos/expediente/${doc.id}/download`;
      const res = await api.get(urlDescarga, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.nombreArchivo || 'documento.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      MySwal.close();
    } catch {
      MySwal.fire('Error', 'No se pudo descargar el archivo', 'error');
    }
  };

  const reviewOptions = OPCIONES_REVISION[selectedDoc?.estado ?? ESTADOS_REVISION_DOCUMENTAL.PENDIENTE] ?? [];
  const requiereObservacion = estadoReview === ESTADOS_REVISION_DOCUMENTAL.OBSERVADO || estadoReview === ESTADOS_REVISION_DOCUMENTAL.RECHAZADO;
  const puedeGuardar =
    estadoReview && (!requiereObservacion || observacion.trim().length > 0);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-8 text-center text-muted-foreground"
      >
        Cargando documentos...
      </motion.div>
    );
  }

  if (!expediente) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-8 text-center text-muted-foreground"
      >
        Expediente no encontrado.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full px-2 sm:px-4 md:px-5 py-4 md:py-6 pb-16"
    >
      {/* Banner */}
      <div className="mb-6 md:mb-8 relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-4 md:p-8 shadow-lg">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <FileText className="h-[120px] w-[120px] md:h-[240px] md:w-[240px]" aria-hidden="true" />
        </div>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">Revisión Documental</p>
          <h1 className="font-extrabold mb-2 break-words text-2xl sm:text-3xl md:text-4xl">
            Expediente {expediente.codigoExpediente}
          </h1>
          <p className="text-sm md:text-base opacity-90">
            Estudiante: {expediente.nombreEstudiante} {expediente.apellidoEstudiante} | Tipo: {expediente.nombreTipoPractica}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 bg-white/10 text-white border-white/20 hover:bg-white/20"
            onClick={() => navigate('/docente/practicantes')}
          >
            <ArrowLeft size={16} />
            Volver a practicantes
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Lista de documentos */}
        <div className="w-full md:w-[34%] shrink-0">
          <Card className="h-full overflow-hidden">
            <div className="p-4 bg-[var(--color-unt-blue)] text-white dark:bg-[var(--color-unt-blue-light)]">
              <h2 className="font-bold text-base">Documentos del Expediente</h2>
            </div>
            <div>
              {documentos.map((doc, index) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div key={doc.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className={cn(
                        'w-full text-left transition-colors',
                        isSelected
                          ? 'bg-muted border-l-4 border-l-primary-600'
                          : 'bg-card border-l-4 border-l-transparent hover:bg-muted'
                      )}
                    >
                      <div className="p-4">
                        <p className="font-medium text-sm text-foreground">
                          {doc.tipoDocumento}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant={getEstadoVariant(doc.estado)} size="sm">
                            {doc.estado ?? 'PENDIENTE'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.fechaSubida).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </button>
                    {index < documentos.length - 1 && (
                      <hr className="border-[var(--color-border)]" />
                    )}
                  </div>
                );
              })}
              {documentos.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No hay documentos registrados.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Detalle del documento */}
        <div className="w-full md:w-[66%]">
          {selectedDoc ? (
            <Card className="h-full p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  {selectedDoc.tipoDocumento}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setHistoryDialog(true)}
                  >
                    <History size={16} />
                    Historial
                  </Button>
                  {reviewOptions.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenReview(selectedDoc)}
                    >
                      <Pencil size={16} />
                      Evaluar
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[280px]">
                  <p className="text-xs font-medium uppercase mb-1 text-muted-foreground">
                    Archivo Actual
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm break-words text-foreground">
                      {selectedDoc.nombreArchivo}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Descargar documento"
                      onClick={() => handleDownload(selectedDoc)}
                      className="h-8 w-8 p-0 text-[var(--color-primary-600)] bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:hover:bg-primary-900/50"
                    >
                      <Download size={18} />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-xs font-medium uppercase mb-1 text-muted-foreground">
                    Estado Actual
                  </p>
                  <Badge variant={getEstadoVariant(selectedDoc.estado)}>
                    {selectedDoc.estado ?? 'PENDIENTE'}
                  </Badge>
                </div>
              </div>

              <hr className="my-4 border-[var(--color-border)]" />

              <div className="rounded-xl text-center min-h-[300px] flex items-center justify-center p-6 bg-muted">
                <p className="text-muted-foreground">
                  [Visor de PDF Integrado iría aquí]
                </p>
              </div>
            </Card>
          ) : (
            <Card className="h-full p-6 flex items-center justify-center">
              <p className="text-muted-foreground">
                Seleccione un documento para revisar
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogo de evaluación */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent size="md" className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evaluar Documento</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <Select
              label="Estado de Revisión"
              value={estadoReview}
              onChange={(e) => setEstadoReview(e.target.value)}
              options={reviewOptions}
            />
            <Textarea
              label="Observaciones detalladas"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              required={requiereObservacion}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setReviewDialog(false)}
              disabled={evaluarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveReview}
              disabled={!puedeGuardar || evaluarMutation.isPending}
              loading={evaluarMutation.isPending}
            >
              Guardar Evaluación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo de historial */}
      <Dialog open={historyDialog} onOpenChange={setHistoryDialog}>
        <DialogContent size="full" className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Historial de Trazabilidad - {selectedDoc?.tipoDocumento}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {(selectedDoc?.historial ?? []).length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-[var(--color-border)]">
                    {(selectedDoc?.historial ?? []).map((hist, index) => (
                      <div key={index} className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              {hist.accion}
                            </p>
                            <p className="text-xs mt-0.5 text-muted-foreground">
                              Usuario: {hist.usuario} | Versión: {hist.version}
                            </p>
                          </div>
                          <span className="text-xs shrink-0 text-muted-foreground">
                            {hist.fecha}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted rounded-xl">
                <Info className="h-12 w-12 text-muted-foreground mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-muted-foreground">
                  No hay historial disponible para este documento.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setHistoryDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

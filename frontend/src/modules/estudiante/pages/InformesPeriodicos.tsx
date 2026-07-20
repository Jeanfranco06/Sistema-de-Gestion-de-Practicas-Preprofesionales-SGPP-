import { useState, useEffect, useRef, useMemo } from 'react';
import { CloudUpload, Download, Clock, CheckCircle, Lock, FileText, Calendar, FileSpreadsheet } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';
import { exportacionApi } from '../../../api/exportacionApi';
import api from '../../../api/axios';
import { ESTADOS_EXPEDIENTE } from '../../../lib/constants';
import { useAuth } from '../../../auth/AuthContext';
import { Card, CardContent, Badge, Button, Progress, Separator, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui';

const MySwal = withReactContent(Swal);

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [hitos, setHitos] = useState<HitoConEstado[]>([]);
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; hito: HitoConEstado | null }>({ open: false, hito: null });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getMisExpedientes();
      const list = res.data?.data || [];
      const exp = list[0] || null;
      setExpediente(exp);
      if (exp) {
        const baseHitos = exp.codigoTipoPractica === 'INICIAL' ? HITOS_INICIAL : HITOS_FINAL;
        const docs: DocumentInfo[] = exp.documentos || [];
        const estadoExp = exp.estado;
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
        if (idxParcial2 >= 0 && idxParcial1 >= 0 && !hitosConEstado[idxParcial1].archivo) {
          hitosConEstado[idxParcial2].bloqueado = true;
          hitosConEstado[idxParcial2].estado = 'BLOQUEADO';
        }
        setHitos(hitosConEstado);
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
      MySwal.fire({ icon: 'error', title: 'Formato Incorrecto', text: 'Solo se permiten archivos en formato PDF.', confirmButtonColor: '#d33' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      MySwal.fire({ icon: 'warning', title: 'Archivo Demasiado Pesado', text: 'El informe excede el tamaño maximo de 5MB. Por favor comprimalo.', confirmButtonColor: '#f8bb86' });
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !expediente || !uploadDialog.hito) return;

    try {
      MySwal.fire({
        title: 'Enviando Informe...',
        html: 'Guardando el documento y notificando a su docente asesor.',
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading(),
      });

      const uploadRes = await expedientesApi.uploadFile(selectedFile);
      const { fileName } = uploadRes.data as { fileName: string };

      await api.post(`/expedientes/${expediente.id}/documentos`, null, {
        params: { tipoDocumento: uploadDialog.hito.tipo, nombreDoc: selectedFile.name, fileName }
      });

      if (uploadDialog.hito.tipo === 'INFORME_PARCIAL_1' || uploadDialog.hito.tipo === 'INFORME_PARCIAL_2') {
        await expedientesApi.presentarInformeParcial(expediente.id);
      } else {
        await expedientesApi.presentarInformeFinal(expediente.id);
      }

      await fetchExpediente();
      handleCloseUpload();

      MySwal.fire({
        icon: 'success',
        title: 'Informe enviado',
        text: 'Su docente asesor ha sido notificado para la revision.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      console.error(error);
      const apiError = error as { response?: { data?: { message?: string } } };
      MySwal.fire({
        icon: 'error',
        title: 'Error de Conexion',
        text: apiError.response?.data?.message || 'Hubo un problema al subir el informe. Intente de nuevo.',
      });
    }
  };

  const handleDownload = async (hito: HitoConEstado) => {
    if (!hito.idDocumento) return;
    try {
      MySwal.fire({ title: 'Descargando...', allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
      const res = await api.get(`/documentos/expediente/${hito.idDocumento}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', hito.archivo || hito.fileName || 'informe.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      MySwal.close();
    } catch (error) {
      console.error('Download error:', error);
      MySwal.fire('Error', 'No tienes permisos o el archivo no existe.', 'error');
    }
  };

  const handleDownloadPlantilla = async () => {
    if (!expediente) return;
    try {
      MySwal.fire({ title: 'Descargando plantilla...', allowOutsideClick: false, didOpen: () => MySwal.showLoading() });
      const res = await exportacionApi.descargarPlantillaInformeFinal(expediente.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_informe_final.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      MySwal.close();
    } catch (error) {
      console.error('Download template error:', error);
      MySwal.fire('Error', 'No se pudo descargar la plantilla. Intente de nuevo.', 'error');
    }
  };

  const getEstadoBadge = (estado: HitoConEstado['estado']): React.ReactNode => {
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
      <div className="px-4 sm:px-6 lg:px-10 py-4 md:py-8 w-full">
        <Card>
          <CardContent className="flex flex-col items-center text-center py-12">
            <FileText className="h-12 w-12" style={{ color: 'var(--color-muted-foreground)' }} />
            <h3 className="text-lg font-semibold mt-4" style={{ color: 'var(--color-foreground)' }}>Sin expediente activo</h3>
            <p className="text-sm mt-2" style={{ color: 'var(--color-muted-foreground)' }}>No tienes ninguna práctica registrada para gestionar informes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 md:py-8 w-full">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>Informes periódicos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
              Carga tus informes en las ventanas de tiempo establecidas para prácticas {expediente.codigoTipoPractica?.toLowerCase() || ''}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleDownloadPlantilla}>
            <FileSpreadsheet className="h-4 w-4" /> Plantilla informe final
          </Button>
          <Badge variant="info" size="sm">{enviados} de {hitos.length} enviados</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Disponibles', value: disponibles, color: 'var(--color-primary-600)' },
          { label: 'Enviados', value: enviados, color: 'var(--color-emerald-600)' },
          { label: 'Bloqueados', value: hitos.length - disponibles, color: 'var(--color-muted-foreground)' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>{item.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: item.color }}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-foreground)' }}>Progreso del semestre</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={progreso} />
            </div>
            <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{progreso}%</span>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-muted-foreground)' }}>Expediente: {expediente.codigoExpediente}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hitos.map((hito) => {
          const isProximo = hito.estado === 'PENDIENTE' && !hito.bloqueado;
          return (
            <Card key={hito.id}>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" style={{ color: hito.bloqueado ? 'var(--color-muted-foreground)' : 'var(--color-primary-600)' }} />
                    <h3 className="text-base font-bold" style={{ color: hito.bloqueado ? 'var(--color-muted-foreground)' : 'var(--color-foreground)' }}>
                      Semana {hito.semana}
                    </h3>
                  </div>
                  {getEstadoBadge(hito.estado)}
                </div>

                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>{hito.nombre}</p>

                <div className="mb-4 flex-1">
                  <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{hito.descripcion}</p>
                  {isProximo && (
                    <div className="mt-2 px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-amber-100)] text-[var(--color-amber-800)]">
                      Pendiente de envío
                    </div>
                  )}
                </div>

                <Separator className="mb-4" />

                <div>
                  {hito.archivo ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate max-w-[65%]" title={hito.archivo} style={{ color: 'var(--color-foreground)' }}>
                        {hito.archivo}
                      </span>
                      <Button variant="secondary" size="sm" onClick={() => handleDownload(hito)}>
                        <Download className="h-4 w-4" /> Descargar
                      </Button>
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

      <Dialog open={uploadDialog.open} onOpenChange={() => handleCloseUpload()}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Cargar {uploadDialog.hito?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="border-2 border-dashed rounded-xl p-6 text-center" style={{ borderColor: 'var(--color-border)' }}>
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
                <p className="mt-3 text-sm" style={{ color: 'var(--color-emerald-600)' }}>
                  Archivo: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseUpload}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={!selectedFile}>Subir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InformesPeriodicos;

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  FileText,
  User,
  Building2,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { evaluacionesApi } from '../../api/evaluacionesApi';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpedienteById } from '@/hooks/useExpedientes';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  Textarea,
} from '@/ui';

const MySwal = withReactContent(Swal);

type Componente = 'DOCENTE' | 'INFORME' | 'SUSTENTACION';

interface Documento {
  id: number;
  tipoDocumento: string;
  nombreArchivo?: string;
  rutaArchivo?: string;
}

interface Expediente {
  id: number;
  nombreEstudiante: string;
  apellidoEstudiante: string;
  codigoEstudiantil: string;
  nombreEmpresa: string;
  documentos?: Documento[];
}

interface Criterio {
  id: number;
  nombre: string;
  descripcion: string;
  puntajeMaximo: number;
}

interface Detalle {
  idCriterio: number;
  puntajeObtenido: number;
  comentarios: string;
}

interface Evaluacion {
  id: number;
  fechaEvaluacion: string;
  componente: string;
  tipoEvaluador: string;
  promedioFinal?: number;
  detalles?: Array<{
    idCriterio: number;
    nombreCriterio?: string;
    puntajeObtenido: number;
  }>;
}

interface EvaluacionForm {
  componente: Componente;
  detalles: Detalle[];
  comentarios: string;
}

interface EvaluacionPayload {
  idExpediente: number;
  tipoEvaluador: string;
  evaluadorId: number | string;
  componente: Componente;
  detalles: Detalle[];
  comentarios: string;
}

export const EvaluacionDocenteAsesor = () => {
  const auth = useAuth() as { user?: { id?: number | string } | null };
  const { id: idExpedienteParams } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const idExpediente = idExpedienteParams ? Number(idExpedienteParams) : NaN;
  const expedienteIdValido = Number.isSafeInteger(idExpediente) && idExpediente > 0;

  const [componenteActual, setComponenteActual] = useState<Componente>('DOCENTE');
  const [evaluacion, setEvaluacion] = useState<EvaluacionForm>({
    componente: 'DOCENTE',
    detalles: [],
    comentarios: '',
  });

  const { data: expediente } = useExpedienteById(idExpedienteParams);
  const { data: criterios = [] } = useQuery<Criterio[]>({
    queryKey: ['evaluaciones', 'criterios', componenteActual],
    queryFn: async () => {
      const res = await evaluacionesApi.obtenerCriteriosPorTipo(componenteActual);
      const payload = res.data as { data?: Criterio[] } | Criterio[] | undefined;
      return Array.isArray(payload) ? payload : payload?.data ?? [];
    },
    enabled: expedienteIdValido,
  });
  const { data: evaluaciones = [] } = useQuery<Evaluacion[]>({
    queryKey: ['evaluaciones', 'expediente', idExpediente],
    queryFn: async () => {
      const res = await evaluacionesApi.obtenerEvaluacionesPorPractica(idExpediente);
      const payload = res.data as { data?: Evaluacion[] } | Evaluacion[] | undefined;
      return Array.isArray(payload) ? payload : payload?.data ?? [];
    },
    enabled: expedienteIdValido,
  });

  const crearMutation = useMutation({
    mutationFn: (payload: EvaluacionPayload) => evaluacionesApi.crearEvaluacion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'expediente', idExpediente] });
    },
  });

  useEffect(() => {
    setEvaluacion((prev) => ({
      ...prev,
      componente: componenteActual,
      detalles: criterios.map((c) => ({
        idCriterio: c.id,
        puntajeObtenido: 0,
        comentarios: '',
      })),
    }));
  }, [criterios, componenteActual]);

  const handleTabChange = (value: string) => {
    setComponenteActual(value as Componente);
  };

  const handlePuntajeChange = (index: number, value: string) => {
    setEvaluacion((prev) => {
      const newDetalles = [...prev.detalles];
      const current = newDetalles[index];
      if (!current) return prev;
      const numValue = parseInt(value, 10) || 0;
      newDetalles[index] = {
        ...current,
        puntajeObtenido: Math.min(Math.max(numValue, 0), 20),
      };
      return { ...prev, detalles: newDetalles };
    });
  };

  const handleComentarioChange = (index: number, value: string) => {
    setEvaluacion((prev) => {
      const newDetalles = [...prev.detalles];
      const current = newDetalles[index];
      if (!current) return prev;
      newDetalles[index] = { ...current, comentarios: value };
      return { ...prev, detalles: newDetalles };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmResult = await MySwal.fire({
      title: '¿Confirmar Evaluación?',
      text: `Vas a registrar la evaluación de la sección ${componenteActual}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
      customClass: { confirmButton: 'wow-btn' },
    });

    if (!confirmResult.isConfirmed) return;

    if (!auth.user?.id) {
      MySwal.fire('Sesión no disponible', 'Vuelve a iniciar sesión antes de registrar la evaluación.', 'error');
      return;
    }

    try {
      MySwal.fire({ title: 'Guardando...', didOpen: () => MySwal.showLoading() });
      await crearMutation.mutateAsync({
        ...evaluacion,
        idExpediente,
        evaluadorId: auth.user.id,
      });
      MySwal.fire({
        icon: 'success',
        title: 'Evaluación Registrada',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      MySwal.fire('Error', 'No se pudo guardar la evaluación.', 'error');
    }
  };

  const handleDownloadDocument = async (documento: Documento) => {
    try {
      MySwal.fire({ title: 'Descargando...', didOpen: () => MySwal.showLoading() });
      const isRegistroDoc = documento.rutaArchivo?.startsWith('registro:');
      const urlDescarga = isRegistroDoc
        ? `/exportacion/descargar/${documento.rutaArchivo.replace('registro:', '')}`
        : `/documentos/expediente/${documento.id}/download`;
      const res = await api.get(urlDescarga, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documento.nombreArchivo || 'documento.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      MySwal.close();
    } catch {
      MySwal.fire('Error', 'No se pudo descargar el archivo.', 'error');
    }
  };

  const ultimaEvaluacion = evaluaciones.length > 0 ? evaluaciones[evaluaciones.length - 1] : null;
  const promedioFinal = ultimaEvaluacion?.promedioFinal ?? 0;
  const progresoColor =
    promedioFinal >= 14
      ? 'var(--color-success)'
      : promedioFinal >= 11
        ? 'var(--color-warning)'
        : 'var(--color-error)';

  if (!expedienteIdValido) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-[var(--color-error)]">No se indicó un expediente válido para evaluar.</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/docente/practicantes')}>
            Volver a practicantes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
                Evaluación docente asesor
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Sistema de calificación por competencias UNT
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/docente/practicantes')}>
            <ArrowLeft size={16} />
          </Button>
        </div>

        {expediente && (
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <p className="text-xs text-[var(--color-muted-foreground)]">Expediente del estudiante</p>
                <h3 className="mb-2 mt-1 text-lg font-semibold text-[var(--color-foreground)]">
                  {expediente.nombreEstudiante} {expediente.apellidoEstudiante}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">
                    <User size={14} className="mr-1" />
                    {expediente.codigoEstudiantil}
                  </Badge>
                  <Badge variant="neutral">
                    <Building2 size={14} className="mr-1" />
                    {expediente.nombreEmpresa}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted-foreground)]">Promedio general</p>
                <div className="text-3xl font-semibold" style={{ color: progresoColor }}>
                  {promedioFinal}
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(promedioFinal / 20) * 100}%`,
                      backgroundColor: progresoColor,
                    }}
                  />
                </div>
              </div>
            </div>

            {expediente.documentos && expediente.documentos.length > 0 && (
              <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">Documentos de referencia</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {expediente.documentos.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 py-1">
                      <FileText size={16} className="text-[var(--color-muted-foreground)]" />
                      <span className="flex-1 truncate text-sm text-[var(--color-foreground)]">
                        {doc.tipoDocumento}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadDocument(doc)}>
                        <Download size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <Tabs value={componenteActual} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger
              value="DOCENTE"
              aria-selected={componenteActual === 'DOCENTE'}
              onClick={() => handleTabChange('DOCENTE')}
            >
              1. Seguimiento docente (30%)
            </TabsTrigger>
            <TabsTrigger
              value="INFORME"
              aria-selected={componenteActual === 'INFORME'}
              onClick={() => handleTabChange('INFORME')}
            >
              2. Informe final (30%)
            </TabsTrigger>
            <TabsTrigger
              value="SUSTENTACION"
              aria-selected={componenteActual === 'SUSTENTACION'}
              onClick={() => handleTabChange('SUSTENTACION')}
            >
              3. Sustentación (10%)
            </TabsTrigger>
          </TabsList>
          <TabsContent value={componenteActual}>
            <Card className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {criterios.map((criterio, index) => (
                  <div
                    key={criterio.id}
                    className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-info)]/10 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--color-foreground)]">
                        {criterio.nombre}
                      </span>
                      <Badge variant="neutral">Peso: {criterio.puntajeMaximo}%</Badge>
                    </div>
                    <p className="mb-3 block text-xs text-[var(--color-muted-foreground)]">
                      {criterio.descripcion}
                    </p>
                    <Input
                      label="Nota (0-20)"
                      type="number"
                      min={0}
                      max={20}
                      value={evaluacion.detalles[index]?.puntajeObtenido || ''}
                      onChange={(e) => handlePuntajeChange(index, e.target.value)}
                      className="mb-3"
                    />
                    <Textarea
                      label="Observaciones"
                      rows={2}
                      value={evaluacion.detalles[index]?.comentarios || ''}
                      onChange={(e) => handleComentarioChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSubmit} disabled={crearMutation.isPending}>
                  {crearMutation.isPending ? 'Registrando...' : `Registrar ${componenteActual}`}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {evaluaciones.length > 0 && (
          <Card className="p-6">
            <h3 className="mb-4 text-base font-semibold text-[var(--color-foreground)]">
              Historial de registros
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Componente</TableHead>
                  <TableHead>Evaluador</TableHead>
                  <TableHead>Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluaciones.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell>{ev.fechaEvaluacion}</TableCell>
                    <TableCell>
                      <Badge variant="neutral">{ev.componente}</Badge>
                    </TableCell>
                    <TableCell>{ev.tipoEvaluador}</TableCell>
                    <TableCell>
                      {ev.detalles?.map((d) => (
                        <span
                          key={d.idCriterio}
                          className="block text-xs text-[var(--color-muted-foreground)]"
                        >
                          {d.nombreCriterio}: {d.puntajeObtenido}/20
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Download, FileText, User, Building2, BarChart3, ArrowLeft,
} from 'lucide-react';
import { evaluacionesApi } from '@/api/evaluacionesApi';
import api from '@/api/axios';
import { useAuth } from '@/auth/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpedienteById } from '@/hooks/useExpedientes';
import { useNotasUnidad } from '@/hooks/useNotasUnidad';
import { EvaluacionComponentesAnexo4 } from '@/modules/evaluacion/EvaluacionComponentesAnexo4';
import {
  Button, Input, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Tabs, TabsList, TabsTrigger, TabsContent, Card, CardContent, Textarea,
} from '@/ui';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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
  codigoTipoPractica?: string;
  calificacionFinal?: number;
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
  const { data: notasUnidad = [] } = useNotasUnidad(idExpedienteParams);
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

  const registrarNotaUnidadMutation = useMutation({
    mutationFn: (payload: { numeroUnidad: number; notaPlan?: number; notaInforme: number; comentarios?: string }) =>
      evaluacionesApi.registrarNotaUnidad(idExpediente, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-unidad', idExpedienteParams] });
      queryClient.invalidateQueries({ queryKey: ['expedientes', idExpedienteParams] });
    },
  });

  const [notasForm, setNotasForm] = useState<{
    unidad1: { plan: string; informe: string; comentarios: string };
    unidad2: { informe: string; comentarios: string };
    unidad3: { informe: string; comentarios: string };
  }>({
    unidad1: { plan: '', informe: '', comentarios: '' },
    unidad2: { informe: '', comentarios: '' },
    unidad3: { informe: '', comentarios: '' },
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

  useEffect(() => {
    if (!notasUnidad || notasUnidad.length === 0) return;
    const nextForm = { ...notasForm };
    notasUnidad.forEach((n: any) => {
      if (n.numeroUnidad === 1) {
        nextForm.unidad1 = {
          plan: n.notaPlan?.toString() ?? '',
          informe: n.notaInforme?.toString() ?? '',
          comentarios: n.comentarios ?? '',
        };
      } else if (n.numeroUnidad === 2) {
        nextForm.unidad2 = {
          informe: n.notaInforme?.toString() ?? '',
          comentarios: n.comentarios ?? '',
        };
      } else if (n.numeroUnidad === 3) {
        nextForm.unidad3 = {
          informe: n.notaInforme?.toString() ?? '',
          comentarios: n.comentarios ?? '',
        };
      }
    });
    setNotasForm(nextForm);
  }, [notasUnidad]);

  const handleTabChange = (value: string) => {
    setComponenteActual(value as Componente);
  };

  const handlePuntajeChange = (index: number, value: string) => {
    setEvaluacion((prev) => {
      const newDetalles = [...prev.detalles];
      const current = newDetalles[index];
      if (!current) return prev;
      const numValue = parseFloat(value) || 0;
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
        tipoEvaluador: 'DOCENTE_ASESOR',
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

  const handleNotaUnidadChange = (unidad: 'unidad1' | 'unidad2' | 'unidad3', campo: string, value: string) => {
    setNotasForm((prev) => ({
      ...prev,
      [unidad]: { ...prev[unidad], [campo]: value },
    }));
  };

  const handleGuardarNotaUnidad = async (unidad: 'unidad1' | 'unidad2' | 'unidad3', numeroUnidad: number) => {
    const confirm = await MySwal.fire({
      title: '¿Registrar nota de unidad?',
      text: `Se guardará la nota de la Unidad ${numeroUnidad}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;
    const datos = notasForm[unidad];
    const planValue = numeroUnidad === 1 ? parseFloat(datos.plan) : undefined;
    const informeValue = parseFloat(datos.informe);
    if (Number.isNaN(informeValue) || informeValue < 0 || informeValue > 20) {
      MySwal.fire('Nota inválida', 'La nota de informe debe estar entre 0 y 20.', 'warning');
      return;
    }
    if (numeroUnidad === 1 && (Number.isNaN(planValue!) || planValue! < 0 || planValue! > 20)) {
      MySwal.fire('Nota inválida', 'La nota de plan debe estar entre 0 y 20.', 'warning');
      return;
    }
    try {
      MySwal.fire({ title: 'Guardando...', didOpen: () => MySwal.showLoading() });
      await registrarNotaUnidadMutation.mutateAsync({
        numeroUnidad,
        notaPlan: planValue,
        notaInforme: informeValue,
        comentarios: datos.comentarios,
      });
      MySwal.fire({ icon: 'success', title: 'Nota guardada', timer: 1500, showConfirmButton: false });
    } catch {
      MySwal.fire('Error', 'No se pudo guardar la nota de la unidad.', 'error');
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
  const notaUnidadPromedio = notasUnidad.find((n: any) => n.promedioFinal != null)?.promedioFinal ?? null;
  const promedioFinal = notaUnidadPromedio ?? ultimaEvaluacion?.promedioFinal ?? expediente?.calificacionFinal ?? 0;

  const progresoColorClass =
    promedioFinal >= 14
      ? 'bg-emerald-500 dark:bg-emerald-400'
      : promedioFinal >= 11
        ? 'bg-amber-500 dark:bg-amber-400'
        : 'bg-red-500 dark:bg-red-400';

  if (!expedienteIdValido) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">No se indicó un expediente válido para evaluar.</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/docente/practicantes')}>
              Volver a practicantes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (expediente && expediente.codigoTipoPractica !== 'INICIAL') {
    return (
      <EvaluacionComponentesAnexo4
        idExpediente={idExpediente}
        tipoPractica={expediente.codigoTipoPractica}
        rol="DOCENTE"
        onVolver={() => navigate('/docente/practicantes')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      {/* ── Header Banner ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <BarChart3 className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">
                Sistema de calificación por competencias
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Evaluación docente asesor
              </h1>
              <p className="text-sm opacity-90 mt-1">
                UNT · Escuela de Ingeniería Industrial
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => navigate('/docente/practicantes')} aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Expediente Card ──────────────────────────────────── */}
      {expediente && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Expediente del estudiante</p>
                <h2 className="mb-2 mt-1 text-lg md:text-xl font-bold text-foreground">
                  {expediente.nombreEstudiante} {expediente.apellidoEstudiante}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral" size="sm">
                    <User className="h-3.5 w-3.5 mr-1" />
                    {expediente.codigoEstudiantil}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    {expediente.nombreEmpresa}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Promedio general</p>
                <p className="text-3xl font-bold text-foreground">{promedioFinal}</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className={cn('h-full rounded-full transition-all', progresoColorClass)}
                    style={{ width: `${(promedioFinal / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {expediente.documentos && expediente.documentos.length > 0 && (
              <div className="mt-6 border-t border-border pt-4">
                <p className="mb-3 text-xs text-muted-foreground uppercase tracking-wider">Documentos de referencia</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {expediente.documentos.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 py-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm text-foreground">
                        {doc.tipoDocumento}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadDocument(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <Tabs value={componenteActual} onValueChange={handleTabChange}>
        <TabsList className="w-full sm:w-auto">
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
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {criterios.map((criterio, index) => (
                  <div
                    key={criterio.id}
                    className="flex h-full flex-col rounded-xl border border-border bg-blue-50 dark:bg-blue-950/30 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {criterio.nombre}
                      </span>
                      <Badge variant="neutral" size="sm">Peso: {criterio.puntajeMaximo}%</Badge>
                    </div>
                    <p className="mb-3 block text-xs text-muted-foreground">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Notas por unidades ───────────────────────────────── */}
      {expediente?.codigoTipoPractica === 'INICIAL' && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-700 dark:text-primary-400" />
              <h3 className="text-base font-bold text-foreground">
                Notas por unidades (Práctica Inicial)
              </h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Unidad 1: 20% plan de práctica + 80% informe de avance. Unidades 2 y 3: 100% informe de avance.
              El promedio final de las unidades reemplaza el componente DOCENTE.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { key: 'unidad1' as const, label: 'Unidad 1', numero: 1, plan: true },
                { key: 'unidad2' as const, label: 'Unidad 2', numero: 2, plan: false },
                { key: 'unidad3' as const, label: 'Unidad 3', numero: 3, plan: false },
              ].map(({ key, label, numero, plan }) => (
                <div key={key} className="rounded-xl border border-border bg-card p-4">
                  <h4 className="mb-3 text-sm font-semibold text-foreground">{label}</h4>
                  {plan && (
                    <Input
                      label="Nota plan de práctica (0-20)"
                      type="number"
                      min={0}
                      max={20}
                      value={notasForm[key].plan}
                      onChange={(e) => handleNotaUnidadChange(key, 'plan', e.target.value)}
                      className="mb-3"
                    />
                  )}
                  <Input
                    label="Nota informe de avance (0-20)"
                    type="number"
                    min={0}
                    max={20}
                    value={notasForm[key].informe}
                    onChange={(e) => handleNotaUnidadChange(key, 'informe', e.target.value)}
                    className="mb-3"
                  />
                  <Textarea
                    label="Comentarios"
                    rows={2}
                    value={notasForm[key].comentarios}
                    onChange={(e) => handleNotaUnidadChange(key, 'comentarios', e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    className="w-full"
                    onClick={() => handleGuardarNotaUnidad(key, numero)}
                    disabled={registrarNotaUnidadMutation.isPending}
                  >
                    {registrarNotaUnidadMutation.isPending ? 'Guardando...' : `Guardar ${label}`}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Historial ────────────────────────────────────────── */}
      {evaluaciones.length > 0 && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="mb-4 text-base font-bold text-foreground">
              Historial de registros
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="text-foreground">Fecha</TableHead>
                    <TableHead className="text-foreground">Componente</TableHead>
                    <TableHead className="text-foreground">Evaluador</TableHead>
                    <TableHead className="text-foreground">Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluaciones.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="text-foreground">{ev.fechaEvaluacion}</TableCell>
                      <TableCell>
                        <Badge variant="neutral" size="sm">{ev.componente}</Badge>
                      </TableCell>
                      <TableCell className="text-foreground">{ev.tipoEvaluador}</TableCell>
                      <TableCell>
                        {ev.detalles?.map((d) => (
                          <span
                            key={d.idCriterio}
                            className="block text-xs text-muted-foreground"
                          >
                            {d.nombreCriterio}: {d.puntajeObtenido}/20
                          </span>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

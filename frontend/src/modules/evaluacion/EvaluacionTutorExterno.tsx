import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Building2, Upload, ArrowLeft, Pencil } from 'lucide-react';
import { evaluacionesApi } from '@/api/evaluacionesApi';
import { expedientesApi } from '@/api/expedientesApi';
import { useAuth } from '@/auth/AuthContext';
import { hasAnyRole } from '@/shared/utils/roleRoutes';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpedienteById } from '@/hooks/useExpedientes';
import { useTiposPractica } from '@/hooks/usePracticas';
import {
  Button, Input, Select, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Card, CardContent, Textarea,
} from '@/ui';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import { showSuccess, showError, showWarning, showLoading, closeLoading } from '@/lib/toast';

interface Criterio {
  id: number;
  nombre: string;
  descripcion?: string;
  puntajeMaximo?: number;
  componente?: string;
  categoria?: string;
}

interface Detalle {
  puntajeObtenido: number;
  calificacionCualitativa: string;
  comentarios: string;
}

interface Grupo {
  categoria: string;
  puntajeMaximo: number;
  criterios: Criterio[];
}

interface Expediente {
  id: number;
  nombreEstudiante: string;
  apellidoEstudiante: string;
  numeroDocumento?: string;
  nombreEmpresa?: string;
  codigoTipoPractica?: string;
  tipoCalificacion?: string;
}

interface Evaluacion {
  id: number;
  fechaEvaluacion: string;
  componente: string;
  tipoEvaluador: string;
  horasRegistradas?: number;
  puntajeTotal?: number;
  promedioFinal?: number;
  tipoCalificacion?: string;
  calificacionCualitativa?: string;
  detalles?: Array<{
    idCriterio?: number;
    id?: number;
    nombreCriterio?: string;
    criterio?: string;
    puntajeObtenido: number;
    calificacionCualitativa?: string;
  }>;
}

interface EvaluacionForm {
  comentarios: string;
  horasRegistradas: number;
  rutaConstancia: string;
  calificacionCualitativa: string;
}

interface EvaluacionPayload {
  idExpediente: number;
  tipoEvaluador: string;
  evaluadorId: number | string;
  componente: string;
  detalles: Array<{ idCriterio: number; puntajeObtenido: number; calificacionCualitativa: string; comentarios: string }>;
  comentarios: string;
  horasRegistradas: number;
  rutaConstancia: string;
  tipoCalificacion: string;
  calificacionCualitativa: string;
}

const CUALITATIVAS = [
  { value: 'Logrado', label: 'Logrado' },
  { value: 'En proceso', label: 'En proceso' },
  { value: 'No logrado', label: 'No logrado' },
];

const agruparCriterios = (criterios: Criterio[]): Grupo[] => {
  const grupos: Record<string, Grupo> = {};
  criterios.forEach((c) => {
    const categoria = c.componente || c.categoria || 'GENERAL';
    if (!grupos[categoria]) {
      grupos[categoria] = { categoria, puntajeMaximo: 0, criterios: [] };
    }
    grupos[categoria].criterios.push(c);
    grupos[categoria].puntajeMaximo += c.puntajeMaximo || 5;
  });
  return Object.values(grupos);
};

export const EvaluacionTutorExterno = () => {
  const auth = useAuth() as { user?: { id?: number | string; roles?: Array<string | { authority?: string; nombre?: string }> } | null };
  const { id: idExpedienteParams } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAdmin = hasAnyRole(auth.user?.roles, ['ADMIN_SISTEMA', 'ADMINISTRADOR']);

  const idExpediente = idExpedienteParams ? Number(idExpedienteParams) : NaN;
  const expedienteIdValido = Number.isSafeInteger(idExpediente) && idExpediente > 0;

  const [detalles, setDetalles] = useState<Record<number, Detalle>>({});
  const [evaluacion, setEvaluacion] = useState<EvaluacionForm>({
    comentarios: '',
    horasRegistradas: 0,
    rutaConstancia: '',
    calificacionCualitativa: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const { data: expediente } = useExpedienteById(idExpedienteParams);
  const { data: tiposPractica = [] } = useTiposPractica();

  const tipoCalificacionExpediente = expediente?.tipoCalificacion
    || tiposPractica.find((tp: { codigo?: string; tipoCalificacion?: string }) => tp.codigo === expediente?.codigoTipoPractica)?.tipoCalificacion
    || 'VIGESIMAL';
  const esCualitativa = tipoCalificacionExpediente === 'CUALITATIVA';

  const { data: criterios = [] } = useQuery<Criterio[]>({
    queryKey: ['evaluaciones', 'criterios', 'EMPRESA'],
    queryFn: async () => {
      const res = await evaluacionesApi.obtenerCriteriosPorTipo('EMPRESA');
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

  const yaEvaluado = evaluaciones.some((ev) => ev.componente === 'EMPRESA');

  const grupos = useMemo(() => agruparCriterios(criterios), [criterios]);

  const crearMutation = useMutation({
    mutationFn: (payload: EvaluacionPayload) => evaluacionesApi.crearEvaluacion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'expediente', idExpediente] });
    },
  });
  const actualizarMutation = useMutation({
    mutationFn: ({ idEvaluacion, payload }: { idEvaluacion: number; payload: EvaluacionPayload }) =>
      evaluacionesApi.actualizarEvaluacion(idEvaluacion, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'expediente', idExpediente] });
      setModoEdicion(false);
    },
  });
  const uploadMutation = useMutation({
    mutationFn: (selectedFile: File) => expedientesApi.uploadFile(selectedFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes', idExpedienteParams] });
    },
  });

  useEffect(() => {
    const initial: Record<number, Detalle> = {};
    criterios.forEach((c) => {
      initial[c.id] = { puntajeObtenido: 0, calificacionCualitativa: '', comentarios: '' };
    });
    setDetalles(initial);
  }, [criterios]);

  // Precargar datos de la evaluación existente al activar modo edición (solo Admin)
  useEffect(() => {
    if (!modoEdicion) return;
    const evEmpresa = evaluaciones.find((ev) => ev.componente === 'EMPRESA');
    if (!evEmpresa) return;
    setEvaluacion({
      comentarios: evEmpresa.calificacionCualitativa ? '' : (evEmpresa as any).comentarios || '',
      horasRegistradas: evEmpresa.horasRegistradas || 0,
      rutaConstancia: (evEmpresa as any).rutaConstancia || '',
      calificacionCualitativa: evEmpresa.calificacionCualitativa || '',
    });
    if (evEmpresa.detalles) {
      const preloaded: Record<number, Detalle> = {};
      evEmpresa.detalles.forEach((d) => {
        const cid = d.idCriterio || d.id;
        if (cid) {
          preloaded[cid] = {
            puntajeObtenido: d.puntajeObtenido || 0,
            calificacionCualitativa: d.calificacionCualitativa || '',
            comentarios: '',
          };
        }
      });
      setDetalles(preloaded);
    }
  }, [modoEdicion, evaluaciones]);

  const handlePuntajeChange = (idCriterio: number, value: string, puntajeMaximo: number) => {
    const numValue = parseInt(value, 10) || 0;
    const max = puntajeMaximo || 5;
    setDetalles((prev) => ({
      ...prev,
      [idCriterio]: {
        ...prev[idCriterio],
        puntajeObtenido: Math.min(Math.max(numValue, 0), max),
      },
    }));
  };

  const handleCalificacionCualitativaChange = (idCriterio: number, value: string) => {
    setDetalles((prev) => ({
      ...prev,
      [idCriterio]: { ...prev[idCriterio], calificacionCualitativa: value },
    }));
  };

  const handleComentarioChange = (idCriterio: number, value: string) => {
    setDetalles((prev) => ({
      ...prev,
      [idCriterio]: { ...prev[idCriterio], comentarios: value },
    }));
  };

  const calcularTotalCategoria = (categoria: Grupo) => {
    return categoria.criterios.reduce((sum, c) => sum + (detalles[c.id]?.puntajeObtenido || 0), 0);
  };

  const calcularTotalGeneral = () => {
    return grupos.reduce((sum, cat) => sum + calcularTotalCategoria(cat), 0);
  };

  const totalMaximo = grupos.reduce((sum, g) => sum + g.puntajeMaximo, 0) || 50;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setEvaluacion((prev) => ({ ...prev, rutaConstancia: selected.name }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const evEmpresa = evaluaciones.find((ev) => ev.componente === 'EMPRESA');
    if (!evEmpresa || !auth.user?.id) return;

    if (esCualitativa) {
      const faltantes = criterios.some((criterio) => !detalles[criterio.id]?.calificacionCualitativa);
      if (faltantes) {
        showWarning('Evaluación incompleta', 'Debe registrar una calificación cualitativa para cada criterio.');
        return;
      }
    }

    const confirmResult = await Swal.fire({
      title: '¿Confirmar cambios?',
      text: '¿Deseas guardar los cambios en la evaluación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirmResult.isConfirmed) return;

    try {
      showLoading('Guardando...');
      let rutaConstancia = evaluacion.rutaConstancia;
      if (file) {
        const uploadRes = await uploadMutation.mutateAsync(file);
        const uploadData = uploadRes.data as { data?: string } | string | undefined;
        rutaConstancia = typeof uploadData === 'string' ? uploadData : uploadData?.data ?? file.name;
      }
      const payload: EvaluacionPayload = {
        ...evaluacion,
        idExpediente,
        tipoEvaluador: 'EMPRESA',
        evaluadorId: auth.user.id,
        componente: 'EMPRESA',
        rutaConstancia,
        tipoCalificacion: esCualitativa ? 'CUALITATIVA' : 'VIGESIMAL',
        calificacionCualitativa: esCualitativa ? evaluacion.calificacionCualitativa : '',
        detalles: criterios.map((c) => ({
          idCriterio: c.id,
          puntajeObtenido: detalles[c.id]?.puntajeObtenido || 0,
          calificacionCualitativa: detalles[c.id]?.calificacionCualitativa || '',
          comentarios: detalles[c.id]?.comentarios || '',
        })),
      };
      await actualizarMutation.mutateAsync({ idEvaluacion: evEmpresa.id, payload });
      setFile(null);
      closeLoading();
      showSuccess('Evaluación actualizada', 'Los cambios han sido guardados correctamente.');
    } catch (err) {
      closeLoading();
      const error = err as { response?: { data?: { mensaje?: string } } };
      showError('Error', error.response?.data?.mensaje || 'No se pudo actualizar la evaluación.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const total = calcularTotalGeneral();
    if (!auth.user?.id || !expedienteIdValido) {
      showError('Sesión o expediente no válido', 'Vuelve a la lista de practicantes e inténtalo nuevamente.');
      return;
    }
    if (esCualitativa) {
      const faltantes = criterios.some((criterio) => !detalles[criterio.id]?.calificacionCualitativa);
      if (faltantes) {
        showWarning('Evaluación incompleta', 'Debe registrar una calificación cualitativa para cada criterio.');
        return;
      }
    } else if (criterios.some((criterio) => !detalles[criterio.id]?.puntajeObtenido)) {
      showWarning('Evaluación incompleta', 'Debe registrar un puntaje para cada criterio.');
      return;
    }

    const confirmText = esCualitativa
      ? `Calificación final: ${evaluacion.calificacionCualitativa || '—'}. ¿Estás seguro de registrar la evaluación?`
      : `Puntaje total: ${total} puntos. ¿Estás seguro de registrar la evaluación?`;
    const confirmResult = await Swal.fire({
      title: '¿Confirmar Evaluación?',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      showLoading('Guardando...');

      let rutaConstancia = evaluacion.rutaConstancia;
      if (file) {
        const uploadRes = await uploadMutation.mutateAsync(file);
        const uploadData = uploadRes.data as { data?: string } | string | undefined;
        rutaConstancia = typeof uploadData === 'string' ? uploadData : uploadData?.data ?? file.name;
      }

      const payload: EvaluacionPayload = {
        ...evaluacion,
        idExpediente,
        tipoEvaluador: 'EMPRESA',
        evaluadorId: auth.user.id,
        componente: 'EMPRESA',
        rutaConstancia,
        tipoCalificacion: esCualitativa ? 'CUALITATIVA' : 'VIGESIMAL',
        calificacionCualitativa: esCualitativa ? evaluacion.calificacionCualitativa : '',
        detalles: criterios.map((c) => ({
          idCriterio: c.id,
          puntajeObtenido: detalles[c.id]?.puntajeObtenido || 0,
          calificacionCualitativa: detalles[c.id]?.calificacionCualitativa || '',
          comentarios: detalles[c.id]?.comentarios || '',
        })),
      };

      await crearMutation.mutateAsync(payload);

      setFile(null);
      closeLoading();
      showSuccess(
        'Evaluación Registrada',
        esCualitativa
          ? `Calificación final: ${evaluacion.calificacionCualitativa}`
          : `Puntaje total: ${total} puntos`
      );
    } catch (err) {
      closeLoading();
      const error = err as { response?: { data?: { mensaje?: string } } };
      showError('Error', error.response?.data?.mensaje || 'No se pudo guardar la evaluación.');
    }
  };

  const totalGeneral = calcularTotalGeneral();
  const porcentaje = totalMaximo > 0 ? (totalGeneral / totalMaximo) * 100 : 0;
  const colorTotal =
    totalGeneral >= totalMaximo * 0.7
      ? 'success'
      : totalGeneral >= totalMaximo * 0.4
        ? 'warning'
        : 'error';
  const colorClass =
    colorTotal === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : colorTotal === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';
  const barClass =
    colorTotal === 'success'
      ? 'bg-emerald-500 dark:bg-emerald-400'
      : colorTotal === 'warning'
        ? 'bg-amber-500 dark:bg-amber-400'
        : 'bg-red-500 dark:bg-red-400';

  if (!expedienteIdValido) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">No se indicó un expediente válido para evaluar.</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/tutor/practicantes')}>
              Volver a practicantes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      {/* ── Header Banner ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <Building2 className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">
                Anexo 2 — Evaluación por la Empresa Receptora
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Evaluación de Prácticas Pre-Profesionales
              </h1>
              <p className="text-sm opacity-90 mt-1">
                UNT · Evaluación del desempeño del practicante
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => navigate('/tutor/practicantes')} aria-label="Volver">
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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">1. DEL PRACTICANTE</p>
                <h2 className="mb-2 mt-1 text-lg md:text-xl font-bold text-foreground">
                  {expediente.nombreEstudiante} {expediente.apellidoEstudiante}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral" size="sm">
                    <User className="h-3.5 w-3.5 mr-1" />
                    DNI: {expediente.numeroDocumento || '—'}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    {expediente.nombreEmpresa}
                  </Badge>
                </div>
              </div>
              <div>
                {esCualitativa ? (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Calificación final</p>
                    <p className="text-xl font-bold text-foreground">
                      {evaluacion.calificacionCualitativa || '—'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Puntaje Total</p>
                    <p className={cn('text-3xl font-bold', colorClass)}>
                      {totalGeneral}{' '}
                      <span className="text-sm text-muted-foreground">/ {totalMaximo}</span>
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className={cn('h-full rounded-full transition-all', barClass)}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Evaluación ───────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-base font-bold text-foreground mb-1">4. EVALUACIÓN</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            {esCualitativa
              ? 'Para cada criterio, seleccione la calificación cualitativa que corresponde al desempeño del practicante.'
              : 'En la columna de puntaje, para cada criterio, sírvase marcar un número de 1 a 5 según corresponda. El número 1 corresponde al peor desempeño y el 5 al mejor.'}
          </p>

          {grupos.map((cat, catIndex) => (
            <div key={cat.categoria} className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{cat.categoria}</h3>
                {!esCualitativa && (
                  <Badge
                    variant={calcularTotalCategoria(cat) >= cat.puntajeMaximo * 0.7 ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {calcularTotalCategoria(cat)} / {cat.puntajeMaximo} pts
                  </Badge>
                )}
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="text-foreground w-1/2">Criterio de Evaluación</TableHead>
                      <TableHead className="text-foreground w-1/4 text-center">
                        {esCualitativa ? 'Calificación' : `Puntaje (${Math.max(
                          ...cat.criterios.map((c) => c.puntajeMaximo || 5),
                          5,
                        )})`}
                      </TableHead>
                      <TableHead className="text-foreground w-1/4 text-center">Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cat.criterios.map((criterio) => (
                      <TableRow key={criterio.id}>
                        <TableCell>
                          <p className="text-sm text-foreground">{criterio.nombre}</p>
                          {criterio.descripcion && (
                            <p className="text-xs text-muted-foreground">{criterio.descripcion}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {esCualitativa ? (
                            <Select
                              id={`criterio-${criterio.id}`}
                              options={CUALITATIVAS}
                              placeholder="Seleccionar"
                              value={detalles[criterio.id]?.calificacionCualitativa || ''}
                              onChange={(e) => handleCalificacionCualitativaChange(criterio.id, e.target.value)}
                              className="mx-auto w-32"
                              disabled={yaEvaluado && !modoEdicion}
                            />
                          ) : (
                            <Input
                              type="number"
                              min={0}
                              max={criterio.puntajeMaximo || 5}
                              value={detalles[criterio.id]?.puntajeObtenido || ''}
                              onChange={(e) =>
                                handlePuntajeChange(criterio.id, e.target.value, criterio.puntajeMaximo || 5)
                              }
                              className="mx-auto w-20 text-center"
                              disabled={yaEvaluado && !modoEdicion}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                           <Input
                            value={detalles[criterio.id]?.comentarios || ''}
                            onChange={(e) => handleComentarioChange(criterio.id, e.target.value)}
                            placeholder="Opcional"
                            disabled={yaEvaluado && !modoEdicion}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {catIndex < grupos.length - 1 && <div className="my-4 border-t border-border" />}
            </div>
          ))}

          <div className="mt-6 border-t-2 border-primary-600 dark:border-primary-400 pt-4">
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
              <Input
                label="Horas registradas"
                type="number"
                value={evaluacion.horasRegistradas || ''}
                onChange={(e) =>
                  setEvaluacion((prev) => ({
                    ...prev,
                    horasRegistradas: parseInt(e.target.value, 10) || 0,
                  }))
                }
                disabled={yaEvaluado && !modoEdicion}
              />
              <div className="relative">
                <Button variant={file ? 'secondary' : 'primary'} className="w-full" disabled={yaEvaluado && !modoEdicion}>
                  <Upload className="h-4 w-4" />
                  {evaluacion.rutaConstancia || 'Subir constancia de horas'}
                </Button>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleFileUpload}
                  disabled={yaEvaluado && !modoEdicion}
                />
              </div>
              {esCualitativa ? (
                <Select
                  label="Calificación final"
                  placeholder="Seleccionar calificación final"
                  options={CUALITATIVAS}
                  value={evaluacion.calificacionCualitativa}
                  onChange={(e) =>
                    setEvaluacion((prev) => ({ ...prev, calificacionCualitativa: e.target.value }))
                  }
                  disabled={yaEvaluado && !modoEdicion}
                />
              ) : (
                <div className="py-2 text-center">
                  <p className="text-xs text-muted-foreground">Puntaje Total Obtenido</p>
                  <p className={cn('text-xl font-bold', colorClass)}>
                    {totalGeneral} / {totalMaximo}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Textarea
                label="Observaciones generales del evaluador"
                rows={3}
                value={evaluacion.comentarios}
                onChange={(e) =>
                  setEvaluacion((prev) => ({ ...prev, comentarios: e.target.value }))
                }
                disabled={yaEvaluado && !modoEdicion}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Lugar y fecha: _______________,{' '}
              {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {yaEvaluado ? (
              <div className="flex items-center gap-3 flex-wrap">
                {!modoEdicion && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm font-semibold">
                    La evaluación de empresa ya ha sido registrada para este expediente.
                  </div>
                )}
                {modoEdicion && (
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 px-4 py-3 text-blue-800 dark:text-blue-300 text-sm font-semibold">
                    ✏️ Modo edición activo — Modifica los campos y guarda los cambios.
                  </div>
                )}
                {isAdmin && !modoEdicion && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setModoEdicion(true)}
                    className="shrink-0"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar evaluación
                  </Button>
                )}
                {isAdmin && modoEdicion && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setModoEdicion(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      disabled={actualizarMutation.isPending || uploadMutation.isPending}
                      size="lg"
                    >
                      {actualizarMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={crearMutation.isPending || uploadMutation.isPending}
                size="lg"
              >
                {crearMutation.isPending || uploadMutation.isPending
                  ? 'Registrando...'
                  : 'Firma y Sello del Funcionario a Cargo'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Historial ────────────────────────────────────────── */}
      {evaluaciones.length > 0 && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="mb-4 text-base font-bold text-foreground">
              Historial de evaluaciones
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="text-foreground">Fecha</TableHead>
                    <TableHead className="text-foreground">Horas</TableHead>
                    <TableHead className="text-foreground">Evaluador</TableHead>
                    <TableHead className="text-foreground">Puntaje</TableHead>
                    <TableHead className="text-foreground">Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluaciones
                    .filter((ev) => ev.componente === 'EMPRESA')
                    .map((ev) => (
                      <TableRow key={ev.id}>
                        <TableCell className="text-foreground">{ev.fechaEvaluacion}</TableCell>
                        <TableCell className="text-foreground">{ev.horasRegistradas} hrs</TableCell>
                        <TableCell className="text-foreground">{ev.tipoEvaluador}</TableCell>
                        <TableCell>
                          <span className="text-sm font-bold text-foreground">
                            {ev.tipoCalificacion === 'CUALITATIVA' ? (ev.calificacionCualitativa || '—') : `${ev.puntajeTotal ?? ev.promedioFinal ?? '—'}/${totalMaximo}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          {ev.detalles?.map((d) => (
                            <span
                              key={d.idCriterio || d.id}
                              className="block text-xs text-muted-foreground"
                            >
                              {d.nombreCriterio || d.criterio}: <span className="font-bold text-foreground">{ev.tipoCalificacion === 'CUALITATIVA' ? (d.calificacionCualitativa || '—') : d.puntajeObtenido}</span>
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

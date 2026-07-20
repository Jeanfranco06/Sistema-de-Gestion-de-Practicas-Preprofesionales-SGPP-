import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Building2, Upload, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { evaluacionesApi } from '../../api/evaluacionesApi';
import { expedientesApi } from '../../api/expedientesApi';
import { useAuth } from '../../auth/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpedienteById } from '@/hooks/useExpedientes';
import { useTiposPractica } from '@/hooks/usePracticas';
import {
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  Textarea,
} from '@/ui';

const MySwal = withReactContent(Swal);

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
  detalles?: Array<{
    idCriterio?: number;
    id?: number;
    nombreCriterio?: string;
    criterio?: string;
    puntajeObtenido: number;
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
  const auth = useAuth() as { user?: { id?: number | string } | null };
  const { id: idExpedienteParams } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const grupos = useMemo(() => agruparCriterios(criterios), [criterios]);

  const crearMutation = useMutation({
    mutationFn: (payload: EvaluacionPayload) => evaluacionesApi.crearEvaluacion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'expediente', idExpediente] });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const total = calcularTotalGeneral();
    if (!auth.user?.id || !expedienteIdValido) {
      MySwal.fire('Sesión o expediente no válido', 'Vuelve a la lista de practicantes e inténtalo nuevamente.', 'error');
      return;
    }
    if (esCualitativa) {
      const faltantes = criterios.some((criterio) => !detalles[criterio.id]?.calificacionCualitativa);
      if (faltantes) {
        MySwal.fire('Evaluación incompleta', 'Debe registrar una calificación cualitativa para cada criterio.', 'warning');
        return;
      }
    } else if (criterios.some((criterio) => !detalles[criterio.id]?.puntajeObtenido)) {
      MySwal.fire('Evaluación incompleta', 'Debe registrar un puntaje para cada criterio.', 'warning');
      return;
    }

    const confirmText = esCualitativa
      ? `Calificación final: ${evaluacion.calificacionCualitativa || '—'}. ¿Estás seguro de registrar la evaluación?`
      : `Puntaje total: ${total} puntos. ¿Estás seguro de registrar la evaluación?`;
    const confirmResult = await MySwal.fire({
      title: '¿Confirmar Evaluación?',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      MySwal.fire({ title: 'Guardando...', didOpen: () => MySwal.showLoading() });

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
      MySwal.fire({
        icon: 'success',
        title: 'Evaluación Registrada',
        text: esCualitativa
          ? `Calificación final: ${evaluacion.calificacionCualitativa}`
          : `Puntaje total: ${total} puntos`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      const error = err as { response?: { data?: { mensaje?: string } } };
      MySwal.fire('Error', error.response?.data?.mensaje || 'No se pudo guardar la evaluación.', 'error');
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
  const colorVar =
    colorTotal === 'success'
      ? 'var(--color-success)'
      : colorTotal === 'warning'
        ? 'var(--color-warning)'
        : 'var(--color-error)';

  if (!expedienteIdValido) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-[var(--color-error)]">No se indicó un expediente válido para evaluar.</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/tutor/practicantes')}>
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
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
                Evaluación de Prácticas Pre-Profesionales
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Anexo 2 — Evaluación por la Empresa Receptora
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tutor/practicantes')}>
            <ArrowLeft size={16} />
          </Button>
        </div>

        {expediente && (
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <p className="text-xs text-[var(--color-muted-foreground)]">1. DEL PRACTICANTE</p>
                <h3 className="mb-2 mt-1 text-lg font-semibold text-[var(--color-foreground)]">
                  {expediente.nombreEstudiante} {expediente.apellidoEstudiante}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">
                    <User size={14} className="mr-1" />
                    DNI: {expediente.numeroDocumento || '—'}
                  </Badge>
                  <Badge variant="neutral">
                    <Building2 size={14} className="mr-1" />
                    {expediente.nombreEmpresa}
                  </Badge>
                </div>
              </div>
              <div>
                {esCualitativa ? (
                  <>
                    <p className="text-xs text-[var(--color-muted-foreground)]">Calificación final</p>
                    <div className="text-xl font-semibold text-[var(--color-foreground)]">
                      {evaluacion.calificacionCualitativa || '—'}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-[var(--color-muted-foreground)]">Puntaje Total</p>
                    <div className="text-3xl font-semibold" style={{ color: colorVar }}>
                      {totalGeneral}{' '}
                      <span className="text-sm text-[var(--color-muted-foreground)]">/ {totalMaximo}</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${porcentaje}%`, backgroundColor: colorVar }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-[var(--color-foreground)]">4. EVALUACIÓN</h3>
          <p className="mb-4 block text-xs text-[var(--color-muted-foreground)]">
            {esCualitativa
              ? 'Para cada criterio, seleccione la calificación cualitativa que corresponde al desempeño del practicante.'
              : '(En la columna de puntaje, para cada criterio, sírvase marcar un número de 1 a 5 según corresponda al practicante que está evaluando. El número 1 corresponde al peor desempeño y el número 5 corresponde al mejor desempeño)'}
          </p>

          {grupos.map((cat, catIndex) => (
            <div key={cat.categoria} className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--color-foreground)]">{cat.categoria}</h4>
                {!esCualitativa && (
                  <Badge
                    variant={calcularTotalCategoria(cat) >= cat.puntajeMaximo * 0.7 ? 'success' : 'neutral'}
                  >
                    {calcularTotalCategoria(cat)} / {cat.puntajeMaximo} pts
                  </Badge>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Criterio de Evaluación</TableHead>
                    <TableHead className="w-1/4 text-center">
                      {esCualitativa ? 'Calificación' : `Puntaje (${Math.max(
                        ...cat.criterios.map((c) => c.puntajeMaximo || 5),
                        5,
                      )})`}
                    </TableHead>
                    <TableHead className="w-1/4 text-center">Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cat.criterios.map((criterio) => (
                    <TableRow key={criterio.id}>
                      <TableCell>
                        <p className="text-sm text-[var(--color-foreground)]">{criterio.nombre}</p>
                        {criterio.descripcion && (
                          <p className="text-xs text-[var(--color-muted-foreground)]">{criterio.descripcion}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {esCualitativa ? (
                          <Select
                            options={[
                              { value: 'Logrado', label: 'Logrado' },
                              { value: 'En proceso', label: 'En proceso' },
                              { value: 'No logrado', label: 'No logrado' },
                            ]}
                            placeholder="Seleccionar"
                            value={detalles[criterio.id]?.calificacionCualitativa || ''}
                            onChange={(e) => handleCalificacionCualitativaChange(criterio.id, e.target.value)}
                            className="mx-auto w-32"
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
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={detalles[criterio.id]?.comentarios || ''}
                          onChange={(e) => handleComentarioChange(criterio.id, e.target.value)}
                          placeholder="Opcional"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {catIndex < grupos.length - 1 && <div className="my-4 border-t border-[var(--color-border)]" />}
            </div>
          ))}

          <div className="mt-6 border-t-2 border-[var(--color-primary)] pt-4">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
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
              />
              <div className="relative">
                <Button variant={file ? 'secondary' : 'primary'} className="w-full">
                  <Upload size={16} />
                  {evaluacion.rutaConstancia || 'Subir constancia de horas'}
                </Button>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleFileUpload}
                />
              </div>
              {esCualitativa ? (
                <Select
                  label="Calificación final"
                  placeholder="Seleccionar calificación final"
                  options={[
                    { value: 'Logrado', label: 'Logrado' },
                    { value: 'En proceso', label: 'En proceso' },
                    { value: 'No logrado', label: 'No logrado' },
                  ]}
                  value={evaluacion.calificacionCualitativa}
                  onChange={(e) =>
                    setEvaluacion((prev) => ({ ...prev, calificacionCualitativa: e.target.value }))
                  }
                />
              ) : (
                <div className="py-2 text-center">
                  <p className="text-xs text-[var(--color-muted-foreground)]">Puntaje Total Obtenido</p>
                  <div className="text-xl font-bold" style={{ color: colorVar }}>
                    {totalGeneral} / {totalMaximo}
                  </div>
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
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Lugar y fecha: _______________,{' '}
              {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <Button
              onClick={handleSubmit}
              disabled={crearMutation.isPending || uploadMutation.isPending}
              size="lg"
            >
              {crearMutation.isPending || uploadMutation.isPending
                ? 'Registrando...'
                : 'Firma y Sello del Funcionario a Cargo'}
            </Button>
          </div>
        </Card>

        {evaluaciones.length > 0 && (
          <Card className="p-6">
            <h3 className="mb-4 text-base font-semibold text-[var(--color-foreground)]">
              Historial de evaluaciones
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Evaluador</TableHead>
                  <TableHead>Puntaje</TableHead>
                  <TableHead>Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluaciones
                  .filter((ev) => ev.componente === 'EMPRESA')
                  .map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>{ev.fechaEvaluacion}</TableCell>
                      <TableCell>{ev.horasRegistradas} hrs</TableCell>
                      <TableCell>{ev.tipoEvaluador}</TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {ev.puntajeTotal ?? ev.promedioFinal ?? '—'}/{totalMaximo}
                        </span>
                      </TableCell>
                      <TableCell>
                        {ev.detalles?.map((d) => (
                          <span
                            key={d.idCriterio || d.id}
                            className="block text-xs text-[var(--color-muted-foreground)]"
                          >
                            {d.nombreCriterio || d.criterio}: {d.puntajeObtenido}
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

import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Clock, CheckCircle, Hourglass, Plus, Loader2, Calendar, AlertCircle, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useMisExpedientes, useExpedienteById, useHistorialEstados } from '@/hooks/useExpedientes';
import { useControlHoras, useRegistrosHoras, useCumplimientoHoras, useRegistrarHoras } from '@/hooks/useHoras';
import { tieneControlHoras } from '@/shared/utils/controlHoras';
import { ESTADOS_EXPEDIENTE } from '@/lib/constants';
import { Card, CardContent, Badge, Progress, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input, Select, Textarea } from '@/ui';
import { cn } from '@/lib/utils';

const MySwal = withReactContent(Swal);

const registroFormSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  horaInicio: z.string().min(1, 'La hora de inicio es requerida'),
  horaFin: z.string().min(1, 'La hora de fin es requerida'),
  horas: z.coerce.number({ invalid_type_error: 'Debe ser un número' }).min(1, 'Mínimo 1 hora').max(24, 'Máximo 24 horas'),
  descripcionActividad: z.string().min(1, 'La descripción es requerida').max(500, 'Máximo 500 caracteres'),
  tipoRegistro: z.enum(['PRESENCIAL', 'VIRTUAL', 'CAMPO', 'EXTRAORDINARIO']),
  observaciones: z.string().max(500, 'Máximo 500 caracteres').optional().default(''),
});

type RegistroFormData = z.infer<typeof registroFormSchema>;

const tipoOptions = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'CAMPO', label: 'Trabajo de campo' },
  { value: 'EXTRAORDINARIO', label: 'Extraordinario' },
];

interface ExpedienteItem {
  id: string;
  codigoExpediente: string;
  codigoTipoPractica: string;
  estado: string;
  fechaInicioPractica?: string;
  fechaFinPractica?: string;
  duracionSemanas?: number;
}

interface ControlData {
  horasAcumuladas?: number;
}

interface CumplimientoData {
  horasRequeridas?: number;
  horasAcumuladas?: number;
}

interface RegistroItem {
  id: string;
  fecha: string;
  horas: number;
  descripcionActividad: string;
  tipoRegistro: string;
  validadoPorTutor: boolean;
}

const calcularHoras = (inicio: string, fin: string): number | null => {
  if (!inicio || !fin) return null;
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  let diff = h2 * 60 + m2 - (h1 * 60 + m1);
  if (diff <= 0) diff += 24 * 60;
  return Math.round(diff / 60);
};

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Cargando control de horas...</p>
    </div>
  );
}

function SinExpedienteState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Clock className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-foreground">Sin expediente activo</h2>
      <p className="text-sm text-muted-foreground">No tienes ninguna práctica registrada para registrar horas.</p>
    </div>
  );
}

export default function RegistroHoras() {
  const { data: expedientes, isLoading: expLoading } = useMisExpedientes();
  const rawList = (expedientes ?? []) as ExpedienteItem[];
  const expediente = rawList[0] ?? null;
  const idExpediente = expediente?.id;

  const horasEnabled = !!idExpediente && tieneControlHoras(expediente!.estado);
  const horasId = horasEnabled ? idExpediente : undefined;

  const { data: control } = useControlHoras(horasId);
  const { data: registros = [] } = useRegistrosHoras(horasId);
  const { data: cumplimiento } = useCumplimientoHoras(horasId);

  // Obtener detalles completos del expediente para mostrar fechas
  const { data: expedienteDetalle } = useExpedienteById(idExpediente);
  // Obtener historial de cambios de estado
  const { data: historialEstados = [] } = useHistorialEstados(idExpediente);

  const registrarMutation = useRegistrarHoras();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroFormSchema),
    defaultValues: {
      fecha: '',
      horaInicio: '',
      horaFin: '',
      horas: 0,
      descripcionActividad: '',
      tipoRegistro: 'PRESENCIAL',
      observaciones: '',
    },
  });

  const horaInicio = watch('horaInicio');
  const horaFin = watch('horaFin');

  useEffect(() => {
    const computed = calcularHoras(horaInicio ?? '', horaFin ?? '');
    if (computed !== null) {
      setValue('horas', computed);
    }
  }, [horaInicio, horaFin, setValue]);

  const onSubmit = useCallback(
    async (data: RegistroFormData) => {
      if (!expediente || !control) {
        await MySwal.fire({ icon: 'warning', title: 'Control no iniciado', text: 'Primero inicie el control de horas.' });
        return;
      }
      if (expediente.estado !== ESTADOS_EXPEDIENTE.EN_EJECUCION) {
        await MySwal.fire({ icon: 'warning', title: 'Registro no habilitado', text: 'Solo puedes registrar horas mientras la práctica está en ejecución.' });
        return;
      }
      try {
        const payload = { ...data } as unknown as Record<string, unknown>;
        if (!payload.horaInicio) delete payload.horaInicio;
        if (!payload.horaFin) delete payload.horaFin;
        await registrarMutation.mutateAsync({ idExpediente: expediente.id, payload });
        reset();
        await MySwal.fire({ icon: 'success', title: 'Horas registradas', timer: 1500, showConfirmButton: false });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { mensaje?: string; message?: string } } };
        await MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.response?.data?.mensaje || err?.response?.data?.message || 'No se pudieron registrar las horas',
        });
      }
    },
    [expediente, control, registrarMutation, reset],
  );

  if (expLoading) return <LoadingState />;
  if (!expediente) return <SinExpedienteState />;

  const cumplData = cumplimiento as CumplimientoData | undefined;
  const ctrlData = control as ControlData | undefined;
  const regList = registros as RegistroItem[];

  const horasRequeridas = cumplData?.horasRequeridas ?? (expediente.codigoTipoPractica === 'INICIAL' ? 64 : 360);
  const horasValidadas = cumplData?.horasAcumuladas ?? ctrlData?.horasAcumuladas ?? 0;
  const horasRegistradas = regList.reduce((sum, r) => sum + r.horas, 0);
  const horasPendientes = horasRegistradas - horasValidadas;
  const progreso = Math.min(100, Math.round((horasValidadas / horasRequeridas) * 100));
  const cumplido = horasValidadas >= horasRequeridas;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 w-full animate-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <Clock className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-full shrink-0 w-14 h-14 bg-white/15">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Registro de Horas</h1>
              <p className="text-sm opacity-90 mt-1">
                Registra tu avance semanal de horas para el expediente {expediente.codigoExpediente}
              </p>
            </div>
          </div>
          <Badge
            variant={cumplido ? 'success' : 'warning'}
            size="md"
            className="self-start md:self-auto shrink-0 bg-white/15 text-white border border-white/20 px-3 py-1.5"
          >
            {cumplido ? <CheckCircle className="h-3.5 w-3.5" /> : <Hourglass className="h-3.5 w-3.5" />}
            {cumplido ? 'Completado' : `${horasValidadas} / ${horasRequeridas} h`}
          </Badge>
        </div>
      </div>

      {/* Estado del Expediente */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Estado del Expediente</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={expediente.estado === ESTADOS_EXPEDIENTE.EN_EJECUCION ? 'success' : 'neutral'} size="sm">
                  {expediente.estado}
                </Badge>
                {expediente.estado !== ESTADOS_EXPEDIENTE.EN_EJECUCION && (
                  <span className="text-sm text-muted-foreground">
                    {expediente.estado === ESTADOS_EXPEDIENTE.PLAN_APROBADO 
                      ? 'El expediente está listo para iniciar ejecución. Contacta a la secretaría o coordinación para iniciar la ejecución.'
                      : 'El registro de horas solo está disponible durante la ejecución de la práctica.'}
                  </span>
                )}
              </div>
              {expedienteDetalle?.fechaInicioPractica && (
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Fecha inicio:</span> {expedienteDetalle.fechaInicioPractica}
                  {expedienteDetalle.fechaFinPractica && (
                    <span className="ml-4"><span className="font-medium">Fecha fin estimada:</span> {expedienteDetalle.fechaFinPractica}</span>
                  )}
                </div>
              )}
              {/* Mostrar último cambio de estado */}
              {historialEstados.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Último cambio: {new Date(historialEstados[historialEstados.length - 1].fechaCambio).toLocaleDateString('es-ES')}
                    {historialEstados[historialEstados.length - 1].observacion && (
                      <span className="ml-2">- {historialEstados[historialEstados.length - 1].observacion}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cuadros Informativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha inicio</p>
                <p className="font-semibold text-foreground">{expedienteDetalle?.fechaInicioPractica || 'No definida'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha fin estimada</p>
                <p className="font-semibold text-foreground">{expedienteDetalle?.fechaFinPractica || 'No definida'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-xs text-muted-foreground">Duración</p>
                <p className="font-semibold text-foreground">{expedienteDetalle?.duracionSemanas ? `${expedienteDetalle.duracionSemanas} semanas` : 'No definida'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de rango de fechas */}
      {expedienteDetalle?.fechaInicioPractica && expedienteDetalle?.fechaFinPractica && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Rango permitido para registrar horas</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Solo puedes registrar horas entre el <span className="font-medium">{expedienteDetalle.fechaInicioPractica}</span> 
                  {' '}y el <span className="font-medium">{expedienteDetalle.fechaFinPractica}</span>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-bold text-base text-foreground">Resumen</h3>

              <div>
                <p className="text-xs text-muted-foreground">Horas registradas (total)</p>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                  {horasRegistradas}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {horasRequeridas}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Horas validadas por tutor</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {horasValidadas}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({horasPendientes} pendientes)
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Progreso</p>
                <div className="flex items-center gap-2">
                  <Progress value={progreso} size="md" className="flex-1" />
                  <span className="text-sm font-semibold text-foreground">{progreso}%</span>
                </div>
              </div>

              <Badge
                variant={cumplido ? 'success' : 'warning'}
                size="sm"
                className="inline-flex items-center gap-1.5 w-fit"
              >
                {cumplido ? <CheckCircle className="h-3.5 w-3.5" /> : <Hourglass className="h-3.5 w-3.5" />}
                {cumplido ? 'Cumplimiento completado' : 'Pendiente de cumplimiento'}
              </Badge>

              {!control && (
                <div className="rounded-lg p-3 text-sm bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800">
                  El control de horas se crea automáticamente al iniciar la ejecución de tu práctica.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card>
            <CardContent>
              <h3 className="font-bold text-base mb-4 text-foreground">Nuevo registro</h3>

              {!control && (
                <div className="rounded-lg p-3 text-sm mb-4 bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800">
                  Debe iniciar el control de horas antes de registrar actividades.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6">
                    <Input label="Fecha" type="date" required {...register('fecha')} error={errors.fecha?.message} />
                  </div>
                  <div className="sm:col-span-3">
                    <Input label="Hora inicio" type="time" required {...register('horaInicio')} error={errors.horaInicio?.message} />
                  </div>
                  <div className="sm:col-span-3">
                    <Input label="Hora fin" type="time" required {...register('horaFin')} error={errors.horaFin?.message} />
                  </div>
                  <div className="sm:col-span-4">
                    <Input label="Horas (calculado)" type="number" {...register('horas')} error={errors.horas?.message} disabled />
                  </div>
                  <div className="sm:col-span-8">
                    <Select
                      label="Tipo de registro"
                      options={tipoOptions}
                      {...register('tipoRegistro')}
                      error={errors.tipoRegistro?.message}
                    />
                  </div>
                  <div className="sm:col-span-12">
                    <Textarea
                      label="Descripción de la actividad"
                      required
                      {...register('descripcionActividad')}
                      error={errors.descripcionActividad?.message}
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="sm:col-span-12">
                    <Textarea
                      label="Observaciones"
                      {...register('observaciones')}
                      error={errors.observaciones?.message}
                      className="min-h-[40px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={!control} loading={registrarMutation.isPending}>
                    <Plus className="h-4 w-4" />
                    Registrar horas
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-12">
          <Card>
            <CardContent>
              <h3 className="font-bold text-base mb-4 text-foreground">Historial de registros</h3>

              {regList.length === 0 ? (
                <div className="rounded-lg p-3 text-sm bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800">
                  No hay registros de horas aún.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Horas</TableHead>
                        <TableHead>Actividad</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regList.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.fecha}</TableCell>
                          <TableCell>{r.horas}</TableCell>
                          <TableCell>{r.descripcionActividad}</TableCell>
                          <TableCell>{r.tipoRegistro}</TableCell>
                          <TableCell>
                            <Badge variant={r.validadoPorTutor ? 'success' : 'neutral'} size="sm">
                              {r.validadoPorTutor ? 'Validado' : 'Pendiente'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

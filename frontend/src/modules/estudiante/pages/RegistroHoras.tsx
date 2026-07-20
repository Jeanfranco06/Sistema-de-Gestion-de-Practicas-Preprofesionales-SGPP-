import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Clock, CheckCircle, Hourglass, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useMisExpedientes } from '../../../hooks/useExpedientes';
import { useControlHoras, useRegistrosHoras, useCumplimientoHoras, useRegistrarHoras } from '../../../hooks/useHoras';
import { tieneControlHoras } from '../../../shared/utils/controlHoras';
import { ESTADOS_EXPEDIENTE } from '../../../lib/constants';
import { Card, CardContent, Badge, Progress, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../ui';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { Textarea } from '../../../ui/Textarea';

const MySwal = withReactContent(Swal);

const registroFormSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  horaInicio: z.string().optional().default(''),
  horaFin: z.string().optional().default(''),
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
    <div className="flex items-center justify-center min-h-[50vh]">
      <svg className="animate-spin h-8 w-8" style={{ color: 'var(--color-primary-600)' }} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
}

function SinExpedienteState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Clock className="h-12 w-12" style={{ color: 'var(--color-muted-foreground)' }} />
      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>Sin expediente activo</h2>
      <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No tienes ninguna práctica registrada para registrar horas.</p>
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
  const progreso = Math.min(100, Math.round((horasValidadas / horasRequeridas) * 100));
  const cumplido = horasValidadas >= horasRequeridas;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-5 w-5" style={{ color: 'var(--color-primary-600)' }} />
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Registro de Horas</h1>
      </div>
      <p className="text-sm -mt-4" style={{ color: 'var(--color-muted-foreground)' }}>
        Registra tu avance semanal de horas para el expediente {expediente.codigoExpediente}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-bold text-base" style={{ color: 'var(--color-foreground)' }}>Resumen</h3>

              <div>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Horas validadas</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--color-primary-600)' }}>
                  {horasValidadas}{' '}
                  <span className="text-sm font-normal" style={{ color: 'var(--color-muted-foreground)' }}>
                    / {horasRequeridas}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs mb-1.5" style={{ color: 'var(--color-muted-foreground)' }}>Progreso</p>
                <div className="flex items-center gap-2">
                  <Progress value={progreso} size="md" className="flex-1" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{progreso}%</span>
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
                <div
                  className="rounded-lg p-3 text-sm"
                  style={{
                    backgroundColor: 'var(--color-blue-100)',
                    color: 'var(--color-blue-800)',
                    border: '1px solid var(--color-blue-200)',
                  }}
                >
                  El control de horas se crea automáticamente al iniciar la ejecución de tu práctica.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card>
            <CardContent>
              <h3 className="font-bold text-base mb-4" style={{ color: 'var(--color-foreground)' }}>Nuevo registro</h3>

              {!control && (
                <div
                  className="rounded-lg p-3 text-sm mb-4"
                  style={{
                    backgroundColor: 'var(--color-blue-100)',
                    color: 'var(--color-blue-800)',
                    border: '1px solid var(--color-blue-200)',
                  }}
                >
                  Debe iniciar el control de horas antes de registrar actividades.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6">
                    <Input label="Fecha" type="date" required {...register('fecha')} error={errors.fecha?.message} />
                  </div>
                  <div className="sm:col-span-3">
                    <Input label="Hora inicio" type="time" {...register('horaInicio')} />
                  </div>
                  <div className="sm:col-span-3">
                    <Input label="Hora fin" type="time" {...register('horaFin')} />
                  </div>
                  <div className="sm:col-span-4">
                    <Input label="Horas" type="number" required {...register('horas')} error={errors.horas?.message} />
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
                      style={{ minHeight: '60px' }}
                    />
                  </div>
                  <div className="sm:col-span-12">
                    <Textarea
                      label="Observaciones"
                      {...register('observaciones')}
                      error={errors.observaciones?.message}
                      style={{ minHeight: '40px' }}
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
              <h3 className="font-bold text-base mb-4" style={{ color: 'var(--color-foreground)' }}>Historial de registros</h3>

              {regList.length === 0 ? (
                <div
                  className="rounded-lg p-3 text-sm"
                  style={{
                    backgroundColor: 'var(--color-blue-100)',
                    color: 'var(--color-blue-800)',
                    border: '1px solid var(--color-blue-200)',
                  }}
                >
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

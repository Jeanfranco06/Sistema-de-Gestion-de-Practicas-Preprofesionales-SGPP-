import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, Clock, Building2, CalendarDays } from 'lucide-react';
import { horasEstudianteApi } from '@/api/horasApi';
import { useExpedienteById } from '@/hooks/useExpedientes';
import { Card, CardContent, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/ui';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import { showSuccess, showError } from '@/lib/toast';

interface RegistroHora {
  id: string;
  fecha: string;
  horas: number;
  descripcionActividad: string;
  tipoRegistro: string;
  validadoPorTutor: boolean;
  rechazadoPorTutor: boolean;
  observacionesTutor?: string;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  variant?: 'default' | 'success' | 'warning' | 'neutral';
}

function KpiCard({ label, value, icon: Icon, variant = 'default' }: KpiCardProps) {
  const colorClasses = {
    default: 'bg-[#1A3A6E] text-white dark:bg-[#4A6FA5]',
    success: 'bg-emerald-600 text-white dark:bg-emerald-700',
    warning: 'bg-amber-500 text-slate-900 dark:bg-amber-600',
    neutral: 'bg-muted text-muted-foreground',
  };

  return (
    <Card variant="hover" className="p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex justify-between items-start">
        <span className="text-[0.65rem] uppercase tracking-wider font-bold text-muted-foreground">{label}</span>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', colorClasses[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{value}</p>
    </Card>
  );
}

export default function ValidacionHorasTutor() {
  const { idExpediente } = useParams<{ idExpediente: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: expediente } = useExpedienteById(idExpediente);
  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['horas', 'registros', idExpediente],
    queryFn: async () => {
      const res = await horasEstudianteApi.getRegistros(idExpediente!);
      const payload = res.data?.data as RegistroHora[] | undefined;
      return Array.isArray(payload) ? payload : [];
    },
    enabled: !!idExpediente,
  });

  const validarMutation = useMutation({
    mutationFn: ({ idRegistro, payload }: { idRegistro: string; payload: { validado: boolean; observaciones?: string } }) =>
      horasEstudianteApi.validar(idRegistro, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horas', 'registros', idExpediente] });
      queryClient.invalidateQueries({ queryKey: ['horas', 'control', idExpediente] });
      queryClient.invalidateQueries({ queryKey: ['horas', 'cumplimiento', idExpediente] });
    },
  });

  const handleValidar = async (registro: RegistroHora, validado: boolean) => {
    const { value: observaciones } = await Swal.fire({
      title: validado ? 'Validar registro de horas' : 'Rechazar registro de horas',
      input: 'textarea',
      inputLabel: 'Observaciones (opcional)',
      inputPlaceholder: 'Ingrese observaciones sobre el registro...',
      showCancelButton: true,
      confirmButtonText: validado ? 'Validar' : 'Rechazar',
      cancelButtonText: 'Cancelar',
    });
    if (observaciones === undefined) return;
    try {
      await validarMutation.mutateAsync({
        idRegistro: registro.id,
        payload: { validado, observaciones: observaciones || '' },
      });
      showSuccess(validado ? 'Registro validado' : 'Registro rechazado');
    } catch (err) {
      const error = err as { response?: { data?: { mensaje?: string; message?: string } } };
      showError('Error', error.response?.data?.mensaje || error.response?.data?.message || 'No se pudo procesar el registro.');
    }
  };

  const pendientes = registros.filter((r) => !r.validadoPorTutor && !r.rechazadoPorTutor);
  const validados = registros.filter((r) => r.validadoPorTutor);
  const rechazados = registros.filter((r) => r.rechazadoPorTutor);
  const totalHorasValidadas = validados.reduce((sum, r) => sum + r.horas, 0);
  const horasRequeridas = expediente?.codigoTipoPractica === 'INICIAL' ? 64 : 360;
  const limiteAlcanzado = totalHorasValidadas >= horasRequeridas;

  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-9 w-9" onClick={() => navigate('/tutor/practicantes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Validación de horas</h1>
            <p className="text-sm text-muted-foreground">
              {expediente?.nombreEstudiante} {expediente?.apellidoEstudiante} — {expediente?.codigoExpediente}
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/tutor/practicantes')}>
          Volver a practicantes
        </Button>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total de registros"
          value={registros.length}
          icon={CalendarDays}
          variant="default"
        />
        <KpiCard
          label="Pendientes"
          value={pendientes.length}
          icon={Clock}
          variant="warning"
        />
        <KpiCard
          label="Validados"
          value={validados.length}
          icon={CheckCircle}
          variant="success"
        />
        <KpiCard
          label="Horas validadas"
          value={`${totalHorasValidadas} / ${horasRequeridas}`}
          icon={CheckCircle}
          variant={limiteAlcanzado ? 'success' : 'default'}
        />
      </div>

      {limiteAlcanzado && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-bold text-green-900 dark:text-green-100">Límite de horas alcanzado</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  El estudiante ha completado las {horasRequeridas} horas requeridas. No se pueden validar más horas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tabla ────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary-700 dark:text-primary-400" />
            <h2 className="text-base font-bold text-foreground">Registros de horas</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 rounded-full border-border border-t-primary-600" />
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground mb-1">No hay registros</h3>
              <p className="text-sm text-muted-foreground">
                Aún no hay registros de horas para este expediente.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="text-foreground">Fecha</TableHead>
                    <TableHead className="text-foreground">Horas</TableHead>
                    <TableHead className="text-foreground">Actividad</TableHead>
                    <TableHead className="text-foreground">Tipo</TableHead>
                    <TableHead className="text-foreground">Estado</TableHead>
                    <TableHead className="text-right text-foreground">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell className="text-foreground">{registro.fecha}</TableCell>
                      <TableCell className="text-foreground font-medium">{registro.horas}</TableCell>
                      <TableCell className="text-foreground">{registro.descripcionActividad}</TableCell>
                      <TableCell className="text-muted-foreground">{registro.tipoRegistro}</TableCell>
                      <TableCell>
                        {registro.rechazadoPorTutor ? (
                          <Badge variant="danger" size="sm">Rechazado</Badge>
                        ) : (
                          <Badge variant={registro.validadoPorTutor ? 'success' : 'neutral'} size="sm">
                            {registro.validadoPorTutor ? 'Validado' : 'Pendiente'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!registro.validadoPorTutor && !registro.rechazadoPorTutor && !limiteAlcanzado && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => handleValidar(registro, false)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleValidar(registro, true)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
  );
}

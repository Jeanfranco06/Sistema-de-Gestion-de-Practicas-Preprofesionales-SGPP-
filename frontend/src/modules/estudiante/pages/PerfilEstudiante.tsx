import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Pencil,
  Save,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Award,
  Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '@/auth/AuthContext';
import { usePerfilAcademico, useActualizarPerfilAcademico } from '@/hooks/useUsuarios';
import { Card, CardContent, Badge, Button, Avatar, Separator, Input, Select } from '@/ui';
import { cn } from '@/lib/utils';

const MySwal = withReactContent(Swal);

const perfilAcademicoFormSchema = z.object({
  semestreActual: z.coerce
    .number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Debe estar entre 1 y 20')
    .max(20, 'Debe estar entre 1 y 20'),
  creditosAprobados: z.coerce
    .number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(0, 'Debe ser un número positivo'),
  promedioPonderado: z.coerce
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'Debe estar entre 0 y 20')
    .max(20, 'Debe estar entre 0 y 20'),
  fechaIngreso: z.string().min(1, 'La fecha de ingreso es requerida'),
  estadoAcademico: z.string().min(1, 'El estado académico es requerido'),
});

type PerfilAcademicoFormData = z.infer<typeof perfilAcademicoFormSchema>;

interface UserData {
  nombres?: string;
  apellidoPaterno?: string;
  codigoEstudiantil?: string;
  semestreActual?: number;
  creditosAprobados?: number;
  promedioPonderado?: number;
  fechaIngreso?: string;
  estadoAcademico?: string;
}

interface PerfilData {
  semestreActual?: number;
  creditosAprobados?: number;
  promedioPonderado?: number;
  fechaIngreso?: string;
  estadoAcademico?: string;
}

const estadoOptions = [
  { value: 'ACTIVO', label: 'ACTIVO' },
  { value: 'REGULAR', label: 'REGULAR' },
  { value: 'MATRICULADO', label: 'MATRICULADO' },
  { value: 'SUSPENDIDO', label: 'SUSPENDIDO' },
  { value: 'EGRESADO', label: 'EGRESADO' },
  { value: 'GRADUADO', label: 'GRADUADO' },
];

const tiposPractica = [
  { key: 'inicial', nombre: 'Práctica Inicial', creditosStr: '100 créditos', semestreStr: '6to semestre' },
  { key: 'final', nombre: 'Práctica Final', creditosStr: '180 créditos', semestreStr: '9no semestre' },
  { key: 'profesional', nombre: 'Práctica Profesional', creditosStr: '180 créditos', semestreStr: '9no semestre' },
] as const;

const requisitosInfo: Record<string, { creditos: number; semestre: number }> = {
  inicial: { creditos: 100, semestre: 6 },
  final: { creditos: 180, semestre: 9 },
  profesional: { creditos: 180, semestre: 9 },
};

const estadosValidos = ['ACTIVO', 'REGULAR', 'MATRICULADO'];

function getEstadoVariant(estado: string): 'success' | 'warning' | 'info' | 'neutral' {
  switch (estado) {
    case 'ACTIVO':
      return 'success';
    case 'REGULAR':
      return 'warning';
    case 'MATRICULADO':
      return 'info';
    case 'SUSPENDIDO':
      return 'warning';
    default:
      return 'neutral';
  }
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary-600" aria-hidden="true" />
      <p className="font-medium text-muted-foreground">Cargando perfil académico...</p>
    </div>
  );
}

function PerfilEstudiante() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userData = user as UserData | null;

  const { data: perfil, isLoading, refetch } = usePerfilAcademico();
  const mutation = useActualizarPerfilAcademico();
  const perfilData = perfil as PerfilData | null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PerfilAcademicoFormData>({
    resolver: zodResolver(perfilAcademicoFormSchema),
    defaultValues: {
      semestreActual: 6,
      creditosAprobados: 0,
      promedioPonderado: 0,
      fechaIngreso: '',
      estadoAcademico: 'ACTIVO',
    },
  });

  useEffect(() => {
    if (perfilData) {
      reset({
        semestreActual: perfilData.semestreActual ?? 0,
        creditosAprobados: perfilData.creditosAprobados ?? 0,
        promedioPonderado: perfilData.promedioPonderado ?? 0,
        fechaIngreso: perfilData.fechaIngreso ?? '',
        estadoAcademico: perfilData.estadoAcademico ?? 'ACTIVO',
      });
    } else if (userData) {
      reset({
        semestreActual: userData.semestreActual ?? 6,
        creditosAprobados: userData.creditosAprobados ?? 0,
        promedioPonderado: userData.promedioPonderado ?? 0,
        fechaIngreso: userData.fechaIngreso ?? '',
        estadoAcademico: userData.estadoAcademico ?? 'ACTIVO',
      });
    }
  }, [perfilData, userData, reset]);

  const watched = watch();

  const cumpleRequisito = (tipo: string) => {
    const req = requisitosInfo[tipo];
    if (!req) return false;
    const promedio = watched.promedioPonderado || 0;
    return (
      (watched.creditosAprobados ?? 0) >= req.creditos &&
      (watched.semestreActual ?? 0) >= req.semestre &&
      estadosValidos.includes(watched.estadoAcademico) &&
      promedio > 0
    );
  };

  const onSubmit = async (data: PerfilAcademicoFormData) => {
    try {
      await mutation.mutateAsync(data as unknown as Record<string, unknown>);
      await MySwal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Tu información académica ha sido actualizada exitosamente.',
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      await MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Error al actualizar el perfil. Por favor, intenta nuevamente.',
      });
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <GraduationCap className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-full shrink-0 w-14 h-14 bg-white/15">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Perfil Académico</h1>
              <p className="text-sm opacity-90 mt-1">
                Mantén actualizada tu información para acceder a las prácticas
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white border border-white/30 rounded-lg hover:bg-white/10 self-start md:self-auto"
            onClick={() => navigate('/estudiante/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4">
          <Card className="h-full overflow-hidden">
            <div className="h-24 rounded-t-2xl bg-gradient-to-br from-primary-700 to-primary-900" />
            <CardContent className="pt-0 px-6 pb-6">
              <div className="flex flex-col items-center -mt-12 text-center">
                <Avatar
                  size="xl"
                  className="border-4 border-white shadow-lg mb-3 bg-muted"
                  fallback={userData?.nombres?.charAt(0) || 'E'}
                />
                <h2 className="text-xl font-bold text-foreground">
                  {userData?.nombres} {userData?.apellidoPaterno}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {userData?.codigoEstudiantil}
                </p>
                <Badge
                  variant={getEstadoVariant(watched.estadoAcademico)}
                  size="md"
                  className="mt-3 font-semibold px-3"
                >
                  {watched.estadoAcademico}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="p-2.5 rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Semestre Actual</p>
                    <p className="text-lg font-bold text-foreground">{watched.semestreActual}°</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Créditos Aprobados</p>
                    <p className="text-lg font-bold text-foreground">{watched.creditosAprobados}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Promedio Ponderado</p>
                    <p className="text-lg font-bold text-foreground">{watched.promedioPonderado || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Edit Form */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Actualizar Información Académica
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Modifica tus datos y guarda los cambios
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Semestre Actual"
                    type="number"
                    {...register('semestreActual')}
                    error={errors.semestreActual?.message}
                    helperText="Semestre en el que te encuentras (1-12)"
                  />
                  <Input
                    label="Créditos Aprobados"
                    type="number"
                    {...register('creditosAprobados')}
                    error={errors.creditosAprobados?.message}
                    helperText="Total de créditos aprobados hasta la fecha"
                  />
                  <Input
                    label="Promedio Ponderado"
                    type="number"
                    step="0.01"
                    {...register('promedioPonderado')}
                    error={errors.promedioPonderado?.message}
                    helperText="Promedio ponderado acumulado (0-20)"
                  />
                  <Input
                    label="Fecha de Ingreso"
                    type="date"
                    {...register('fechaIngreso')}
                    error={errors.fechaIngreso?.message}
                    helperText="Fecha de ingreso a la carrera"
                  />
                  <div className="sm:col-span-2">
                    <Select
                      label="Estado Académico"
                      options={estadoOptions}
                      {...register('estadoAcademico')}
                      error={errors.estadoAcademico?.message}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      if (perfilData) {
                        reset({
                          semestreActual: perfilData.semestreActual ?? 0,
                          creditosAprobados: perfilData.creditosAprobados ?? 0,
                          promedioPonderado: perfilData.promedioPonderado ?? 0,
                          fechaIngreso: perfilData.fechaIngreso ?? '',
                          estadoAcademico: perfilData.estadoAcademico ?? 'ACTIVO',
                        });
                      } else {
                        refetch();
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="px-6"
                  >
                    {isSubmitting ? 'Guardando...' : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Requirements Verification */}
      <div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Verificación de Requisitos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Revisa si cumples con los requisitos para cada tipo de práctica
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tiposPractica.map((tipo) => {
                const cumple = cumpleRequisito(tipo.key);
                return (
                  <Card
                    key={tipo.key}
                    className={cn(
                      'h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
                      cumple
                        ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-500'
                        : 'border-2 border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-500'
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className={cn('p-1.5 rounded-xl', cumple ? 'bg-emerald-500' : 'bg-red-500')}>
                          {cumple ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-foreground">
                          {tipo.nombre}
                        </h3>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cumple ? 'bg-emerald-500' : 'bg-red-500')} />
                          <span className="text-sm font-medium text-muted-foreground">
                            {tipo.creditosStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cumple ? 'bg-emerald-500' : 'bg-red-500')} />
                          <span className="text-sm font-medium text-muted-foreground">
                            {tipo.semestreStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cumple ? 'bg-emerald-500' : 'bg-red-500')} />
                          <span className="text-sm font-medium text-muted-foreground">
                            Estado ACTIVO
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={cumple ? 'success' : 'danger'}
                        size="sm"
                        className="w-full justify-center font-bold py-1.5"
                      >
                        {cumple ? '✓ CUMPLE' : '✗ NO CUMPLE'}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl p-4 text-sm flex items-start gap-3 bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800">
              <GraduationCap className="h-5 w-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-300" />
              <p>
                <strong>Nota:</strong> Para solicitar una práctica, debes cumplir con los requisitos mínimos.
                Actualiza tu información para reflejar tu progreso.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { PerfilEstudiante };
export default PerfilEstudiante;

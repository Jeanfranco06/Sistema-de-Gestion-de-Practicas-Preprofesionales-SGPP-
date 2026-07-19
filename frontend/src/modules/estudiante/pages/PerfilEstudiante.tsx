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
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../../../auth/AuthContext';
import { usePerfilAcademico, useActualizarPerfilAcademico } from '../../../hooks/useUsuarios';
import { Card, CardContent, Badge, Button, Avatar, Separator } from '../../../ui';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';

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
    <div className="flex items-center justify-center min-h-[60vh]">
      <svg className="animate-spin h-12 w-12" style={{ color: 'var(--color-primary-600)' }} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/estudiante/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#0f172a' }}>
            Perfil Académico
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Mantén actualizada tu información para acceder a las prácticas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <div
              className="h-24 rounded-t-[calc(var(--radius-2xl)-1px)]"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
            />
            <CardContent className="pt-0 px-6 pb-6">
              <div className="flex flex-col items-center -mt-12 text-center">
                <Avatar
                  size="xl"
                  className="border-4 border-white shadow-lg mb-3"
                  fallback={userData?.nombres?.charAt(0) || 'E'}
                />
                <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                  {userData?.nombres} {userData?.apellidoPaterno}
                </h2>
                <p className="text-sm" style={{ color: '#64748b' }}>
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
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#eff6ff' }}>
                    <GraduationCap className="h-4 w-4" style={{ color: '#2563eb' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#64748b' }}>Semestre Actual</p>
                    <p className="text-lg font-bold" style={{ color: '#0f172a' }}>{watched.semestreActual}°</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#ecfdf5' }}>
                    <User className="h-4 w-4" style={{ color: '#059669' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#64748b' }}>Créditos Aprobados</p>
                    <p className="text-lg font-bold" style={{ color: '#0f172a' }}>{watched.creditosAprobados}</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#fffbeb' }}>
                    <Award className="h-4 w-4" style={{ color: '#d97706' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#64748b' }}>Promedio Ponderado</p>
                    <p className="text-lg font-bold" style={{ color: '#0f172a' }}>{watched.promedioPonderado || '-'}</p>
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
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#eff6ff' }}>
                  <Pencil className="h-5 w-5" style={{ color: '#2563eb' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                    Actualizar Información Académica
                  </h2>
                  <p className="text-sm" style={{ color: '#64748b' }}>
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
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                    }}
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
      <div className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#ecfdf5' }}>
                <CheckCircle className="h-5 w-5" style={{ color: '#059669' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                  Verificación de Requisitos
                </h2>
                <p className="text-sm" style={{ color: '#64748b' }}>
                  Revisa si cumples con los requisitos para cada tipo de práctica
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tiposPractica.map((tipo) => {
                const cumple = cumpleRequisito(tipo.key);
                return (
                  <div
                    key={tipo.key}
                    className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Card
                      className="h-full"
                      style={{
                        border: `2px solid ${cumple ? '#10b981' : '#ef4444'}`,
                        backgroundColor: cumple ? '#ecfdf5' : '#fef2f2',
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="p-1.5 rounded-xl"
                            style={{ backgroundColor: cumple ? '#10b981' : '#ef4444' }}
                          >
                            {cumple ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <h3 className="font-bold text-sm" style={{ color: '#0f172a' }}>
                            {tipo.nombre}
                          </h3>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: cumple ? '#10b981' : '#ef4444' }}
                            />
                            <span className="text-sm font-medium" style={{ color: '#475569' }}>
                              {tipo.creditosStr}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: cumple ? '#10b981' : '#ef4444' }}
                            />
                            <span className="text-sm font-medium" style={{ color: '#475569' }}>
                              {tipo.semestreStr}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: cumple ? '#10b981' : '#ef4444' }}
                            />
                            <span className="text-sm font-medium" style={{ color: '#475569' }}>
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
                  </div>
                );
              })}
            </div>

            <div
              className="mt-4 rounded-xl p-4 text-sm flex items-start gap-3"
              style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}
            >
              <GraduationCap className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
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

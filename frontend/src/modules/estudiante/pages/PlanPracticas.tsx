import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Send, ClipboardList, FileText, FolderArchive } from 'lucide-react';
import { useMisExpedientes } from '@/hooks/useExpedientes';
import { usePlanActivo, useRegistrarPlan, useActualizarPlan, usePresentarPlan, useSubsanarPlan } from '@/hooks/usePlanes';
import { ESTADOS_PLAN_GENERAL } from '@/lib/constants';
import { Button, Input, Textarea, Select, Card, CardContent, Badge, type BadgeProps, DatePicker } from '@/ui';
import { CardSkeleton } from '@/ui/SkeletonLoader';
import { EmptyState } from '@/ui/EmptyState';
import { cn } from '@/lib/utils';
import { showSuccess, showError, showWarning } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface Caratula {
  institucion: string;
  nombrePlan: string;
  autor: string;
  asesor: string;
  fecha: string;
}

interface DatosEmpresa {
  razonSocial: string;
  direccion: string;
  representanteLegal: string;
  telefono: string;
  correo: string;
  celular: string;
  descripcionGeneral: string;
}

interface AreaDepartamento {
  areaDepartamento: string;
  funcionarioACargo: string;
}

interface Objetivo {
  tipo: 'GENERAL' | 'ESPECIFICO';
  descripcion: string;
  orden: number;
}

interface Actividad {
  actividad: string;
  fechaInicioPrevista: string;
  fechaFinPrevista: string;
  duracionSemanas: string | number;
  orden: number;
}

interface PlanForm {
  idExpediente: string;
  caratula: Caratula;
  datosEmpresa: DatosEmpresa;
  areaDepartamento: AreaDepartamento;
  situacionProblematica: string;
  objetivos: Objetivo[];
  tecnicasProcedimientos: string;
  teoriasTecnicas: unknown[];
  cronograma: Actividad[];
}

interface Expediente {
  id: string;
  codigoExpediente: string;
  nombreEstudiante: string;
  nombreAsesor: string;
  nombreEmpresa: string;
  codigoTipoPractica: string;
}

const today = (): string => new Date().toISOString().slice(0, 10);

const emptyActivity = (): Actividad => ({
  actividad: '',
  fechaInicioPrevista: '',
  fechaFinPrevista: '',
  duracionSemanas: '',
  orden: 0,
});

const planInitial = (expediente: Expediente): PlanForm => ({
  idExpediente: expediente.id,
  caratula: {
    institucion: 'Universidad Nacional de Trujillo - Facultad de Ingeniería',
    nombrePlan: 'Plan de Actividades de Prácticas Preprofesionales',
    autor: expediente.nombreEstudiante || '',
    asesor: expediente.nombreAsesor || '',
    fecha: today(),
  },
  datosEmpresa: {
    razonSocial: expediente.nombreEmpresa || '',
    direccion: '',
    representanteLegal: '',
    telefono: '',
    correo: '',
    celular: '',
    descripcionGeneral: '',
  },
  areaDepartamento: { areaDepartamento: '', funcionarioACargo: '' },
  situacionProblematica: '',
  objetivos: [
    { tipo: 'GENERAL', descripcion: '', orden: 1 },
    { tipo: 'ESPECIFICO', descripcion: '', orden: 2 },
    { tipo: 'ESPECIFICO', descripcion: '', orden: 3 },
  ],
  tecnicasProcedimientos: '',
  teoriasTecnicas: [],
  cronograma: [emptyActivity()],
});

const mapPlan = (plan: Record<string, unknown>, expediente?: Expediente): PlanForm => ({
  idExpediente: plan.idExpediente as string,
  caratula: (plan.caratula as Caratula) ?? {
    institucion: 'Universidad Nacional de Trujillo - Facultad de Ingeniería',
    nombrePlan: 'Plan de Actividades de Prácticas Preprofesionales',
    autor: expediente?.nombreEstudiante || '',
    asesor: expediente?.nombreAsesor || '',
    fecha: today(),
  },
  datosEmpresa: (plan.datosEmpresa as DatosEmpresa) ?? {
    razonSocial: expediente?.nombreEmpresa || '',
    direccion: '',
    representanteLegal: '',
    telefono: '',
    correo: '',
    celular: '',
    descripcionGeneral: '',
  },
  areaDepartamento: (plan.areaDepartamento as AreaDepartamento) ?? { areaDepartamento: '', funcionarioACargo: '' },
  situacionProblematica: plan.situacionProblematica as string,
  objetivos: (plan.objetivos as Objetivo[]) ?? [],
  tecnicasProcedimientos: plan.tecnicasProcedimientos as string,
  teoriasTecnicas: (plan.teoriasTecnicas as unknown[]) ?? [],
  cronograma: ((plan.cronograma as Actividad[]) ?? []).map(
    ({ actividad, fechaInicioPrevista, fechaFinPrevista, duracionSemanas, orden }) => ({
      actividad,
      fechaInicioPrevista: fechaInicioPrevista || '',
      fechaFinPrevista: fechaFinPrevista || '',
      duracionSemanas: duracionSemanas || '',
      orden,
    }),
  ),
});

const estadoBadgeVariant: Record<string, BadgeProps['variant']> = {
  [ESTADOS_PLAN_GENERAL.BORRADOR]: 'neutral',
  [ESTADOS_PLAN_GENERAL.PRESENTADO]: 'info',
  [ESTADOS_PLAN_GENERAL.EN_REVISION]: 'warning',
  [ESTADOS_PLAN_GENERAL.APROBADO]: 'success',
  [ESTADOS_PLAN_GENERAL.OBSERVADO]: 'danger',
};

export function PlanPracticas() {
  const expedientesQuery = useMisExpedientes();
  const expediente = expedientesQuery.data?.[0] as Expediente | undefined;

  const planActivoQuery = usePlanActivo(expediente?.id);
  const planActivo = planActivoQuery.data as Record<string, unknown> | null | undefined;

  const planEstado = (planActivo?.estado as string) ?? null;
  const existingPlanId = (planActivo?.id as string) ?? null;

  const observacionesPendientes = useMemo(() => {
    if (!planActivo) return [];
    const obs = (planActivo.observaciones as Array<{ id?: string | number; descripcion?: string; subsanado?: boolean }> | undefined) ?? [];
    return obs.filter((o) => !o.subsanado && o.id && o.descripcion) as Array<{ id: string | number; descripcion: string }>;
  }, [planActivo]);

  const loading = expedientesQuery.isLoading || planActivoQuery.isLoading;

  const [planForm, setPlanForm] = useState<PlanForm | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const registrarMutation = useRegistrarPlan();
  const actualizarMutation = useActualizarPlan();
  const presentarMutation = usePresentarPlan();
  const subsanarMutation = useSubsanarPlan();

  const formInitialized = useRef(false);
  useEffect(() => {
    if (!formInitialized.current && expediente && planActivoQuery.status === 'success') {
      setPlanForm(planActivo ? mapPlan(planActivo, expediente) : planInitial(expediente));
      formInitialized.current = true;
    }
  }, [expediente, planActivo, planActivoQuery.status]);

  const update = (section: string, field: string, value: string) => {
    setPlanForm((current) => {
      if (!current) return current;
      return { ...current, [section]: { ...(current[section as keyof PlanForm] as Record<string, unknown>), [field]: value } };
    });
  };

  const updateList = (section: string, index: number, field: string, value: string) => {
    setPlanForm((current) => {
      if (!current) return current;
      const arr = current[section as keyof PlanForm] as Array<Record<string, unknown>>;
      return {
        ...current,
        [section]: arr.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      };
    });
  };

  const addObjective = () => {
    setPlanForm((current) => {
      if (!current) return current;
      return {
        ...current,
        objetivos: [...current.objetivos, { tipo: 'ESPECIFICO' as const, descripcion: '', orden: current.objetivos.length + 1 }],
      };
    });
  };

  const removeObjective = (index: number) => {
    setPlanForm((current) => {
      if (!current) return current;
      return {
        ...current,
        objetivos: current.objetivos.filter((_, i) => i !== index).map((item, i) => ({ ...item, orden: i + 1 })),
      };
    });
  };

  const addActivity = () => {
    setPlanForm((current) => {
      if (!current) return current;
      return { ...current, cronograma: [...current.cronograma, emptyActivity()] };
    });
  };

  const removeActivity = (index: number) => {
    setPlanForm((current) => {
      if (!current) return current;
      return {
        ...current,
        cronograma: current.cronograma.filter((_, i) => i !== index).map((item, i) => ({ ...item, orden: i + 1 })),
      };
    });
  };

  const validate = (): string | null => {
    if (!planForm) return 'No hay un plan cargado.';
    const general = planForm.objetivos.filter((item) => item.tipo === 'GENERAL').length;
    const specific = planForm.objetivos.filter((item) => item.tipo === 'ESPECIFICO').length;
    if (general < 1 || specific < 2) return 'Registra un objetivo general y al menos dos objetivos específicos.';
    if (planForm.cronograma.some((item) => !item.actividad || !item.fechaInicioPrevista || !item.fechaFinPrevista)) {
      return 'Completa actividad, fecha de inicio y fecha de fin en todo el cronograma.';
    }
    if (planForm.cronograma.some((item) => item.fechaFinPrevista < item.fechaInicioPrevista)) {
      return 'La fecha final de una actividad no puede ser anterior a su fecha inicial.';
    }
    return null;
  };

  const buildPayload = (): Record<string, unknown> => {
    if (!planForm) return {};
    const { idExpediente, ...rest } = planForm;
    void idExpediente;
    return {
      ...rest,
      objetivos: planForm.objetivos.map((item, index) => ({ ...item, orden: index + 1 })),
      cronograma: planForm.cronograma.map((item, index) => ({
        ...item,
        orden: index + 1,
        duracionSemanas: Number(item.duracionSemanas) || null,
      })),
    };
  };

  const submit = async () => {
    if (!planForm || !expediente) return;
    const error = validate();
    if (error) {
      showWarning('Completa el Plan', error);
      return;
    }
    try {
      setSubmitting(true);
      const payload = buildPayload();
      if (existingPlanId && planEstado === ESTADOS_PLAN_GENERAL.BORRADOR) {
        await actualizarMutation.mutateAsync({ id: existingPlanId, payload });
        await presentarMutation.mutateAsync(existingPlanId);
        showSuccess('Plan presentado', 'El Plan de Prácticas fue enviado para revisión.');
      } else if (existingPlanId && planEstado === ESTADOS_PLAN_GENERAL.OBSERVADO) {
        if (observacionesPendientes.length === 0) {
          showWarning('Sin observaciones', 'No hay observaciones pendientes para subsanar.');
          return;
        }
        await subsanarMutation.mutateAsync({
          id: existingPlanId,
          payload: {
            ...payload,
            observacionIds: observacionesPendientes.map((o) => Number(o.id)),
            respuesta: 'Subsanación de observaciones del plan',
          },
        });
        showSuccess('Plan subsanado', 'El Plan de Prácticas fue subsanado y reenviado para revisión.');
      } else {
        const created = await registrarMutation.mutateAsync({ ...payload, idExpediente: expediente.id });
        const planId = (created.data?.data as { id?: string })?.id;
        if (!planId) throw new Error('No se obtuvo el ID del plan creado');
        await presentarMutation.mutateAsync(planId);
        showSuccess('Plan presentado', 'El Plan de Prácticas fue enviado para revisión.');
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string; mensaje?: string } } };
      const message = apiErr.response?.data?.message ?? apiErr.response?.data?.mensaje ?? '';
      if (message.includes('Ya existe un plan activo')) {
        try {
          const result = await planActivoQuery.refetch();
          const activo = result.data as Record<string, unknown> | null | undefined;
          if (activo && activo.estado === ESTADOS_PLAN_GENERAL.BORRADOR) {
            await actualizarMutation.mutateAsync({ id: activo.id as string, payload: buildPayload() });
            await presentarMutation.mutateAsync(activo.id as string);
            showSuccess('Plan presentado', 'El Plan existente fue actualizado y presentado correctamente.');
            return;
          }
        } catch (innerErr: unknown) {
          console.error('Error al recuperar plan activo', innerErr);
        }
        showError('Plan duplicado', 'Ya existe un Plan activo que no se pudo presentar. Contacta al administrador.');
      } else {
        showError('No se pudo presentar', message || 'Revisa los datos obligatorios e intenta nuevamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 w-full">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 h-28 md:h-32 animate-pulse" />
        <CardSkeleton lines={6} />
        <CardSkeleton lines={4} />
        <CardSkeleton lines={8} />
      </div>
    );
  }

  if (!expediente || !planForm) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4 animate-in">
        <EmptyState
          icon={<FolderArchive className="h-6 w-6" />}
          title="Sin expediente activo"
          description="No tienes una práctica registrada para completar el plan de prácticas."
        />
      </div>
    );
  }

  const editable = !planEstado || planEstado === ESTADOS_PLAN_GENERAL.BORRADOR || planEstado === ESTADOS_PLAN_GENERAL.OBSERVADO;

  const alertClasses = planEstado === ESTADOS_PLAN_GENERAL.APROBADO
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
    : planEstado === ESTADOS_PLAN_GENERAL.OBSERVADO
      ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
      : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200';

  const field = (
    section: 'caratula' | 'datosEmpresa' | 'areaDepartamento',
    name: string,
    label: string,
    options?: { required?: boolean; type?: string; multiline?: boolean; minRows?: number },
  ) => {
    const value = (planForm[section] as Record<string, string | undefined>)[name] ?? '';
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(section, name, e.target.value);

    if (options?.multiline) {
      return <Textarea label={label} value={value} disabled={!editable} required={options?.required} onChange={onChange} rows={options?.minRows ?? 3} />;
    }

    return <Input label={label} value={value} disabled={!editable} required={options?.required} type={options?.type ?? 'text'} onChange={onChange} />;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 w-full">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-6 md:p-8">
        <div className="absolute right-[-20px] top-2 opacity-10 md:right-[-50px] md:top-[-50px]">
          <ClipboardList className="h-[150px] w-[150px] md:h-[300px] md:w-[300px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-full shrink-0 w-14 h-14 bg-white/15">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Plan de Prácticas</h1>
              <p className="text-sm opacity-90 mt-1">Anexo 1 · {expediente.codigoExpediente}</p>
            </div>
          </div>
          {planEstado && (
            <Badge
              variant={estadoBadgeVariant[planEstado] ?? 'neutral'}
              size="md"
              className="self-start md:self-auto shrink-0 bg-white/15 text-white border border-white/20 px-3 py-1.5"
            >
              {planEstado}
            </Badge>
          )}
        </div>
      </div>

      {planEstado && (
        <div className={cn('rounded-xl border p-4', alertClasses)}>
          <p className="text-sm font-medium">Estado del Plan: {planEstado}</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1A3A6E] text-white dark:bg-[#4A6FA5]">
                1
              </span>
              Del practicante
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">{field('caratula', 'autor', 'Nombre del practicante', { required: true })}</div>
              <div className="md:col-span-6">
                <DatePicker label="Fecha del Plan" value={planForm.caratula.fecha} disabled={!editable} required onChange={(value) => update('caratula', 'fecha', value)} />
              </div>
              <div className="md:col-span-12">{field('caratula', 'institucion', 'Institución', { required: true })}</div>
              <div className="md:col-span-12">{field('caratula', 'nombrePlan', 'Nombre del Plan', { required: true })}</div>
              <div className="md:col-span-12">{field('caratula', 'asesor', expediente.codigoTipoPractica === 'INICIAL' ? 'Docente asesor' : 'Responsable de revisión')}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1A3A6E] text-white dark:bg-[#4A6FA5]">
                2
              </span>
              Empresa o institución receptora
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">{field('datosEmpresa', 'razonSocial', 'Razón social', { required: true })}</div>
              <div className="md:col-span-6">{field('datosEmpresa', 'representanteLegal', 'Gerente o representante legal', { required: true })}</div>
              <div className="md:col-span-12">{field('datosEmpresa', 'direccion', 'Dirección', { required: true })}</div>
              <div className="md:col-span-4">{field('datosEmpresa', 'telefono', 'Teléfono', { required: true })}</div>
              <div className="md:col-span-4">{field('datosEmpresa', 'correo', 'Correo electrónico', { type: 'email' })}</div>
              <div className="md:col-span-4">{field('datosEmpresa', 'celular', 'Celular')}</div>
              <div className="md:col-span-12">{field('datosEmpresa', 'descripcionGeneral', 'Descripción general de la empresa', { required: true, multiline: true, minRows: 3 })}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1A3A6E] text-white dark:bg-[#4A6FA5]">
                3
              </span>
              Área, objetivos y fundamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">{field('areaDepartamento', 'areaDepartamento', 'Área, departamento o sección', { required: true })}</div>
              <div className="md:col-span-6">{field('areaDepartamento', 'funcionarioACargo', 'Funcionario a cargo')}</div>
            </div>
            <Textarea label="Situación problemática" value={planForm.situacionProblematica} disabled={!editable} required onChange={(e) => setPlanForm((prev) => prev ? { ...prev, situacionProblematica: e.target.value } : prev)} rows={4} />
            <Textarea label="Técnicas y procedimientos de Ingeniería Industrial" value={planForm.tecnicasProcedimientos} disabled={!editable} required onChange={(e) => setPlanForm((prev) => prev ? { ...prev, tecnicasProcedimientos: e.target.value } : prev)} rows={4} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1A3A6E] text-white dark:bg-[#4A6FA5]">
                  4
                </span>
                Objetivos o logros previstos
              </h2>
              {editable && (
                <Button variant="secondary" size="sm" onClick={addObjective}>
                  <Plus className="h-4 w-4" /> Agregar objetivo específico
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {planForm.objetivos.map((objective, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <Select
                    label="Tipo"
                    value={objective.tipo}
                    disabled={!editable || index === 0}
                    onChange={(e) => updateList('objetivos', index, 'tipo', e.target.value)}
                    options={[
                      { value: 'GENERAL', label: 'General' },
                      { value: 'ESPECIFICO', label: 'Específico' },
                    ]}
                    className="w-full sm:w-[150px] min-w-0"
                  />
                  <div className="flex-1">
                    <Input label={`Objetivo ${index + 1}`} value={objective.descripcion} disabled={!editable} required onChange={(e) => updateList('objetivos', index, 'descripcion', e.target.value)} />
                  </div>
                  {editable && index > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 mt-6"
                      onClick={() => removeObjective(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1A3A6E] text-white dark:bg-[#4A6FA5]">
                  5
                </span>
                Principales actividades y cronograma
              </h2>
              {editable && (
                <Button variant="secondary" size="sm" onClick={addActivity}>
                  <Plus className="h-4 w-4" /> Agregar actividad
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {planForm.cronograma.map((activity, index) => (
                <div key={index} className="border border-border bg-card rounded-xl p-4 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-5">
                      <Input label="Actividad" value={activity.actividad} disabled={!editable} required onChange={(e) => updateList('cronograma', index, 'actividad', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <DatePicker
                        label="Inicio"
                        value={activity.fechaInicioPrevista}
                        disabled={!editable}
                        required
                        max={activity.fechaFinPrevista || undefined}
                        onChange={(value) => updateList('cronograma', index, 'fechaInicioPrevista', value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <DatePicker
                        label="Fin"
                        value={activity.fechaFinPrevista}
                        disabled={!editable}
                        required
                        min={activity.fechaInicioPrevista || undefined}
                        onChange={(value) => updateList('cronograma', index, 'fechaFinPrevista', value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input type="number" label="Duración (semanas)" value={String(activity.duracionSemanas)} disabled={!editable} onChange={(e) => updateList('cronograma', index, 'duracionSemanas', e.target.value)} min={1} />
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      {editable && planForm.cronograma.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => removeActivity(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {planEstado === ESTADOS_PLAN_GENERAL.OBSERVADO && observacionesPendientes.length > 0 && (
          <Card>
            <CardContent>
              <h3 className="font-semibold text-foreground mb-2">Observaciones pendientes</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {observacionesPendientes.map((o) => (
                  <li key={o.id}>{o.descripcion}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {editable && (
          <div className="flex justify-end">
            <Button size="lg" onClick={() => setConfirmOpen(true)} disabled={submitting} className="w-full sm:w-auto">
              <Send className="h-4 w-4" /> {planEstado === ESTADOS_PLAN_GENERAL.OBSERVADO ? 'Subsanar y reenviar Plan' : 'Presentar Plan para revisión'}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={planEstado === ESTADOS_PLAN_GENERAL.OBSERVADO ? 'Subsanar Plan' : 'Presentar Plan'}
        description={planEstado === ESTADOS_PLAN_GENERAL.OBSERVADO
          ? '¿Estás seguro de que deseas subsanar las observaciones y reenviar el plan para revisión?'
          : '¿Estás seguro de que deseas presentar el plan para revisión?'
        }
        confirmLabel={planEstado === ESTADOS_PLAN_GENERAL.OBSERVADO ? 'Subsanar y enviar' : 'Presentar'}
        variant="warning"
        onConfirm={submit}
        loading={submitting}
      />
    </div>
  );
}

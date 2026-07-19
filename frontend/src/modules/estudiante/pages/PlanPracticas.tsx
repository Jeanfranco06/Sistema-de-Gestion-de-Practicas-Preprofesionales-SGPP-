import { useEffect, useState } from 'react';
import { Plus, Trash2, Send, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { expedientesApi } from '../../../api/expedientesApi';
import { planesApi } from '../../../api/planesApi';
import { Button, Input, Textarea, Select, Card, CardContent } from '../../../ui';

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

const mapPlan = (plan: Record<string, unknown>): PlanForm => ({
  idExpediente: plan.idExpediente as string,
  caratula: plan.caratula as Caratula,
  datosEmpresa: plan.datosEmpresa as DatosEmpresa,
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

export function PlanPracticas() {
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [plan, setPlan] = useState<PlanForm | null>(null);
  const [planEstado, setPlanEstado] = useState<string | null>(null);
  const [existingPlanId, setExistingPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await expedientesApi.getMisExpedientes();
        const expedientes: Expediente[] = response.data?.data ?? [];
        const activo = expedientes[0];
        if (!activo) {
          setLoading(false);
          return;
        }
        setExpediente(activo);
        try {
          const planResponse = await planesApi.getActivoByExpediente(activo.id);
          const existente: Record<string, unknown> | undefined = planResponse.data?.data;
          if (existente) {
            setExistingPlanId(existente.id as string);
            const estado = existente.estado as string;
            setPlanEstado(estado);
            if (estado === 'BORRADOR' && existente.caratula) {
              setPlan(mapPlan(existente));
            } else if (estado === 'BORRADOR' && !existente.caratula) {
              setPlan(planInitial(activo));
            } else {
              setPlan(mapPlan(existente));
            }
          } else {
            setPlan(planInitial(activo));
          }
        } catch {
          setPlan(planInitial(activo));
        }
      } catch (error) {
        console.error('No se pudo cargar el Plan de Prácticas', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = (section: string, field: string, value: string) => {
    setPlan((current) => {
      if (!current) return current;
      return { ...current, [section]: { ...(current[section as keyof PlanForm] as Record<string, unknown>), [field]: value } };
    });
  };

  const updateList = (section: string, index: number, field: string, value: string) => {
    setPlan((current) => {
      if (!current) return current;
      const arr = current[section as keyof PlanForm] as Array<Record<string, unknown>>;
      return {
        ...current,
        [section]: arr.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      };
    });
  };

  const addObjective = () => {
    setPlan((current) => {
      if (!current) return current;
      return {
        ...current,
        objetivos: [...current.objetivos, { tipo: 'ESPECIFICO' as const, descripcion: '', orden: current.objetivos.length + 1 }],
      };
    });
  };

  const removeObjective = (index: number) => {
    setPlan((current) => {
      if (!current) return current;
      return {
        ...current,
        objetivos: current.objetivos.filter((_, i) => i !== index).map((item, i) => ({ ...item, orden: i + 1 })),
      };
    });
  };

  const addActivity = () => {
    setPlan((current) => {
      if (!current) return current;
      return { ...current, cronograma: [...current.cronograma, emptyActivity()] };
    });
  };

  const removeActivity = (index: number) => {
    setPlan((current) => {
      if (!current) return current;
      return {
        ...current,
        cronograma: current.cronograma.filter((_, i) => i !== index).map((item, i) => ({ ...item, orden: i + 1 })),
      };
    });
  };

  const validate = (): string | null => {
    if (!plan) return 'No hay un plan cargado.';
    const general = plan.objetivos.filter((item) => item.tipo === 'GENERAL').length;
    const specific = plan.objetivos.filter((item) => item.tipo === 'ESPECIFICO').length;
    if (general < 1 || specific < 2) return 'Registra un objetivo general y al menos dos objetivos específicos.';
    if (plan.cronograma.some((item) => !item.actividad || !item.fechaInicioPrevista || !item.fechaFinPrevista)) {
      return 'Completa actividad, fecha de inicio y fecha de fin en todo el cronograma.';
    }
    if (plan.cronograma.some((item) => item.fechaFinPrevista < item.fechaInicioPrevista)) {
      return 'La fecha final de una actividad no puede ser anterior a su fecha inicial.';
    }
    return null;
  };

  const submit = async () => {
    if (!plan || !expediente) return;
    const error = validate();
    if (error) {
      await Swal.fire({ icon: 'warning', title: 'Completa el Plan', text: error });
      return;
    }
    try {
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        ...plan,
        objetivos: plan.objetivos.map((item, index) => ({ ...item, orden: index + 1 })),
        cronograma: plan.cronograma.map((item, index) => ({
          ...item,
          orden: index + 1,
          duracionSemanas: Number(item.duracionSemanas) || null,
        })),
      };
      if (existingPlanId && planEstado === 'BORRADOR') {
        await planesApi.presentar(existingPlanId);
      } else {
        const created = await planesApi.registrar(payload);
        const planId = (created.data?.data as { id?: string })?.id;
        if (!planId) throw new Error('No se obtuvo el ID del plan creado');
        await planesApi.presentar(planId);
      }
      setPlanEstado('PRESENTADO');
      await Swal.fire({ icon: 'success', title: 'Plan presentado', text: 'El Plan de Prácticas fue enviado para revisión.' });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const message = apiErr.response?.data?.message ?? '';
      if (message.includes('Ya existe un plan activo')) {
        try {
          const planResponse = await planesApi.getActivoByExpediente(expediente.id);
          const activo = planResponse.data?.data as { estado?: string; id?: string } | undefined;
          if (activo && activo.estado === 'BORRADOR') {
            await planesApi.presentar(activo.id!);
            setPlanEstado('PRESENTADO');
            await Swal.fire({ icon: 'success', title: 'Plan presentado', text: 'El Plan existente fue presentado correctamente.' });
            return;
          }
        } catch (innerErr: unknown) {
          console.error('Error al recuperar plan activo', innerErr);
        }
        await Swal.fire({ icon: 'error', title: 'Plan duplicado', text: 'Ya existe un Plan activo que no se pudo presentar. Contacta al administrador.' });
      } else {
        await Swal.fire({ icon: 'error', title: 'No se pudo presentar', text: message || 'Revisa los datos obligatorios e intenta nuevamente.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: '#1a365d' }} />
      </div>
    );
  }

  if (!expediente || !plan) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-4 md:py-8 w-full">
        <div className="rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-950/40 p-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">No tienes un expediente activo.</p>
        </div>
      </div>
    );
  }

  const editable = !planEstado || planEstado === 'BORRADOR' || planEstado === 'OBSERVADO';

  const field = (
    section: 'caratula' | 'datosEmpresa' | 'areaDepartamento',
    name: string,
    label: string,
    options?: { required?: boolean; type?: string; multiline?: boolean; minRows?: number },
  ) => {
    const value = (plan[section] as Record<string, string | undefined>)[name] ?? '';
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(section, name, e.target.value);

    if (options?.multiline) {
      return <Textarea label={label} value={value} disabled={!editable} required={options?.required} onChange={onChange} rows={options?.minRows ?? 3} />;
    }

    return <Input label={label} value={value} disabled={!editable} required={options?.required} type={options?.type ?? 'text'} onChange={onChange} />;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 md:py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Plan de Prácticas</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Anexo 1 · {expediente.codigoExpediente}</p>
      </div>

      {planEstado && (
        <div className={`rounded-xl border p-4 mb-6 ${planEstado === 'APROBADO' ? 'border-green-300 bg-green-50 dark:bg-green-950/40' : 'border-blue-300 bg-blue-50 dark:bg-blue-950/40'}`}>
          <p className="text-sm font-medium" style={{ color: planEstado === 'APROBADO' ? '#166534' : '#1e40af' }}>
            Estado del Plan: {planEstado}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>1. Del practicante</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">{field('caratula', 'autor', 'Nombre del practicante', { required: true })}</div>
              <div className="md:col-span-6">
                <Input type="date" label="Fecha del Plan" value={plan.caratula.fecha} disabled={!editable} required onChange={(e) => update('caratula', 'fecha', e.target.value)} />
              </div>
              <div className="md:col-span-12">{field('caratula', 'institucion', 'Institución', { required: true })}</div>
              <div className="md:col-span-12">{field('caratula', 'nombrePlan', 'Nombre del Plan', { required: true })}</div>
              <div className="md:col-span-12">{field('caratula', 'asesor', expediente.codigoTipoPractica === 'INICIAL' ? 'Docente asesor' : 'Responsable de revisión')}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>2. Empresa o institución receptora</h2>
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
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>3. Área, objetivos y fundamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">{field('areaDepartamento', 'areaDepartamento', 'Área, departamento o sección', { required: true })}</div>
              <div className="md:col-span-6">{field('areaDepartamento', 'funcionarioACargo', 'Funcionario a cargo')}</div>
            </div>
            <Textarea label="Situación problemática" value={plan.situacionProblematica} disabled={!editable} required onChange={(e) => setPlan({ ...plan, situacionProblematica: e.target.value })} rows={4} />
            <Textarea label="Técnicas y procedimientos de Ingeniería Industrial" value={plan.tecnicasProcedimientos} disabled={!editable} required onChange={(e) => setPlan({ ...plan, tecnicasProcedimientos: e.target.value })} rows={4} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>4. Objetivos o logros previstos</h2>
              {editable && (
                <Button variant="secondary" size="sm" onClick={addObjective}>
                  <Plus className="h-4 w-4" /> Agregar objetivo específico
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {plan.objetivos.map((objective, index) => (
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
                    className="w-[150px]"
                  />
                  <div className="flex-1">
                    <Input label={`Objetivo ${index + 1}`} value={objective.descripcion} disabled={!editable} required onChange={(e) => updateList('objetivos', index, 'descripcion', e.target.value)} />
                  </div>
                  {editable && index > 2 && (
                    <button type="button" className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors mt-6" onClick={() => removeObjective(index)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>5. Principales actividades y cronograma</h2>
              {editable && (
                <Button variant="secondary" size="sm" onClick={addActivity}>
                  <Plus className="h-4 w-4" /> Agregar actividad
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {plan.cronograma.map((activity, index) => (
                <div key={index} className="border border-[var(--color-border)] rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-5">
                      <Input label="Actividad" value={activity.actividad} disabled={!editable} required onChange={(e) => updateList('cronograma', index, 'actividad', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Input type="date" label="Inicio" value={activity.fechaInicioPrevista} disabled={!editable} required onChange={(e) => updateList('cronograma', index, 'fechaInicioPrevista', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Input type="date" label="Fin" value={activity.fechaFinPrevista} disabled={!editable} required onChange={(e) => updateList('cronograma', index, 'fechaFinPrevista', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Input type="number" label="Duración (semanas)" value={String(activity.duracionSemanas)} disabled={!editable} onChange={(e) => updateList('cronograma', index, 'duracionSemanas', e.target.value)} min={1} />
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      {editable && plan.cronograma.length > 1 && (
                        <button type="button" className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors" onClick={() => removeActivity(index)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {editable && (
          <div className="flex justify-end">
            <Button size="lg" onClick={submit} disabled={submitting} loading={submitting}>
              <Send className="h-4 w-4" /> {submitting ? 'Presentando...' : 'Presentar Plan para revisión'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Settings, Clock, BookOpen, SlidersHorizontal, Plus, Pencil, Trash2,
  Search, RefreshCw, AlertTriangle
} from 'lucide-react';
import {
  useParametrosSistema, useCreateParametro, useUpdateParametro, useDisableParametro,
  useReglasPlazo, useCreateReglaPlazo, useUpdateReglaPlazo, useDisableReglaPlazo,
  useRequisitosAcademicos, useCreateRequisitoAcademico, useUpdateRequisitoAcademico, useDisableRequisitoAcademico
} from '@/hooks/useConfiguracion';
import { useTiposPractica } from '@/hooks/usePracticas';
import {
  Button, Input, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Badge, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Tabs, TabsList, TabsTrigger, TabsContent
} from '@/ui';
import { cn } from '@/lib/utils';

const MySwal = withReactContent(Swal);

type TabValue = 'parametros' | 'reglas' | 'requisitos';

interface Parametro {
  id?: string;
  clave: string;
  valor: string;
  descripcion?: string;
  tipoDato?: string;
  activo?: boolean;
}

interface ReglaPlazo {
  id?: string;
  codigo: string;
  idTipoPractica?: string;
  nombre: string;
  descripcion?: string;
  etapaExpediente?: string;
  diasPlazo: number;
  tipoComputo?: string;
  orden?: number;
  diasProximoVencer?: number;
}

interface RequisitoAcademico {
  id?: string;
  idTipoPractica: string;
  nombre: string;
  descripcion?: string;
  obligatorio?: boolean;
}

const etapasOptions = [
  { value: 'SOLICITUD', label: 'Solicitud' },
  { value: 'PRESENTACION_PLAN', label: 'Presentación de plan' },
  { value: 'SUBSANACION', label: 'Subsanación' },
  { value: 'EJECUCION', label: 'Ejecución' },
  { value: 'INFORMES', label: 'Informes' },
  { value: 'EVALUACION', label: 'Evaluación' },
  { value: 'CIERRE', label: 'Cierre' },
];

const tipoComputoOptions = [
  { value: 'CALENDARIO', label: 'Días calendario' },
  { value: 'HABILES', label: 'Días hábiles' },
];

const tipoDatoOptions = [
  { value: 'STRING', label: 'Texto' },
  { value: 'INTEGER', label: 'Entero' },
  { value: 'BOOLEAN', label: 'Booleano' },
  { value: 'DECIMAL', label: 'Decimal' },
];

function confirmDelete(nombre: string) {
  return MySwal.fire({
    title: '¿Eliminar?',
    text: `Se desactivará "${nombre}". Esta acción se puede revertir editándolo nuevamente.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: 'var(--color-red-600, #dc2626)',
  });
}

export default function ConfiguracionSistema() {
  const [tab, setTab] = useState<TabValue>('parametros');

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 md:p-8 text-white shadow-lg">
        <Settings className="absolute -right-10 -top-10 h-48 w-48 opacity-10 hidden md:block" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">Administración</p>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Configuración del Sistema</h1>
          <p className="text-sm opacity-90">Parámetros, reglas de plazo y requisitos académicos configurables.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="flex-col">
          <TabsList className="w-full flex rounded-none border-b border-border bg-muted/30 px-4 justify-start overflow-x-auto overflow-y-hidden">
            <TabsTrigger
              value="parametros"
              onClick={() => setTab('parametros')}
              aria-selected={tab === 'parametros'}
              className="py-3 gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" /> Parámetros
            </TabsTrigger>
            <TabsTrigger
              value="reglas"
              onClick={() => setTab('reglas')}
              aria-selected={tab === 'reglas'}
              className="py-3 gap-2"
            >
              <Clock className="h-4 w-4" /> Reglas de Plazo
            </TabsTrigger>
            <TabsTrigger
              value="requisitos"
              onClick={() => setTab('requisitos')}
              aria-selected={tab === 'requisitos'}
              className="py-3 gap-2"
            >
              <BookOpen className="h-4 w-4" /> Requisitos Académicos
            </TabsTrigger>
          </TabsList>

          <div className="p-4 md:p-6">
            {tab === 'parametros' && <ParametrosTab />}
            {tab === 'reglas' && <ReglasPlazoTab />}
            {tab === 'requisitos' && <RequisitosTab />}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

function ParametrosTab() {
  const { data: parametros = [], isLoading, refetch } = useParametrosSistema();
  const create = useCreateParametro();
  const update = useUpdateParametro();
  const disable = useDisableParametro();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Parametro | null>(null);
  const [form, setForm] = useState<Parametro>({ clave: '', valor: '', descripcion: '', tipoDato: 'STRING', activo: true });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return parametros.filter((p: any) =>
      (p.clave || '').toLowerCase().includes(q) ||
      (p.valor || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q)
    );
  }, [parametros, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ clave: '', valor: '', descripcion: '', tipoDato: 'STRING', activo: true });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      clave: p.clave || '',
      valor: p.valor || '',
      descripcion: p.descripcion || '',
      tipoDato: p.tipoDato || 'STRING',
      activo: p.activo !== false,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.clave.trim() || !form.valor.trim()) {
      MySwal.fire('Campos incompletos', 'La clave y el valor son obligatorios.', 'warning');
      return;
    }
    try {
      if (editing?.id) {
        await update.mutateAsync({ id: editing.id, data: form });
      } else {
        await create.mutateAsync(form);
      }
      setDialogOpen(false);
      MySwal.fire('Guardado', 'Parámetro guardado correctamente.', 'success');
    } catch (e: any) {
      MySwal.fire('Error', e.response?.data?.message || 'No se pudo guardar el parámetro.', 'error');
    }
  };

  const remove = async (p: any) => {
    const res = await confirmDelete(p.clave);
    if (!res.isConfirmed) return;
    try {
      await disable.mutateAsync(p.id);
      MySwal.fire('Eliminado', 'Parámetro desactivado.', 'success');
    } catch (e: any) {
      MySwal.fire('Error', e.response?.data?.message || 'No se pudo eliminar el parámetro.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar parámetro..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clave</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay parámetros registrados.</TableCell></TableRow>
            ) : filtered.map((p: any) => (
              <TableRow key={p.id} className={cn(p.activo === false && 'opacity-60')}>
                <TableCell className="font-medium">{p.clave}</TableCell>
                <TableCell>{p.valor}</TableCell>
                <TableCell><Badge variant="outline" size="sm">{p.tipoDato || 'STRING'}</Badge></TableCell>
                <TableCell className="max-w-xs truncate">{p.descripcion || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="danger" size="sm" onClick={() => remove(p)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Parámetro' : 'Nuevo Parámetro'}</DialogTitle>
            <DialogDescription>Configure una clave y valor accesible desde el backend.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <Input label="Clave" value={form.clave} onChange={(e) => setForm({ ...form, clave: e.target.value })} disabled={!!editing} />
            <Input label="Valor" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
            <Select label="Tipo de dato" options={tipoDatoOptions} value={form.tipoDato} onChange={(e) => setForm({ ...form, tipoDato: e.target.value })} />
            <Input label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} loading={create.isPending || update.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReglasPlazoTab() {
  const { data: reglas = [], isLoading, refetch } = useReglasPlazo();
  const { data: tipos = [] } = useTiposPractica();
  const create = useCreateReglaPlazo();
  const update = useUpdateReglaPlazo();
  const disable = useDisableReglaPlazo();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ReglaPlazo | null>(null);
  const [form, setForm] = useState<ReglaPlazo>({
    codigo: '', idTipoPractica: '', nombre: '', descripcion: '', etapaExpediente: '',
    diasPlazo: 7, tipoComputo: 'CALENDARIO', orden: 0, diasProximoVencer: 3,
  });

  const tipoOptions = useMemo(() => [
    { value: '', label: 'Todos los tipos' },
    ...tipos.map((t: any) => ({ value: String(t.id), label: `${t.nombre} (${t.codigo})` })),
  ], [tipos]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reglas.filter((r: any) =>
      (r.codigo || '').toLowerCase().includes(q) ||
      (r.nombre || '').toLowerCase().includes(q) ||
      (r.etapaExpediente || '').toLowerCase().includes(q)
    );
  }, [reglas, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ codigo: '', idTipoPractica: '', nombre: '', descripcion: '', etapaExpediente: '',
      diasPlazo: 7, tipoComputo: 'CALENDARIO', orden: 0, diasProximoVencer: 3 });
    setDialogOpen(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      codigo: r.codigo || '',
      idTipoPractica: r.idTipoPractica ? String(r.idTipoPractica) : '',
      nombre: r.nombre || '',
      descripcion: r.descripcion || '',
      etapaExpediente: r.etapaExpediente || '',
      diasPlazo: r.diasPlazo ?? 7,
      tipoComputo: r.tipoComputo || 'CALENDARIO',
      orden: r.orden ?? 0,
      diasProximoVencer: r.diasProximoVencer ?? 3,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.codigo.trim() || !form.nombre.trim() || !form.diasPlazo) {
      MySwal.fire('Campos incompletos', 'Código, nombre y días de plazo son obligatorios.', 'warning');
      return;
    }
    const payload = { ...form, diasPlazo: Number(form.diasPlazo), orden: Number(form.orden), diasProximoVencer: Number(form.diasProximoVencer) };
    try {
      if (editing?.id) {
        await update.mutateAsync({ id: editing.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      setDialogOpen(false);
      MySwal.fire('Guardado', 'Regla de plazo guardada correctamente.', 'success');
    } catch (e: any) {
      MySwal.fire('Error', e.response?.data?.message || 'No se pudo guardar la regla.', 'error');
    }
  };

  const remove = async (r: any) => {
    const res = await confirmDelete(r.nombre);
    if (!res.isConfirmed) return;
    try {
      await disable.mutateAsync(r.id);
      MySwal.fire('Eliminado', 'Regla de plazo desactivada.', 'success');
    } catch (e: any) {
      MySwal.fire('Error', e.response?.data?.message || 'No se pudo eliminar la regla.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar regla..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nueva
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo práctica</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay reglas registradas.</TableCell></TableRow>
            ) : filtered.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.codigo}</TableCell>
                <TableCell>{r.nombre}</TableCell>
                <TableCell>{r.codigoTipoPractica || '—'}</TableCell>
                <TableCell>{r.diasPlazo} {r.tipoComputo === 'HABILES' ? 'hábiles' : 'calendario'}</TableCell>
                <TableCell>{r.etapaExpediente || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="danger" size="sm" onClick={() => remove(r)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Regla de Plazo' : 'Nueva Regla de Plazo'}</DialogTitle>
            <DialogDescription>Defina plazos normativos por tipo de práctica y etapa del expediente.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} disabled={!!editing} />
            <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Select label="Tipo de práctica" options={tipoOptions} value={form.idTipoPractica} onChange={(e) => setForm({ ...form, idTipoPractica: e.target.value })} />
            <Select label="Etapa del expediente" options={[{ value: '', label: 'Ninguna' }, ...etapasOptions]} value={form.etapaExpediente} onChange={(e) => setForm({ ...form, etapaExpediente: e.target.value })} />
            <Input label="Días de plazo" type="number" min={1} value={form.diasPlazo} onChange={(e) => setForm({ ...form, diasPlazo: Number(e.target.value) })} />
            <Select label="Tipo de cómputo" options={tipoComputoOptions} value={form.tipoComputo} onChange={(e) => setForm({ ...form, tipoComputo: e.target.value })} />
            <Input label="Orden" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} />
            <Input label="Días para 'Próximo a vencer'" type="number" min={1} value={form.diasProximoVencer} onChange={(e) => setForm({ ...form, diasProximoVencer: Number(e.target.value) })} />
            <div className="md:col-span-2">
              <Input label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} loading={create.isPending || update.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequisitosTab() {
  const { data: requisitos = [], isLoading, refetch } = useRequisitosAcademicos();
  const { data: tipos = [] } = useTiposPractica();
  const create = useCreateRequisitoAcademico();
  const update = useUpdateRequisitoAcademico();
  const disable = useDisableRequisitoAcademico();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RequisitoAcademico | null>(null);
  const [form, setForm] = useState<RequisitoAcademico>({ idTipoPractica: '', nombre: '', descripcion: '', obligatorio: true });

  const tipoOptions = useMemo(() => [
    { value: '', label: 'Seleccione...' },
    ...tipos.map((t: any) => ({ value: String(t.id), label: `${t.nombre} (${t.codigo})` })),
  ], [tipos]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return requisitos.filter((r: any) =>
      (r.nombre || '').toLowerCase().includes(q) ||
      (r.descripcion || '').toLowerCase().includes(q) ||
      (r.nombreTipoPractica || '').toLowerCase().includes(q)
    );
  }, [requisitos, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ idTipoPractica: '', nombre: '', descripcion: '', obligatorio: true });
    setDialogOpen(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      idTipoPractica: r.idTipoPractica ? String(r.idTipoPractica) : '',
      nombre: r.nombre || '',
      descripcion: r.descripcion || '',
      obligatorio: r.obligatorio !== false,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.idTipoPractica || !form.nombre.trim()) {
      MySwal.fire('Campos incompletos', 'Debe seleccionar un tipo de práctica e ingresar el nombre.', 'warning');
      return;
    }
    try {
      if (editing?.id) {
        await update.mutateAsync({ id: editing.id, data: form });
      } else {
        await create.mutateAsync(form);
      }
      setDialogOpen(false);
      MySwal.fire('Guardado', 'Requisito académico guardado correctamente.', 'success');
    } catch (e: any) {
      MySwal.fire('Error', e.response?.data?.message || 'No se pudo guardar el requisito.', 'error');
    }
  };

  const remove = async (r: any) => {
    const res = await confirmDelete(r.nombre);
    if (!res.isConfirmed) return;
    try {
      await disable.mutateAsync(r.id);
      MySwal.fire('Eliminado', 'Requisito académico desactivado.', 'success');
    } catch (e: any) {
      MySwal.fire('Error', e.response?.data?.message || 'No se pudo eliminar el requisito.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 flex gap-3 items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Estos requisitos son administrables. La validación automática de requisitos académicos sigue usando los parámetros del sistema y los datos del estudiante.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar requisito..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo práctica</TableHead>
              <TableHead>Obligatorio</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay requisitos registrados.</TableCell></TableRow>
            ) : filtered.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.nombre}</TableCell>
                <TableCell>{r.nombreTipoPractica || r.codigoTipoPractica || '—'}</TableCell>
                <TableCell>{r.obligatorio !== false ? <Badge variant="success" size="sm">Sí</Badge> : <Badge variant="outline" size="sm">No</Badge>}</TableCell>
                <TableCell className="max-w-xs truncate">{r.descripcion || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="danger" size="sm" onClick={() => remove(r)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Requisito Académico' : 'Nuevo Requisito Académico'}</DialogTitle>
            <DialogDescription>Defina un requisito asociado a un tipo de práctica.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <Select label="Tipo de práctica" options={tipoOptions} value={form.idTipoPractica} onChange={(e) => setForm({ ...form, idTipoPractica: e.target.value })} />
            <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.obligatorio}
                onChange={(e) => setForm({ ...form, obligatorio: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
              />
              Es requisito obligatorio
            </label>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} loading={create.isPending || update.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Pencil, Trash2, Search, Plus, Filter, Eye, CheckCircle2, XCircle, Building2, ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { tutoresApi, usuariosApi } from '../../../api/usuariosApi';
import { empresaApi, sedeApi } from '../../../api/sedesApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog, DialogContent, DialogTitle, DialogFooter, Select, Avatar, Tooltip, Separator } from '../../../ui';
import { Drawer } from '@mui/material';

const MySwal = withReactContent(Swal);

const ESTADO_TUTOR_OPTS = ['ACTIVO', 'INACTIVO'];
const ESTADOS_FILTRO = ['todos', 'ACTIVO', 'INACTIVO'];

interface Tutor {
  id: number;
  idUsuario: number;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  username?: string;
  correo?: string;
  email?: string;
  telefono?: string;
  cargo: string;
  area?: string;
  empresaNombre?: string;
  razonSocialEmpresa?: string;
  idEmpresa?: number;
  idSede?: number;
  nombreSede?: string;
  estadoTutor?: string;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

interface Empresa {
  id: number;
  razonSocial: string;
  activo?: boolean;
}

interface Sede {
  id: number;
  nombreSede: string;
  empresaId?: number;
  activo?: boolean;
}

interface Usuario {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  username: string;
  activo?: boolean;
}

interface TutorFormData {
  idUsuario: string;
  cargo: string;
  area: string;
  empresaNombre: string;
  idEmpresa: string;
  idSede: string;
  estadoTutor: string;
}

const getInitials = (nombre?: string, apellido?: string): string => {
  const n = nombre ? nombre.charAt(0).toUpperCase() : '';
  const a = apellido ? apellido.charAt(0).toUpperCase() : '';
  return n + a || '?';
};

export const GestionTutores = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('empresaNombre');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState('todos');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TutorFormData>({
    idUsuario: '', cargo: '', area: '', empresaNombre: '', idEmpresa: '', idSede: '', estadoTutor: 'ACTIVO'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: tutores = [], isLoading: tutoresLoading } = useQuery({
    queryKey: ['tutores'],
    queryFn: async () => {
      const res = await tutoresApi.getAll();
      return (res.data?.data || res.data || []) as Tutor[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-activas'],
    queryFn: async () => {
      const res = await empresaApi.getAll();
      const data: Empresa[] = res.data?.data || res.data || [];
      return data.filter(e => e.activo !== false);
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: sedes = [] } = useQuery({
    queryKey: ['sedes-activas'],
    queryFn: async () => {
      const res = await sedeApi.getAllActive();
      const data: Sede[] = res.data?.data || res.data || [];
      return data.filter(s => s.activo !== false);
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: usuariosDisponibles = [] } = useQuery({
    queryKey: ['usuarios-disponibles'],
    queryFn: async () => {
      const res = await usuariosApi.getAll();
      const data: Usuario[] = res.data?.data || res.data || [];
      return data.filter(u => u.activo !== false);
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: selectedTutor, isLoading: detalleLoading } = useQuery({
    queryKey: ['tutor-detalle', detalleId],
    queryFn: async () => {
      const res = await tutoresApi.getById(detalleId!);
      return (res.data?.data || res.data) as Tutor;
    },
    enabled: !!detalleId && drawerOpen,
  });

  const createTutorMutation = useMutation({
    mutationFn: (data: TutorFormData) => tutoresApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutores'] });
      MySwal.fire({ icon: 'success', title: '¡Tutor Registrado!', timer: 2000, showConfirmButton: false });
      setOpenDialog(false);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error al procesar la solicitud';
      MySwal.fire('Error', msg, 'error');
    },
  });

  const updateTutorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TutorFormData }) => tutoresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutores'] });
      MySwal.fire({ icon: 'success', title: '¡Tutor Actualizado!', timer: 2000, showConfirmButton: false });
      setOpenDialog(false);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error al procesar la solicitud';
      MySwal.fire('Error', msg, 'error');
    },
  });

  const disableMutation = useMutation({
    mutationFn: (id: number) => tutoresApi.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutores'] });
      MySwal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
    },
    onError: () => MySwal.fire('Error', 'No se pudo cambiar el estado.', 'error'),
  });

  const loadTutorDetalle = (id: number) => {
    setDetalleId(id);
    setDrawerOpen(true);
  };

  const handleOpenDialog = (tutor?: Tutor) => {
    if (tutor) {
      setIsEditing(true);
      setCurrentId(tutor.id);
      setFormData({
        idUsuario: String(tutor.idUsuario || ''),
        cargo: tutor.cargo || '',
        area: tutor.area || '',
        empresaNombre: tutor.empresaNombre || '',
        idEmpresa: String(tutor.idEmpresa || ''),
        idSede: String(tutor.idSede || ''),
        estadoTutor: tutor.estadoTutor || 'ACTIVO',
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ idUsuario: '', cargo: '', area: '', empresaNombre: '', idEmpresa: '', idSede: '', estadoTutor: 'ACTIVO' });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const validate = (): boolean => {
    const temp: Record<string, string> = {};
    if (!formData.idUsuario) temp.idUsuario = 'Seleccione un usuario';
    if (!formData.cargo?.trim()) temp.cargo = 'El cargo es requerido';
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (isEditing) {
      updateTutorMutation.mutate({ id: currentId!, data: formData });
    } else {
      createTutorMutation.mutate(formData);
    }
  };

  const handleToggleEstado = async (tutor: Tutor) => {
    const accion = tutor.activo ? 'deshabilitar' : 'habilitar';
    const result = await MySwal.fire({
      title: `¿${tutor.activo ? 'Deshabilitar' : 'Habilitar'} Tutor?`,
      text: `Se ${tutor.activo ? 'deshabilitará' : 'habilitará'} el perfil de ${tutor.nombres || ''} ${tutor.apellidoPaterno || ''}.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: tutor.activo ? '#d33' : '#3085d6',
      confirmButtonText: `Sí, ${accion}`, cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      disableMutation.mutate(tutor.id);
    }
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroEstado('todos');
    setFiltroEmpresa('todos');
  };

  const getNombreUsuario = (tutor: Tutor): string => {
    const { nombres, apellidoPaterno, apellidoMaterno } = tutor;
    if (nombres) return `${nombres} ${apellidoPaterno || ''}${apellidoMaterno ? ' ' + apellidoMaterno : ''}`;
    const user = usuariosDisponibles.find(u => u.id === tutor.idUsuario);
    return user ? `${user.nombres} ${user.apellidoPaterno}` : '—';
  };

  const getEmailUsuario = (tutor: Tutor): string => tutor.correo || tutor.email || '—';

  const getEstado = (t: Tutor): string => t.estadoTutor || (t.activo ? 'ACTIVO' : 'INACTIVO');

  const sortedTutores = useMemo(() => {
    let filtered = [...tutores];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        (t.empresaNombre || '').toLowerCase().includes(s) ||
        (t.cargo || '').toLowerCase().includes(s) ||
        ((t.nombres || '') + ' ' + (t.apellidoPaterno || '')).toLowerCase().includes(s)
      );
    }
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(t => getEstado(t) === filtroEstado);
    }
    if (filtroEmpresa !== 'todos') {
      filtered = filtered.filter(t => t.idEmpresa === parseInt(filtroEmpresa));
    }
    filtered.sort((a, b) => {
      let aVal: string | number = a[orderBy as keyof Tutor] || '';
      let bVal: string | number = b[orderBy as keyof Tutor] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [tutores, searchTerm, filtroEstado, filtroEmpresa, orderBy, order]);

  const paginatedTutores = useMemo(
    () => sortedTutores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedTutores, page, rowsPerPage]
  );

  const stats = useMemo(() => [
    { label: 'Totales', value: tutores.length, icon: <Users size={16} />, accent: 'blue' },
    { label: 'Activos', value: tutores.filter(t => getEstado(t) === 'ACTIVO').length, icon: <CheckCircle2 size={16} />, accent: 'emerald' },
    { label: 'Inactivos', value: tutores.filter(t => getEstado(t) !== 'ACTIVO').length, icon: <XCircle size={16} />, accent: 'red' },
    { label: 'Empresas', value: new Set(tutores.filter(t => t.idEmpresa).map(t => t.idEmpresa)).size, icon: <Building2 size={16} />, accent: 'violet' },
  ], [tutores]);

  const totalPages = Math.ceil(sortedTutores.length / rowsPerPage);
  const from = sortedTutores.length === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, sortedTutores.length);

  if (tutoresLoading && tutores.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="rounded-2xl p-6 md:p-8 mb-4" style={{ backgroundColor: '#1a365d', color: 'white' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} className="w-14 h-14 rounded-full flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Gestión de Tutores Externos</h2>
              <p className="text-sm opacity-85 mt-0.5">Registro y control de tutores designados por las entidades receptoras.</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} variant="primary" style={{ backgroundColor: 'white', color: '#1a365d', fontWeight: 700 }}>
            <Plus size={18} /> Nuevo Tutor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {stats.map((stat) => {
          const accentMap: Record<string, { bg: string; text: string; icon: string }> = {
            blue: { bg: '#eff6ff', text: '#1d4ed8', icon: '#3b82f6' },
            emerald: { bg: '#ecfdf5', text: '#065f46', icon: '#10b981' },
            red: { bg: '#fef2f2', text: '#991b1b', icon: '#ef4444' },
            violet: { bg: '#f5f3ff', text: '#5b21b6', icon: '#8b5cf6' },
          };
          const colors = accentMap[stat.accent] || accentMap.blue;
          return (
            <div key={stat.label} className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.icon}20` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.icon }}>{stat.icon}</div>
              <div>
                <div className="text-2xl font-bold" style={{ color: colors.text }}>{stat.value}</div>
                <div className="text-sm" style={{ color: colors.text, opacity: 0.8 }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border p-4 flex flex-wrap gap-3 mb-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-border min-w-[260px]">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa o cargo..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-1.5 text-sm min-w-[130px]"
        >
          {ESTADOS_FILTRO.map(e => (
            <option key={e} value={e}>{e === 'todos' ? 'Todos' : e === 'ACTIVO' ? 'Activo' : 'Inactivo'}</option>
          ))}
        </select>
        <select
          value={filtroEmpresa}
          onChange={(e) => setFiltroEmpresa(e.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-1.5 text-sm min-w-[190px]"
        >
          <option value="todos">Todas</option>
          {empresas.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.razonSocial}</option>
          ))}
        </select>
        <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
          <Filter size={14} /> Limpiar Filtros
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <Table>
          <TableHeader>
            <TableRow>
              {[
                { id: 'nombres', label: 'Tutor' },
                { id: 'empresaNombre', label: 'Empresa' },
                { id: 'nombreSede', label: 'Sede' },
                { id: 'cargo', label: 'Cargo / Área' },
                { id: 'correo', label: 'Contacto' },
                { id: 'estado', label: 'Estado', sortable: false },
                { id: 'acciones', label: 'Acciones', sortable: false },
              ].map(hc => (
                <TableHead key={hc.id} className="font-semibold text-[#475569]">
                  {hc.sortable !== false ? (
                    <button className="flex items-center gap-1 font-semibold text-[#475569] bg-transparent border-none cursor-pointer" onClick={() => handleSort(hc.id)}>
                      {hc.label}
                      {orderBy === hc.id ? (
                        <span>{order === 'asc' ? '↑' : '↓'}</span>
                      ) : (
                        <span className="opacity-30">↕</span>
                      )}
                    </button>
                  ) : hc.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTutores.map((tutor) => {
              const estado = getEstado(tutor);
              const activo = estado === 'ACTIVO';
              return (
                <TableRow key={tutor.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Avatar size="sm" className={activo ? 'bg-blue-500' : 'bg-gray-400'} fallback={getInitials(tutor.nombres, tutor.apellidoPaterno)} />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: activo ? '#22c55e' : '#ef4444' }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{getNombreUsuario(tutor)}</div>
                        <div className="text-xs text-muted-foreground">@{tutor.username || '—'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      <Building2 size={14} className="text-gray-400 shrink-0" />
                      <span className="text-sm">{tutor.empresaNombre || tutor.razonSocialEmpresa || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm" style={{ color: tutor.nombreSede ? 'inherit' : '#94a3b8' }}>
                      {tutor.nombreSede || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{tutor.cargo || '—'}</div>
                    {tutor.area && <div className="text-xs text-muted-foreground">{tutor.area}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getEmailUsuario(tutor)}</div>
                    {tutor.telefono && <div className="text-xs text-muted-foreground">{tutor.telefono}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={activo ? 'success' : 'danger'}>{estado}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Tooltip content="Ver Detalle">
                        <Button variant="ghost" size="sm" onClick={() => loadTutorDetalle(tutor.id)}>
                          <Eye size={16} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Editar">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(tutor)}>
                          <Pencil size={16} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={activo ? 'Deshabilitar' : 'Habilitar'}>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleEstado(tutor)}>
                          {activo ? <Trash2 size={16} /> : <CheckCircle2 size={16} />}
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {sortedTutores.length === 0 && !tutoresLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <Users size={48} className="mx-auto text-gray-400 mb-1" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No se encontraron tutores</h3>
                  <p className="text-sm text-muted-foreground">Ajusta los filtros o crea un nuevo tutor.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedTutores.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-sm text-muted-foreground">
              {from}-{to} de {sortedTutores.length}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                className="text-sm border border-border rounded-lg px-2 py-1"
              >
                {[5, 10, 25].map(n => (
                  <option key={n} value={n}>{n} filas</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
                <span className="text-sm text-muted-foreground px-2">Pág. {page + 1}</span>
                <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Siguiente</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent size="xl" className="p-0 overflow-hidden">
          <div className="bg-[#1a365d] text-white px-6 py-4 flex items-center gap-3 rounded-t-2xl">
            <div className="bg-white/15 rounded-full p-1.5"><Users size={18} /></div>
            <DialogTitle className="text-white text-lg font-semibold m-0">
              {isEditing ? 'Editar Perfil Tutor' : 'Registrar Nuevo Tutor Externo'}
            </DialogTitle>
          </div>
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            <div>
              <h4 className="text-sm font-bold text-[#1a365d] border-b-2 pb-0.5 mb-3" style={{ borderColor: '#1a365d20' }}>
                Vinculación al Sistema
              </h4>
              <Select
                label="Usuario (debe tener rol TUTOR_EXTERNO)"
                value={formData.idUsuario}
                onChange={(e) => setFormData({ ...formData, idUsuario: e.target.value })}
                disabled={isEditing}
                error={errors.idUsuario}
                options={usuariosDisponibles
                  .filter(u => !isEditing || u.id === Number(formData.idUsuario))
                  .map(u => ({ value: String(u.id), label: `${u.nombres} ${u.apellidoPaterno} (${u.username})` }))}
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1a365d] border-b-2 pb-0.5 mb-3" style={{ borderColor: '#1a365d20' }}>
                Empresa y Sede
              </h4>
              <div className="flex gap-2 flex-col md:flex-row">
                <div className="flex-1">
                  <Select
                    label="Empresa"
                    value={formData.idEmpresa}
                    onChange={(e) => {
                      const emp = empresas.find(ep => ep.id === Number(e.target.value));
                      setFormData({ ...formData, idEmpresa: e.target.value, empresaNombre: emp ? emp.razonSocial : '', idSede: '' });
                    }}
                    options={[
                      { value: '', label: 'Seleccione' },
                      ...empresas.map(emp => ({ value: String(emp.id), label: emp.razonSocial })),
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Nombre de Empresa (manual)</label>
                    <input
                      value={formData.empresaNombre}
                      onChange={(e) => setFormData({ ...formData, empresaNombre: e.target.value })}
                      className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Select
                  label="Sede (opcional)"
                  value={formData.idSede}
                  onChange={(e) => setFormData({ ...formData, idSede: e.target.value })}
                  options={[
                    { value: '', label: 'Sin sede específica' },
                    ...sedes
                      .filter(s => !formData.idEmpresa || s.empresaId === Number(formData.idEmpresa))
                      .map(s => ({ value: String(s.id), label: s.nombreSede })),
                  ]}
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1a365d] border-b-2 pb-0.5 mb-3" style={{ borderColor: '#1a365d20' }}>
                Datos del Cargo
              </h4>
              <div className="flex gap-2 flex-col md:flex-row">
                <div className="flex-1">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Cargo *</label>
                    <input
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className={`w-full rounded-xl border ${errors.cargo ? 'border-red-500' : 'border-input'} bg-card px-4 py-2.5 text-sm text-foreground`}
                    />
                    {errors.cargo && <p className="mt-1.5 text-sm text-red-600">{errors.cargo}</p>}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Área</label>
                    <input
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Select
                  label="Estado del Tutor"
                  value={formData.estadoTutor}
                  onChange={(e) => setFormData({ ...formData, estadoTutor: e.target.value })}
                  options={ESTADO_TUTOR_OPTS.map(et => ({ value: et, label: et }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="bg-[#f8fafc] border-t border-border px-6 py-4">
            <Button variant="secondary" onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>
              <Save size={16} /> {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        sx={{ zIndex: (theme: any) => theme.zIndex.drawer + 2, '& .MuiDrawer-paper': { width: 620 } }}>
        {detalleLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full mx-auto" />
          </div>
        ) : selectedTutor ? (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
                <ArrowLeft size={20} />
              </Button>
              <h3 className="text-xl font-bold">Detalle del Tutor</h3>
            </div>
            <div className="flex items-center gap-2.5 mb-4 p-2.5 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
              <Avatar size="lg" className={getEstado(selectedTutor) === 'ACTIVO' ? 'bg-blue-500' : 'bg-gray-400'} fallback={getInitials(selectedTutor.nombres, selectedTutor.apellidoPaterno)} />
              <div>
                <h4 className="text-lg font-bold">{getNombreUsuario(selectedTutor)}</h4>
                <p className="text-sm text-muted-foreground">{selectedTutor.username || ''}</p>
                <Badge variant={getEstado(selectedTutor) === 'ACTIVO' ? 'success' : 'danger'}>{getEstado(selectedTutor)}</Badge>
              </div>
            </div>
            <Separator className="my-4" />
            <h5 className="font-bold text-base mb-2">Información de Contacto</h5>
            <p className="text-sm mb-1"><strong>Correo:</strong> {getEmailUsuario(selectedTutor)}</p>
            <p className="text-sm mb-1"><strong>Teléfono:</strong> {selectedTutor.telefono || '—'}</p>
            <Separator className="my-4" />
            <h5 className="font-bold text-base mb-2">Empresa y Cargo</h5>
            <div className="rounded-xl p-2.5 mb-2 border" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--color-border)' }}>
              <p className="text-sm mb-0.5"><strong>Empresa:</strong> {selectedTutor.empresaNombre || selectedTutor.razonSocialEmpresa || '—'}</p>
              <p className="text-sm mb-0.5"><strong>Sede:</strong> {selectedTutor.nombreSede || '—'}</p>
              <p className="text-sm mb-0.5"><strong>Cargo:</strong> {selectedTutor.cargo || '—'}</p>
              <p className="text-sm"><strong>Área:</strong> {selectedTutor.area || '—'}</p>
            </div>
            <Separator className="my-4" />
            <h5 className="font-bold text-base mb-2">Auditoría</h5>
            <p className="text-xs text-muted-foreground"><strong>Registro creado:</strong> {selectedTutor.fechaCreacion ? new Date(selectedTutor.fechaCreacion).toLocaleString() : '—'}</p>
            <p className="text-xs text-muted-foreground"><strong>Última actualización:</strong> {selectedTutor.fechaActualizacion ? new Date(selectedTutor.fechaActualizacion).toLocaleString() : '—'}</p>
            <div className="mt-4 flex gap-2 flex-col">
              <Button variant="secondary" onClick={() => { setDrawerOpen(false); handleOpenDialog(selectedTutor); }}>
                <Pencil size={16} /> Editar Perfil de Tutor
              </Button>
              <Button
                variant={getEstado(selectedTutor) === 'ACTIVO' ? 'danger' : 'primary'}
                onClick={() => { setDrawerOpen(false); handleToggleEstado(selectedTutor); }}>
                {getEstado(selectedTutor) === 'ACTIVO' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                {getEstado(selectedTutor) === 'ACTIVO' ? 'Deshabilitar Tutor' : 'Habilitar Tutor'}
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </motion.div>
  );
};

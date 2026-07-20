import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase, Pencil, Trash2, CheckCircle2, Search, Plus, Filter, Ban, RefreshCw,
  BadgeCheck, Building2, Handshake
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { showSuccess, showError } from '../../../lib/toast';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, LinearProgress
} from '@mui/material';
import {
  Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Select, Avatar, Tooltip
} from '../../../ui';
import { empresaApi } from '../../../api/sedesApi';

interface Empresa {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  pais?: string;
  telefono?: string;
  email?: string;
  paginaWeb?: string;
  sectorEconomico?: string;
  tamanoEmpresa?: string;
  validado?: boolean;
  activo?: boolean;
}

interface EmpresaFormData {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  pais: string;
  telefono: string;
  email: string;
  paginaWeb: string;
  sectorEconomico: string;
  tamanoEmpresa: string;
}

const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || '';
  const second = parts.length > 1 ? parts[1]?.charAt(0) || '' : '';
  return (first + second).toUpperCase() || '?';
};

const statusColorMap = {
  validada: { badge: 'success' as const, dot: '#10b981', shadow: '#d1fae5', label: 'Validada' },
  pendiente: { badge: 'warning' as const, dot: '#f59e0b', shadow: '#fef3c7', label: 'Pendiente' },
  inactiva: { badge: 'danger' as const, dot: '#ef4444', shadow: '#fee2e2', label: 'Inactiva' },
};

interface DashboardCardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard = ({ title, action, children, className }: DashboardCardProps) => (
  <div
    className={`rounded-2xl border p-4 md:p-6 flex flex-col ${className ?? ''}`}
    style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
  >
    {(title || action) && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        {title && <h3 className="text-lg font-bold text-[var(--color-foreground)]">{title}</h3>}
        {action}
      </div>
    )}
    <div className="flex-1 flex flex-col">{children}</div>
  </div>
);

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}

const StatCard = ({ label, value, icon, accent }: StatCardProps) => {
  const accentMap: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: '#eff6ff', text: '#1e40af', icon: '#3b82f6' },
    emerald: { bg: '#ecfdf5', text: '#065f46', icon: '#10b981' },
    violet: { bg: '#f5f3ff', text: '#5b21b6', icon: '#8b5cf6' },
    orange: { bg: '#fff7ed', text: '#9a3412', icon: '#f97316' },
  };
  const colors = (accentMap[accent] ?? accentMap.blue) as { bg: string; text: string; icon: string };
  return (
    <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.icon}20` }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: colors.icon }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: colors.text }}>{value}</div>
        <div className="text-sm font-medium" style={{ color: colors.text, opacity: 0.8 }}>{label}</div>
      </div>
    </div>
  );
};

export const GestionEmpresas = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: empresas = [], isLoading: empresasLoading } = useQuery<Empresa[]>({
    queryKey: ['empresas'],
    queryFn: async () => {
      const res = await empresaApi.getAll();
      return (res.data?.data || res.data || []) as Empresa[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createEmpresaMutation = useMutation({
    mutationFn: (data: EmpresaFormData) => empresaApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['empresas'] }); },
  });

  const updateEmpresaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmpresaFormData }) => empresaApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['empresas'] }); },
  });

  const disableEmpresaMutation = useMutation({
    mutationFn: (id: number) => empresaApi.disable(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['empresas'] }); },
  });

  const validateEmpresaMutation = useMutation({
    mutationFn: (id: number) => empresaApi.validate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['empresas'] }); },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof Empresa>('razonSocial');
  const [filterEstado, setFilterEstado] = useState('todos');

  const asyncTimers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

  const initialFormState: EmpresaFormData = {
    ruc: '', razonSocial: '', nombreComercial: '', direccion: '',
    distrito: '', provincia: '', departamento: '', pais: 'Perú',
    telefono: '', email: '', paginaWeb: '', sectorEconomico: '', tamanoEmpresa: ''
  };
  const [formData, setFormData] = useState<EmpresaFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const scheduleRucCheck = useCallback((ruc: string) => {
    if (asyncTimers.current.ruc) {
      clearTimeout(asyncTimers.current.ruc);
      asyncTimers.current.ruc = null;
    }
    if (!ruc || ruc.length !== 11) return;
    asyncTimers.current.ruc = setTimeout(async () => {
      if (formData.ruc !== ruc) return;
      try {
        const res = await empresaApi.checkRuc(ruc, isEditing ? currentId ?? undefined : undefined);
        const available = res.data?.available ?? res.data?.data?.available;
        setErrors(prev => {
          const next = { ...prev };
          if (!available && !next.ruc) {
            next.ruc = 'El RUC ya está registrado por otra empresa';
          } else if (available && prev.ruc === 'El RUC ya está registrado por otra empresa') {
            delete next.ruc;
          }
          return next;
        });
      } catch {
        // Silently ignore
      }
    }, 600);
  }, [formData.ruc, isEditing, currentId]);

  useEffect(() => {
    const timers = asyncTimers.current;
    return () => {
      Object.values(timers).forEach(t => t && clearTimeout(t));
    };
  }, []);

  const handleOpenDialog = (empresa?: Empresa) => {
    if (empresa) {
      setIsEditing(true);
      setCurrentId(empresa.id);
      setFormData({
        ruc: empresa.ruc || '',
        razonSocial: empresa.razonSocial || '',
        nombreComercial: empresa.nombreComercial || '',
        direccion: empresa.direccion || '',
        distrito: empresa.distrito || '',
        provincia: empresa.provincia || '',
        departamento: empresa.departamento || '',
        pais: empresa.pais || 'Perú',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        paginaWeb: empresa.paginaWeb || '',
        sectorEconomico: empresa.sectorEconomico || '',
        tamanoEmpresa: empresa.tamanoEmpresa || ''
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData(initialFormState);
    }
    setErrors({});
    setTouched({});
    setOpenDialog(true);
  };

  const handleCloseDialog = async () => {
    if (formData.ruc || formData.razonSocial) {
      const result = await Swal.fire({
        title: '¿Descartar cambios?',
        text: 'Si cierras ahora perderás los datos ingresados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Continuar',
        confirmButtonColor: '#dc2626'
      });
      if (!result.isConfirmed) return;
    }
    setOpenDialog(false);
  };

  const validateField = (field: keyof EmpresaFormData, data: EmpresaFormData): string | null => {
    switch (field) {
      case 'ruc':
        if (!data.ruc) return 'El RUC es requerido';
        if (!/^\d{11}$/.test(data.ruc)) return 'El RUC debe tener exactamente 11 dígitos numéricos';
        return null;
      case 'razonSocial':
        if (!data.razonSocial?.trim()) return 'La razón social es requerida';
        return null;
      case 'sectorEconomico':
        if (!data.sectorEconomico?.trim()) return 'El sector económico es requerido';
        return null;
      case 'email':
        if (!data.email) return null;
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? 'Formato de correo inválido' : null;
      case 'telefono':
        if (!data.telefono) return null;
        if (!/^\d{9}$/.test(data.telefono.replace(/\D/g, ''))) return 'Debe tener al menos 9 dígitos';
        return null;
      case 'paginaWeb':
        if (!data.paginaWeb) return null;
        return !/^https?:\/\/.+/.test(data.paginaWeb) ? 'Debe comenzar con http:// o https://' : null;
      default:
        return null;
    }
  };

  const handleChange = (field: keyof EmpresaFormData, value: string) => {
    if (field === 'ruc' && asyncTimers.current.ruc) {
      clearTimeout(asyncTimers.current.ruc);
      asyncTimers.current.ruc = null;
    }
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (touched[field] || errors[field]) {
      const error = validateField(field, newData);
      setErrors(prev => {
        const next = { ...prev };
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  };

  const handleBlur = (field: keyof EmpresaFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData);
    setErrors(prev => {
      const next = { ...prev };
      if (error) {
        next[field] = error;
      } else {
        delete next[field];
      }
      return next;
    });
    if (field === 'ruc' && formData.ruc?.length === 11 && !error) {
      scheduleRucCheck(formData.ruc);
    }
  };

  const validate = (): boolean => {
    const fields: (keyof EmpresaFormData)[] = ['ruc', 'razonSocial', 'sectorEconomico', 'email', 'telefono', 'paginaWeb'];
    const tempErrors: Record<string, string> = {};
    for (const f of fields) {
      const error = validateField(f, formData);
      if (error) tempErrors[f] = error;
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      if (isEditing && currentId) {
        await updateEmpresaMutation.mutateAsync({ id: currentId, data: formData });
      } else {
        await createEmpresaMutation.mutateAsync(formData);
      }
      setOpenDialog(false);
      showSuccess(isEditing ? '¡Empresa Actualizada!' : '¡Empresa Creada!', 'Los datos se guardaron correctamente.');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || "Ya existe una empresa con ese RUC o hubo un error en el servidor.";
      showError('Error al guardar', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Deshabilitar Empresa?',
      text: "Esta acción evitará que la empresa pueda participar en nuevos convenios.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, deshabilitar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await disableEmpresaMutation.mutateAsync(id);
        showSuccess('¡Deshabilitada!', 'La empresa ha sido deshabilitada correctamente.');
      } catch {
        showError('Error', 'No se pudo deshabilitar la empresa.');
      }
    }
  };

  const handleValidate = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Validar Empresa?',
      text: "Al validar esta empresa, confirmas que su perfil es legítimo.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#2e7d32',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, validar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await validateEmpresaMutation.mutateAsync(id);
        showSuccess('¡Validada!', 'La empresa ha sido validada exitosamente.');
      } catch {
        showError('Error', 'No se pudo validar la empresa.');
      }
    }
  };

  const handleSort = (property: keyof Empresa) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const limpiarFiltros = () => { setSearchTerm(''); setFilterEstado('todos'); };

  const filteredEmpresas = useMemo(() => {
    let filtered = empresas.filter(emp => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        emp.razonSocial?.toLowerCase().includes(q) ||
        emp.ruc?.includes(q) ||
        emp.nombreComercial?.toLowerCase().includes(q);
      const matchesFilter = filterEstado === 'todos' ||
        (filterEstado === 'validadas' && emp.validado && emp.activo) ||
        (filterEstado === 'pendientes' && !emp.validado && emp.activo) ||
        (filterEstado === 'inactivas' && !emp.activo);
      return matchesSearch && matchesFilter;
    });
    filtered.sort((a, b) => {
      let aVal = a[orderBy] || '';
      let bVal = b[orderBy] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [empresas, searchTerm, filterEstado, orderBy, order]);

  const paginatedEmpresas = filteredEmpresas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const kpis = useMemo(() => ({
    total: empresas.length,
    validadas: empresas.filter(e => e.validado && e.activo).length,
    pendientes: empresas.filter(e => !e.validado && e.activo).length,
    inactivas: empresas.filter(e => !e.activo).length,
  }), [empresas]);

  const stats = [
    { label: 'Total Empresas', value: kpis.total, icon: <Briefcase size={18} />, accent: 'blue' },
    { label: 'Validadas', value: kpis.validadas, icon: <CheckCircle2 size={18} />, accent: 'emerald' },
    { label: 'Pendientes', value: kpis.pendientes, icon: <Filter size={18} />, accent: 'violet' },
    { label: 'Inactivas', value: kpis.inactivas, icon: <Ban size={18} />, accent: 'orange' },
  ];

  const headCells = [
    { id: 'razonSocial' as keyof Empresa, label: 'Empresa', sortable: true },
    { id: 'ruc' as keyof Empresa, label: 'RUC', sortable: true },
    { id: 'sectorEconomico' as keyof Empresa, label: 'Sector', sortable: true },
    { id: 'email' as keyof Empresa, label: 'Contacto', sortable: true },
    { id: 'validado' as keyof Empresa, label: 'Estado', sortable: true },
    { id: 'acciones', label: 'Acciones', sortable: false }
  ];

  const totalPages = Math.ceil(filteredEmpresas.length / rowsPerPage);
  const from = filteredEmpresas.length === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, filteredEmpresas.length);

  if (empresasLoading && empresas.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6">
        <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
        <p className="text-[var(--color-muted-foreground)] font-medium">Cargando directorio de empresas...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="px-2 sm:px-4 md:px-6 py-4 md:py-6 w-full pb-8">
        <div className="relative rounded-3xl p-6 md:p-8 mb-6 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ backgroundColor: '#1a365d', color: 'white' }}>
          <div className="absolute right-4 md:right-12 top-0 md:-top-6 opacity-10 pointer-events-none">
            <Building2 size={160} />
          </div>
          <div className="relative z-10">
            <span className="text-xs font-semibold tracking-widest opacity-80 block mb-1">ENTIDADES EXTERNAS</span>
            <h1 className="text-2xl md:text-4xl font-extrabold mb-2">Gestión de Empresas</h1>
            <p className="text-sm md:text-base opacity-90">Administra el catálogo de empresas aliadas y valida sus perfiles.</p>
          </div>
          <div className="relative z-10 flex items-center gap-3 self-end md:self-center">
            <Button onClick={() => handleOpenDialog()} style={{ backgroundColor: 'white', color: '#1a365d', fontWeight: 700 }}>
              <Plus size={18} /> Nueva Empresa
            </Button>
            <Tooltip content="Actualizar Directorio">
              <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['empresas'] })} style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <RefreshCw size={18} />
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        <DashboardCard className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-[var(--color-card)] rounded-xl px-3 py-2 border border-[var(--color-border)] min-w-[260px] flex-1">
              <Search size={16} className="text-[var(--color-muted-foreground)] shrink-0" />
              <input
                type="text"
                placeholder="Buscar por razón social, RUC o nombre comercial..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-transparent border-none outline-none text-sm w-full text-[var(--color-foreground)]"
              />
            </div>
            <div className="min-w-[180px] w-full sm:w-auto">
              <Select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos los estados' },
                  { value: 'validadas', label: 'Validadas' },
                  { value: 'pendientes', label: 'Pendientes' },
                  { value: 'inactivas', label: 'Inactivas' },
                ]}
              />
            </div>
            <Tooltip content="Limpiar filtros">
              <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
                <Filter size={16} />
              </Button>
            </Tooltip>
          </div>
        </DashboardCard>

        <DashboardCard className="p-0 overflow-hidden relative">
          {empresasLoading && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <LinearProgress sx={{ height: 3, '& .MuiLinearProgress-bar': { backgroundColor: '#1a365d' }, backgroundColor: '#e2e8f0' }} />
            </div>
          )}
          <div className="overflow-x-auto transition-opacity duration-200" style={{ opacity: empresasLoading ? 0.6 : 1 }}>
            <Table className="min-w-[800px]">
              <TableHeader style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <TableRow>
                  {headCells.map((hc) => (
                    <TableHead key={hc.id} className="font-bold text-[#475569] py-3">
                      {hc.sortable ? (
                        <button className="flex items-center gap-1 font-bold text-[#475569] bg-transparent border-none cursor-pointer" onClick={() => handleSort(hc.id as keyof Empresa)}>
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
                {paginatedEmpresas.map((emp) => {
                  const statusKey: keyof typeof statusColorMap = !emp.activo ? 'inactiva' : emp.validado ? 'validada' : 'pendiente';
                  const sc = statusColorMap[statusKey];
                  return (
                    <TableRow key={emp.id} className="hover:bg-[var(--color-muted)]/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            size="sm"
                            className={emp.validado ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}
                            fallback={getInitials(emp.razonSocial)}
                          />
                          <div>
                            <div className="font-bold text-sm text-[var(--color-foreground)]">{emp.razonSocial}</div>
                            <div className="text-xs text-[var(--color-muted-foreground)]">{emp.nombreComercial || emp.sectorEconomico || '—'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-[var(--color-muted-foreground)] font-mono">{emp.ruc}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral">{emp.sectorEconomico || '—'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-[var(--color-muted-foreground)]">{emp.email || '—'}</div>
                        <div className="text-xs text-[var(--color-muted-foreground)] opacity-70">{emp.telefono || ''}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.dot, boxShadow: `0 0 0 2px ${sc.shadow}` }} />
                          <span className="text-xs font-bold" style={{ color: sc.dot }}>{sc.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          {!emp.validado && emp.activo && (
                            <Tooltip content="Validar Perfil">
                              <Button variant="ghost" size="sm" onClick={() => handleValidate(emp.id)} style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
                                <CheckCircle2 size={16} />
                              </Button>
                            </Tooltip>
                          )}
                          <Tooltip content="Editar Empresa">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(emp)} style={{ color: '#64748b', backgroundColor: '#f8fafc' }}>
                              <Pencil size={16} />
                            </Button>
                          </Tooltip>
                          {emp.activo && (
                            <Tooltip content="Deshabilitar Empresa">
                              <Button variant="ghost" size="sm" onClick={() => handleDisable(emp.id)} style={{ color: '#ef4444', backgroundColor: '#fef2f2' }}>
                                <Trash2 size={16} />
                              </Button>
                            </Tooltip>
                          )}
                          <Tooltip content="Registrar Convenio">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/convenios?empresaId=${emp.id}`)} style={{ color: '#8b5cf6', backgroundColor: '#f5f3ff' }}>
                              <Handshake size={16} />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredEmpresas.length === 0 && !empresasLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-[var(--color-muted-foreground)]">
                        <Search size={48} className="opacity-50" />
                        <h3 className="text-lg font-semibold">No se encontraron empresas</h3>
                        <p className="text-sm">Intenta ajustar los filtros o agrega una nueva empresa.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredEmpresas.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-sm text-[var(--color-muted-foreground)]">
                {from}-{to} de {filteredEmpresas.length}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  className="text-sm border border-[var(--color-border)] rounded-lg px-2 py-1 bg-[var(--color-card)]"
                >
                  {[10, 25, 50].map(n => <option key={n} value={n}>{n} filas</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
                  <span className="text-sm text-[var(--color-muted-foreground)] px-2">Pág. {page + 1}</span>
                  <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Siguiente</Button>
                </div>
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      <Dialog open={openDialog} onClose={() => handleCloseDialog()} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
        <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', py: 2.5, px: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BadgeCheck /> <span className="font-bold text-lg">{isEditing ? 'Editar Empresa' : 'Registrar Nueva Empresa'}</span>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col md:flex-row gap-4">
              <TextField
                sx={{ flex: 1 }} label="RUC *" value={formData.ruc}
                onChange={e => handleChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                onBlur={() => handleBlur('ruc')}
                error={!!errors.ruc} helperText={errors.ruc || "11 dígitos numéricos"}
                slotProps={{ htmlInput: { maxLength: 11 } }}
              />
              <TextField
                sx={{ flex: 2 }} label="Razón Social *" value={formData.razonSocial}
                onChange={e => handleChange('razonSocial', e.target.value)}
                onBlur={() => handleBlur('razonSocial')}
                error={!!errors.razonSocial} helperText={errors.razonSocial || ' '}
                slotProps={{ htmlInput: { maxLength: 200 } }}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <TextField sx={{ flex: 1 }} label="Nombre Comercial" value={formData.nombreComercial} onChange={e => handleChange('nombreComercial', e.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
              <TextField sx={{ flex: 1 }} label="Sector Económico *" value={formData.sectorEconomico} onChange={e => handleChange('sectorEconomico', e.target.value)} onBlur={() => handleBlur('sectorEconomico')} error={!!errors.sectorEconomico} helperText={errors.sectorEconomico || ' '} slotProps={{ htmlInput: { maxLength: 100 } }} />
            </div>

            <div className="text-sm font-bold text-[#1a365d] border-b border-[var(--color-border)] pb-1 mt-1">
              Contacto y Ubicación
            </div>

            <TextField fullWidth label="Dirección" value={formData.direccion} onChange={e => handleChange('direccion', e.target.value)} slotProps={{ htmlInput: { maxLength: 300 } }} helperText=" " />

            <div className="flex flex-col md:flex-row gap-4">
              <TextField sx={{ flex: 1 }} label="Distrito" value={formData.distrito} onChange={e => handleChange('distrito', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
              <TextField sx={{ flex: 1 }} label="Provincia" value={formData.provincia} onChange={e => handleChange('provincia', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
              <TextField sx={{ flex: 1 }} label="Departamento" value={formData.departamento} onChange={e => handleChange('departamento', e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <TextField sx={{ flex: 1 }} label="Teléfono" value={formData.telefono} onChange={e => handleChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))} onBlur={() => handleBlur('telefono')} error={!!errors.telefono} helperText={errors.telefono || '9 dígitos'} slotProps={{ htmlInput: { maxLength: 9 } }} />
              <TextField sx={{ flex: 1 }} label="Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} error={!!errors.email} helperText={errors.email || ' '} slotProps={{ htmlInput: { maxLength: 100 } }} />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <TextField sx={{ flex: 1 }} label="Página Web" value={formData.paginaWeb} onChange={e => handleChange('paginaWeb', e.target.value)} onBlur={() => handleBlur('paginaWeb')} error={!!errors.paginaWeb} helperText={errors.paginaWeb || 'Ej: https://ejemplo.com'} slotProps={{ htmlInput: { maxLength: 200 } }} />
              <TextField sx={{ flex: 1 }} label="Tamaño Empresa" value={formData.tamanoEmpresa} onChange={e => handleChange('tamanoEmpresa', e.target.value)} placeholder="Ej: Grande, Pyme" slotProps={{ htmlInput: { maxLength: 50 } }} helperText=" " />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button variant="secondary" onClick={() => setOpenDialog(false)} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSave} disabled={submitting} loading={submitting}>
            {submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

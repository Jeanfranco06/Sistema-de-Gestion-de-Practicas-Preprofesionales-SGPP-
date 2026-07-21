import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Pencil, Trash2, Bell, Search, Plus, Handshake, Filter, RefreshCw,
  CheckCircle2, XCircle, Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import { showSuccess, showError } from '../../../lib/toast';
import {
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, LinearProgress
} from '@mui/material';
import {
  Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Select, Avatar, Tooltip
} from '../../../ui';
import { convenioApi } from '../../../api/sedesApi';
import { useEmpresas } from '../../../hooks/useSedes';
import { COLORS } from '@/lib/constants';

interface Empresa {
  id: number;
  razonSocial: string;
  activo?: boolean;
  validado?: boolean;
}

interface Convenio {
  id: number;
  empresaId?: number;
  numeroConvenio: string;
  fechaInicio?: string;
  fechaFin?: string;
  objetivo?: string;
  razonSocialEmpresa?: string;
  vigente?: boolean;
  activo?: boolean;
}

interface ConvenioFormData {
  empresaId: string;
  numeroConvenio: string;
  fechaInicio: string;
  fechaFin: string;
  objetivo: string;
}

const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || '';
  const second = parts.length > 1 ? parts[1]?.charAt(0) || '' : '';
  return (first + second).toUpperCase() || '?';
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
    blue: { bg: '#eff6ff', text: '#1e40af', icon: COLORS.INFO },
    emerald: { bg: '#ecfdf5', text: '#065f46', icon: COLORS.SUCCESS },
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

export const GestionConvenios = () => {
  const [searchParams] = useSearchParams();
  const empresaIdParam = searchParams.get('empresaId');
  const queryClient = useQueryClient();

  const { data: empresasRaw = [] } = useEmpresas();
  const empresas = useMemo(() => (empresasRaw as Empresa[]).filter(e => e.activo && e.validado), [empresasRaw]);

  const { data: convenios = [], isLoading: conveniosLoading } = useQuery<Convenio[]>({
    queryKey: ['convenios'],
    queryFn: async () => {
      const res = await convenioApi.getAllActive();
      return (res.data?.data || res.data || []) as Convenio[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: expiring = [] } = useQuery<Convenio[]>({
    queryKey: ['convenios', 'por-vencer', 30],
    queryFn: async () => {
      const res = await convenioApi.getExpiring(30);
      return (res.data?.data || res.data || []) as Convenio[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createConvenioMutation = useMutation({
    mutationFn: (data: ConvenioFormData) => convenioApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      queryClient.invalidateQueries({ queryKey: ['convenios', 'por-vencer', 30] });
    },
  });

  const updateConvenioMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConvenioFormData }) => convenioApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      queryClient.invalidateQueries({ queryKey: ['convenios', 'por-vencer', 30] });
    },
  });

  const disableConvenioMutation = useMutation({
    mutationFn: (id: number) => convenioApi.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      queryClient.invalidateQueries({ queryKey: ['convenios', 'por-vencer', 30] });
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof Convenio>('fechaInicio');
  const [filterVigencia, setFilterVigencia] = useState('todos');

  const initialFormState: ConvenioFormData = { empresaId: '', numeroConvenio: '', fechaInicio: '', fechaFin: '', objetivo: '' };
  const [formData, setFormData] = useState<ConvenioFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (empresaIdParam && empresas.length > 0) {
      const exists = empresas.some(e => e.id === Number(empresaIdParam));
      if (exists) {
        setFormData(prev => ({ ...prev, empresaId: String(empresaIdParam) }));
        setOpenDialog(true);
      }
    }
  }, [empresaIdParam, empresas]);

  const handleOpenDialog = (convenio?: Convenio) => {
    if (convenio) {
      setIsEditing(true);
      setCurrentId(convenio.id);
      setFormData({
        empresaId: String(convenio.empresaId || ''),
        numeroConvenio: convenio.numeroConvenio || '',
        fechaInicio: convenio.fechaInicio || '',
        fechaFin: convenio.fechaFin || '',
        objetivo: convenio.objetivo || ''
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData(initialFormState);
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = async () => {
    if (formData.numeroConvenio || formData.objetivo) {
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

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.empresaId) tempErrors.empresaId = "Debe seleccionar una empresa";
    if (!formData.numeroConvenio) tempErrors.numeroConvenio = "El número es requerido";
    if (!formData.fechaInicio) tempErrors.fechaInicio = "Fecha de inicio requerida";
    if (!formData.fechaFin) tempErrors.fechaFin = "Fecha de fin requerida";
    if (formData.fechaInicio && formData.fechaFin && new Date(formData.fechaInicio) > new Date(formData.fechaFin)) {
      tempErrors.fechaFin = "La fecha fin debe ser posterior a la fecha inicio";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      if (isEditing && currentId) {
        await updateConvenioMutation.mutateAsync({ id: currentId, data: formData });
      } else {
        await createConvenioMutation.mutateAsync(formData);
      }
      setOpenDialog(false);
      showSuccess(isEditing ? '¡Convenio Actualizado!' : '¡Convenio Registrado!', 'El convenio se guardó correctamente.');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || "Error al guardar. Verifica que el número de convenio no esté duplicado.";
      showError('Error al guardar', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Anular Convenio?',
      text: "Esta acción marcará el convenio como inactivo y no podrá utilizarse.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await disableConvenioMutation.mutateAsync(id);
        showSuccess('¡Anulado!', 'El convenio ha sido anulado correctamente.');
      } catch {
        showError('Error', 'No se pudo anular el convenio.');
      }
    }
  };

  const handleSort = (property: keyof Convenio) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredConvenios = useMemo(() => {
    let filtered = convenios.filter(conv => {
      const matchesSearch = conv.numeroConvenio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            conv.razonSocialEmpresa?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterVigencia === 'todos' ||
                            (filterVigencia === 'vigentes' && conv.vigente) ||
                            (filterVigencia === 'vencidos' && !conv.vigente);
      return Boolean(matchesSearch) && matchesFilter;
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
  }, [convenios, searchTerm, filterVigencia, orderBy, order]);

  const paginatedConvenios = filteredConvenios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const kpis = useMemo(() => ({
    total: convenios.length,
    vigentes: convenios.filter(c => c.vigente).length,
    porVencer: expiring.length,
    vencidos: convenios.filter(c => !c.vigente).length,
  }), [convenios, expiring]);

  const stats = [
    { label: 'Total Convenios', value: kpis.total, icon: <Handshake size={18} />, accent: 'blue' },
    { label: 'Vigentes', value: kpis.vigentes, icon: <CheckCircle2 size={18} />, accent: 'emerald' },
    { label: 'Por vencer (30d)', value: kpis.porVencer, icon: <Clock size={18} />, accent: 'orange' },
    { label: 'Vencidos', value: kpis.vencidos, icon: <XCircle size={18} />, accent: 'violet' },
  ];

  const headCells = [
    { id: 'numeroConvenio' as keyof Convenio, label: 'N° Convenio', sortable: true },
    { id: 'razonSocialEmpresa' as keyof Convenio, label: 'Empresa', sortable: true },
    { id: 'fechaInicio' as keyof Convenio, label: 'Vigencia', sortable: true },
    { id: 'vigente' as keyof Convenio, label: 'Estado', sortable: true },
    { id: 'acciones', label: 'Acciones', sortable: false }
  ];

  const totalPages = Math.ceil(filteredConvenios.length / rowsPerPage);
  const from = filteredConvenios.length === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, filteredConvenios.length);

  if (conveniosLoading && convenios.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6">
        <CircularProgress size={48} thickness={4} sx={{ color: COLORS.UNT_BLUE_DARK }} />
        <p className="text-[var(--color-muted-foreground)] font-medium">Cargando convenios...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="px-2 sm:px-4 md:px-6 py-4 md:py-6 w-full pb-8">
        <div className="relative rounded-3xl p-6 md:p-8 mb-6 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--color-primary)] text-white">
          <div className="absolute right-4 md:right-12 top-0 md:-top-6 opacity-10 pointer-events-none">
            <Handshake size={160} />
          </div>
          <div className="relative z-10">
            <span className="text-xs font-semibold tracking-widest opacity-80 block mb-1">ENTIDADES EXTERNAS</span>
            <h1 className="text-2xl md:text-4xl font-extrabold mb-2">Gestión de Convenios</h1>
            <p className="text-sm md:text-base opacity-90">Registra y monitorea los convenios activos con las empresas aliadas.</p>
          </div>
          <div className="relative z-10 flex items-center gap-3 self-end md:self-center">
            <Button onClick={() => handleOpenDialog()} className="bg-white text-[var(--color-primary)] font-bold">
              <Plus size={18} /> Nuevo Convenio
            </Button>
            <Tooltip content="Actualizar Directorio">
              <Button variant="ghost" size="sm" onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['convenios'] });
                queryClient.invalidateQueries({ queryKey: ['convenios', 'por-vencer', 30] });
              }} style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <RefreshCw size={18} />
              </Button>
            </Tooltip>
          </div>
        </div>

        {expiring.length > 0 && (
          <Alert
            severity="warning"
            icon={<Bell fontSize="inherit" />}
            sx={{ mb: 4, borderRadius: 2, boxShadow: 1, border: '1px solid #ffcc80' }}
          >
            <strong>¡Atención!</strong> Hay {expiring.length} convenio(s) próximo(s) a vencer en los siguientes 30 días. Por favor, revise las renovaciones para no afectar las prácticas de los estudiantes.
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        <DashboardCard className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-[var(--color-card)] rounded-xl px-3 py-2 border border-[var(--color-border)] min-w-[260px] flex-1">
              <Search size={16} className="text-[var(--color-muted-foreground)] shrink-0" />
              <input
                type="text"
                placeholder="Buscar por número o empresa..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-transparent border-none outline-none text-sm w-full text-[var(--color-foreground)]"
              />
            </div>
            <div className="min-w-[180px] w-full sm:w-auto">
              <Select
                value={filterVigencia}
                onChange={(e) => setFilterVigencia(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos los Estados' },
                  { value: 'vigentes', label: 'Convenios Vigentes' },
                  { value: 'vencidos', label: 'Convenios Vencidos' },
                ]}
              />
            </div>
            <Tooltip content="Limpiar filtros">
              <Button variant="secondary" size="sm" onClick={() => { setSearchTerm(''); setFilterVigencia('todos'); }}>
                <Filter size={16} />
              </Button>
            </Tooltip>
          </div>
        </DashboardCard>

        <DashboardCard className="p-0 overflow-hidden relative">
          {conveniosLoading && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <LinearProgress sx={{ height: 3, '& .MuiLinearProgress-bar': { backgroundColor: COLORS.UNT_BLUE_DARK }, backgroundColor: COLORS.BORDER }} />
            </div>
          )}
          <div className="overflow-x-auto transition-opacity duration-200" style={{ opacity: conveniosLoading ? 0.6 : 1 }}>
            <Table className="min-w-[700px]">
              <TableHeader style={{ backgroundColor: COLORS.BG_LIGHT, borderBottom: `2px solid ${COLORS.BORDER}` }}>
                <TableRow>
                  {headCells.map((hc) => (
                    <TableHead key={hc.id} className="font-bold text-[#475569] py-3">
                      {hc.sortable ? (
                        <button className="flex items-center gap-1 font-bold text-[#475569] bg-transparent border-none cursor-pointer" onClick={() => handleSort(hc.id as keyof Convenio)}>
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
                {paginatedConvenios.map((conv) => {
                  const isExpiring = expiring.some(e => e.id === conv.id);
                  return (
                    <TableRow key={conv.id} className="hover:bg-[var(--color-muted)]/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            size="sm"
                            className={conv.vigente ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}
                            fallback={getInitials(conv.numeroConvenio)}
                          />
                          <div>
                            <div className="font-bold text-sm text-[var(--color-foreground)]">{conv.numeroConvenio}</div>
                            {conv.objetivo && (
                              <div className="text-xs text-[var(--color-muted-foreground)] line-clamp-1 max-w-[250px]">{conv.objetivo}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-[var(--color-primary)]">{conv.razonSocialEmpresa}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{conv.fechaInicio} al {conv.fechaFin}</div>
                        {isExpiring && <Badge variant="warning" size="sm" className="mt-1">Por vencer</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: conv.vigente ? COLORS.SUCCESS : COLORS.DANGER, boxShadow: `0 0 0 2px ${conv.vigente ? COLORS.SUCCESS_BG : COLORS.DANGER_BG}` }} />
                          <span className="text-xs font-bold" style={{ color: conv.vigente ? COLORS.SUCCESS : COLORS.DANGER }}>{conv.vigente ? 'Vigente' : 'Vencido'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Tooltip content="Editar Convenio">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(conv)} style={{ color: COLORS.MUTED, backgroundColor: COLORS.BG_LIGHT }}>
                              <Pencil size={16} />
                            </Button>
                          </Tooltip>
                          {conv.activo && (
                            <Tooltip content="Anular Convenio">
                              <Button variant="ghost" size="sm" onClick={() => handleDisable(conv.id)} style={{ color: COLORS.DANGER, backgroundColor: '#fef2f2' }}>
                                <Trash2 size={16} />
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredConvenios.length === 0 && !conveniosLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-[var(--color-muted-foreground)]">
                        <Search size={48} className="opacity-50" />
                        <h3 className="text-lg font-semibold">No se encontraron convenios</h3>
                        <p className="text-sm">Intenta ajustar los filtros o registra un nuevo convenio.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredConvenios.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-sm text-[var(--color-muted-foreground)]">
                {from}-{to} de {filteredConvenios.length}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  className="text-sm border border-[var(--color-border)] rounded-lg px-2 py-1 bg-[var(--color-card)]"
                >
                  {[5, 10, 25].map(n => <option key={n} value={n}>{n} filas</option>)}
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
        <DialogTitle sx={{ bgcolor: COLORS.UNT_BLUE_DARK, color: COLORS.WHITE, py: 2.5, px: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Handshake /> <span className="font-bold text-lg">{isEditing ? 'Editar Convenio' : 'Registrar Nuevo Convenio'}</span>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: COLORS.WHITE }}>
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-[2]">
                <Select
                  label="Empresa Aliada (Validada) *"
                  value={formData.empresaId}
                  onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
                  disabled={isEditing}
                  error={errors.empresaId || ''}
                  options={[
                    { value: '', label: 'Seleccione una empresa' },
                    ...empresas.map(emp => ({ value: String(emp.id), label: emp.razonSocial }))
                  ]}
                />
              </div>
              <TextField
                sx={{ flex: 1 }} label="Número de Convenio *" value={formData.numeroConvenio}
                onChange={e => setFormData({ ...formData, numeroConvenio: e.target.value })}
                error={!!errors.numeroConvenio} helperText={errors.numeroConvenio || ' '}
                slotProps={{ htmlInput: { maxLength: 50 } }}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <TextField
                sx={{ flex: 1 }} label="Fecha Inicio *" type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.fechaInicio} onChange={e => setFormData({ ...formData, fechaInicio: e.target.value })}
                error={!!errors.fechaInicio} helperText={errors.fechaInicio || ' '}
              />
              <TextField
                sx={{ flex: 1 }} label="Fecha Fin *" type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.fechaFin} onChange={e => setFormData({ ...formData, fechaFin: e.target.value })}
                error={!!errors.fechaFin} helperText={errors.fechaFin || ' '}
              />
            </div>

            <TextField
              fullWidth label="Objetivo / Descripción" multiline rows={4}
              value={formData.objetivo} onChange={e => setFormData({ ...formData, objetivo: e.target.value })}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: COLORS.BG_LIGHT, borderTop: `1px solid ${COLORS.BORDER}` }}>
          <Button variant="secondary" onClick={() => setOpenDialog(false)} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSave} disabled={submitting} loading={submitting}>
            {submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

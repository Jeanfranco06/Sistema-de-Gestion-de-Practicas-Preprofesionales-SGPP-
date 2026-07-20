import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Search, RefreshCw, FileText, AlertTriangle, Award, FileSearch, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useExpedientes } from '../../../hooks/useExpedientes';
import { expedientesApi } from '../../../api/expedientesApi';
import { secretariaApi, usuariosApi } from '../../../api/usuariosApi';
import { Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Tooltip, Avatar } from '../../../ui';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

const MySwal = withReactContent(Swal);

interface Expediente {
  id: string;
  codigoExpediente: string;
  nombreEstudiante: string;
  apellidoEstudiante: string;
  nombreTipoPractica: string;
  codigoTipoPractica: string;
  nombreEmpresa: string;
  nombreSede: string;
  estado: string;
  idAsesor: string;
  nombreAsesor?: string;
  resolucionAsesor?: string;
}

interface Docente {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  username: string;
}

interface EstadoColor {
  chip: string;
  dot: string;
  bg: string;
  label: string;
}

const estadoColorMap: Record<string, EstadoColor> = {
  SOLICITADO: { chip: 'primary', dot: '#3b82f6', bg: '#eff6ff', label: 'Solicitado' },
  EMPRESA_SEDE_ASIGNADA: { chip: 'info', dot: '#06b6d4', bg: '#ecfeff', label: 'Empresa Asignada' },
  VALIDADO_SECRETARIA: { chip: 'success', dot: '#10b981', bg: '#ecfdf5', label: 'Validado (listo para carta)' },
  CARTA_PRESENTACION_EMITIDA: { chip: 'info', dot: '#6366f1', bg: '#eef2ff', label: 'Carta Emitida' },
  ASESOR_ASIGNADO: { chip: 'info', dot: '#8b5cf6', bg: '#f5f3ff', label: 'Asesor Asignado' },
  COMITE_ASIGNADO: { chip: 'info', dot: '#8b5cf6', bg: '#f5f3ff', label: 'Comité Asignado' },
  CARTA_ACEPTACION_PRESENTADA: { chip: 'info', dot: '#6366f1', bg: '#eef2ff', label: 'Carta Acept. Presentada' },
  PLAN_PRESENTADO: { chip: 'default', dot: '#f59e0b', bg: '#fef3c7', label: 'Plan Presentado' },
  EN_REVISION: { chip: 'warning', dot: '#f59e0b', bg: '#fffbeb', label: 'En Revisión' },
  OBSERVADO: { chip: 'error', dot: '#ef4444', bg: '#fef2f2', label: 'Observado' },
  SUBSANADO: { chip: 'info', dot: '#06b6d4', bg: '#ecfeff', label: 'Subsanado' },
  APROBADO: { chip: 'success', dot: '#10b981', bg: '#ecfdf5', label: 'Aprobado' },
  EN_EJECUCION: { chip: 'success', dot: '#10b981', bg: '#ecfdf5', label: 'En Ejecución' },
  EVALUADO: { chip: 'success', dot: '#059669', bg: '#d1fae5', label: 'Evaluado' },
  CERRADO: { chip: 'default', dot: '#64748b', bg: '#f1f5f9', label: 'Cerrado' },
};

const getInitials = (nombre: string, apellido: string) => {
  const n = nombre ? nombre.charAt(0).toUpperCase() : '';
  const a = apellido ? apellido.charAt(0).toUpperCase() : '';
  return n + a || '?';
};

const StatCard = ({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) => {
  const accentColors: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: '#eff6ff', text: '#1e40af', icon: '#3b82f6' },
    emerald: { bg: '#ecfdf5', text: '#065f46', icon: '#10b981' },
    violet: { bg: '#f5f3ff', text: '#5b21b6', icon: '#8b5cf6' },
    orange: { bg: '#fff7ed', text: '#9a3412', icon: '#f97316' }
  };
  const colors = accentColors[accent] || accentColors.blue;
  return (
    <div className="flex-1 min-w-[140px] p-2.5 rounded-3xl border" style={{ backgroundColor: colors.bg, borderColor: `${colors.icon}20` }}>
      <div className="flex items-center gap-1.5">
        <div style={{ color: colors.icon }}>{icon}</div>
        <div>
          <div className="text-2xl font-extrabold" style={{ color: colors.text }}>{value}</div>
          <div className="text-xs font-semibold" style={{ color: colors.text, opacity: 0.8 }}>{label}</div>
        </div>
      </div>
    </div>
  );
};

export const RecepcionAdministrativa = () => {
  const { data: expedientes = [], isLoading } = useExpedientes();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExp, setSelectedExp] = useState<Expediente | null>(null);
  const [incidenciaText, setIncidenciaText] = useState('');

  const [openAsesorDialog, setOpenAsesorDialog] = useState(false);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [selectedAsesor, setSelectedAsesor] = useState<Docente | null>(null);
  const [resolucionAsesor, setResolucionAsesor] = useState('');
  const [asignandoAsesor, setAsignandoAsesor] = useState(false);

  const [validarDialog, setValidarDialog] = useState<{ open: boolean; expediente: Expediente | null }>({ open: false, expediente: null });
  const [validarChecks, setValidarChecks] = useState({
    empresaAsignada: false,
    sedeConfirmada: false,
    convenioVigente: false,
    estudianteActivo: false,
    tipoPracticaDefinido: false,
  });
  const [validarObs, setValidarObs] = useState('');

  const { mutateAsync: validarMutacion } = useMutation({
    mutationFn: (id: string) => expedientesApi.validarExpediente(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes'] }),
  });

  const { mutateAsync: registrarIncidenciaMutation } = useMutation({
    mutationFn: ({ id, incidencia }: { id: string; incidencia: string }) => secretariaApi.registrarIncidencia(id, incidencia),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes'] }),
  });

  const { mutateAsync: asignarAsesorMutation } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { idAsesor: string; resolucion: string } }) => expedientesApi.asignarAsesor(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expedientes'] }),
  });

  const loadDocentes = async () => {
    try {
      const resp = await usuariosApi.getAll({ params: { rol: 'DOCENTE_ASESOR' } });
      if (resp.data.success) {
        setDocentes(resp.data.data || []);
      }
    } catch (error) {
      console.error("Error loading docentes:", error);
    }
  };

  const handleOpenValidarDialog = (exp: Expediente) => {
    setValidarChecks({
      empresaAsignada: !!exp.nombreEmpresa,
      sedeConfirmada: !!exp.nombreSede,
      convenioVigente: true,
      estudianteActivo: true,
      tipoPracticaDefinido: !!exp.codigoTipoPractica,
    });
    setValidarObs('');
    setValidarDialog({ open: true, expediente: exp });
  };

  const handleValidarExpediente = async () => {
    const exp = validarDialog.expediente;
    if (!exp) return;

    const allChecked = Object.values(validarChecks).every(Boolean);
    if (!allChecked) {
      MySwal.fire('Incompleto', 'Debe marcar todos los requisitos administrativos antes de validar.', 'warning');
      return;
    }

    const res = await MySwal.fire({
      title: '¿Validar expediente?',
      html: `<div style="text-align:left; font-size:0.9rem;">
                <p>Se marcará el expediente <b>${exp.codigoExpediente}</b> como <b>listo para emisión de Carta de Presentación</b>.</p>
                <p style="color:#666; margin-top:8px;">Estudiante: <b>${exp.nombreEstudiante} ${exp.apellidoEstudiante}</b></p>
                <p style="color:#666;">Empresa: <b>${exp.nombreEmpresa || '—'}</b></p>
              </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, validar',
      cancelButtonText: 'Cancelar',
      customClass: { confirmButton: 'wow-btn' }
    });

    if (!res.isConfirmed) return;

    try {
      MySwal.fire({ title: 'Validando...', didOpen: () => MySwal.showLoading() });
      await validarMutacion(exp.id);
      setValidarDialog({ open: false, expediente: null });
      MySwal.fire('Validado', 'Expediente marcado como listo para emisión de Carta de Presentación.', 'success');
    } catch {
      MySwal.fire('Error', 'No se pudo validar el expediente.', 'error');
    }
  };

  const handleOpenIncidencia = (exp: Expediente) => {
    setSelectedExp(exp);
    setIncidenciaText('');
    setOpenDialog(true);
  };

  const handleRegistrarIncidencia = async () => {
    if (!incidenciaText.trim() || !selectedExp) return;
    try {
      await registrarIncidenciaMutation({ id: selectedExp.id, incidencia: incidenciaText });
      setOpenDialog(false);
      MySwal.fire('Éxito', 'Incidencia registrada', 'success');
    } catch {
      MySwal.fire('Error', 'No se pudo registrar la incidencia.', 'error');
    }
  };

  const handleOpenAsesorDialog = async (exp: Expediente) => {
    setSelectedExp(exp);
    setSelectedAsesor(null);
    setResolucionAsesor('');
    await loadDocentes();
    setOpenAsesorDialog(true);
  };

  const handleAsignarAsesor = async () => {
    if (!selectedAsesor || !resolucionAsesor.trim() || !selectedExp) return;
    try {
      setAsignandoAsesor(true);
      await asignarAsesorMutation({ id: selectedExp.id, payload: { idAsesor: selectedAsesor.id, resolucion: resolucionAsesor.trim() } });
      setOpenAsesorDialog(false);
      MySwal.fire('Éxito', 'Asesor asignado correctamente.', 'success');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo asignar el asesor.';
      MySwal.fire('Error', msg, 'error');
    } finally {
      setAsignandoAsesor(false);
    }
  };

  const filteredExpedientes = expedientes.filter((exp: Expediente) => {
    const q = searchTerm.toLowerCase();
    return (exp.nombreEstudiante + " " + exp.apellidoEstudiante).toLowerCase().includes(q)
      || exp.codigoExpediente.toLowerCase().includes(q)
      || (exp.estado || '').toLowerCase().includes(q)
      || (exp.nombreTipoPractica || '').toLowerCase().includes(q);
  });

  const kpis = useMemo(() => {
    return {
      total: expedientes.length,
      paraCarta: expedientes.filter((e: Expediente) => e.estado === 'VALIDADO_SECRETARIA').length,
      evaluados: expedientes.filter((e: Expediente) => e.estado === 'EVALUADO').length,
      observados: expedientes.filter((e: Expediente) => e.estado === 'OBSERVADO').length,
    };
  }, [expedientes]);

  const stats = [
    { label: 'Total Trámites', value: kpis.total, icon: <FileSearch size={20} />, accent: 'blue' },
    { label: 'Listas para Carta', value: kpis.paraCarta, icon: <FileText size={20} />, accent: 'violet' },
    { label: 'Expedientes Evaluados', value: kpis.evaluados, icon: <Award size={20} />, accent: 'emerald' },
    { label: 'Observados / Alertas', value: kpis.observados, icon: <AlertTriangle size={20} />, accent: 'orange' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-4 py-6 w-full" style={{ paddingBottom: 32 }}>
        <div className="rounded-2xl p-6 md:p-8 mb-4 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ backgroundColor: '#1a365d', color: 'white' }}>
          <div className="absolute right-[-20px] top-[10px] md:right-[20px] md:top-[-20px] opacity-10">
            <FileSearch size={220} />
          </div>
          <div className="relative z-10 w-full">
            <div className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-0.5">Secretaría Académica</div>
            <h1 className="text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] font-extrabold mb-1.5 break-words">Recepción Administrativa</h1>
            <div className="text-sm opacity-90">Gestión de documentos, emisión de cartas de presentación y constancias.</div>
          </div>
          <div className="flex gap-2 items-center relative z-10 self-end md:self-center">
            <Tooltip content="Actualizar listado">
              <button onClick={() => queryClient.invalidateQueries({ queryKey: ['expedientes'] })}
                className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <RefreshCw size={20} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="rounded-xl border p-4 md:p-6 mb-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="w-full md:w-[400px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-foreground)' }} />
              <input
                type="text"
                placeholder="Buscar por estudiante, código, estado o tipo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: 'var(--color-foreground)' }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden relative" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <LinearProgress sx={{ height: 3, '& .MuiLinearProgress-bar': { bgcolor: '#1a365d' }, bgcolor: '#e2e8f0' }} />
            </div>
          )}
          <div className="overflow-x-auto" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s ease-in-out' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  {['Código', 'Estudiante', 'Tipo', 'Empresa/Sede', 'Estado', 'Acciones'].map(h => (
                    <TableHead key={h} className="font-bold py-2" style={{ color: '#475569', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpedientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((exp: Expediente) => {
                  const sc = estadoColorMap[exp.estado] || { dot: '#94a3b8', bg: '#f1f5f9', label: exp.estado };
                  return (
                    <TableRow key={exp.id} className="hover:bg-muted/50">
                      <TableCell>
                        <span className="font-semibold text-sm font-mono" style={{ color: 'var(--color-muted-foreground)' }}>{exp.codigoExpediente}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Avatar fallback={getInitials(exp.nombreEstudiante, exp.apellidoEstudiante)}
                            className="w-9 h-9 text-xs font-bold border" style={{ backgroundColor: sc.bg, color: sc.dot, borderColor: `${sc.dot}40` }} />
                          <span className="text-sm font-bold">{exp.nombreEstudiante} {exp.apellidoEstudiante}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={exp.codigoTipoPractica === 'INICIAL' ? 'info' : 'default'} size="sm">
                          {exp.nombreTipoPractica || (exp.codigoTipoPractica === 'INICIAL' ? 'Práctica Inicial' : exp.codigoTipoPractica === 'FINAL' ? 'Práctica Final' : exp.codigoTipoPractica || '—')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>{exp.nombreEmpresa || '—'}</div>
                        {exp.nombreSede && <div className="text-xs" style={{ color: 'var(--color-muted-foreground)', opacity: 0.7 }}>{exp.nombreSede}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.dot }} />
                          <span className="text-xs font-bold" style={{ color: sc.dot }}>{sc.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-0.5 flex-wrap justify-center">
                          {exp.estado === 'EMPRESA_SEDE_ASIGNADA' && (
                            <Tooltip content="Validar requisitos administrativos y marcar como listo para carta">
                              <Button size="sm" variant="primary"
                                onClick={() => handleOpenValidarDialog(exp)}
                                className="whitespace-nowrap px-1 text-[0.7rem]">
                                Validar
                              </Button>
                            </Tooltip>
                          )}
                          {exp.estado === 'CARTA_ACEPTACION_PRESENTADA' && exp.codigoTipoPractica === 'INICIAL' && !exp.idAsesor && (
                            <Tooltip content="Asignar Docente Asesor">
                              <Button size="sm" variant="secondary"
                                onClick={() => handleOpenAsesorDialog(exp)}
                                className="whitespace-nowrap px-1 text-[0.7rem]">
                                + Asesor
                              </Button>
                            </Tooltip>
                          )}
                          <Tooltip content="Registrar Incidencia / Observación">
                            <Button size="sm" variant="danger"
                              onClick={() => handleOpenIncidencia(exp)}
                              className="whitespace-nowrap px-1 text-[0.7rem]">
                              Incidencia
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredExpedientes.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-1" style={{ color: '#94a3b8' }}>
                        <FileSearch size={48} className="opacity-50" />
                        <div className="font-semibold text-base">No hay trámites documentarios</div>
                        <div className="text-sm">Aún no hay expedientes registrados en el sistema.</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              <span>Filas por pág:</span>
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                className="border rounded px-2 py-1 text-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
                {[5, 10, 25].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              <span>{page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredExpedientes.length)} de {filteredExpedientes.length}</span>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-2 py-1 border rounded disabled:opacity-50" style={{ borderColor: 'var(--color-border)' }}>‹</button>
              <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * rowsPerPage >= filteredExpedientes.length}
                className="px-2 py-1 border rounded disabled:opacity-50" style={{ borderColor: 'var(--color-border)' }}>›</button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
        <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, px: 4 }}>
          <AlertTriangle size={20} /> <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Registrar Incidencia</span>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
          <div style={{ marginTop: 4, marginBottom: 12, padding: 8, backgroundColor: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
              <strong>Expediente:</strong> {selectedExp?.codigoExpediente}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
              <strong>Estudiante:</strong> {selectedExp?.nombreEstudiante} {selectedExp?.apellidoEstudiante}
            </div>
          </div>
          <TextField
            fullWidth multiline rows={4}
            label="Detalle de la Incidencia"
            placeholder="Describa el problema u observación..."
            value={incidenciaText}
            onChange={(e) => setIncidenciaText(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button variant="secondary" onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleRegistrarIncidencia} disabled={!incidenciaText.trim()}>Registrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAsesorDialog} onClose={() => setOpenAsesorDialog(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
        <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, px: 4 }}>
          <UserPlus size={20} /> <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Asignar Docente Asesor</span>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
            <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                <strong>Expediente:</strong> {selectedExp?.codigoExpediente}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                <strong>Estudiante:</strong> {selectedExp?.nombreEstudiante} {selectedExp?.apellidoEstudiante}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                <strong>Tipo:</strong> {selectedExp?.nombreTipoPractica || 'Práctica Inicial'}
              </div>
            </div>
            <Autocomplete
              value={selectedAsesor}
              onChange={(_, newValue) => setSelectedAsesor(newValue)}
              options={docentes}
              getOptionLabel={(opt) => `${opt.nombres || ''} ${opt.apellidoPaterno || ''} ${opt.apellidoMaterno || ''}`.trim() || opt.username || ''}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              renderInput={(params) => (
                <TextField {...params} label="Seleccionar Docente Asesor *" placeholder="Buscar por nombre..." />
              )}
              noOptionsText="No se encontraron docentes asesores"
            />
            <TextField
              fullWidth label="Resolución / N° de Designación *"
              placeholder="Ej: RES-001-2025-UNT/DEII"
              value={resolucionAsesor}
              onChange={(e) => setResolucionAsesor(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button variant="secondary" onClick={() => setOpenAsesorDialog(false)} disabled={asignandoAsesor}>Cancelar</Button>
          <Button variant="primary" onClick={handleAsignarAsesor} disabled={!selectedAsesor || !resolucionAsesor.trim() || asignandoAsesor}
            className="px-3 font-bold" style={{ backgroundColor: '#1a365d' }}>
            {asignandoAsesor ? 'Asignando...' : 'Asignar Asesor'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={validarDialog.open} onClose={() => setValidarDialog({ open: false, expediente: null })}
        maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
        <DialogTitle sx={{ bgcolor: '#1a365d', color: 'white', py: 2.5, px: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Validar Requisitos Administrativos</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Marque cada requisito antes de validar</div>
          </div>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: '20px !important' }}>
          {validarDialog.expediente && (
            <div>
              <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Expediente</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{validarDialog.expediente.codigoExpediente}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', marginTop: 2 }}>
                  {validarDialog.expediente.nombreEstudiante} {validarDialog.expediente.apellidoEstudiante}
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 6, color: '#1a365d' }}>
                Checklist de validación:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FormControlLabel
                  control={<Checkbox checked={validarChecks.empresaAsignada}
                    onChange={(e) => setValidarChecks(prev => ({ ...prev, empresaAsignada: e.target.checked }))}
                    color="success" size="small" />}
                  label={<span style={{ fontSize: '0.875rem' }}>Empresa receptora asignada y confirmada</span>}
                />
                <FormControlLabel
                  control={<Checkbox checked={validarChecks.sedeConfirmada}
                    onChange={(e) => setValidarChecks(prev => ({ ...prev, sedeConfirmada: e.target.checked }))}
                    color="success" size="small" />}
                  label={<span style={{ fontSize: '0.875rem' }}>Sede de práctica confirmada</span>}
                />
                <FormControlLabel
                  control={<Checkbox checked={validarChecks.convenioVigente}
                    onChange={(e) => setValidarChecks(prev => ({ ...prev, convenioVigente: e.target.checked }))}
                    color="success" size="small" />}
                  label={<span style={{ fontSize: '0.875rem' }}>Convenio con la empresa vigente</span>}
                />
                <FormControlLabel
                  control={<Checkbox checked={validarChecks.estudianteActivo}
                    onChange={(e) => setValidarChecks(prev => ({ ...prev, estudianteActivo: e.target.checked }))}
                    color="success" size="small" />}
                  label={<span style={{ fontSize: '0.875rem' }}>Estudiante/egresado activo en sistema</span>}
                />
                <FormControlLabel
                  control={<Checkbox checked={validarChecks.tipoPracticaDefinido}
                    onChange={(e) => setValidarChecks(prev => ({ ...prev, tipoPracticaDefinido: e.target.checked }))}
                    color="success" size="small" />}
                  label={<span style={{ fontSize: '0.875rem' }}>Tipo de práctica definido (Inicial / Final / Profesional)</span>}
                />
              </div>

              <Divider sx={{ my: 2 }} />

              <TextField
                label="Observaciones (opcional)"
                fullWidth multiline rows={2} size="small"
                value={validarObs}
                onChange={(e) => setValidarObs(e.target.value)}
                placeholder="Ej: Todos los documentos administrativos están completos..."
              />
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button variant="secondary" onClick={() => setValidarDialog({ open: false, expediente: null })}>Cancelar</Button>
          <Button variant="primary" onClick={handleValidarExpediente}
            disabled={!Object.values(validarChecks).every(Boolean)}
            className="px-3 font-bold" style={{ backgroundColor: '#10b981' }}>
            Validar y Marcar Listo para Carta
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

import { useState, useMemo } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { showSuccess, showError, showWarning, showLoading, closeLoading } from '../../../lib/toast';
import { Search, RefreshCw, FileText, AlertTriangle, Award, FileSearch, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useExpedientes } from '../../../hooks/useExpedientes';
import { expedientesApi } from '../../../api/expedientesApi';
import { ESTADOS_EXPEDIENTE, COLORS } from '../../../lib/constants';
import { secretariaApi, usuariosApi } from '../../../api/usuariosApi';
import { Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Tooltip, Avatar, Dialog, DialogContent, DialogFooter, Select, Textarea } from '../../../ui';
import { Card, CardContent } from '../../../ui/Card';
import { Progress } from '../../../ui/Progress';
import { Separator } from '../../../ui/Separator';
import { cn } from '../../../lib/utils';

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
  SOLICITADO: { chip: 'info', dot: COLORS.INFO, bg: '#eff6ff', label: 'Solicitado' },
  EMPRESA_SEDE_ASIGNADA: { chip: 'info', dot: '#06b6d4', bg: '#ecfeff', label: 'Empresa Asignada' },
  VALIDADO_SECRETARIA: { chip: 'success', dot: COLORS.SUCCESS, bg: '#ecfdf5', label: 'Validado (listo para carta)' },
  CARTA_PRESENTACION_EMITIDA: { chip: 'info', dot: '#6366f1', bg: '#eef2ff', label: 'Carta Emitida' },
  ASESOR_ASIGNADO: { chip: 'info', dot: '#8b5cf6', bg: '#f5f3ff', label: 'Asesor Asignado' },
  COMITE_ASIGNADO: { chip: 'info', dot: '#8b5cf6', bg: '#f5f3ff', label: 'Comité Asignado' },
  CARTA_ACEPTACION_PRESENTADA: { chip: 'info', dot: '#6366f1', bg: '#eef2ff', label: 'Carta Acept. Presentada' },
  PLAN_PRESENTADO: { chip: 'default', dot: COLORS.WARNING, bg: '#fef3c7', label: 'Plan Presentado' },
  EN_REVISION: { chip: 'warning', dot: COLORS.WARNING, bg: '#fffbeb', label: 'En Revisión' },
  OBSERVADO: { chip: 'error', dot: COLORS.DANGER, bg: '#fef2f2', label: 'Observado' },
  SUBSANADO: { chip: 'info', dot: '#06b6d4', bg: '#ecfeff', label: 'Subsanado' },
  APROBADO: { chip: 'success', dot: COLORS.SUCCESS, bg: '#ecfdf5', label: 'Aprobado' },
  EN_EJECUCION: { chip: 'success', dot: COLORS.SUCCESS, bg: '#ecfdf5', label: 'En Ejecución' },
  EVALUADO: { chip: 'success', dot: '#059669', bg: '#d1fae5', label: 'Evaluado' },
  CERRADO: { chip: 'default', dot: COLORS.MUTED, bg: '#f1f5f9', label: 'Cerrado' },
};

const getInitials = (nombre: string, apellido: string) => {
  const n = nombre ? nombre.charAt(0).toUpperCase() : '';
  const a = apellido ? apellido.charAt(0).toUpperCase() : '';
  return n + a || '?';
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => (
  <Card className="flex-1 min-w-[140px] p-3">
    <CardContent className="p-0 flex items-center gap-3">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', color)}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold text-foreground">{value}</div>
        <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      </div>
    </CardContent>
  </Card>
);

const CheckboxItem = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
        checked ? 'bg-emerald-600 border-emerald-600 dark:bg-emerald-700 dark:border-emerald-700' : 'border-border bg-card dark:bg-muted'
      )}>
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
    <span className="text-sm text-foreground group-hover:text-foreground/80">{label}</span>
  </label>
);

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
      showWarning('Incompleto', 'Debe marcar todos los requisitos administrativos antes de validar.');
      return;
    }

    try {
      showLoading('Validando...');
      await validarMutacion(exp.id);
      setValidarDialog({ open: false, expediente: null });
      closeLoading();
      showSuccess('Validado', 'Expediente marcado como listo para emisión de Carta de Presentación.');
    } catch {
      closeLoading();
      showError('Error', 'No se pudo validar el expediente.');
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
      showSuccess('Éxito', 'Incidencia registrada');
    } catch {
      showError('Error', 'No se pudo registrar la incidencia.');
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
      showSuccess('Éxito', 'Asesor asignado correctamente.');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo asignar el asesor.';
      showError('Error', msg);
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
      paraCarta: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.VALIDADO_SECRETARIA).length,
      evaluados: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.EVALUADO).length,
      observados: expedientes.filter((e: Expediente) => e.estado === ESTADOS_EXPEDIENTE.OBSERVADO).length,
    };
  }, [expedientes]);

  const stats = [
    { label: 'Total Trámites', value: kpis.total, icon: <FileSearch size={18} />, color: 'bg-[#1A3A6E] text-white dark:bg-[#4A6FA5] dark:text-white' },
    { label: 'Listas para Carta', value: kpis.paraCarta, icon: <FileText size={18} />, color: 'bg-primary-600 text-slate-900 dark:bg-primary-700 dark:text-slate-900' },
    { label: 'Expedientes Evaluados', value: kpis.evaluados, icon: <Award size={18} />, color: 'bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-50' },
    { label: 'Observados / Alertas', value: kpis.observados, icon: <AlertTriangle size={18} />, color: 'bg-amber-500 text-slate-900 dark:bg-amber-600 dark:text-slate-900' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-7xl mx-auto px-4 py-6 w-full" style={{ paddingBottom: 32 }}>
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 md:p-8 mb-4 text-white shadow-lg">
          <div className="absolute right-[-20px] top-[10px] md:right-[20px] md:top-[-20px] opacity-10">
            <FileSearch size={220} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full">
              <div className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-0.5">Secretaría Académica</div>
              <h1 className="text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] font-extrabold mb-1.5 break-words">Recepción Administrativa</h1>
              <div className="text-sm opacity-90">Gestión de documentos, emisión de cartas de presentación y constancias.</div>
            </div>
            <div className="flex gap-2 items-center relative z-10 self-end md:self-center">
              <Tooltip content="Actualizar listado">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['expedientes'] })}
                  className="h-9 w-9 bg-white/10 text-white border-white/20 hover:bg-white/20 p-0"
                >
                  <RefreshCw size={20} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Search */}
        <Card className="p-4 mb-4">
          <CardContent className="p-0 w-full md:w-[400px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por estudiante, código, estado o tipo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden relative">
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <Progress value={100} size="sm" />
            </div>
          )}
          <div className={cn('overflow-x-auto transition-opacity duration-200', isLoading ? 'opacity-60' : 'opacity-100')}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  {['Código', 'Estudiante', 'Tipo', 'Empresa/Sede', 'Estado', 'Acciones'].map(h => (
                    <TableHead key={h} className="font-bold text-muted-foreground">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpedientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((exp: Expediente) => {
                  const sc = estadoColorMap[exp.estado] || { dot: '#94a3b8', bg: '#f1f5f9', label: exp.estado };
                  return (
                    <TableRow key={exp.id}>
                      <TableCell>
                        <span className="font-semibold text-sm font-mono text-muted-foreground">{exp.codigoExpediente}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar fallback={getInitials(exp.nombreEstudiante, exp.apellidoEstudiante)}
                            className="w-9 h-9 text-xs font-bold border"
                            style={{ backgroundColor: sc.bg, color: sc.dot, borderColor: `${sc.dot}40` }} />
                          <span className="text-sm font-bold text-foreground">{exp.nombreEstudiante} {exp.apellidoEstudiante}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={exp.codigoTipoPractica === 'INICIAL' ? 'info' : 'default'} size="sm">
                          {exp.nombreTipoPractica || (exp.codigoTipoPractica === 'INICIAL' ? 'Práctica Inicial' : exp.codigoTipoPractica === 'FINAL' ? 'Práctica Final' : exp.codigoTipoPractica || '—')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-muted-foreground">{exp.nombreEmpresa || '—'}</div>
                        {exp.nombreSede && <div className="text-xs text-muted-foreground opacity-70">{exp.nombreSede}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.dot }} />
                          <span className="text-xs font-bold" style={{ color: sc.dot }}>{sc.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap justify-center">
                          {exp.estado === ESTADOS_EXPEDIENTE.EMPRESA_SEDE_ASIGNADA && (
                            <Tooltip content="Validar requisitos administrativos y marcar como listo para carta">
                              <Button size="sm" variant="primary" onClick={() => handleOpenValidarDialog(exp)} className="whitespace-nowrap text-xs">
                                Validar
                              </Button>
                            </Tooltip>
                          )}
                          {exp.estado === ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA && exp.codigoTipoPractica === 'INICIAL' && !exp.idAsesor && (
                            <Tooltip content="Asignar Docente Asesor">
                              <Button size="sm" variant="secondary" onClick={() => handleOpenAsesorDialog(exp)} className="whitespace-nowrap text-xs">
                                <UserPlus size={14} /> Asesor
                              </Button>
                            </Tooltip>
                          )}
                          <Tooltip content="Registrar Incidencia / Observación">
                            <Button size="sm" variant="danger" onClick={() => handleOpenIncidencia(exp)} className="whitespace-nowrap text-xs">
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-1">
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
          <div className="flex items-center justify-between px-4 py-2 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Filas por pág:</span>
              <Select
                label=""
                value={String(rowsPerPage)}
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                options={[5, 10, 25].map(n => ({ value: String(n), label: String(n) }))}
                className="w-16"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>{page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredExpedientes.length)} de {filteredExpedientes.length}</span>
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>‹</Button>
              <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * rowsPerPage >= filteredExpedientes.length}>›</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Incidencia Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent size="md" className="p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white px-6 py-4 flex items-center gap-3">
            <AlertTriangle size={20} />
            <h2 className="text-lg font-bold">Registrar Incidencia</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
              <p><strong>Expediente:</strong> {selectedExp?.codigoExpediente}</p>
              <p><strong>Estudiante:</strong> {selectedExp?.nombreEstudiante} {selectedExp?.apellidoEstudiante}</p>
            </div>
            <Textarea
              label="Detalle de la Incidencia"
              placeholder="Describa el problema u observación..."
              value={incidenciaText}
              onChange={(e) => setIncidenciaText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="bg-muted dark:bg-muted/50 border-t border-border px-6 py-4">
            <Button variant="secondary" onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleRegistrarIncidencia} disabled={!incidenciaText.trim()}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asesor Dialog */}
      <Dialog open={openAsesorDialog} onOpenChange={setOpenAsesorDialog}>
        <DialogContent size="md" className="p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white px-6 py-4 flex items-center gap-3">
            <UserPlus size={20} />
            <h2 className="text-lg font-bold">Asignar Docente Asesor</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
              <p><strong>Expediente:</strong> {selectedExp?.codigoExpediente}</p>
              <p><strong>Estudiante:</strong> {selectedExp?.nombreEstudiante} {selectedExp?.apellidoEstudiante}</p>
              <p><strong>Tipo:</strong> {selectedExp?.nombreTipoPractica || 'Práctica Inicial'}</p>
            </div>
            <Select
              label="Seleccionar Docente Asesor *"
              value={selectedAsesor ? String(selectedAsesor.id) : ''}
              onChange={(e) => {
                const doc = docentes.find(d => String(d.id) === e.target.value);
                setSelectedAsesor(doc || null);
              }}
              placeholder="Buscar por nombre..."
              options={docentes.map(d => ({
                value: String(d.id),
                label: `${d.nombres || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.trim() || d.username,
              }))}
            />
            <Input
              label="Resolución / N° de Designación *"
              placeholder="Ej: RES-001-2025-UNT/DEII"
              value={resolucionAsesor}
              onChange={(e) => setResolucionAsesor(e.target.value)}
            />
          </div>
          <DialogFooter className="bg-muted dark:bg-muted/50 border-t border-border px-6 py-4">
            <Button variant="secondary" onClick={() => setOpenAsesorDialog(false)} disabled={asignandoAsesor}>Cancelar</Button>
            <Button onClick={handleAsignarAsesor} disabled={!selectedAsesor || !resolucionAsesor.trim() || asignandoAsesor} loading={asignandoAsesor}>
              {asignandoAsesor ? 'Asignando...' : 'Asignar Asesor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validar Dialog */}
      <Dialog open={validarDialog.open} onOpenChange={(v) => { if (!v) setValidarDialog({ open: false, expediente: null }); }}>
        <DialogContent size="md" className="p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white px-6 py-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Validar Requisitos Administrativos</h2>
              <p className="text-xs opacity-80">Marque cada requisito antes de validar</p>
            </div>
          </div>
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {validarDialog.expediente && (
              <>
                <div className="rounded-lg border border-border bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Expediente</p>
                  <p className="font-bold text-foreground">{validarDialog.expediente.codigoExpediente}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {validarDialog.expediente.nombreEstudiante} {validarDialog.expediente.apellidoEstudiante}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-primary-700 dark:text-primary-400 mb-3">
                    Checklist de validación:
                  </h4>
                  <div className="flex flex-col gap-2">
                    <CheckboxItem
                      checked={validarChecks.empresaAsignada}
                      onChange={(checked) => setValidarChecks(prev => ({ ...prev, empresaAsignada: checked }))}
                      label="Empresa receptora asignada y confirmada"
                    />
                    <CheckboxItem
                      checked={validarChecks.sedeConfirmada}
                      onChange={(checked) => setValidarChecks(prev => ({ ...prev, sedeConfirmada: checked }))}
                      label="Sede de práctica confirmada"
                    />
                    <CheckboxItem
                      checked={validarChecks.convenioVigente}
                      onChange={(checked) => setValidarChecks(prev => ({ ...prev, convenioVigente: checked }))}
                      label="Convenio con la empresa vigente"
                    />
                    <CheckboxItem
                      checked={validarChecks.estudianteActivo}
                      onChange={(checked) => setValidarChecks(prev => ({ ...prev, estudianteActivo: checked }))}
                      label="Estudiante/egresado activo en sistema"
                    />
                    <CheckboxItem
                      checked={validarChecks.tipoPracticaDefinido}
                      onChange={(checked) => setValidarChecks(prev => ({ ...prev, tipoPracticaDefinido: checked }))}
                      label="Tipo de práctica definido (Inicial / Final / Profesional)"
                    />
                  </div>
                </div>

                <Separator />

                <Textarea
                  label="Observaciones (opcional)"
                  rows={2}
                  value={validarObs}
                  onChange={(e) => setValidarObs(e.target.value)}
                  placeholder="Ej: Todos los documentos administrativos están completos..."
                />
              </>
            )}
          </div>
          <DialogFooter className="bg-muted dark:bg-muted/50 border-t border-border px-6 py-4">
            <Button variant="secondary" onClick={() => setValidarDialog({ open: false, expediente: null })}>Cancelar</Button>
            <Button
              onClick={handleValidarExpediente}
              disabled={!Object.values(validarChecks).every(Boolean)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Validar y Marcar Listo para Carta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

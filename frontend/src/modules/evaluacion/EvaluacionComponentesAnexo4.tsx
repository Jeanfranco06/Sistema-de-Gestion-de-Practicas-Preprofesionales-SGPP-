import { useState } from 'react';
import { useComponentesEvaluacion, useRegistrarComponenteEvaluacion } from '@/hooks/useComponentesEvaluacion';
import { useAuth } from '@/auth/AuthContext';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/ui';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { BarChart3, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MySwal = withReactContent(Swal);

interface Componente {
  id: number;
  tipoComponente: string;
  puntajeMaximo: number;
  puntajeObtenido?: number | null;
  porcentaje: number;
  estado: string;
  observaciones?: string;
  evaluadorId?: number;
  tipoEvaluador?: string;
  fechaEvaluacion?: string;
}

const NOMBRES_COMPONENTES: Record<string, string> = {
  PLAN: 'Plan de prácticas (10%)',
  EMPRESA: 'Evaluación de empresa (50%)',
  INFORME: 'Informe final / Comité (40%)',
};

const RESPONSABLES: Record<string, string> = {
  PLAN: 'Docente asesor / Comité',
  EMPRESA: 'Tutor externo',
  INFORME: 'Comité / Docente asesor',
};

interface Props {
  idExpediente: number;
  tipoPractica: string;
  rol: 'DOCENTE' | 'COMITE';
  onVolver?: () => void;
}

export const EvaluacionComponentesAnexo4 = ({ idExpediente, tipoPractica, rol, onVolver }: Props) => {
  const auth = useAuth() as { user?: { id?: number | string } | null };
  const navigate = useNavigate();
  const { data: componentes = [], isLoading } = useComponentesEvaluacion(String(idExpediente));
  const registrarMutation = useRegistrarComponenteEvaluacion();
  const [puntajes, setPuntajes] = useState<Record<string, { puntaje: string; observaciones: string }>>({});

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Cargando componentes de evaluación...</p>
      </div>
    );
  }

  const handleChange = (tipo: string, campo: 'puntaje' | 'observaciones', valor: string) => {
    setPuntajes((prev) => ({
      ...prev,
      [tipo]: { ...prev[tipo], [campo]: valor },
    }));
  };

  const puedeEditar = (componente: Componente) => {
    if (componente.tipoComponente === 'EMPRESA') return false;
    if (rol === 'COMITE') return true;
    return componente.tipoComponente !== 'EMPRESA';
  };

  const handleGuardar = async (componente: Componente) => {
    const datos = puntajes[componente.tipoComponente] || { puntaje: '', observaciones: '' };
    const puntaje = parseInt(datos.puntaje, 10);
    if (Number.isNaN(puntaje) || puntaje < 0 || puntaje > componente.puntajeMaximo) {
      MySwal.fire('Puntaje inválido', `El puntaje debe estar entre 0 y ${componente.puntajeMaximo}`, 'warning');
      return;
    }
    if (!auth.user?.id) {
      MySwal.fire('Sesión no disponible', 'Vuelve a iniciar sesión antes de registrar la evaluación.', 'error');
      return;
    }
    const confirm = await MySwal.fire({
      title: '¿Registrar evaluación?',
      text: `Se guardará el componente ${componente.tipoComponente} con ${puntaje}/${componente.puntajeMaximo} puntos.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;
    try {
      MySwal.fire({ title: 'Guardando...', didOpen: () => MySwal.showLoading() });
      await registrarMutation.mutateAsync({
        idExpediente,
        tipoComponente: componente.tipoComponente,
        puntaje,
        observaciones: datos.observaciones,
      });
      MySwal.fire({ icon: 'success', title: 'Evaluación registrada', timer: 1500, showConfirmButton: false });
    } catch {
      MySwal.fire('Error', 'No se pudo registrar la evaluación del componente.', 'error');
    }
  };

  const total = componentes.reduce((acc, c) => acc + (c.puntajeObtenido ?? 0), 0);
  const vigesimal = componentes.length === 3 ? (total / 100) * 20 : 0;
  const completo = total >= 100;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1A3A6E] text-white shadow-md dark:bg-[#4A6FA5]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Evaluación Anexo 4 — {tipoPractica}
            </h2>
            <p className="text-sm text-muted-foreground">
              Puntaje sobre 100 puntos convertido a escala vigesimal (0-20)
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={onVolver ?? (() => navigate(-1))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Resumen */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Total acumulado
              </p>
              <p className="mt-1 text-3xl font-extrabold text-foreground">{total}/100</p>
            </div>
            <div className="rounded-xl bg-primary-50 p-4 dark:bg-primary-900/20">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                Escala vigesimal
              </p>
              <p className="mt-1 text-3xl font-extrabold text-primary-700 dark:text-primary-300">
                {vigesimal.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">Estado</p>
              <div className="mt-2">
                <Badge variant={completo ? 'success' : 'warning'} size="md">
                  {completo ? 'Completo' : 'Pendiente'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas de componentes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {componentes.map((componente) => {
          const editable = puedeEditar(componente);
          const completado = componente.estado === 'COMPLETADO';
          return (
            <Card key={componente.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-foreground">
                    {NOMBRES_COMPONENTES[componente.tipoComponente] || componente.tipoComponente}
                  </h3>
                  <Badge variant={completado ? 'success' : 'warning'} size="sm">
                    {completado ? 'Completado' : 'Pendiente'}
                  </Badge>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  Responsable: {RESPONSABLES[componente.tipoComponente] || 'No definido'}
                </p>

                {completado ? (
                  <div className="mt-auto space-y-2 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                    <p className="text-sm font-semibold text-foreground">
                      Puntaje: {componente.puntajeObtenido}/{componente.puntajeMaximo}
                    </p>
                    {componente.observaciones && (
                      <p className="text-xs text-muted-foreground">{componente.observaciones}</p>
                    )}
                  </div>
                ) : editable ? (
                  <div className="mt-auto space-y-3">
                    <Input
                      label={`Puntaje (0-${componente.puntajeMaximo})`}
                      type="number"
                      min={0}
                      max={componente.puntajeMaximo}
                      value={puntajes[componente.tipoComponente]?.puntaje ?? ''}
                      onChange={(e) => handleChange(componente.tipoComponente, 'puntaje', e.target.value)}
                    />
                    <Textarea
                      label="Observaciones"
                      rows={2}
                      value={puntajes[componente.tipoComponente]?.observaciones ?? ''}
                      onChange={(e) => handleChange(componente.tipoComponente, 'observaciones', e.target.value)}
                    />
                    <Button
                      className="w-full"
                      onClick={() => handleGuardar(componente)}
                      disabled={registrarMutation.isPending}
                    >
                      {registrarMutation.isPending ? 'Guardando...' : 'Guardar evaluación'}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-auto rounded-xl bg-muted/60 p-3">
                    <p className="text-sm text-muted-foreground">
                      Este componente es evaluado por el tutor externo en su módulo correspondiente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabla detalle */}
      {componentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-700 dark:text-primary-400" />
              Detalle de componentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Componente</TableHead>
                    <TableHead className="font-semibold">Puntaje</TableHead>
                    <TableHead className="font-semibold">%</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Evaluador</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {componentes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-foreground">
                        {NOMBRES_COMPONENTES[c.tipoComponente] || c.tipoComponente}
                      </TableCell>
                      <TableCell>
                        <span className={cn('font-semibold', c.puntajeObtenido ? 'text-foreground' : 'text-muted-foreground')}>
                          {c.puntajeObtenido ?? '-'}
                        </span>
                        <span className="text-muted-foreground">/{c.puntajeMaximo}</span>
                      </TableCell>
                      <TableCell>{c.porcentaje}%</TableCell>
                      <TableCell>
                        <Badge variant={c.estado === 'COMPLETADO' ? 'success' : 'warning'} size="sm">
                          {c.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.tipoEvaluador || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

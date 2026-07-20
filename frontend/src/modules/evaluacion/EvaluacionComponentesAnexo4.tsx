import { useState } from 'react';
import { useComponentesEvaluacion, useRegistrarComponenteEvaluacion } from '@/hooks/useComponentesEvaluacion';
import { useAuth } from '@/auth/AuthContext';
import { Button, Card, Input, Textarea, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/ui';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { BarChart3, ArrowLeft } from 'lucide-react';
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
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
              Evaluación Anexo 4 — {tipoPractica}
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Puntaje sobre 100 puntos convertido a escala vigesimal (0-20)
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onVolver ?? (() => navigate(-1))}>
          <ArrowLeft size={16} />
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)]">Total acumulado</p>
            <p className="text-3xl font-semibold text-[var(--color-foreground)]">{total}/100</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)]">Escala vigesimal</p>
            <p className="text-3xl font-semibold text-[var(--color-primary)]">{vigesimal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)]">Estado</p>
            <Badge variant={total >= 100 ? 'success' : 'warning'}>
              {total >= 100 ? 'Completo' : 'Pendiente'}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {componentes.map((componente) => {
          const editable = puedeEditar(componente);
          const completado = componente.estado === 'COMPLETADO';
          return (
            <Card key={componente.id} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                  {NOMBRES_COMPONENTES[componente.tipoComponente] || componente.tipoComponente}
                </h3>
                <Badge variant={completado ? 'success' : 'warning'}>{completado ? 'Completado' : 'Pendiente'}</Badge>
              </div>
              <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
                Responsable: {RESPONSABLES[componente.tipoComponente] || 'No definido'}
              </p>
              {completado ? (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--color-foreground)]">
                    Puntaje: {componente.puntajeObtenido}/{componente.puntajeMaximo}
                  </p>
                  {componente.observaciones && (
                    <p className="text-xs text-[var(--color-muted-foreground)]">{componente.observaciones}</p>
                  )}
                </div>
              ) : editable ? (
                <div className="space-y-3">
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
                    {registrarMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Este componente es evaluado por el tutor externo en su módulo correspondiente.
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {componentes.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-[var(--color-foreground)]">Detalle de componentes</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Componente</TableHead>
                <TableHead>Puntaje</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Evaluador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {componentes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{NOMBRES_COMPONENTES[c.tipoComponente] || c.tipoComponente}</TableCell>
                  <TableCell>{c.puntajeObtenido ?? '-'}/{c.puntajeMaximo}</TableCell>
                  <TableCell>{c.porcentaje}%</TableCell>
                  <TableCell>
                    <Badge variant={c.estado === 'COMPLETADO' ? 'success' : 'warning'}>{c.estado}</Badge>
                  </TableCell>
                  <TableCell>{c.tipoEvaluador || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

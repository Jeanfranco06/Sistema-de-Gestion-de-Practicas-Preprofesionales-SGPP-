import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { useMisExpedientes } from '../../../hooks/useExpedientes';
import { useNotasUnidad } from '../../../hooks/useNotasUnidad';
import { useEvaluacionesPorExpediente } from '../../../hooks/useEvaluaciones';
import { Card, CardContent, Badge, Button, Skeleton, Separator } from '../../../ui';
import { ESTADOS_EXPEDIENTE } from '../../../lib/constants';
import { Award, ArrowLeft, BookOpen, ClipboardCheck, TrendingUp, FileText } from 'lucide-react';

export default function EvaluacionEstudiante() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: expedientes, isLoading: loadingExpedientes } = useMisExpedientes();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const expedienteActivo = expedientes?.find(
    (e: any) => e.estado !== ESTADOS_EXPEDIENTE.CERRADO && e.estado !== ESTADOS_EXPEDIENTE.SUSPENDIDO
  ) ?? expedientes?.[0];

  const expedienteId = selectedId ?? expedienteActivo?.id?.toString();

  const { data: notasUnidad, isLoading: loadingNotas } = useNotasUnidad(expedienteId);
  const { data: evaluaciones, isLoading: loadingEvals } = useEvaluacionesPorExpediente(expedienteId);

  const calificacionFinal = expedienteActivo?.calificacionFinal;
  const esInicial = expedienteActivo?.codigoTipoPractica === 'INICIAL';

  const promedioNotas = (() => {
    if (!notasUnidad || notasUnidad.length === 0) return null;
    const notas = notasUnidad.map((n: any) => n.notaFinal ?? n.nota);
    if (notas.length === 0) return null;
    return notas.reduce((a: number, b: number) => a + b, 0) / notas.length;
  })();

  if (loadingExpedientes) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!expedienteActivo) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <Award className="mb-4 h-12 w-12 text-[var(--color-muted-foreground)]" />
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">Sin practicas registradas</h2>
        <p className="mb-4 text-sm text-[var(--color-muted-foreground)]">
          No se encontraron expedientes de practicas asociados a tu cuenta.
        </p>
        <Button onClick={() => navigate('/estudiante/dashboard')}>Volver al Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/estudiante/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Mis Evaluaciones</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Consulta las calificaciones y evaluaciones de tu practica.
          </p>
        </div>
      </div>

      {/* Calificacion Final */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--color-muted-foreground)]">Calificacion Final</h3>
              <p className="text-3xl font-bold text-[var(--color-foreground)]">
                {calificacionFinal != null && calificacionFinal !== ''
                  ? Number(calificacionFinal).toFixed(1)
                  : '--'}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {esInicial ? 'Escala vigesimal (0-20)' : 'Escala 0-100 puntos (Anexo 4)'}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={calificacionFinal != null && Number(calificacionFinal) >= 13.5 ? 'success' : 'warning'}>
                {calificacionFinal != null && Number(calificacionFinal) >= 13.5 ? 'Aprobado' : 'En proceso'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas por Unidad (Iniciales) */}
      {esInicial && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
              <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Notas por Unidad</h3>
            </div>
            {loadingNotas ? (
              <Skeleton className="h-32 w-full" />
            ) : notasUnidad && notasUnidad.length > 0 ? (
              <div className="space-y-3">
                {notasUnidad.map((nota: any) => (
                  <div key={nota.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3">
                    <div>
                      <p className="font-medium text-[var(--color-foreground)]">
                        Unidad {nota.numeroUnidad} - {nota.nombreUnidad || `Informe ${nota.numeroUnidad}`}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        Ponderacion: {nota.ponderacion}% |
                        {nota.notaPlan != null ? ` Plan: ${nota.notaPlan}` : ''}
                        {nota.notaInforme != null ? ` | Informe: ${nota.notaInforme}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[var(--color-foreground)]">
                        {nota.notaFinal ?? nota.nota ?? '--'}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">/ 20</p>
                    </div>
                  </div>
                ))}
                {promedioNotas != null && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-[var(--color-primary)]/10 p-3">
                    <p className="font-semibold text-[var(--color-primary)]">Promedio General</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">{promedioNotas.toFixed(1)}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Aun no se han registrado notas para este expediente.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Evaluaciones Registradas */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-[var(--color-primary)]" />
            <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Evaluaciones</h3>
          </div>
          {loadingEvals ? (
            <Skeleton className="h-32 w-full" />
          ) : evaluaciones && evaluaciones.length > 0 ? (
            <div className="space-y-3">
              {evaluaciones.map((eval_: any) => (
                <div key={eval_.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[var(--color-muted-foreground)]" />
                    <div>
                      <p className="font-medium text-[var(--color-foreground)]">
                        {eval_.tipoEvaluador === 'EMPRESA' ? 'Evaluacion de Empresa' :
                         eval_.tipoEvaluador === 'DOCENTE' ? 'Evaluacion del Asesor' :
                         eval_.tipoEvaluador === 'COMITE' ? 'Evaluacion del Comite' :
                         eval_.tipoEvaluador}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {eval_.fechaEvaluacion ? new Date(eval_.fechaEvaluacion).toLocaleDateString('es-PE') : 'Sin fecha'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {eval_.calificacion != null && (
                      <p className="text-lg font-bold text-[var(--color-foreground)]">
                        {eval_.calificacion}
                      </p>
                    )}
                    {eval_.calificacionCualitativa && (
                      <Badge variant={eval_.calificacionCualitativa === 'Logrado' ? 'success' : eval_.calificacionCualitativa === 'En proceso' ? 'warning' : 'danger'}>
                        {eval_.calificacionCualitativa}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {esInicial
                ? 'Las evaluaciones de practicas iniciales se registran por el docente asesor.'
                : 'Las evaluaciones apareceran una vez que el tutor externo y el comite las registren.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Promedio (Finales/Profesionales) */}
      {!esInicial && calificacionFinal != null && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
              <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Desglose Anexo 4</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted-foreground)]">Plan de Practicas (10 pts)</span>
                <span className="font-medium text-[var(--color-foreground)]">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted-foreground)]">Evaluacion de Empresa (50 pts)</span>
                <span className="font-medium text-[var(--color-foreground)]">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted-foreground)]">Evaluacion del Informe (40 pts)</span>
                <span className="font-medium text-[var(--color-foreground)]">--</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-[var(--color-foreground)]">Total (100 pts)</span>
                <span className="text-[var(--color-primary)]">{Number(calificacionFinal).toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

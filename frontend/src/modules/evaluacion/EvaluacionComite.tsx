import { useParams, useNavigate } from 'react-router-dom';
import { EvaluacionComponentesAnexo4 } from './EvaluacionComponentesAnexo4';
import { useExpedienteById } from '@/hooks/useExpedientes';
import { Card, CardContent, Button } from '@/ui';
import { cn } from '@/lib/utils';
import { ArrowLeft, FileWarning, Loader2 } from 'lucide-react';

export const EvaluacionComite = () => {
  const { id: idParams } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: expediente, isLoading } = useExpedienteById(idParams);

  const idExpediente = idParams ? Number(idParams) : NaN;
  const expedienteIdValido = Number.isSafeInteger(idExpediente) && idExpediente > 0;

  if (!expedienteIdValido) {
    return (
      <div className="space-y-6 animate-in p-4 sm:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <FileWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">Expediente no válido</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No se indicó un expediente válido para evaluar.
                </p>
              </div>
            </div>
            <Button variant="secondary" className="mt-5" onClick={() => navigate('/comite/panel')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !expediente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Cargando expediente...</p>
      </div>
    );
  }

  return (
    <div className={cn('animate-in p-4 sm:p-6')}>
      <EvaluacionComponentesAnexo4
        idExpediente={idExpediente}
        tipoPractica={expediente.codigoTipoPractica}
        rol="COMITE"
        onVolver={() => navigate('/comite/panel')}
      />
    </div>
  );
};

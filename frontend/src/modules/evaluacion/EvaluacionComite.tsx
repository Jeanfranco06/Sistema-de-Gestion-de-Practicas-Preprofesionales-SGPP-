import { useParams, useNavigate } from 'react-router-dom';
import { EvaluacionComponentesAnexo4 } from './EvaluacionComponentesAnexo4';
import { useExpedienteById } from '@/hooks/useExpedientes';
import { Card, Button } from '@/ui';
import { ArrowLeft } from 'lucide-react';

export const EvaluacionComite = () => {
  const { id: idParams } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: expediente } = useExpedienteById(idParams);

  const idExpediente = idParams ? Number(idParams) : NaN;
  const expedienteIdValido = Number.isSafeInteger(idExpediente) && idExpediente > 0;

  if (!expedienteIdValido) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-[var(--color-error)]">No se indicó un expediente válido para evaluar.</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/comite/panel')}>
            Volver al panel
          </Button>
        </Card>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <EvaluacionComponentesAnexo4
      idExpediente={idExpediente}
      tipoPractica={expediente.codigoTipoPractica}
      rol="COMITE"
      onVolver={() => navigate('/comite/panel')}
    />
  );
};

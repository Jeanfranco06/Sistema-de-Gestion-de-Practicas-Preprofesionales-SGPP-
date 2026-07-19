import { useQuery } from '@tanstack/react-query';
import { expedientesApi } from '../api/expedientesApi';
import { horasEstudianteApi } from '../api/horasApi';
import { tieneControlHoras } from '../shared/utils/controlHoras';

export function useExpediente() {
  return useQuery({
    queryKey: ['expediente', 'mis-expedientes'],
    queryFn: async () => {
      const res = await expedientesApi.getMisExpedientes();
      const expedientes = res.data?.data || [];
      return expedientes[0] || null;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCumplimiento(expediente: { id: string; codigoTipoPractica?: string } | null | undefined) {
  const shouldFetch = expediente != null && tieneControlHoras(expediente.estado);

  return useQuery({
    queryKey: ['cumplimiento', expediente?.id],
    queryFn: async () => {
      const res = await horasEstudianteApi.getCumplimiento(expediente!.id);
      const data = res.data?.data || {};
      return {
        horasRequeridas:
          data.horasRequeridas ||
          (expediente.codigoTipoPractica === 'INICIAL' ? 64 : 360),
        horasValidadas: data.horasValidadas || 0,
      };
    },
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: {
      horasRequeridas:
        expediente?.codigoTipoPractica === 'INICIAL' ? 64 : 360,
      horasValidadas: 0,
    },
  });
}
import { getStatusAccent } from '../theme/designTokens';

const STATUS_LABELS: Record<string, string> = {
  SOLICITADO: 'Solicitado',
  EMPRESA_SEDE_ASIGNADA: 'Empresa y sede asignadas',
  VALIDADO_SECRETARIA: 'Validado por secretaría',
  CARTA_PRESENTACION_EMITIDA: 'Carta de presentación emitida',
  CARTA_ACEPTACION_PRESENTADA: 'Carta de aceptación presentada',
  ASESOR_ASIGNADO: 'Asesor asignado',
  COMITE_ASIGNADO: 'Comité asignado',
  PLAN_PRESENTADO: 'Plan presentado',
  PLAN_EN_REVISION: 'Plan en revisión',
  PLAN_EN_REVISION_COMITE: 'Plan en revisión comité',
  PLAN_OBSERVADO: 'Plan observado',
  PLAN_APROBADO: 'Plan aprobado',
  EN_EJECUCION: 'En ejecución',
  INFORME_PARCIAL_1_PRESENTADO: 'Informe parcial 1',
  INFORME_PARCIAL_2_PRESENTADO: 'Informe parcial 2',
  INFORME_FINAL_PRESENTADO: 'Informe final presentado',
  INFORME_EN_REVISION: 'Informe en revisión',
  INFORME_APROBADO: 'Informe aprobado',
  EVALUACION_PENDIENTE: 'Evaluación pendiente',
  EVALUACION_EMPRESA_PENDIENTE: 'Evaluación empresa pendiente',
  EVALUACION_COMPLETA: 'Evaluación completa',
  DICTAMEN_EMITIDO: 'Dictamen emitido',
  EVALUADO: 'Evaluado',
  EXAMEN_APLAZADOS_HABILITADO: 'Examen de aplazados habilitado',
  EXAMEN_APLAZADOS_RENDIDO: 'Examen de aplazados rendido',
  CERRADO: 'Cerrado',
  OBSERVADO: 'Observado',
  SUBSANADO: 'Subsanado',
  EN_REVISION: 'En revisión',
  RECHAZADO: 'Rechazado',
  SUSPENDIDO: 'Suspendido',
  CANCELADO: 'Cancelado',
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  COMPLETADO: 'Completado',
  VIGENTE: 'Vigente',
  ACTIVO: 'Activo',
};

interface StatusChipProps {
  status?: string | null;
  label?: string;
}

export default function StatusChip({ status, label }: StatusChipProps) {
  const accent = getStatusAccent(status);
  const displayLabel =
    label ||
    (status ? STATUS_LABELS[status] : undefined) ||
    status?.replace(/_/g, ' ') ||
    '—';

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{
        backgroundColor: accent.bg,
        color: accent.main,
        border: `1px solid ${accent.border}`,
      }}
    >
      {displayLabel}
    </span>
  );
}

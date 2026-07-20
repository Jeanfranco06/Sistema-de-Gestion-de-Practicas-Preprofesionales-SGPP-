import { getStatusAccent } from '../theme/designTokens';
import { Tooltip } from '@/ui';

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

const STATUS_DESCRIPTIONS: Record<string, string> = {
  SOLICITADO: 'El estudiante ha solicitado la práctica y está a la espera de asignación de empresa/sede.',
  EMPRESA_SEDE_ASIGNADA: 'La empresa y sede de práctica han sido asignadas al expediente.',
  VALIDADO_SECRETARIA: 'La secretaría ha validado los requisitos administrativos del expediente.',
  CARTA_PRESENTACION_EMITIDA: 'La carta de presentación institucional ha sido emitida por coordinación/dirección.',
  CARTA_ACEPTACION_PRESENTADA: 'El estudiante ha cargado la carta de aceptación de la empresa.',
  ASESOR_ASIGNADO: 'Se ha asignado un docente asesor para la práctica inicial.',
  COMITE_ASIGNADO: 'Se ha conformado el comité evaluador para la práctica final/profesional.',
  PLAN_PRESENTADO: 'El estudiante ha presentado el plan de prácticas para revisión.',
  PLAN_EN_REVISION: 'El plan está siendo revisado por el asesor o comité.',
  PLAN_EN_REVISION_COMITE: 'El plan está en revisión por parte del comité evaluador.',
  PLAN_OBSERVADO: 'El plan presentado cuenta con observaciones que deben subsanarse.',
  PLAN_APROBADO: 'El plan de prácticas ha sido aprobado.',
  EN_EJECUCION: 'La práctica está en desarrollo; el estudiante registra horas e informes.',
  INFORME_PARCIAL_1_PRESENTADO: 'El estudiante ha presentado el primer informe parcial de avance.',
  INFORME_PARCIAL_2_PRESENTADO: 'El estudiante ha presentado el segundo informe parcial de avance.',
  INFORME_FINAL_PRESENTADO: 'El estudiante ha presentado el informe final de prácticas.',
  INFORME_EN_REVISION: 'El informe final está siendo revisado por la instancia correspondiente.',
  INFORME_APROBADO: 'El informe final ha sido aprobado.',
  EVALUACION_PENDIENTE: 'Faltan evaluaciones por registrar para completar la calificación.',
  EVALUACION_EMPRESA_PENDIENTE: 'El tutor externo aún no registra la evaluación de empresa.',
  EVALUACION_COMPLETA: 'Todas las evaluaciones requeridas han sido registradas.',
  DICTAMEN_EMITIDO: 'El comité ha emitido el dictamen correspondiente.',
  EVALUADO: 'El expediente cuenta con calificación final registrada.',
  EXAMEN_APLAZADOS_HABILITADO: 'El estudiante puede rendir el examen de aplazados para práctica inicial.',
  EXAMEN_APLAZADOS_RENDIDO: 'El examen de aplazados ha sido registrado.',
  CERRADO: 'El expediente ha sido cerrado y, de corresponder, la constancia generada.',
  OBSERVADO: 'El documento o expediente cuenta con observaciones pendientes.',
  SUBSANADO: 'El estudiante ha subsanado las observaciones realizadas.',
  EN_REVISION: 'El ítem está en revisión.',
  RECHAZADO: 'El ítem ha sido rechazado.',
  SUSPENDIDO: 'El expediente o proceso se encuentra suspendido temporalmente.',
  CANCELADO: 'El expediente o proceso ha sido cancelado.',
  PENDIENTE: 'El ítem está pendiente de acción.',
  APROBADO: 'El ítem ha sido aprobado.',
  COMPLETADO: 'El ítem ha sido completado.',
  VIGENTE: 'El ítem se encuentra vigente.',
  ACTIVO: 'El ítem se encuentra activo.',
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

  const tooltip = status ? STATUS_DESCRIPTIONS[status] : undefined;
  const chip = (
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

  if (!tooltip) return chip;

  return (
    <Tooltip content={tooltip} side="top">
      {chip}
    </Tooltip>
  );
}

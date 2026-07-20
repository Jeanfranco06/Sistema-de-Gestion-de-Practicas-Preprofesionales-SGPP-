import { alpha } from '@mui/material/styles';
import { palette } from './theme';

export interface Accent {
  main: string;
  bg: string;
  border: string;
  text: string;
}

export type AccentKey = 'yellow' | 'blue' | 'green' | 'red' | 'amber' | 'slate' | 'gray';

/** Paleta institucional UNT — amarillo y azul como primarios, verde/rojo como semánticos */
export const accents: Record<AccentKey, Accent> = {
  yellow: {
    main: palette.yellow.main,
    bg: alpha(palette.yellow.main, 0.12),
    border: alpha(palette.yellow.main, 0.35),
    text: palette.yellow.contrast,
  },
  blue: {
    main: palette.blue.main,
    bg: alpha(palette.blue.main, 0.08),
    border: alpha(palette.blue.main, 0.25),
    text: palette.blue.contrast,
  },
  green: {
    main: palette.green.main,
    bg: alpha(palette.green.main, 0.1),
    border: alpha(palette.green.main, 0.3),
    text: palette.green.contrast,
  },
  red: {
    main: palette.red.main,
    bg: alpha(palette.red.main, 0.1),
    border: alpha(palette.red.main, 0.3),
    text: palette.red.contrast,
  },
  amber: {
    main: palette.amber.main,
    bg: alpha(palette.amber.main, 0.1),
    border: alpha(palette.amber.main, 0.3),
    text: palette.amber.contrast,
  },
  slate: {
    main: palette.slate.main,
    bg: palette.background,
    border: palette.divider,
    text: palette.slate.contrast,
  },
  gray: {
    main: palette.gray.main,
    bg: alpha(palette.gray.main, 0.08),
    border: alpha(palette.gray.main, 0.2),
    text: palette.gray.contrast,
  },
};

export const chartColors: string[] = [
  palette.yellow.main,
  palette.blue.main,
  palette.green.main,
  palette.amber.main,
  palette.red.main,
  palette.gray.main,
];

export const statAccentKeys: AccentKey[] = ['yellow', 'blue', 'green', 'amber', 'red', 'slate'];

/** Obtiene el color semántico correspondiente a un estado de expediente/documento */
export const getStatusAccent = (status: string | null | undefined): Accent => {
  if (!status) return accents.gray;
  const s = String(status).toUpperCase();
  if (['APROBADO', 'APROBADA', 'CERRADO', 'FINALIZADO', 'CUMPLIDO', 'ACEPTADO', 'COMPLETADO', 'EVALUADO', 'ACTIVO', 'VIGENTE'].includes(s))
    return accents.green;
  if (['RECHAZADO', 'RECHAZADA', 'CANCELADO', 'ANULADO', 'ERROR', 'VENCIDO', 'DESAPROBADO'].includes(s))
    return accents.red;
  if (['OBSERVADO', 'OBSERVADA', 'PENDIENTE', 'EN_REVISION', 'PROCESO', 'BORRADOR', 'PLAN_OBSERVADO', 'SUBSANADO', 'EXAMEN_APLAZADOS_HABILITADO'].includes(s))
    return accents.amber;
  if (['EN_EJECUCION', 'SOLICITADO', 'PLAN_PRESENTADO', 'INFORME_PRESENTADO', 'DICTAMEN_EMITIDO', 'CARTA_PRESENTACION_EMITIDA', 'CARTA_ACEPTACION_PRESENTADA', 'EXAMEN_APLAZADOS_RENDIDO'].includes(s))
    return accents.blue;
  return accents.gray;
};

export const getStatusColor = (status: string | null | undefined): string =>
  getStatusAccent(status).main;

export default accents;

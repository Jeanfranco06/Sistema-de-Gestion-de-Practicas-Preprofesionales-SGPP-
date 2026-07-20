import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Filter, Eye, BarChart3 } from 'lucide-react';
import { useReportePorTipo, useExportarReporte } from '../../../hooks/useCoordinacion';
import { useSedes, useEmpresas } from '../../../hooks/useSedes';
import { ESTADOS_EXPEDIENTE } from '../../../lib/constants';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  Tooltip,
  Skeleton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../ui';
import { cn } from '../../../lib/utils';

const REPORT_TYPES = [
  { value: 'EXPEDIENTES_ACTIVOS', label: 'Expedientes activos' },
  { value: 'EXPEDIENTES_CERRADOS', label: 'Expedientes cerrados' },
  { value: 'PRACTICAS_POR_TIPO', label: 'Prácticas por tipo' },
  { value: 'EMPRESAS_RECEPTORAS', label: 'Empresas receptoras' },
  { value: 'SEDES_VALIDADAS', label: 'Sedes validadas' },
  { value: 'CONVENIOS_VIGENTES', label: 'Convenios vigentes' },
  { value: 'SUBSANACIONES_PENDIENTES', label: 'Subsanaciones pendientes' },
];

const TIPOS_PRACTICA = [
  { value: '', label: 'Todos los tipos' },
  { value: 'INICIAL', label: 'Práctica Inicial' },
  { value: 'FINAL', label: 'Práctica Final' },
  { value: 'PROFESIONAL', label: 'Práctica Profesional' },
];

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: ESTADOS_EXPEDIENTE.SOLICITADO, label: 'Solicitud registrada' },
  { value: ESTADOS_EXPEDIENTE.VALIDADO_SECRETARIA, label: 'Validado por Secretaría' },
  { value: ESTADOS_EXPEDIENTE.CARTA_PRESENTACION_EMITIDA, label: 'Carta de Presentación emitida' },
  { value: ESTADOS_EXPEDIENTE.CARTA_ACEPTACION_PRESENTADA, label: 'Carta de Aceptación presentada' },
  { value: ESTADOS_EXPEDIENTE.PLAN_PRESENTADO, label: 'Plan presentado' },
  { value: ESTADOS_EXPEDIENTE.PLAN_APROBADO, label: 'Plan aprobado' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: ESTADOS_EXPEDIENTE.OBSERVADO, label: 'Observado' },
  { value: ESTADOS_EXPEDIENTE.EN_EJECUCION, label: 'En ejecución' },
  { value: ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO, label: 'Informe final presentado' },
  { value: ESTADOS_EXPEDIENTE.INFORME_APROBADO, label: 'Informe aprobado' },
  { value: ESTADOS_EXPEDIENTE.EVALUADO, label: 'Evaluado' },
  { value: ESTADOS_EXPEDIENTE.DICTAMEN_EMITIDO, label: 'Dictamen emitido' },
  { value: ESTADOS_EXPEDIENTE.CERRADO, label: 'Cerrado' },
];

const REPORT_COLUMNS: Record<string, { key: string; label: string }[]> = {
  EXPEDIENTES_ACTIVOS: [
    { key: 'codigoExpediente', label: 'Código' },
    { key: 'nombreEstudiante', label: 'Estudiante' },
    { key: 'razonSocialEmpresa', label: 'Empresa' },
    { key: 'nombreTipoPractica', label: 'Tipo' },
    { key: 'periodoAcademico', label: 'Periodo' },
    { key: 'estadoActual', label: 'Estado' },
    { key: 'etapaFlujo', label: 'Etapa' },
  ],
  EXPEDIENTES_CERRADOS: [
    { key: 'codigoExpediente', label: 'Código' },
    { key: 'nombreEstudiante', label: 'Estudiante' },
    { key: 'razonSocialEmpresa', label: 'Empresa' },
    { key: 'nombreTipoPractica', label: 'Tipo' },
    { key: 'periodoAcademico', label: 'Periodo' },
    { key: 'estadoFinal', label: 'Estado final' },
    { key: 'calificacionFinal', label: 'Calificación' },
  ],
  PRACTICAS_POR_TIPO: [
    { key: 'codigoTipoPractica', label: 'Código' },
    { key: 'nombreTipoPractica', label: 'Tipo de práctica' },
    { key: 'totalExpedientes', label: 'Expedientes' },
    { key: 'expedientesActivos', label: 'Activos' },
    { key: 'expedientesCerrados', label: 'Cerrados' },
  ],
  EMPRESAS_RECEPTORAS: [
    { key: 'razonSocial', label: 'Empresa' },
    { key: 'ruc', label: 'RUC' },
    { key: 'totalExpedientes', label: 'Expedientes' },
    { key: 'sedesValidadasVigentes', label: 'Sedes' },
    { key: 'conveniosVigentes', label: 'Convenios vigentes' },
  ],
  SEDES_VALIDADAS: [
    { key: 'nombreSede', label: 'Sede' },
    { key: 'razonSocialEmpresa', label: 'Empresa' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'expedientesVinculados', label: 'Expedientes' },
    { key: 'vigente', label: 'Vigente' },
  ],
  CONVENIOS_VIGENTES: [
    { key: 'numeroConvenio', label: 'Convenio' },
    { key: 'razonSocialEmpresa', label: 'Empresa' },
    { key: 'fechaInicio', label: 'Inicio' },
    { key: 'fechaFin', label: 'Fin' },
    { key: 'totalExpedientesAsociados', label: 'Expedientes' },
  ],
  SUBSANACIONES_PENDIENTES: [
    { key: 'codigoExpediente', label: 'Código' },
    { key: 'nombreEstudiante', label: 'Estudiante' },
    { key: 'tipoObservacion', label: 'Tipo de observación' },
    { key: 'estadoExpediente', label: 'Estado expediente' },
    { key: 'fechaLimiteSubsanacion', label: 'Fecha límite' },
    { key: 'diasRestantes', label: 'Días restantes' },
  ],
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'No disponible';
  return Array.isArray(value) ? value.join(', ') : String(value);
};

interface ReportesCoordinacionProps {
  variant?: 'coordinacion' | 'admin';
}

export const ReportesCoordinacion = ({ variant = 'coordinacion' }: ReportesCoordinacionProps) => {
  const isAdminView = variant === 'admin';
  const navigate = useNavigate();
  const [tipoReporte, setTipoReporte] = useState('EXPEDIENTES_ACTIVOS');
  const [filtros, setFiltros] = useState({
    periodoAcademico: '',
    codigoTipoPractica: '',
    estadoExpediente: '',
    idEmpresa: '',
    idSede: '',
  });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const {
    data: resultado,
    isLoading: reporteLoading,
    isFetching: reporteFetching,
    error: reporteError,
    refetch,
  } = useReportePorTipo(tipoReporte, filtros);

  const { mutate: exportar, isPending: exportando } = useExportarReporte();
  const { data: empresas = [], isLoading: empresasLoading } = useEmpresas();
  const { data: sedes = [], isLoading: sedesLoading } = useSedes();

  const loadingCatalogos = empresasLoading || sedesLoading;
  const loading = reporteLoading || reporteFetching;

  useEffect(() => {
    setExportMessage('');
  }, [tipoReporte, filtros]);

  const generarReporte = () => {
    setHasGenerated(true);
    refetch();
  };

  const exportarReporte = (formato: string) => {
    exportar(
      { tipoReporte, formato, filtros },
      {
        onSuccess: (info) => {
          setExportMessage(
            `Exportación ${formato} completada: ${info.nombreArchivo}${info.trazabilidad ? ` · Trazabilidad ${info.trazabilidad}` : ''}`
          );
        },
        onError: () => {
          setExportMessage('No se pudo exportar el reporte con los filtros actuales.');
        },
      }
    );
  };

  const columnas = useMemo(() => {
    if (REPORT_COLUMNS[tipoReporte]) return REPORT_COLUMNS[tipoReporte];
    const firstRow = resultado?.registros?.[0];
    return firstRow
      ? Object.keys(firstRow).map((key) => ({ key, label: key }))
      : [];
  }, [resultado, tipoReporte]);

  const empresaOptions = useMemo(
    () => [
      { value: '', label: 'Todas las empresas' },
      ...(empresas || []).map((empresa: any) => ({
        value: String(empresa.id),
        label: empresa.razonSocial || empresa.nombreEmpresa || 'Sin nombre',
      })),
    ],
    [empresas]
  );

  const sedeOptions = useMemo(
    () => [
      { value: '', label: 'Todas las sedes' },
      ...(sedes || []).map((sede: any) => ({
        value: String(sede.id),
        label: sede.nombreSede || sede.nombre || 'Sin nombre',
      })),
    ],
    [sedes]
  );

  const errorMessage = reporteError
    ? 'No se pudo generar el reporte solicitado.'
    : '';

  const getEstadoBadgeVariant = (value: unknown): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    const estado = String(value).toUpperCase();
    if ([ESTADOS_EXPEDIENTE.CERRADO, ESTADOS_EXPEDIENTE.EVALUADO, ESTADOS_EXPEDIENTE.DICTAMEN_EMITIDO, ESTADOS_EXPEDIENTE.INFORME_APROBADO, ESTADOS_EXPEDIENTE.PLAN_APROBADO].includes(estado)) return 'success';
    if ([ESTADOS_EXPEDIENTE.OBSERVADO, ESTADOS_EXPEDIENTE.PLAN_OBSERVADO].includes(estado)) return 'danger';
    if ([ESTADOS_EXPEDIENTE.PLAN_PRESENTADO, ESTADOS_EXPEDIENTE.INFORME_FINAL_PRESENTADO, 'EN_REVISION'].includes(estado)) return 'warning';
    return 'info';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A3A6E] text-white dark:bg-[#4A6FA5]">
            <BarChart3 size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">
              {isAdminView ? 'Reportes Administrativos' : 'Reportes Consolidados'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAdminView
                ? 'Consulta y exporta reportes operativos de expedientes, empresas, sedes y convenios para la gestión administrativa del SGPP.'
                : 'Genera reportes ejecutivos por periodo, tipo de práctica, estado, empresa y sede.'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Configuración de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6 items-end">
            <Select
              label="Tipo de reporte"
              options={REPORT_TYPES}
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
            />

            <Input
              label="Periodo"
              placeholder="Ej. 2025-I"
              value={filtros.periodoAcademico}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, periodoAcademico: e.target.value }))
              }
            />

            <Select
              label="Tipo de práctica"
              options={TIPOS_PRACTICA}
              value={filtros.codigoTipoPractica}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, codigoTipoPractica: e.target.value }))
              }
            />

            <Select
              label="Estado"
              options={ESTADOS}
              value={filtros.estadoExpediente}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, estadoExpediente: e.target.value }))
              }
            />

            <Select
              label="Empresa"
              options={empresaOptions}
              value={filtros.idEmpresa}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, idEmpresa: e.target.value }))
              }
              disabled={loadingCatalogos}
            />

            <Select
              label="Sede"
              options={sedeOptions}
              value={filtros.idSede}
              onChange={(e) => setFiltros((prev) => ({ ...prev, idSede: e.target.value }))}
              disabled={loadingCatalogos}
            />
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() =>
                setFiltros({
                  periodoAcademico: '',
                  codigoTipoPractica: '',
                  estadoExpediente: '',
                  idEmpresa: '',
                  idSede: '',
                })
              }
            >
              Limpiar filtros
            </Button>
            <Button
              loading={loading}
              onClick={generarReporte}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Filter size={16} aria-hidden="true" />
              Generar reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {errorMessage}
        </div>
      )}
      {exportMessage && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          {exportMessage}
        </div>
      )}

      {loading ? (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <Skeleton variant="circular" className="h-10 w-10" />
            <Skeleton variant="text" className="w-40" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Generando reporte...
          </p>
        </Card>
      ) : hasGenerated && resultado ? (
        <Card>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-primary-700 dark:text-primary-400">
                  {resultado.titulo || REPORT_TYPES.find((item) => item.value === tipoReporte)?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {resultado.totalRegistros || 0} registros · {resultado.descripcion || 'Consulta consolidada del SGPP.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  loading={exportando}
                  onClick={() => exportarReporte('CSV')}
                  disabled={exportando}
                  className="w-full sm:w-auto"
                >
                  <Download size={16} aria-hidden="true" />
                  Exportar CSV
                </Button>
                <Button
                  loading={exportando}
                  onClick={() => exportarReporte('PDF')}
                  disabled={exportando}
                  className="w-full sm:w-auto"
                >
                  <Download size={16} aria-hidden="true" />
                  Exportar PDF
                </Button>
              </div>
            </div>

            {resultado.registros?.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columnas.map((col) => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.registros.map((row: any, index: number) => (
                      <TableRow key={row.idExpediente || row.id || index}>
                        {columnas.map((col) => (
                          <TableCell key={`${col.key}-${row.idExpediente || row.id || index}`}>
                            {col.key.toLowerCase().includes('estado') || col.key.toLowerCase().includes('vigente') ? (
                              <Badge variant={getEstadoBadgeVariant(row[col.key])} size="sm">
                                {formatValue(row[col.key])}
                              </Badge>
                            ) : (
                              <span className="text-sm text-foreground">
                                {formatValue(row[col.key])}
                              </span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          {row.idExpediente ? (
                            <Tooltip content={isAdminView ? 'Ver expedientes' : 'Ver detalle'}>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="min-h-10 w-full sm:w-auto"
                                onClick={() =>
                                  navigate(
                                    isAdminView
                                      ? '/admin/expedientes'
                                      : `/coordinacion/expedientes/${row.idExpediente}`
                                  )
                                }
                              >
                                <Eye size={14} aria-hidden="true" />
                                <span className="hidden sm:inline">{isAdminView ? 'Ver expedientes' : 'Ver detalle'}</span>
                              </Button>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Sin detalle
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                El reporte no devolvió registros con los filtros seleccionados.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <h3 className="mb-1 text-lg font-semibold text-primary-700 dark:text-primary-400">
            Aún no se ha generado un reporte
          </h3>
          <p className="text-sm text-muted-foreground">
            Selecciona el tipo de reporte, aplica los filtros necesarios y luego pulsa <strong>Generar reporte</strong>.
          </p>
        </Card>
      )}
    </motion.div>
  );
};

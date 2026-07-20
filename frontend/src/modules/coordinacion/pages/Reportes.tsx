import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Filter, Eye, BarChart3 } from 'lucide-react';
import { useReportePorTipo, useExportarReporte } from '../../../hooks/useCoordinacion';
import { useSedes, useEmpresas } from '../../../hooks/useSedes';
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
} from '../../../ui';

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
  { value: 'SOLICITADO', label: 'Solicitud registrada' },
  { value: 'VALIDADO_SECRETARIA', label: 'Validado por Secretaría' },
  { value: 'CARTA_PRESENTACION_EMITIDA', label: 'Carta de Presentación emitida' },
  { value: 'CARTA_ACEPTACION_PRESENTADA', label: 'Carta de Aceptación presentada' },
  { value: 'PLAN_PRESENTADO', label: 'Plan presentado' },
  { value: 'PLAN_APROBADO', label: 'Plan aprobado' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'OBSERVADO', label: 'Observado' },
  { value: 'EN_EJECUCION', label: 'En ejecución' },
  { value: 'INFORME_FINAL_PRESENTADO', label: 'Informe final presentado' },
  { value: 'INFORME_APROBADO', label: 'Informe aprobado' },
  { value: 'EVALUADO', label: 'Evaluado' },
  { value: 'DICTAMEN_EMITIDO', label: 'Dictamen emitido' },
  { value: 'CERRADO', label: 'Cerrado' },
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
    { key: 'sedesActivas', label: 'Sedes' },
    { key: 'conveniosVigentes', label: 'Convenios vigentes' },
  ],
  SEDES_VALIDADAS: [
    { key: 'nombreSede', label: 'Sede' },
    { key: 'razonSocialEmpresa', label: 'Empresa' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'totalExpedientes', label: 'Expedientes' },
    { key: 'validadaVigente', label: 'Validación' },
  ],
  CONVENIOS_VIGENTES: [
    { key: 'numeroConvenio', label: 'Convenio' },
    { key: 'razonSocialEmpresa', label: 'Empresa' },
    { key: 'fechaInicio', label: 'Inicio' },
    { key: 'fechaFin', label: 'Fin' },
    { key: 'expedientesRelacionados', label: 'Expedientes' },
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div
            className="rounded-xl p-2"
            style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-primary)' }}
          >
            <BarChart3 size={24} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--color-foreground)' }}
            >
              {isAdminView ? 'Reportes Administrativos' : 'Reportes Consolidados'}
            </h1>
            <p style={{ color: 'var(--color-muted-foreground)' }}>
              {isAdminView
                ? 'Consulta y exporta reportes operativos de expedientes, empresas, sedes y convenios para la gestión administrativa del SGPP.'
                : 'Genera reportes ejecutivos por periodo, tipo de práctica, estado, empresa y sede.'}
            </p>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--color-foreground)' }}
        >
          Configuración de Reporte
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
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

        <div className="flex flex-wrap gap-3 mt-5 justify-end">
          <Button
            variant="secondary"
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
          >
            <Filter size={16} />
            Generar reporte
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{
            backgroundColor: 'var(--color-muted)',
            borderColor: 'var(--color-error)',
            color: 'var(--color-error)',
          }}
        >
          {errorMessage}
        </div>
      )}
      {exportMessage && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{
            backgroundColor: 'var(--color-muted)',
            borderColor: 'var(--color-info)',
            color: 'var(--color-info)',
          }}
        >
          {exportMessage}
        </div>
      )}

      {loading ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col items-center gap-3">
            <Skeleton variant="circular" className="h-10 w-10" />
            <Skeleton variant="text" className="w-40" />
          </div>
          <p className="mt-4 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Generando reporte...
          </p>
        </div>
      ) : hasGenerated && resultado ? (
        <>
          <div
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {resultado.titulo || REPORT_TYPES.find((item) => item.value === tipoReporte)?.label}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  {resultado.totalRegistros || 0} registros · {resultado.descripcion || 'Consulta consolidada del SGPP.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  loading={exportando}
                  onClick={() => exportarReporte('CSV')}
                  disabled={exportando}
                >
                  <Download size={16} />
                  Exportar CSV
                </Button>
                <Button
                  loading={exportando}
                  onClick={() => exportarReporte('PDF')}
                  disabled={exportando}
                >
                  <Download size={16} />
                  Exportar PDF
                </Button>
              </div>
            </div>

            {resultado.registros?.length > 0 ? (
              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: 'var(--color-border)' }}
              >
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
                            {col.key.toLowerCase().includes('estado') ? (
                              <Badge variant="primary" size="sm">
                                {formatValue(row[col.key])}
                              </Badge>
                            ) : (
                              <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
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
                                onClick={() =>
                                  navigate(
                                    isAdminView
                                      ? '/admin/expedientes'
                                      : `/coordinacion/expedientes/${row.idExpediente}`
                                  )
                                }
                              >
                                <Eye size={14} />
                                {isAdminView ? 'Ver expedientes' : 'Ver detalle'}
                              </Button>
                            </Tooltip>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
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
              <div
                className="rounded-xl border px-4 py-3"
                style={{
                  backgroundColor: 'var(--color-muted)',
                  borderColor: 'var(--color-info)',
                  color: 'var(--color-info)',
                }}
              >
                El reporte no devolvió registros con los filtros seleccionados.
              </div>
            )}
          </div>
        </>
      ) : (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--color-primary)' }}
          >
            Aún no se ha generado un reporte
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Selecciona el tipo de reporte, aplica los filtros necesarios y luego pulsa `Generar reporte`.
          </p>
        </div>
      )}
    </motion.div>
  );
};

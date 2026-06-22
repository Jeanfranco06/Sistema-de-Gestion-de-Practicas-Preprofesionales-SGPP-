import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Download, FilterAlt, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import { empresaApi, sedeApi } from '../../../api/sedesApi';
import { reportesCoordinacionApi } from '../../../api/coordinacionApi';

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
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'OBSERVADO', label: 'Observado' },
  { value: 'EVALUADO', label: 'Evaluado' },
  { value: 'CERRADO', label: 'Cerrado' },
];

const REPORT_COLUMNS = {
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

const getPayload = (response) => response?.data?.data ?? response?.data ?? [];

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'No disponible';
  return Array.isArray(value) ? value.join(', ') : String(value);
};

export const ReportesCoordinacion = ({ variant = 'coordinacion' }) => {
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
  const [empresas, setEmpresas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [error, setError] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  useEffect(() => {
    const cargarCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        const [empresasRes, sedesRes] = await Promise.all([
          empresaApi.getAll(),
          sedeApi.getAllActive(),
        ]);
        setEmpresas(getPayload(empresasRes) || []);
        setSedes(getPayload(sedesRes) || []);
      } catch (err) {
        console.error('Error cargando catálogos de reportes:', err);
      } finally {
        setLoadingCatalogos(false);
      }
    };

    cargarCatalogos();
  }, []);

  const generarReporte = async () => {
    setLoading(true);
    setError('');
    setExportMessage('');
    try {
      const response = await reportesCoordinacionApi.getReportePorTipo(tipoReporte, filtros);
      setResultado(getPayload(response));
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('No se pudo generar el reporte solicitado.');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = async (formato) => {
    try {
      const info = await reportesCoordinacionApi.descargarReporte(tipoReporte, formato, filtros);
      setExportMessage(
        `Exportación ${formato} completada: ${info.nombreArchivo}${info.trazabilidad ? ` · Trazabilidad ${info.trazabilidad}` : ''}`
      );
    } catch (err) {
      console.error('Error exportando reporte:', err);
      setExportMessage('No se pudo exportar el reporte con los filtros actuales.');
    }
  };

  const columnas = useMemo(() => {
    if (REPORT_COLUMNS[tipoReporte]) return REPORT_COLUMNS[tipoReporte];
    const firstRow = resultado?.registros?.[0];
    return firstRow
      ? Object.keys(firstRow).map((key) => ({ key, label: key }))
      : [];
  }, [resultado, tipoReporte]);

  return (
    <PageContainer>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 0.75 }}>
          {isAdminView ? 'Reportes Administrativos' : 'Reportes Institucionales'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 860 }}>
          {isAdminView
            ? 'Consulta y exporta reportes operativos de expedientes, empresas, sedes y convenios para la gestión administrativa del SGPP.'
            : 'Genera reportes ejecutivos por periodo, tipo de práctica, estado, empresa y sede. La exportación se conecta con el backend institucional y permite descargar salidas en PDF o CSV.'}
        </Typography>
      </Box>

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' },
            gap: 2,
            alignItems: 'end',
          }}
        >
          <TextField
            select
            label="Tipo de reporte"
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
            fullWidth
          >
            {REPORT_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Periodo"
            placeholder="Ej. 2025-I"
            value={filtros.periodoAcademico}
            onChange={(e) => setFiltros((prev) => ({ ...prev, periodoAcademico: e.target.value }))}
            fullWidth
          />

          <TextField
            select
            label="Tipo de práctica"
            value={filtros.codigoTipoPractica}
            onChange={(e) => setFiltros((prev) => ({ ...prev, codigoTipoPractica: e.target.value }))}
            fullWidth
          >
            {TIPOS_PRACTICA.map((option) => (
              <MenuItem key={option.label} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Estado"
            value={filtros.estadoExpediente}
            onChange={(e) => setFiltros((prev) => ({ ...prev, estadoExpediente: e.target.value }))}
            fullWidth
          >
            {ESTADOS.map((option) => (
              <MenuItem key={option.label} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Empresa"
            value={filtros.idEmpresa}
            onChange={(e) => setFiltros((prev) => ({ ...prev, idEmpresa: e.target.value }))}
            fullWidth
            disabled={loadingCatalogos}
          >
            <MenuItem value="">Todas las empresas</MenuItem>
            {empresas.map((empresa) => (
              <MenuItem key={empresa.id} value={empresa.id}>
                {empresa.razonSocial || empresa.nombreEmpresa}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Sede"
            value={filtros.idSede}
            onChange={(e) => setFiltros((prev) => ({ ...prev, idSede: e.target.value }))}
            fullWidth
            disabled={loadingCatalogos}
          >
            <MenuItem value="">Todas las sedes</MenuItem>
            {sedes.map((sede) => (
              <MenuItem key={sede.id} value={sede.id}>
                {sede.nombreSede || sede.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2.5 }}>
          <Button variant="contained" startIcon={<FilterAlt />} onClick={generarReporte} disabled={loading}>
            Generar reporte
          </Button>
          <Button
            variant="outlined"
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
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {exportMessage && <Alert severity="info" sx={{ mb: 3 }}>{exportMessage}</Alert>}

      {loading ? (
        <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Generando reporte...
          </Typography>
        </Paper>
      ) : resultado ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
              gap: 2,
              mb: 3,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="body2" color="text.secondary">Reporte</Typography>
              <Typography variant="h6" fontWeight={700}>{resultado.titulo || REPORT_TYPES.find((item) => item.value === tipoReporte)?.label}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="body2" color="text.secondary">Registros</Typography>
              <Typography variant="h6" fontWeight={700}>{resultado.totalRegistros || 0}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="body2" color="text.secondary">Generado en</Typography>
              <Typography variant="h6" fontWeight={700}>{resultado.generadoEn ? new Date(resultado.generadoEn).toLocaleString('es-PE') : 'No disponible'}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="body2" color="text.secondary">Resumen</Typography>
              <Typography variant="h6" fontWeight={700}>
                {resultado.resumen?.totalRegistros ?? resultado.totalRegistros ?? 0}
              </Typography>
            </Paper>
          </Box>

          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 1.5 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Resultados del reporte
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {resultado.descripcion || 'Consulta consolidada conectada al backend institucional.'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Download />} onClick={() => exportarReporte('CSV')}>
                  Exportar CSV
                </Button>
                <Button variant="contained" startIcon={<Download />} onClick={() => exportarReporte('PDF')}>
                  Exportar PDF
                </Button>
              </Box>
            </Box>

            {resultado.registros?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {columnas.map((col) => (
                        <TableCell key={col.key}>{col.label}</TableCell>
                      ))}
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultado.registros.map((row, index) => (
                      <TableRow key={row.idExpediente || row.id || index} hover>
                        {columnas.map((col) => (
                          <TableCell key={`${col.key}-${row.idExpediente || row.id || index}`}>
                            {col.key.toLowerCase().includes('estado') ? (
                              <Chip size="small" label={formatValue(row[col.key])} color="primary" variant="outlined" />
                            ) : (
                              formatValue(row[col.key])
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="right">
                          {row.idExpediente ? (
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => navigate(`/coordinacion/expedientes/${row.idExpediente}`)}
                            >
                              Ver detalle
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sin detalle
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">El reporte no devolvió registros con los filtros seleccionados.</Alert>
            )}
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Aún no se ha generado un reporte
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selecciona el tipo de reporte, aplica los filtros necesarios y luego pulsa `Generar reporte`.
          </Typography>
        </Paper>
      )}
    </PageContainer>
  );
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Apartment,
  Assessment,
  AutoGraph,
  BarChart,
  Business,
  FolderOpen,
  GppGood,
  People,
  PlaylistAddCheckCircle,
  SupervisorAccount,
  Visibility,
  WarningAmber,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageContainer from '../../../shared/components/PageContainer';
import { convenioApi, empresaApi, sedeApi } from '../../../api/sedesApi';
import { dashboardApi, reportesCoordinacionApi } from '../../../api/coordinacionApi';
import { secretariaApi, tutoresApi, usuariosApi } from '../../../api/usuariosApi';

const COLORS = ['#2563eb', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#06b6d4'];

/** Datos de demostración cuando la BD local aún no tiene expedientes. */
const DEMO_CHARTS = {
  periodos: [
    { periodo: '2024-II', activos: 22, cerrados: 14, total: 36 },
    { periodo: '2025-I', activos: 31, cerrados: 9, total: 40 },
  ],
  tipos: [
    { name: 'Práctica Inicial', value: 28, activos: 20, cerrados: 8 },
    { name: 'Práctica Final', value: 34, activos: 26, cerrados: 8 },
    { name: 'Práctica Profesional', value: 14, activos: 9, cerrados: 5 },
  ],
  estados: [
    { name: 'En proceso', value: 24 },
    { name: 'Observado', value: 8 },
    { name: 'Evaluado', value: 12 },
    { name: 'Cerrado', value: 23 },
    { name: 'Pendiente', value: 9 },
  ],
  empresas: [
    { name: 'Agroind. Casa Grande', total: 18, activos: 12 },
    { name: 'Corp. Norte S.A.', total: 14, activos: 10 },
    { name: 'Ind. del Pacífico', total: 11, activos: 8 },
    { name: 'Metalúrgica Trujillo', total: 9, activos: 6 },
    { name: 'Logística Andina', total: 7, activos: 5 },
  ],
  sedes: [
    { name: 'Trujillo Centro', total: 22, activos: 16 },
    { name: 'La Libertad Norte', total: 17, activos: 12 },
    { name: 'Chepén', total: 13, activos: 9 },
    { name: 'Pacasmayo', total: 10, activos: 7 },
    { name: 'Virú', total: 8, activos: 5 },
  ],
};

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

const emptyDashboard = {
  resumen: null,
  kpis: null,
  activos: null,
  cerrados: null,
  convenios: null,
  expiringConvenios: [],
};

const emptyAdminMetrics = {
  usuarios: 0,
  tutores: 0,
  estudiantes: 0,
  empresas: 0,
  sedes: 0,
  convenios: 0,
  roles: [],
};

const getPayload = (response) => response?.data?.data ?? response?.data ?? null;

const numberFormat = (value) => new Intl.NumberFormat('es-PE').format(value || 0);

const percentFormat = (value) =>
  new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 }).format(value || 0);

const hasChartData = (list = [], keys = ['value']) =>
  Array.isArray(list) && list.some((item) => keys.some((key) => Number(item?.[key] || 0) > 0));

const MetricCard = ({ title, value, helper, icon }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.25 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" fontWeight={600} sx={{ lineHeight: 1.2, mt: 0.5 }}>
          {numberFormat(value)}
        </Typography>
        <Typography variant="caption" color="text.secondary">{helper}</Typography>
      </Box>
    </Box>
  </Paper>
);

const ChartCard = ({ title, subtitle, badge, children, minHeight = 320 }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start', mb: 0.5 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {badge && <Chip size="small" color="primary" variant="outlined" label={badge} />}
    </Box>
    <Box sx={{ width: '100%', minHeight }}>{children}</Box>
  </Paper>
);

const EmptyChartState = ({ title, description, highlight }) => (
  <Box
    sx={{
      minHeight: 290,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 3,
    }}
  >
    <Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.secondary',
          mx: 'auto',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AutoGraph />
      </Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      {highlight && (
        <Chip
          label={highlight}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 1.5 }}
        />
      )}
    </Box>
  </Box>
);

const QuickActionCard = ({ title, helper, icon, onClick }) => (
  <Paper
    variant="outlined"
    onClick={onClick}
    sx={{
      p: 2,
      borderRadius: 2,
      cursor: 'pointer',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export const DashboardCoordinacion = ({ variant = 'coordinacion' }) => {
  const navigate = useNavigate();
  const isAdminView = variant === 'admin';
  const [filtros, setFiltros] = useState({
    periodoAcademico: '',
    codigoTipoPractica: '',
    estadoExpediente: '',
  });
  const [data, setData] = useState(emptyDashboard);
  const [adminMetrics, setAdminMetrics] = useState(emptyAdminMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dashboardRequests = [
        dashboardApi.getResumenEjecutivo(filtros),
        dashboardApi.getDashboardKpis(filtros),
        reportesCoordinacionApi.getExpedientesActivos(filtros),
        reportesCoordinacionApi.getExpedientesCerrados(filtros),
        reportesCoordinacionApi.getConveniosVigentes(filtros),
        convenioApi.getExpiring(45).catch(() => ({ data: [] })),
      ];

      const adminRequests = isAdminView
        ? [
            usuariosApi.getAll().catch(() => ({ data: [] })),
            tutoresApi.getAll().catch(() => ({ data: [] })),
            secretariaApi.getAllEstudiantes().catch(() => ({ data: [] })),
            empresaApi.getAll().catch(() => ({ data: [] })),
            sedeApi.getAllActive().catch(() => ({ data: [] })),
            convenioApi.getAllActive().catch(() => ({ data: [] })),
          ]
        : [];

      const responses = await Promise.all([...dashboardRequests, ...adminRequests]);

      const [resumenRes, kpisRes, activosRes, cerradosRes, conveniosRes, expiringRes, ...adminRes] = responses;

      setData({
        resumen: getPayload(resumenRes),
        kpis: getPayload(kpisRes),
        activos: getPayload(activosRes),
        cerrados: getPayload(cerradosRes),
        convenios: getPayload(conveniosRes),
        expiringConvenios: getPayload(expiringRes) || [],
      });

      if (isAdminView) {
        const [usuariosRes, tutoresRes, estudiantesRes, empresasRes, sedesRes, conveniosAllRes] = adminRes;
        const usuarios = getPayload(usuariosRes) || [];
        const roles = Object.entries(
          usuarios.reduce((acc, user) => {
            const role = user?.roles?.[0] || 'SIN_ROL';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          }, {})
        )
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        setAdminMetrics({
          usuarios: usuarios.length,
          tutores: (getPayload(tutoresRes) || []).length,
          estudiantes: (getPayload(estudiantesRes) || []).length,
          empresas: (getPayload(empresasRes) || []).length,
          sedes: (getPayload(sedesRes) || []).length,
          convenios: (getPayload(conveniosAllRes) || []).length,
          roles,
        });
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('No se pudo cargar el dashboard. Verifica que el backend esté disponible y que tu sesión tenga permisos.');
    } finally {
      setLoading(false);
    }
  }, [filtros, isAdminView]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const periodosChart = useMemo(() => {
    const activos = data.activos?.resumen?.conteoPorPeriodo || {};
    const cerrados = data.cerrados?.resumen?.conteoPorPeriodo || {};
    const allKeys = [...new Set([...Object.keys(activos), ...Object.keys(cerrados)])].sort();
    return allKeys.map((periodo) => ({
      periodo,
      activos: activos[periodo] || 0,
      cerrados: cerrados[periodo] || 0,
      total: (activos[periodo] || 0) + (cerrados[periodo] || 0),
    }));
  }, [data.activos, data.cerrados]);

  const tiposChart = useMemo(
    () =>
      (data.kpis?.expedientesPorTipo?.datos?.segmentos || []).map((segmento) => ({
        name: segmento.nombreTipoPractica,
        value: segmento.cantidad,
        activos: segmento.activos,
        cerrados: segmento.cerrados,
      })),
    [data.kpis]
  );

  const estadosChart = useMemo(() => {
    const activos = data.activos?.resumen?.conteoPorEstado || {};
    const cerrados = data.cerrados?.resumen?.conteoPorEstado || {};
    const merged = {};
    [...Object.entries(activos), ...Object.entries(cerrados)].forEach(([key, value]) => {
      merged[key] = (merged[key] || 0) + value;
    });
    return Object.entries(merged).map(([name, value]) => ({ name, value }));
  }, [data.activos, data.cerrados]);

  const empresasChart = useMemo(
    () =>
      (data.kpis?.empresasRecurrentes?.datos?.ranking || []).slice(0, 6).map((empresa) => ({
        name: empresa.razonSocial,
        total: empresa.totalExpedientes,
        activos: empresa.expedientesActivos,
      })),
    [data.kpis]
  );

  const sedesChart = useMemo(
    () =>
      (data.kpis?.distribucionSedes?.datos?.segmentos || []).slice(0, 6).map((sede) => ({
        name: sede.nombreSede,
        total: sede.totalExpedientes,
        activos: sede.expedientesActivos,
      })),
    [data.kpis]
  );

  const alertasCriticas = useMemo(() => {
    const riesgoPlazos = (data.kpis?.cumplimientoPlazos?.datos?.casosEnRiesgo || []).map((caso) => ({
      id: `plazo-${caso.idExpediente}-${caso.codigoRegla}`,
      tipo: 'Expediente crítico',
      titulo: caso.codigoExpediente,
      detalle: `${caso.codigoRegla} · ${caso.estadoPlazo} · ${caso.fechaLimite}`,
      severidad: caso.diasRestantes <= 0 ? 'error' : 'warning',
      expedienteId: caso.idExpediente,
    }));

    const convenios = (data.expiringConvenios || []).slice(0, 5).map((convenio, index) => ({
      id: `convenio-${convenio.id || index}`,
      tipo: 'Convenio por vencer',
      titulo: convenio.numeroConvenio || convenio.razonSocialEmpresa || 'Convenio institucional',
      detalle: convenio.fechaFin ? `Vence el ${convenio.fechaFin}` : 'Convenio próximo a vencer',
      severidad: 'warning',
    }));

    return [...riesgoPlazos, ...convenios].slice(0, 8);
  }, [data.expiringConvenios, data.kpis]);

  const expedientesCriticos = useMemo(
    () => (data.activos?.registros || []).filter((item) => item.estadoActual === 'OBSERVADO').slice(0, 6),
    [data.activos]
  );

  const chartsHaveRealData = useMemo(
    () =>
      hasChartData(periodosChart, ['activos', 'cerrados', 'total']) ||
      hasChartData(tiposChart, ['value']) ||
      hasChartData(estadosChart, ['value']) ||
      hasChartData(empresasChart, ['total']) ||
      hasChartData(sedesChart, ['total']),
    [periodosChart, tiposChart, estadosChart, empresasChart, sedesChart]
  );

  const usingDemoCharts = !loading && !chartsHaveRealData;

  const displayPeriodos = usingDemoCharts ? DEMO_CHARTS.periodos : periodosChart;
  const displayTipos = usingDemoCharts ? DEMO_CHARTS.tipos : tiposChart;
  const displayEstados = usingDemoCharts ? DEMO_CHARTS.estados : estadosChart;
  const displayEmpresas = usingDemoCharts ? DEMO_CHARTS.empresas : empresasChart;
  const displaySedes = usingDemoCharts ? DEMO_CHARTS.sedes : sedesChart;

  const displayResumen = usingDemoCharts
    ? {
        expedientesActivos: 31,
        expedientesCerrados: 23,
        subsanacionesPendientes: 8,
        conveniosVigentes: 12,
      }
    : data.resumen;

  const displayAdminMetrics = usingDemoCharts && isAdminView && adminMetrics.usuarios === 0
    ? {
        usuarios: 24,
        tutores: 8,
        estudiantes: 45,
        empresas: 12,
        sedes: 18,
        convenios: 9,
        roles: [
          { name: 'ESTUDIANTE', value: 8 },
          { name: 'DOCENTE_ASESOR', value: 5 },
          { name: 'SECRETARIA', value: 3 },
          { name: 'COORDINADOR', value: 2 },
          { name: 'TUTOR_EXTERNO', value: 4 },
          { name: 'COMITE_PRACTICAS', value: 2 },
        ],
      }
    : adminMetrics;

  const viewMeta = isAdminView
    ? {
        title: 'Dashboard Administrativo',
        subtitle:
          'Vista operativa e institucional para administración del SGPP: expedientes, convenios, usuarios, empresas y control de la carga operativa.',
        scopeLabel: 'Vista admin',
      }
    : {
        title: 'Panel Ejecutivo',
        subtitle:
          'Monitorea expedientes, cumplimiento de plazos, distribución por tipo de práctica, empresas receptoras y alertas institucionales para la toma de decisiones.',
        scopeLabel: 'Vista coordinación',
      };

  return (
    <PageContainer>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 0.75 }}>
          {viewMeta.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 920, mb: 1.5 }}>
          {viewMeta.subtitle}
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip size="small" color="primary" variant="outlined" label={viewMeta.scopeLabel} />
          <Chip size="small" variant="outlined" label={`Alertas activas: ${alertasCriticas.length}`} />
          <Chip size="small" variant="outlined" label={`Convenios vigilados: ${numberFormat(displayResumen?.conveniosVigentes)}`} />
        </Stack>
      </Box>

      <Paper id="tabla-expedientes" variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
            gap: 2,
            alignItems: 'end',
          }}
        >
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
            label="Estado de expediente"
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={cargarDashboard} disabled={loading}>
              Actualizar
            </Button>
            <Button
              variant="outlined"
              onClick={() => setFiltros({ periodoAcademico: '', codigoTipoPractica: '', estadoExpediente: '' })}
            >
              Limpiar
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {usingDemoCharts && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          La base de datos local aún no tiene expedientes registrados. Se muestran <strong>datos de demostración</strong> para que puedas visualizar el panel ejecutivo. Cuando existan trámites reales, los gráficos se actualizarán automáticamente.
        </Alert>
      )}

      {loading ? (
        <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cargando indicadores...
          </Typography>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: isAdminView ? 'repeat(6, 1fr)' : 'repeat(5, 1fr)' },
              gap: 2,
              mb: 3,
            }}
          >
            <MetricCard
              title="Expedientes activos"
              value={displayResumen?.expedientesActivos}
              helper="Trámites en curso"
              icon={<FolderOpen />}
            />
            <MetricCard
              title="Expedientes cerrados"
              value={displayResumen?.expedientesCerrados}
              helper="Casos concluidos"
              icon={<GppGood />}
            />
            <MetricCard
              title="Subsanaciones pendientes"
              value={displayResumen?.subsanacionesPendientes}
              helper="Observaciones por atender"
              icon={<PlaylistAddCheckCircle />}
            />
            <MetricCard
              title="Convenios vigentes"
              value={displayResumen?.conveniosVigentes}
              helper="Cobertura institucional activa"
              icon={<Business />}
            />
            <MetricCard
              title="Alertas críticas"
              value={alertasCriticas.length}
              helper="Plazos o convenios en riesgo"
              icon={<WarningAmber />}
            />
            {isAdminView && (
              <MetricCard
                title="Usuarios del sistema"
                value={displayAdminMetrics.usuarios}
                helper="Cuentas registradas"
                icon={<People />}
              />
            )}
          </Box>

          {isAdminView && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', xl: '1.2fr 0.8fr' },
                gap: 3,
                mb: 3,
              }}
            >
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  Gestión administrativa rápida
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Accesos directos a los módulos más usados por administración.
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                  <QuickActionCard title="Usuarios" helper="Roles, bloqueos y accesos" icon={<People />} onClick={() => navigate('/admin/usuarios')} />
                  <QuickActionCard title="Tutores externos" helper="Administración del padrón" icon={<SupervisorAccount />} onClick={() => navigate('/admin/tutores')} />
                  <QuickActionCard title="Validar requisitos" helper="Control académico previo" icon={<Assessment />} onClick={() => navigate('/admin/validar-requisitos')} />
                  <QuickActionCard 
                    title="Expedientes" 
                    helper="Gestión y asignaciones" 
                    icon={<FolderOpen />} 
                    onClick={() => navigate('/comite/panel')} 
                  />
                </Box>
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  Cobertura operativa
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Volumen de actores y catálogos activos del sistema.
                </Typography>
                <Stack spacing={1.25}>
                  <MetricLine label="Tutores externos" value={displayAdminMetrics.tutores} icon={<SupervisorAccount fontSize="small" />} />
                  <MetricLine label="Estudiantes visibles" value={displayAdminMetrics.estudiantes} icon={<People fontSize="small" />} />
                  <MetricLine label="Empresas registradas" value={displayAdminMetrics.empresas} icon={<Business fontSize="small" />} />
                  <MetricLine label="Sedes activas" value={displayAdminMetrics.sedes} icon={<Apartment fontSize="small" />} />
                  <MetricLine label="Convenios activos" value={displayAdminMetrics.convenios} icon={<Assessment fontSize="small" />} />
                </Stack>
              </Paper>
            </Box>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: '1.3fr 1fr' },
              gap: 3,
              mb: 3,
            }}
          >
            <ChartCard
              title="Expedientes por periodo"
              subtitle="Comparativo entre expedientes activos y cerrados por periodo académico."
              badge={`${numberFormat(displayPeriodos.reduce((acc, item) => acc + item.total, 0))} casos`}
            >
              {hasChartData(displayPeriodos, ['activos', 'cerrados', 'total']) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={displayPeriodos} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => numberFormat(value)} />
                    <Legend />
                    <Bar dataKey="activos" name="Activos" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
                    <Bar dataKey="cerrados" name="Cerrados" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </ReBarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  title="Aún no hay serie temporal suficiente"
                  description="Cuando existan expedientes activos o cerrados por periodo, este gráfico mostrará su evolución."
                  highlight="Esperando histórico"
                />
              )}
            </ChartCard>

            <ChartCard
              title="Distribución por tipo"
              subtitle="Participación de cada tipo de práctica en el volumen total."
              badge={`${displayTipos.length} categorías`}
            >
              {hasChartData(displayTipos, ['value']) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={displayTipos}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      innerRadius={58}
                      paddingAngle={3}
                    >
                      {displayTipos.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => numberFormat(value)} />
                    <Legend layout="horizontal" verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  title="Sin distribución disponible"
                  description="Todavía no hay expedientes suficientes para segmentar por tipo de práctica."
                  highlight="Sin segmentación"
                />
              )}
            </ChartCard>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: isAdminView ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' },
              gap: 3,
              mb: 3,
            }}
          >
            <ChartCard
              title="Estado de expedientes"
              subtitle="Fotografía del flujo documental según estado actual."
            >
              {hasChartData(displayEstados, ['value']) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={displayEstados} dataKey="value" nameKey="name" outerRadius={100} innerRadius={52} paddingAngle={2}>
                      {displayEstados.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => numberFormat(value)} />
                    <Legend layout="horizontal" verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  title="Sin estado consolidado"
                  description="El backend aún no devolvió expedientes con estado agrupado para los filtros seleccionados."
                />
              )}
            </ChartCard>

            <ChartCard
              title="Empresas receptoras"
              subtitle="Ranking de empresas con mayor cantidad de expedientes."
            >
              {hasChartData(displayEmpresas, ['total']) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={displayEmpresas} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => numberFormat(value)} />
                    <Bar dataKey="total" name="Expedientes" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={28} />
                  </ReBarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  title="Ranking no disponible"
                  description="Aún no hay empresas receptoras con expedientes suficientes para ordenar el ranking."
                />
              )}
            </ChartCard>

            <ChartCard
              title="Sedes con mayor concentración"
              subtitle="Distribución institucional de expedientes por sede validada."
            >
              {hasChartData(displaySedes, ['total']) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={displaySedes} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={56} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => numberFormat(value)} />
                    <Line type="monotone" dataKey="total" name="Expedientes" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  title="Sin densidad por sede"
                  description="Todavía no hay suficiente información para calcular concentración por sede."
                />
              )}
            </ChartCard>

            {isAdminView && (
              <ChartCard
                title="Distribución de usuarios por rol"
                subtitle="Composición operativa de cuentas registradas en el sistema."
              >
                {hasChartData(displayAdminMetrics.roles, ['value']) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={displayAdminMetrics.roles} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50}>
                        {displayAdminMetrics.roles.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => numberFormat(value)} />
                      <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ paddingTop: 20, fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState
                    title="Sin distribución de roles"
                    description="No fue posible recuperar usuarios para construir la composición del sistema."
                  />
                )}
              </ChartCard>
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: '1.1fr 0.9fr' },
              gap: 3,
            }}
          >
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                Alertas institucionales
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Expedientes con riesgo de vencimiento y convenios próximos a expirar.
              </Typography>
              <Stack spacing={1.5}>
                {alertasCriticas.length > 0 ? (
                  alertasCriticas.map((alerta) => (
                    <Alert
                      key={alerta.id}
                      severity={alerta.severidad}
                      action={
                        alerta.expedienteId ? (
                          <Button
                            color="inherit"
                            size="small"
                            onClick={() => navigate(`/coordinacion/expedientes/${alerta.expedienteId}`)}
                          >
                            Revisar
                          </Button>
                        ) : null
                      }
                    >
                      <strong>{alerta.tipo}:</strong> {alerta.titulo} · {alerta.detalle}
                    </Alert>
                  ))
                ) : (
                  <Alert severity="success">No hay alertas críticas con los filtros actuales.</Alert>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                Expedientes observados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Casos activos que requieren seguimiento inmediato.
              </Typography>
              <Stack spacing={1.25}>
                {expedientesCriticos.length > 0 ? (
                  expedientesCriticos.map((item) => (
                    <Paper
                      key={item.idExpediente}
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', gap: 1.5 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {item.codigoExpediente}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {item.nombreEstudiante}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.razonSocialEmpresa || 'Sin empresa'} · {item.nombreTipoPractica}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end" spacing={1}>
                        <Chip size="small" color="warning" label={item.estadoActual} />
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/coordinacion/expedientes/${item.idExpediente}`)}
                        >
                          Ver
                        </Button>
                      </Stack>
                    </Paper>
                  ))
                ) : (
                  <Alert severity="info">No hay expedientes observados en el conjunto filtrado.</Alert>
                )}
              </Stack>
            </Paper>
          </Box>

          <Paper sx={{ p: 2.5, mt: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              Indicadores de cumplimiento
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Métricas calculadas por el backend sobre plazos normativos y subsanaciones.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Tasa de cumplimiento</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {percentFormat(data.kpis?.cumplimientoPlazos?.datos?.tasaCumplimiento)}%
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Plazos próximos a vencer</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {numberFormat(data.kpis?.cumplimientoPlazos?.datos?.proximosAVencer)}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Observaciones vencidas</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {numberFormat(data.kpis?.estadoObservaciones?.datos?.vencidas)}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Subsanación lograda</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {percentFormat(data.kpis?.estadoObservaciones?.datos?.tasaSubsanacion)}%
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </>
      )}
    </PageContainer>
  );
};

function MetricLine({ label, value, icon }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Typography variant="body2">{label}</Typography>
      </Box>
      <Typography variant="subtitle2" fontWeight={700}>
        {numberFormat(value)}
      </Typography>
    </Box>
  );
}

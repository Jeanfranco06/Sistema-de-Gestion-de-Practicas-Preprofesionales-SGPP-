import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Box, Chip, FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, CircularProgress, Alert, Drawer, Divider,
  Avatar, IconButton, Stack, Badge, Tooltip, Button
} from '@mui/material';
import {
  Search, Business, LocationOn, Work, People, CheckCircle,
  Cancel, Warning, FilterList, Clear, Close, Info,
  Apartment, CorporateFare, School
} from '@mui/icons-material';
import { sedeApi } from '../../../api/sedesApi';
import { practicaApi } from '../../../api/practicasApi';
import { useAuth } from '../../../auth/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';
import StatStrip from '../../../shared/components/StatStrip';

const MySwal = withReactContent(Swal);

export const CatalogoSedes = () => {
  const { user } = useAuth();
  const [sedes, setSedes] = useState([]);
  const [filteredSedes, setFilteredSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtros
  const [tipoEntidad, setTipoEntidad] = useState('');
  const [vigenciaConvenio, setVigenciaConvenio] = useState('todos');
  const [disponibilidad, setDisponibilidad] = useState('todos');
  const [estadoValidacion, setEstadoValidacion] = useState('todos');
  const [tieneTutor, setTieneTutor] = useState('todos');
  const [mostrarSoloElegibles, setMostrarSoloElegibles] = useState(false);

  useEffect(() => {
    const fetchCatalogoSedes = async () => {
      try {
        setLoading(true);
        const response = await sedeApi.getCatalogo();
        setSedes(response.data);
        setFilteredSedes(response.data);
        setError(null);
      } catch (err) {
        console.error('Error cargando catálogo de sedes:', err);
        setError('Error al cargar el catálogo de sedes. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogoSedes();
  }, []);

  useEffect(() => {
    let filtered = sedes.filter(sede => {
      // Búsqueda por texto
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        sede.nombreSede?.toLowerCase().includes(searchLower) ||
        sede.razonSocialEmpresa?.toLowerCase().includes(searchLower) ||
        sede.distrito?.toLowerCase().includes(searchLower) ||
        sede.provincia?.toLowerCase().includes(searchLower) ||
        sede.departamento?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filtro por tipo de entidad
      if (tipoEntidad && sede.tipoEntidad !== tipoEntidad) return false;

      // Filtro por vigencia de convenio
      if (vigenciaConvenio === 'vigente' && !sede.tieneConvenioVigente) return false;
      if (vigenciaConvenio === 'no vigente' && sede.tieneConvenioVigente) return false;

      // Filtro por disponibilidad
      if (disponibilidad === 'disponible' && sede.vacantesDisponibles <= 0) return false;
      if (disponibilidad === 'no disponible' && sede.vacantesDisponibles > 0) return false;

      // Filtro por estado de validación
      if (estadoValidacion === 'aprobada' && sede.resultadoValidacion !== 'APROBADA') return false;
      if (estadoValidacion === 'observada' && sede.resultadoValidacion !== 'OBSERVADA') return false;
      if (estadoValidacion === 'rechazada' && sede.resultadoValidacion !== 'RECHAZADA') return false;

      // Filtro por tutor asignado
      if (tieneTutor === 'si' && !sede.tieneTutorActivo) return false;
      if (tieneTutor === 'no' && sede.tieneTutorActivo) return false;

      // Filtro por elegibilidad
      if (mostrarSoloElegibles && !sede.esElegible) return false;

      return true;
    });

    setFilteredSedes(filtered);
  }, [sedes, searchTerm, tipoEntidad, vigenciaConvenio, disponibilidad, estadoValidacion, tieneTutor, mostrarSoloElegibles]);

  const [selectedSede, setSelectedSede] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDetails = async (sede) => {
    try {
      setLoading(true);
      const response = await sedeApi.getDetalle(sede.id);
      setSelectedSede(response.data);
      setDrawerOpen(true);
    } catch (err) {
      console.error('Error cargando detalle de sede:', err);
      setError('Error al cargar el detalle de la sede.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setDrawerOpen(false);
    setSelectedSede(null);
  };

  const [selectingSedeId, setSelectingSedeId] = useState(null);

  const handleSeleccionarSede = async (sede) => {
    if (!sede.esElegible) {
      MySwal.fire('Sede no elegible', sede.motivoNoElegible || 'La sede no cumple con los requisitos para ser seleccionada.', 'warning');
      return;
    }

    const result = await MySwal.fire({
      title: '¿Seleccionar esta sede?',
      text: `Confirmas que deseas seleccionar "${sede.nombreSede}" en ${sede.razonSocialEmpresa} para tus prácticas preprofesionales.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, seleccionar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    try {
      setSelectingSedeId(sede.id);
      await practicaApi.seleccionarSede(sede.id);
      await MySwal.fire({
        icon: 'success',
        title: '¡Sede seleccionada!',
        text: `Has seleccionado exitosamente "${sede.nombreSede}". Ahora debes completar tu registro de prácticas.`,
        timer: 3000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error seleccionando sede:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'No se pudo completar la selección. Intenta nuevamente.';
      MySwal.fire('Error', msg, 'error');
    } finally {
      setSelectingSedeId(null);
    }
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setTipoEntidad('');
    setVigenciaConvenio('todos');
    setDisponibilidad('todos');
    setEstadoValidacion('todos');
    setTieneTutor('todos');
    setMostrarSoloElegibles(false);
  };

  const getConvenioBadgeColor = (sede) => {
    if (!sede.tieneConvenioVigente) return 'error';
    return 'success';
  };

  const getValidacionBadgeColor = (sede) => {
    if (!sede.tieneValidacionVigente) return 'default';
    switch (sede.resultadoValidacion) {
      case 'APROBADA': return 'success';
      case 'OBSERVADA': return 'warning';
      case 'RECHAZADA': return 'error';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Sedes', value: sedes.length, icon: <Business fontSize="small" />, accent: 'blue' },
    { label: 'Elegibles', value: filteredSedes.filter(s => s.esElegible).length, icon: <CheckCircle fontSize="small" />, accent: 'emerald' },
    { label: 'Con convenio', value: filteredSedes.filter(s => s.tieneConvenioVigente).length, icon: <Work fontSize="small" />, accent: 'teal' },
    { label: 'Con tutor', value: filteredSedes.filter(s => s.tieneTutorActivo).length, icon: <People fontSize="small" />, accent: 'violet' },
  ];

  if (loading && sedes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<Business />}
        title="Catálogo de empresas y sedes"
        subtitle="Explora empresas e instituciones disponibles para realizar tus prácticas preprofesionales."
        action={<Chip label={`${filteredSedes.length} resultados`} size="small" color="primary" variant="outlined" />}
      />

      <StatStrip items={stats} />

      {error && (
        <Alert severity="error" sx={{ my: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <ContentCard sx={{ my: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FilterList color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>Filtros de Búsqueda</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por empresa, sede, distrito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="medium"
            slotProps={{
              input: {
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchTerm && (
                  <IconButton onClick={() => setSearchTerm('')} size="small">
                    <Clear />
                  </IconButton>
                )
              }
            }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <FormControl fullWidth size="medium">
              <InputLabel>Tipo Entidad</InputLabel>
              <Select
                value={tipoEntidad}
                label="Tipo Entidad"
                onChange={(e) => setTipoEntidad(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PÚBLICA">Pública</MenuItem>
                <MenuItem value="PRIVADA">Privada</MenuItem>
                <MenuItem value="MIXTA">Mixta</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="medium">
              <InputLabel>Convenio</InputLabel>
              <Select
                value={vigenciaConvenio}
                label="Convenio"
                onChange={(e) => setVigenciaConvenio(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="vigente">Vigente</MenuItem>
                <MenuItem value="no vigente">No vigente</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="medium">
              <InputLabel>Validación</InputLabel>
              <Select
                value={estadoValidacion}
                label="Validación"
                onChange={(e) => setEstadoValidacion(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="aprobada">Aprobada</MenuItem>
                <MenuItem value="observada">Observada</MenuItem>
                <MenuItem value="rechazada">Rechazada</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="medium">
              <InputLabel>Tutor</InputLabel>
              <Select
                value={tieneTutor}
                label="Tutor"
                onChange={(e) => setTieneTutor(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="si">Con tutor</MenuItem>
                <MenuItem value="no">Sin tutor</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={mostrarSoloElegibles}
                  onChange={(e) => setMostrarSoloElegibles(e.target.checked)}
                />
              }
              label="Solo sedes elegibles"
            />
            <Button
              variant="outlined"
              size="medium"
              onClick={limpiarFiltros}
              startIcon={<Clear />}
            >
              Limpiar Filtros
            </Button>
          </Box>
        </Box>
      </ContentCard>

      {/* Resultados */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Resultados
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Badge badgeContent={filteredSedes.length} color="primary">
            <Business color="action" />
          </Badge>
          <Typography variant="body2" color="text.secondary">
            de {sedes.length} sedes totales
          </Typography>
          <Box sx={{ height: 24, width: 1, bgcolor: 'divider' }} />
          <Chip
            size="small"
            label={`${filteredSedes.filter(s => s.esElegible).length} elegibles`}
            color="success"
            variant="outlined"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {filteredSedes.map((sede) => (
          <ContentCard
            key={sede.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderColor: sede.esElegible ? 'success.light' : 'divider',
              borderWidth: sede.esElegible ? 2 : 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Avatar sx={{
                  bgcolor: sede.esElegible ? 'success.light' : 'grey.100',
                  color: sede.esElegible ? 'success.main' : 'text.secondary',
                  width: 48,
                  height: 48
                }}>
                  <Business />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" component="h2" fontWeight="bold" noWrap>
                    {sede.razonSocialEmpresa}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {sede.nombreSede}
                  </Typography>
                </Box>
              </Box>
              {sede.esElegible && (
                <Tooltip title="Sede elegible para selección">
                  <CheckCircle color="success" sx={{ fontSize: 28 }} />
                </Tooltip>
              )}
            </Box>

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<LocationOn fontSize="small" />}
                label={sede.distrito}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={sede.tipoEntidad === 'PÚBLICA' ? <Apartment fontSize="small" /> : sede.tipoEntidad === 'PRIVADA' ? <CorporateFare fontSize="small" /> : <School fontSize="small" />}
                label={sede.tipoEntidad}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={sede.tieneConvenioVigente ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                label={sede.tieneConvenioVigente ? 'Convenio Vigente' : 'Sin Convenio'}
                size="small"
                color={getConvenioBadgeColor(sede)}
              />
            </Stack>

            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {sede.departamento}, {sede.provincia}, {sede.distrito}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Work fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {sede.areaDisponible || 'Área no especificada'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {sede.vacantesDisponibles || 0} vacantes disponibles
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={sede.resultadoValidacion || 'No validada'}
                size="small"
                color={getValidacionBadgeColor(sede)}
              />
            </Box>

            {!sede.esElegible && sede.motivoNoElegible && (
              <Alert severity="warning" sx={{ mb: 2, py: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {sede.motivoNoElegible}
                </Typography>
              </Alert>
            )}
            {sede.esElegible && (
              <Alert severity="success" sx={{ mb: 2, py: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Cumple todos los requisitos para prácticas
                </Typography>
              </Alert>
            )}

            <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
              <Button
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => handleOpenDetails(sede)}
                startIcon={<Info />}
                sx={{ flex: 1 }}
              >
                Ver Detalle
              </Button>
              <Button
                size="small"
                color="success"
                variant="contained"
                onClick={() => handleSeleccionarSede(sede)}
                disabled={!sede.esElegible || selectingSedeId === sede.id}
                startIcon={selectingSedeId === sede.id ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                sx={{ flex: 1 }}
              >
                {selectingSedeId === sede.id ? 'Seleccionando...' : 'Seleccionar'}
              </Button>
            </Box>
          </ContentCard>
        ))}
        {filteredSedes.length === 0 && !loading && (
          <ContentCard sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
            <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight="bold">
              No se encontraron sedes
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Intenta ajustar los filtros de búsqueda para encontrar más opciones.
            </Typography>
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              startIcon={<Clear />}
              sx={{ mt: 2 }}
            >
              Limpiar filtros
            </Button>
          </ContentCard>
        )}
      </Box>

      {/* Drawer de detalle */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDetails}
        sx={{
          '& .MuiDrawer-paper': { width: 600 }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {selectedSede && (
            <>
              <Box sx={{
                p: 3,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <Business />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Detalle de Sede
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Información completa
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={handleCloseDetails} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Box>
              <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                <ContentCard accent sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {selectedSede.razonSocialEmpresa}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedSede.nombreSede}
                  </Typography>
                  {selectedSede.esElegible && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <CheckCircle />
                      <Typography variant="body2" fontWeight="bold">
                        Sede elegible para selección
                      </Typography>
                    </Box>
                  )}
                </ContentCard>

                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Datos de la Sede
                </Typography>
                <ContentCard sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Dirección:</strong> {selectedSede.direccion}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Ubicación:</strong> {selectedSede.departamento}, {selectedSede.provincia}, {selectedSede.distrito}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Apartment fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Tipo de entidad:</strong> {selectedSede.tipoEntidad}
                    </Typography>
                  </Box>
                </ContentCard>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </ModulePageShell>
  );
};

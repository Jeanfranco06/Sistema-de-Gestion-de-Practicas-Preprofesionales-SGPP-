import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Chip, Button, TextField, InputAdornment,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton,
} from '@mui/material';
import { Search, Description, ChevronRight } from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { useNavigate } from 'react-router-dom';
import { hasAnyRole } from '../../shared/utils/roleRoutes';
import PageHeader from '../../shared/components/PageHeader';
import ContentCard from '../../shared/components/ContentCard';

export const ListaPracticantes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [practicantes, setPracticantes] = useState([]);
  const [filteredPracticantes, setFilteredPracticantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isTutor = hasAnyRole(user?.roles, ['TUTOR_EXTERNO']);

  useEffect(() => {
    const fetchPracticantes = async () => {
      try {
        setLoading(true);
        const res = await expedientesApi.getMisExpedientes();
        const data = res?.data?.data || [];
        setPracticantes(data);
        setFilteredPracticantes(data);
      } catch (err) {
        console.error('Error al cargar practicantes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPracticantes();
  }, [user]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredPracticantes(
      practicantes.filter((p) =>
        p.nombreEstudiante?.toLowerCase().includes(q) ||
        p.apellidoEstudiante?.toLowerCase().includes(q) ||
        p.codigoEstudiantil?.toLowerCase().includes(q) ||
        p.nombreEmpresa?.toLowerCase().includes(q)
      )
    );
  }, [search, practicantes]);

  const handleEvaluar = (id) => {
    navigate(isTutor ? `/tutor/evaluaciones/${id}` : `/docente/evaluaciones/${id}`);
  };

  const estadoLabel = (estado) => {
    const map = {
      EN_EJECUCION: 'En ejecución',
      EVALUADO: 'Evaluado',
      CERRADO: 'Cerrado',
    };
    return map[estado] || estado?.replace(/_/g, ' ') || 'Pendiente';
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <PageHeader
        title="Practicantes asignados"
        subtitle="Gestione y evalúe a los estudiantes a su cargo"
      />

      <ContentCard sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre, código o empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </ContentCard>

      {loading ? (
        <LinearProgress />
      ) : filteredPracticantes.length === 0 ? (
        <ContentCard>
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            {search ? 'No hay resultados para la búsqueda.' : 'No hay practicantes asignados.'}
          </Typography>
          {search && (
            <Box textAlign="center">
              <Button size="small" onClick={() => setSearch('')}>Limpiar búsqueda</Button>
            </Box>
          )}
        </ContentCard>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Estudiante</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Modalidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPracticantes.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {p.nombreEstudiante} {p.apellidoEstudiante}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{p.codigoEstudiantil}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.nombreEmpresa || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.nombreSede || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.nombreTipoPractica || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={estadoLabel(p.estado)} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/docente/documentos/${p.id}`)}
                      title="Documentos"
                    >
                      <Description fontSize="small" />
                    </IconButton>
                    <Button
                      size="small"
                      endIcon={<ChevronRight />}
                      onClick={() => handleEvaluar(p.id)}
                    >
                      Evaluar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
